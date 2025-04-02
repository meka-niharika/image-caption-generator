
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import random
import time
import werkzeug
import logging

app = Flask(__name__, static_folder='static')
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Sample data (same as in the original JS code)
sample_captions = [
    "A beautiful sunset over the mountains with vibrant orange and purple hues.",
    "A cute golden retriever puppy playing with a red ball in a green field.",
    "A modern kitchen with granite countertops and stainless steel appliances.",
    "A crowded city street with people walking under colorful umbrellas in the rain.",
    "A serene lake surrounded by pine trees reflecting the clear blue sky."
]

sample_images = [
    "/static/images/sunset.jpeg",
    "/static/images/dog.jpeg",
    "/static/images/kitchen.jpeg",
    "/static/images/citystreet.jpeg",
    "/static/images/lake.jpeg"
]

# Ensure the upload directory exists
os.makedirs('uploads', exist_ok=True)
os.makedirs('static/images', exist_ok=True)

@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/api/generate-caption', methods=['POST'])
def generate_caption():
    """Generate a caption based on an uploaded image"""
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
    
    # Simulate processing delay
    time.sleep(1.5)
    
    # Simple logic to pick different captions based on file name
    # In a real app, this would use AI image analysis
    caption_index = 4  # Default to lake caption
    
    if "nature" in filename.lower() or "landscape" in filename.lower():
        caption_index = 0  # Sunset caption
    elif "dog" in filename.lower() or "pet" in filename.lower():
        caption_index = 1  # Dog caption
    elif "kitchen" in filename.lower() or "home" in filename.lower():
        caption_index = 2  # Kitchen caption
    elif "city" in filename.lower() or "street" in filename.lower():
        caption_index = 3  # City caption
    
    caption = sample_captions[caption_index]
    logger.info(f"Generated caption: {caption}")
    
    return jsonify({'caption': caption})

@app.route('/api/generate-image', methods=['POST'])
def generate_image():
    """Generate an image based on a caption"""
    data = request.json
    if not data or 'caption' not in data:
        return jsonify({'error': 'No caption provided'}), 400
        
    caption = data['caption']
    logger.info(f"Caption received: {caption}")
    
    # Simulate processing delay
    time.sleep(2)
    
    # Simple logic to map caption keywords to relevant images
    # In a real app, this would use AI image generation
    image_index = 4  # Default to lake image
    
    lower_caption = caption.lower()
    if "sunset" in lower_caption or "mountain" in lower_caption:
        image_index = 0
    elif "dog" in lower_caption or "puppy" in lower_caption or "pet" in lower_caption:
        image_index = 1
    elif "kitchen" in lower_caption or "home" in lower_caption:
        image_index = 2
    elif "city" in lower_caption or "street" in lower_caption or "rain" in lower_caption:
        image_index = 3
    
    image_url = sample_images[image_index]
    logger.info(f"Generated image URL: {image_url}")
    
    return jsonify({'imageUrl': image_url})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
