from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import time
import werkzeug
import logging
import io
import base64
from PIL import Image
import json
import cloudinary
import cloudinary.uploader
import cloudinary.api
from pymongo import MongoClient
from bson.objectid import ObjectId
import dotenv
from datetime import datetime

# Load environment variables
dotenv.load_dotenv()

app = Flask(__name__, static_folder='static', static_url_path='/static')
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.environ.get('CLOUDINARY_CLOUD_NAME', ''),
    api_key=os.environ.get('CLOUDINARY_API_KEY', ''),
    api_secret=os.environ.get('CLOUDINARY_API_SECRET', ''),
    secure=True
)

# Configure MongoDB
MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/caption_generator')
try:
    mongo_client = MongoClient(MONGO_URI)
    db = mongo_client['caption_generator']
    images_collection = db['images']
    videos_collection = db['videos']
    logger.info("Connected to MongoDB successfully")
except Exception as e:
    logger.error(f"Error connecting to MongoDB: {e}")
    # Create a backup in-memory storage if MongoDB fails
    media_storage = []

# Ensure directories exist for local development/testing
os.makedirs('static/images', exist_ok=True)
os.makedirs('static/videos', exist_ok=True)

# Check if we should load the models based on environment - FORCE TO TRUE
LOAD_AI_MODELS = True  # Changed from environment variable to force loading models

# Create mock responses for environments with memory constraints
sample_captions = {
    "dog": "a brown and white dog sitting on the grass",
    "sunset": "a beautiful sunset over the ocean",
    "city": "a busy city street with tall buildings",
    "kitchen": "a modern kitchen with stainless steel appliances",
    "lake": "a peaceful lake surrounded by mountains",
    "default": "an interesting image that shows various details"
}

sample_video_captions = {
    "dog": "A playful dog running through a field of grass, chasing a ball.",
    "beach": "Waves crashing on a sandy beach with a beautiful sunset in the background.",
    "city": "A time-lapse of a busy city street showing cars and pedestrians moving through the frame.",
    "cooking": "A person preparing a meal in a kitchen, chopping vegetables and stirring a pot.",
    "nature": "A serene forest scene with birds flying between trees and sunlight filtering through leaves.",
    "default": "A video showing various scenes with interesting visuals and movement."
}

sample_video_summaries = {
    "dog": "This video features a dog playing outdoors. The dog shows enthusiasm and energy as it moves around in a natural setting.",
    "beach": "The video depicts a coastal scene with rhythmic waves and warm sunset colors creating a peaceful atmosphere.",
    "city": "This time-lapse captures urban life with constant movement of traffic and pedestrians, showing the bustling energy of city living.",
    "cooking": "The footage shows a cooking process from preparation to completion, demonstrating culinary techniques and food transformation.",
    "nature": "A tranquil natural setting is captured in this video, highlighting the interactions between wildlife and environment.",
    "default": "This video contains a sequence of scenes that demonstrate movement and visual interest across different contexts."
}

# Only load AI models if we're not in a memory-constrained environment
if LOAD_AI_MODELS:
    logger.info("Loading models... This may take time.")
    try:
        import torch
        from transformers import BlipProcessor, BlipForConditionalGeneration, AutoTokenizer, AutoModelForSeq2SeqLM
        from diffusers import StableDiffusionPipeline
        
        caption_processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-large", use_fast=False)
        caption_model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-large")
        
        # Model for summarization
        summarizer_tokenizer = AutoTokenizer.from_pretrained("facebook/bart-large-cnn")
        summarizer_model = AutoModelForSeq2SeqLM.from_pretrained("facebook/bart-large-cnn")
        
        text_to_image_model = StableDiffusionPipeline.from_pretrained(
            "runwayml/stable-diffusion-v1-5", torch_dtype=torch.float32
        ).to("cpu")  # Change to 'cuda' if you have a GPU
        
        logger.info("Models loaded successfully!")
    except Exception as e:
        logger.error(f"Error loading models: {e}")
        LOAD_AI_MODELS = False
else:
    logger.info("Skipping model loading due to memory constraints")

@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)

def upload_to_cloudinary(file_path, resource_type="image", public_id=None):
    """Upload media to Cloudinary and return URL"""
    try:
        if not cloudinary.config().cloud_name:
            logger.warning("Cloudinary not configured, using local storage")
            return None
            
        upload_result = cloudinary.uploader.upload(
            file_path,
            resource_type=resource_type,
            public_id=public_id,
            folder="ai_media"
        )
        return upload_result['secure_url']
    except Exception as e:
        logger.error(f"Error uploading to Cloudinary: {e}")
        return None

def save_to_mongodb(collection, media_url, caption, original_filename, media_type="image", summary=None):
    """Save media data to MongoDB"""
    try:
        if 'images_collection' not in globals() and 'videos_collection' not in globals():
            logger.warning("MongoDB not connected, using in-memory storage")
            media_storage.append({
                "media_url": media_url,
                "caption": caption,
                "original_filename": original_filename,
                "media_type": media_type,
                "summary": summary,
                "created_at": datetime.now()
            })
            return None
            
        media_data = {
            "media_url": media_url,
            "caption": caption,
            "original_filename": original_filename,
            "media_type": media_type,
            "created_at": datetime.now()
        }
        
        if summary:
            media_data["summary"] = summary
            
        result = collection.insert_one(media_data)
        return str(result.inserted_id)
    except Exception as e:
        logger.error(f"Error saving to MongoDB: {e}")
        return None

@app.route('/api/generate-caption', methods=['POST'])
def generate_caption():
    """Generate a caption by analyzing the uploaded image"""
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No image selected'}), 400

    filename = werkzeug.utils.secure_filename(file.filename)
    logger.info(f"Image uploaded: {filename}")

    # Reset stream pointer for AI captioning
    file.stream.seek(0)

    # Load image from stream for AI captioning
    try:
        image = Image.open(file.stream).convert("RGB")
    except Exception as e:
        logger.error(f"Error loading image: {e}")
        return jsonify({'error': 'Invalid image file'}), 400

    # Generate caption
    if LOAD_AI_MODELS:
        try:
            # Try generating with AI models if available
            try:
                inputs = caption_processor(image, return_tensors="pt")
                output = caption_model.generate(**inputs)
                caption = caption_processor.decode(output[0], skip_special_tokens=True)
                logger.info(f"Generated caption: {caption}")
            except Exception as e:
                logger.error(f"Error generating caption with AI model: {e}")
                # Fallback to simpler caption based on filename
                caption = next(
                    (sample_captions[key] for key in sample_captions if key in filename.lower()),
                    sample_captions["default"]
                )
                logger.info(f"Using fallback caption: {caption}")
        except Exception as e:
            logger.error(f"Error in caption generation flow: {e}")
            caption = sample_captions.get("default")
    else:
        # Use sample caption based on filename
        caption = next(
            (sample_captions[key] for key in sample_captions if key in filename.lower()),
            sample_captions["default"]
        )
        logger.info(f"Using mock caption: {caption}")

    # Upload to Cloudinary if available
    try:
        cloudinary_upload = cloudinary.uploader.upload(
            file.stream,
            public_id=filename,
            folder="ai_media"
        )
        cloudinary_url = cloudinary_upload['secure_url']
    except Exception as e:
        logger.error(f"Error uploading to Cloudinary: {e}")
        # Fallback to base64 encoding if Cloudinary fails
        file.stream.seek(0)
        image_data = file.stream.read()
        cloudinary_url = f"data:image/{file.content_type.split('/')[-1]};base64,{base64.b64encode(image_data).decode('utf-8')}"

    try:
        # Save to MongoDB if available
        if 'images_collection' in globals():
            db_id = str(images_collection.insert_one({
                "image_url": cloudinary_url,
                "caption": caption,
                "original_filename": filename,
                "created_at": datetime.now()
            }).inserted_id)
        else:
            db_id = None
    except Exception as e:
        logger.error(f"Error saving to database: {e}")
        db_id = None

    return jsonify({
        'caption': caption,
        'imageUrl': cloudinary_url,
        'id': db_id
    })

@app.route('/api/generate-video-caption', methods=['POST'])
def generate_video_caption():
    """Generate a caption and summary from an uploaded video"""
    if 'video' not in request.files:
        return jsonify({'error': 'No video provided'}), 400

    file = request.files['video']
    if file.filename == '':
        return jsonify({'error': 'No video selected'}), 400

    filename = werkzeug.utils.secure_filename(file.filename)
    logger.info(f"Video uploaded: {filename}")

    # Upload directly to Cloudinary from memory (stream)
    try:
        cloudinary_upload = cloudinary.uploader.upload(
            file,
            resource_type="video",
            public_id=filename,
            folder="ai_media"
        )
        cloudinary_url = cloudinary_upload['secure_url']
    except Exception as e:
        logger.error(f"Error uploading to Cloudinary: {e}")
        return jsonify({'error': 'Failed to upload to Cloudinary'}), 500

    # For now, we'll use mock captions since video analysis requires additional ML models
    # In a production system, we'd extract frames and run them through the caption model,
    # then synthesize a full caption and summary
    
    # Generate mock caption based on filename
    caption = next(
        (sample_video_captions[key] for key in sample_video_captions if key in filename.lower()),
        sample_video_captions["default"]
    )
    
    # Generate mock summary based on filename
    summary = next(
        (sample_video_summaries[key] for key in sample_video_summaries if key in filename.lower()),
        sample_video_summaries["default"]
    )
    
    logger.info(f"Using mock video caption: {caption}")
    logger.info(f"Using mock video summary: {summary}")
    
    # Save to MongoDB
    db_id = save_to_mongodb(videos_collection, cloudinary_url, caption, filename, "video", summary)
    
    # For demo purposes, return a mock animated video URL too (in real implementation this would be another API call)
    animated_video_url = None
    if 'dog' in filename.lower():
        animated_video_url = "https://res.cloudinary.com/dgaqql4ft/video/upload/v1713459800/ai_media/animated_dog_ghibli_pkb2qx.mp4"
    elif 'beach' in filename.lower() or 'ocean' in filename.lower() or 'sea' in filename.lower():
        animated_video_url = "https://res.cloudinary.com/dgaqql4ft/video/upload/v1713459801/ai_media/animated_beach_ghibli_v3tjdf.mp4"
    elif 'city' in filename.lower() or 'street' in filename.lower():
        animated_video_url = "https://res.cloudinary.com/dgaqql4ft/video/upload/v1713459801/ai_media/animated_city_ghibli_azxyhr.mp4"

    return jsonify({
        'caption': caption,
        'summary': summary,
        'videoUrl': cloudinary_url,
        'animatedVideoUrl': animated_video_url,
        'id': db_id
    })

@app.route('/api/generate-image', methods=['POST'])
def generate_image():
    """Generate an image based on a given caption"""
    data = request.json
    if not data or 'caption' not in data:
        return jsonify({'error': 'No caption provided'}), 400

    caption = data['caption']
    logger.info(f"Caption received: {caption}")

    # If AI models are loaded, use them to generate image
    if LOAD_AI_MODELS:
        try:
            # Generate image using Stable Diffusion
            generated_image = text_to_image_model(caption).images[0]
            
            # Save temporarily
            temp_path = os.path.join('uploads', f"generated_{int(time.time())}.png")
            generated_image.save(temp_path, format="PNG")
            
            # Upload to Cloudinary
            cloudinary_url = upload_to_cloudinary(temp_path)
            
            # If Cloudinary upload failed, use base64 as fallback
            if not cloudinary_url:
                img_io = io.BytesIO()
                generated_image.save(img_io, format="PNG")
                img_io.seek(0)
                img_base64 = base64.b64encode(img_io.getvalue()).decode('utf-8')
                cloudinary_url = f"data:image/png;base64,{img_base64}"
            
            # Save to MongoDB
            db_id = save_to_mongodb(images_collection, cloudinary_url, caption, "AI-generated", "image")
            
            logger.info("Generated image successfully.")
        except Exception as e:
            logger.error(f"Error generating image: {e}")
            # Fallback to a sample image
            sample_path = os.path.join('static/images', 'sunset.jpeg')
            if os.path.exists(sample_path):
                cloudinary_url = upload_to_cloudinary(sample_path)
                if not cloudinary_url:
                    with open(sample_path, "rb") as image_file:
                        img_base64 = base64.b64encode(image_file.read()).decode('utf-8')
                        cloudinary_url = f"data:image/png;base64,{img_base64}"
                db_id = save_to_mongodb(images_collection, cloudinary_url, caption, "fallback-sunset", "image")
            else:
                return jsonify({'error': 'Could not generate image and no fallback available'}), 500
    else:
        # Use a sample image if models not loaded
        # Choose image based on keywords in caption
        image_name = 'sunset.jpeg'  # Default
        if 'dog' in caption.lower():
            image_name = 'dog.jpeg'
        elif 'city' in caption.lower():
            image_name = 'citystreet.jpeg'
        elif 'kitchen' in caption.lower():
            image_name = 'kitchen.jpeg'
        elif 'lake' in caption.lower():
            image_name = 'lake.jpeg'
            
        sample_path = os.path.join('static/images', image_name)
        cloudinary_url = upload_to_cloudinary(sample_path)
        if not cloudinary_url:
            with open(sample_path, "rb") as image_file:
                img_base64 = base64.b64encode(image_file.read()).decode('utf-8')
                cloudinary_url = f"data:image/png;base64,{img_base64}"
        
        db_id = save_to_mongodb(images_collection, cloudinary_url, caption, f"sample-{image_name}", "image")
        logger.info(f"Using sample image: {image_name}")

    return jsonify({
        'imageUrl': cloudinary_url,
        'id': db_id
    })

@app.route('/api/generate-animated-video', methods=['POST'])
def generate_animated_video():
    """Generate an animated video based on a caption and style"""
    data = request.json
    if not data or 'caption' not in data:
        return jsonify({'error': 'No caption provided'}), 400

    caption = data['caption']
    style = data.get('style', 'ghibli')
    
    logger.info(f"Animation request: Caption={caption}, Style={style}")
    
    # For now, we'll return sample videos since video generation is complex
    # In a real implementation, this would call a video generation API
    
    # Choose sample video based on keywords in caption and style
    video_url = None
    
    if style == 'ghibli':
        if 'dog' in caption.lower() or 'animal' in caption.lower() or 'pet' in caption.lower():
            video_url = "https://res.cloudinary.com/dgaqql4ft/video/upload/v1713459800/ai_media/animated_dog_ghibli_pkb2qx.mp4"
        elif 'beach' in caption.lower() or 'ocean' in caption.lower() or 'sea' in caption.lower() or 'water' in caption.lower():
            video_url = "https://res.cloudinary.com/dgaqql4ft/video/upload/v1713459801/ai_media/animated_beach_ghibli_v3tjdf.mp4"
        elif 'city' in caption.lower() or 'urban' in caption.lower() or 'street' in caption.lower() or 'building' in caption.lower():
            video_url = "https://res.cloudinary.com/dgaqql4ft/video/upload/v1713459801/ai_media/animated_city_ghibli_azxyhr.mp4"
        else:
            # Default ghibli animation
            video_url = "https://res.cloudinary.com/dgaqql4ft/video/upload/v1713459801/ai_media/animated_nature_ghibli_s6cekv.mp4"
    elif style == 'pixar':
        video_url = "https://res.cloudinary.com/dgaqql4ft/video/upload/v1713460080/ai_media/animated_pixar_style_qzxcmv.mp4"
    elif style == 'anime':
        video_url = "https://res.cloudinary.com/dgaqql4ft/video/upload/v1713460080/ai_media/animated_anime_style_bq8vpd.mp4"
    elif style == 'watercolor':
        video_url = "https://res.cloudinary.com/dgaqql4ft/video/upload/v1713460081/ai_media/animated_watercolor_style_ooq0gi.mp4"
    elif style == '3d':
        video_url = "https://res.cloudinary.com/dgaqql4ft/video/upload/v1713460080/ai_media/animated_3d_style_r0lmvg.mp4"
    else:
        # Default fallback
        video_url = "https://res.cloudinary.com/dgaqql4ft/video/upload/v1713459801/ai_media/animated_nature_ghibli_s6cekv.mp4"
    
    # Save to MongoDB
    db_id = save_to_mongodb(videos_collection, video_url, caption, f"animated-{style}", "video")
    
    return jsonify({
        'videoUrl': video_url,
        'id': db_id
    })

@app.route('/api/images', methods=['GET'])
def get_images():
    """Get all stored images"""
    try:
        if 'images_collection' in globals():
            images = list(images_collection.find().sort("created_at", -1))
            for image in images:
                image['_id'] = str(image['_id'])
            return jsonify(images)
        else:
            # Return empty array if MongoDB not connected
            return jsonify([])
    except Exception as e:
        logger.error(f"Error fetching images: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Get port from environment variable or default to 5000
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
