/**
 * Image Background Remover - Frontend Logic
 */

const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const uploadPrompt = document.getElementById('uploadPrompt');
const previewContainer = document.getElementById('previewContainer');
const previewImage = document.getElementById('previewImage');
const fileName = document.getElementById('fileName');
const removeBgBtn = document.getElementById('removeBgBtn');
const resetBtn = document.getElementById('resetBtn');
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const errorMessage = document.getElementById('errorMessage');
const retryBtn = document.getElementById('retryBtn');
const resultArea = document.getElementById('resultArea');
const resultImage = document.getElementById('resultImage');
const downloadBtn = document.getElementById('downloadBtn');

let currentFile = null;
let currentResult = null;

// API endpoint - replace with your Cloudflare Worker URL
const API_URL = 'https://your-worker.workers.dev/api/remove-bg'; // TODO: Set your Worker URL

// ==================== File Upload ====================

uploadArea.addEventListener('click', () => fileInput.click());

uploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadArea.classList.add('drag-over');
});

uploadArea.addEventListener('dragleave', () => {
  uploadArea.classList.remove('drag-over');
});

uploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadArea.classList.remove('drag-over');
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    handleFile(files[0]);
  }
});

fileInput.addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    handleFile(e.target.files[0]);
  }
});

function handleFile(file) {
  // Validate file type
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    showError('Please upload a JPG, PNG, or WebP image.');
    return;
  }

  // Validate file size (10MB)
  if (file.size > 10 * 1024 * 1024) {
    showError('File size must be less than 10MB.');
    return;
  }

  currentFile = file;

  // Show preview
  const reader = new FileReader();
  reader.onload = (e) => {
    previewImage.src = e.target.result;
    fileName.textContent = file.name;
    uploadPrompt.classList.add('hidden');
    previewContainer.classList.remove('hidden');
    removeBgBtn.disabled = false;
    hideError();
    hideResult();
  };
  reader.readAsDataURL(file);
}

// ==================== Actions ====================

removeBgBtn.addEventListener('click', processImage);
retryBtn.addEventListener('click', processImage);
resetBtn.addEventListener('click', resetAll);
downloadBtn.addEventListener('click', downloadResult);

async function processImage() {
  if (!currentFile) return;

  hideError();
  hideResult();
  setLoading(true);

  try {
    // Convert file to base64
    const base64 = await fileToBase64(currentFile);

    // Call API
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: base64 }),
    });

    const data = await response.json();

    if (data.success) {
      currentResult = data.result;
      showResult(data.result);
    } else {
      showError(data.error || 'Failed to remove background. Please try again.');
    }
  } catch (error) {
    showError('Network error. Please check your connection and try again.');
  } finally {
    setLoading(false);
  }
}

function resetAll() {
  currentFile = null;
  currentResult = null;
  fileInput.value = '';
  previewImage.src = '';
  uploadPrompt.classList.remove('hidden');
  previewContainer.classList.add('hidden');
  removeBgBtn.disabled = true;
  hideError();
  hideResult();
}

function downloadResult() {
  if (!currentResult) return;

  const link = document.createElement('a');
  link.href = currentResult;
  link.download = `removed-bg-${Date.now()}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ==================== UI State Helpers ====================

function setLoading(loading) {
  if (loading) {
    loadingState.classList.remove('hidden');
    removeBgBtn.disabled = true;
  } else {
    loadingState.classList.add('hidden');
    if (currentFile) {
      removeBgBtn.disabled = false;
    }
  }
}

function showError(message) {
  errorMessage.textContent = message;
  errorState.classList.remove('hidden');
}

function hideError() {
  errorState.classList.add('hidden');
}

function showResult(imageData) {
  resultImage.src = imageData;
  resultArea.classList.remove('hidden');
}

function hideResult() {
  resultArea.classList.add('hidden');
}

// ==================== Utilities ====================

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
