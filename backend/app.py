
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

app = Flask(__name__, static_folder='static', static_url_path='/static')
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Ensure directories exist
os.makedirs('uploads', exist_ok=True)
os.makedirs('static/images', exist_ok=True)

# Check if we should load the models based on environment
LOAD_AI_MODELS = os.environ.get('LOAD_AI_MODELS', 'true').lower() == 'true'

# Create mock responses for environments with memory constraints
sample_captions = {
    "dog": "a brown and white dog sitting on the grass",
    "sunset": "a beautiful sunset over the ocean",
    "city": "a busy city street with tall buildings",
    "kitchen": "a modern kitchen with stainless steel appliances",
    "lake": "a peaceful lake surrounded by mountains",
    "default": "an interesting image that shows various details"
}

# Only load AI models if we're not in a memory-constrained environment
if LOAD_AI_MODELS:
    logger.info("Loading models... This may take time.")
    try:
        import torch
        from transformers import BlipProcessor, BlipForConditionalGeneration
        from diffusers import StableDiffusionPipeline
        
        caption_processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-large", use_fast=False)
        caption_model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-large")
        
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

@app.route('/api/generate-caption', methods=['POST'])
def generate_caption():
    """Generate a caption by analyzing the uploaded image"""
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No image selected'}), 400

    # Save the uploaded image
    filename = werkzeug.utils.secure_filename(file.filename)
    filepath = os.path.join('uploads', filename)
    file.save(filepath)

    logger.info(f"Image uploaded: {filename}")

    # If AI models are loaded, use them to generate caption
    if LOAD_AI_MODELS:
        try:
            # Load the image
            image = Image.open(filepath).convert("RGB")
            
            # Generate caption using BLIP
            inputs = caption_processor(image, return_tensors="pt")
            output = caption_model.generate(**inputs)
            caption = caption_processor.decode(output[0], skip_special_tokens=True)
            
            logger.info(f"Generated caption: {caption}")
        except Exception as e:
            logger.error(f"Error generating caption: {e}")
            # Fallback to mock caption
            caption = sample_captions.get("default")
    else:
        # Use mock response if models not loaded
        for key in sample_captions:
            if key in filename.lower():
                caption = sample_captions[key]
                break
        else:
            caption = sample_captions["default"]
        
        logger.info(f"Using mock caption: {caption}")

    return jsonify({'caption': caption})

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
            
            # Save and convert to Base64 for frontend
            img_io = io.BytesIO()
            generated_image.save(img_io, format="PNG")
            img_io.seek(0)
            img_base64 = base64.b64encode(img_io.getvalue()).decode('utf-8')
            
            logger.info("Generated image successfully.")
        except Exception as e:
            logger.error(f"Error generating image: {e}")
            # Fallback to a sample image
            sample_path = os.path.join('static/images', 'sunset.jpeg')
            if os.path.exists(sample_path):
                with open(sample_path, "rb") as image_file:
                    img_base64 = base64.b64encode(image_file.read()).decode('utf-8')
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
        with open(sample_path, "rb") as image_file:
            img_base64 = base64.b64encode(image_file.read()).decode('utf-8')
        
        logger.info(f"Using sample image: {image_name}")

    return jsonify({'imageUrl': f"data:image/png;base64,{img_base64}"})

if __name__ == '__main__':
    # Get port from environment variable or default to 5000
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
