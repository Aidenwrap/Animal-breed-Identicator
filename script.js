document.addEventListener('DOMContentLoaded', () => {
    const uploadButton = document.getElementById('uploadButton');
    const imageInput = document.getElementById('imageInput');
    const uploadForm = document.getElementById('uploadForm');
    const preview = document.getElementById('preview');
    const imagePreview = document.getElementById('imagePreview');
    const loading = document.getElementById('loading');
    const result = document.getElementById('result');
    const breedInfo = document.getElementById('breedInfo');

    // Handle file selection
    uploadButton.addEventListener('click', () => {
        imageInput.click();
    });

    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleImage(file);
        }
    });

    // Handle drag and drop
    uploadForm.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadForm.classList.add('border-blue-500');
    });

    uploadForm.addEventListener('dragleave', () => {
        uploadForm.classList.remove('border-blue-500');
    });

    uploadForm.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadForm.classList.remove('border-blue-500');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleImage(file);
        }
    });

    function handleImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            preview.classList.remove('hidden');
            analyzeImage(file);
        };
        reader.readAsDataURL(file);
    }

    async function analyzeImage(file) {
        const formData = new FormData();
        formData.append('image', file);

        try {
            loading.classList.remove('hidden');
            result.classList.add('hidden');

            const response = await fetch('/api/analyze-image', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to analyze image');
            }

            const data = await response.json();
            displayResults(data.message);
        } catch (error) {
            console.error('Error:', error);
            breedInfo.innerHTML = '<p class="text-red-500">Error analyzing image. Please try again.</p>';
            result.classList.remove('hidden');
        } finally {
            loading.classList.add('hidden');
        }
    }

    function displayResults(message) {
        breedInfo.innerHTML = message;
        result.classList.remove('hidden');
    }
});
