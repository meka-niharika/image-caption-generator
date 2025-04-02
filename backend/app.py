from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import time
import werkzeug
import logging
import torch
import io
import base64
from PIL import Image
from transformers import BlipProcessor, BlipForConditionalGeneration
from diffusers import StableDiffusionPipeline

app = Flask(__name__, static_folder='static', static_url_path='/static')
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Ensure directories exist
os.makedirs('uploads', exist_ok=True)
os.makedirs('static/images', exist_ok=True)

# Load AI models (Only once to optimize performance)
logger.info("Loading models... This may take time.")
caption_processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-large", use_fast=False)
caption_model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-large")

text_to_image_model = StableDiffusionPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5", torch_dtype=torch.float32
).to("cpu")  # Change to 'cuda' if you have a GPU

logger.info("Models loaded successfully!")

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

    # Load the image
    image = Image.open(filepath).convert("RGB")

    # Generate caption using BLIP
    inputs = caption_processor(image, return_tensors="pt")
    output = caption_model.generate(**inputs)
    caption = caption_processor.decode(output[0], skip_special_tokens=True)

    logger.info(f"Generated caption: {caption}")

    return jsonify({'caption': caption})

@app.route('/api/generate-image', methods=['POST'])
def generate_image():
    """Generate an image based on a given caption"""
    data = request.json
    if not data or 'caption' not in data:
        return jsonify({'error': 'No caption provided'}), 400

    caption = data['caption']
    logger.info(f"Caption received: {caption}")

    # Generate image using Stable Diffusion
    generated_image = text_to_image_model(caption).images[0]

    # Save and convert to Base64 for frontend
    img_io = io.BytesIO()
    generated_image.save(img_io, format="PNG")
    img_io.seek(0)
    img_base64 = base64.b64encode(img_io.getvalue()).decode('utf-8')

    logger.info("Generated image successfully.")

    return jsonify({'imageUrl': f"data:image/png;base64,{img_base64}"})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
