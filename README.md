
# AI Image & Caption Generator - Python Backend

This project is an AI-powered tool that can:
1. Generate captions from uploaded images
2. Generate images based on text descriptions

## Features

- Upload images to receive AI-generated captions
- Enter text descriptions to generate matching images
- Simple and intuitive user interface
- Python Flask backend API
- Responsive design for mobile and desktop

## Technical Stack

- **Backend**: Python with Flask
- **Frontend**: HTML, CSS, and vanilla JavaScript
- **API Endpoints**:
  - `/api/generate-caption`: Processes uploaded images and returns captions
  - `/api/generate-image`: Processes text descriptions and returns image URLs

## Setup Instructions

1. Install Python 3.7+ if you don't have it already
2. Clone this repository
3. Navigate to the backend directory

```bash
cd backend
```

4. Install required dependencies:

```bash
pip install -r requirements.txt
```

5. Run the application:

```bash
python app.py
```

6. Open your browser and navigate to: http://localhost:5000

## Project Structure

```
backend/
├── app.py                 # Flask application and API endpoints
├── requirements.txt       # Python dependencies
├── uploads/               # Directory for uploaded images
└── static/                # Static assets
    ├── index.html         # Main HTML page
    ├── css/
    │   └── styles.css     # CSS styles
    ├── js/
    │   └── main.js        # Frontend JavaScript
    └── images/            # Sample images for demonstration
        ├── sunset.jpg
        ├── dog.jpg
        ├── kitchen.jpg
        ├── citystreet.jpg
        └── lake.jpg
```

## Note on Implementation

This is a demonstration version that simulates AI image and caption generation. In a production environment, you would integrate with actual AI services like:
- OpenAI's DALL-E for image generation
- OpenAI's GPT-4 or Vision API for image captioning
- Google Cloud Vision API for image analysis

The current implementation uses sample data and keyword matching to simulate AI functionality.
