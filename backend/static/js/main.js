
document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const imageToCaptionTab = document.getElementById('tab-image-to-caption');
    const captionToImageTab = document.getElementById('tab-caption-to-image');
    const imageToCaptionContent = document.getElementById('content-image-to-caption');
    const captionToImageContent = document.getElementById('content-caption-to-image');
    
    imageToCaptionTab.addEventListener('click', function() {
        setActiveTab('image-to-caption');
    });
    
    captionToImageTab.addEventListener('click', function() {
        setActiveTab('caption-to-image');
    });
    
    function setActiveTab(tabName) {
        // Reset all tabs
        imageToCaptionTab.classList.remove('active');
        captionToImageTab.classList.remove('active');
        imageToCaptionContent.classList.remove('active');
        captionToImageContent.classList.remove('active');
        imageToCaptionContent.classList.add('hidden');
        captionToImageContent.classList.add('hidden');
        
        // Set active tab
        if (tabName === 'image-to-caption') {
            imageToCaptionTab.classList.add('active');
            imageToCaptionContent.classList.add('active');
            imageToCaptionContent.classList.remove('hidden');
        } else {
            captionToImageTab.classList.add('active');
            captionToImageContent.classList.add('active');
            captionToImageContent.classList.remove('hidden');
        }
    }
    
    // Image upload preview
    const fileUpload = document.getElementById('file-upload');
    const imagePreview = document.getElementById('image-preview');
    const generateCaptionBtn = document.getElementById('generate-caption-btn');
    let selectedFile = null;
    
    fileUpload.addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            selectedFile = e.target.files[0];
            const reader = new FileReader();
            
            reader.onload = function(event) {
                imagePreview.innerHTML = `<img src="${event.target.result}" alt="Preview">`;
                generateCaptionBtn.disabled = false;
            };
            
            reader.readAsDataURL(selectedFile);
        }
    });
    
    // Caption input validation
    const captionInput = document.getElementById('caption-input');
    const generateImageBtn = document.getElementById('generate-image-btn');
    
    captionInput.addEventListener('input', function() {
        generateImageBtn.disabled = captionInput.value.trim() === '';
    });
    
    // Loading spinner
    const loadingSpinner = document.getElementById('loading-spinner');
    
    function showLoading() {
        loadingSpinner.classList.remove('hidden');
    }
    
    function hideLoading() {
        loadingSpinner.classList.add('hidden');
    }
    
    // Generate Caption
    const generateCaptionButton = document.getElementById('generate-caption-btn');
    const captionResult = document.getElementById('caption-result');
    const captionText = document.getElementById('caption-text');
    
    generateCaptionButton.addEventListener('click', async function() {
        if (!selectedFile) return;
        
        showLoading();
        captionResult.classList.add('hidden');
        
        const formData = new FormData();
        formData.append('image', selectedFile);
        
        try {
            const response = await fetch('/api/generate-caption', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error('Server error');
            }
            
            const data = await response.json();
            
            captionText.textContent = data.caption;
            captionResult.classList.remove('hidden');
        } catch (error) {
            console.error('Error generating caption:', error);
            alert('Failed to generate caption. Please try again.');
        } finally {
            hideLoading();
        }
    });
    
    // Generate Image
    const generateImageButton = document.getElementById('generate-image-btn');
    const imageResult = document.getElementById('image-result');
    const resultImage = document.getElementById('result-image');
    
    generateImageButton.addEventListener('click', async function() {
        const caption = captionInput.value.trim();
        if (!caption) return;
        
        showLoading();
        imageResult.classList.add('hidden');
        
        try {
            const response = await fetch('/api/generate-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ caption })
            });
            
            if (!response.ok) {
                throw new Error('Server error');
            }
            
            const data = await response.json();
            
            resultImage.src = data.imageUrl;
            resultImage.alt = caption;
            resultImage.onload = function() {
                imageResult.classList.remove('hidden');
            };
        } catch (error) {
            console.error('Error generating image:', error);
            alert('Failed to generate image. Please try again.');
        } finally {
            hideLoading();
        }
    });
});
