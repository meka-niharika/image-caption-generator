
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import time
import werkzeug
import logging
import base64
import requests
from io import BytesIO
from PIL import Image
import torch
from transformers import BlipProcessor, BlipForConditionalGeneration

app = Flask(__name__, static_folder='static', static_url_path='/static')
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Ensure the upload directory exists
os.makedirs('uploads', exist_ok=True)
os.makedirs('static/generated_images', exist_ok=True)

# Initialize image captioning model
try:
    processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
    model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")
    logger.info("BLIP image captioning model loaded successfully.")
except Exception as e:
    logger.error(f"Error loading BLIP model: {e}")
    processor = None
    model = None

# Hugging Face API for stable diffusion
HF_API_URL = "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5"
HEADERS = {
    "Authorization": "Bearer hf_dummy_key"  # Replace with your actual Hugging Face API key
}

@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)

def generate_caption_with_blip(image_path):
    """Generate a caption using BLIP model"""
    try:
        if processor is None or model is None:
            return "Image captioning model not available. Please check logs."
            
        raw_image = Image.open(image_path).convert('RGB')
        # Prepare inputs
        inputs = processor(raw_image, return_tensors="pt")
        
        # Generate caption
        out = model.generate(**inputs, max_length=50)
        caption = processor.decode(out[0], skip_special_tokens=True)
        
        return caption
    except Exception as e:
        logger.error(f"Error generating caption with BLIP: {e}")
        return "Error processing image. Please try another image."

def generate_image_with_stable_diffusion(prompt):
    """Generate an image using Stable Diffusion via HuggingFace API"""
    try:
        payload = {
            "inputs": prompt,
            "parameters": {
                "num_inference_steps": 50,
                "guidance_scale": 7.5
            }
        }
        
        response = requests.post(HF_API_URL, headers=HEADERS, json=payload)
        
        if response.status_code != 200:
            logger.error(f"API error: {response.status_code} - {response.text}")
            return None
            
        # Save the generated image
        image = Image.open(BytesIO(response.content))
        timestamp = int(time.time())
        image_path = f"static/generated_images/generated_{timestamp}.png"
        image.save(image_path)
        
        return f"/{image_path}"
    except Exception as e:
        logger.error(f"Error generating image: {e}")
        return None

@app.route('/api/generate-caption', methods=['POST'])
def generate_caption():
    """Generate a caption based on an uploaded image using AI model"""
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
            
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No image selected'}), 400
            
        # Save the uploaded file
        filename = werkzeug.utils.secure_filename(file.filename)
        filepath = os.path.join('uploads', filename)
        file.save(filepath)
        
        logger.info(f"Image uploaded: {filename}")
        
        # Generate caption using BLIP
        caption = generate_caption_with_blip(filepath)
        logger.info(f"Generated caption: {caption}")
        
        return jsonify({'caption': caption})
    except Exception as e:
        logger.error(f"Error in generate_caption endpoint: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/generate-image', methods=['POST'])
def generate_image():
    """Generate an image based on a caption using Stable Diffusion"""
    try:
        # Ensure we're getting JSON data
        if not request.is_json:
            logger.error("Request does not contain JSON")
            return jsonify({'error': 'Request must be JSON'}), 400
            
        data = request.get_json()
        if not data or 'caption' not in data:
            logger.error(f"Missing caption in request: {data}")
            return jsonify({'error': 'No caption provided'}), 400
            
        caption = data['caption']
        logger.info(f"Caption received: {caption}")
        
        # Generate image using Stable Diffusion
        image_url = generate_image_with_stable_diffusion(caption)
        
        if image_url:
            logger.info(f"Generated image URL: {image_url}")
            return jsonify({'imageUrl': image_url})
        else:
            logger.error("Failed to generate image")
            return jsonify({'error': 'Failed to generate image'}), 500
    except Exception as e:
        logger.error(f"Error in generate_image endpoint: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
