import { Controller } from "@hotwired/stimulus"
import { DirectUpload } from "@rails/activestorage"

export default class extends Controller {
  static targets = [
    "name", "nameError", 
    "label", "labelError", 
    "audioFile", "audioError", 
    "uploadProgress", "fileName", "percentage", "progressBar",
    "submitButton"
  ]
  
  connect() {
    console.log("Sample form controller connected");
  }
  
  validateForm(event) {
    // Prevent form submission if validation fails
    if (!this.validateRequiredFields()) {
      event.preventDefault();
    }
  }
  
  validateRequiredFields() {
    let isValid = true;
    
    // Validate name
    if (!this.nameTarget.value.trim()) {
      this.nameErrorTarget.classList.remove('hidden');
      isValid = false;
    } else {
      this.nameErrorTarget.classList.add('hidden');
    }
    
    // Validate label
    if (!this.labelTarget.value.trim()) {
      this.labelErrorTarget.classList.remove('hidden');
      isValid = false;
    } else {
      this.labelErrorTarget.classList.add('hidden');
    }
    
    // Validate audio file
    if (!this.audioFileTarget.files[0]) {
      this.audioErrorTarget.classList.remove('hidden');
      this.audioErrorTarget.textContent = 'Please select an audio file';
      isValid = false;
    } else {
      this.audioErrorTarget.classList.add('hidden');
    }
    
    return isValid;
  }
  
  validateAudioFile() {
    const file = this.audioFileTarget.files[0];
    
    if (!file) {
      this.audioErrorTarget.classList.remove('hidden');
      this.audioErrorTarget.textContent = 'Please select an audio file';
      return false;
    }
    
    // Check if it's an audio file
    if (!file.type.startsWith('audio/')) {
      this.audioErrorTarget.classList.remove('hidden');
      this.audioErrorTarget.textContent = 'Please select a valid audio file';
      return false;
    }
    
    // Check file size (50MB max)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSize) {
      this.audioErrorTarget.classList.remove('hidden');
      this.audioErrorTarget.textContent = 'File size exceeds the 50MB limit';
      return false;
    }
    
    // File is valid
    this.audioErrorTarget.classList.add('hidden');
    this.showUploadProgress(file);
    return true;
  }
  
  showUploadProgress(file) {
    // Show the progress bar
    this.uploadProgressTarget.classList.remove('hidden');
    this.fileNameTarget.textContent = file.name;
    
    // Set up direct upload
    const upload = new DirectUpload(file, '/rails/active_storage/direct_uploads', {
      directUploadWillStoreFileWithXHR: (xhr) => {
        xhr.upload.addEventListener('progress', event => this.updateProgress(event));
      }
    });
    
    // Start upload
    upload.create((error, blob) => {
      if (error) {
        this.handleError(error);
      } else {
        this.completeUpload(blob);
      }
    });
  }
  
  updateProgress(event) {
    if (event.lengthComputable) {
      const progress = Math.round((event.loaded / event.total) * 100);
      this.progressBarTarget.style.width = `${progress}%`;
      this.percentageTarget.textContent = `${progress}%`;
    }
  }
  
  handleError(error) {
    console.error('Error uploading file:', error);
    this.audioErrorTarget.classList.remove('hidden');
    this.audioErrorTarget.textContent = 'Error uploading file. Please try again.';
    this.uploadProgressTarget.classList.add('hidden');
  }
  
  completeUpload(blob) {
    // Show 100% completion
    this.progressBarTarget.style.width = '100%';
    this.percentageTarget.textContent = '100%';
    
    // Update the hidden field with the blob signed id
    const hiddenField = document.createElement('input');
    hiddenField.type = 'hidden';
    hiddenField.name = 'sample[audio]';
    hiddenField.value = blob.signed_id;
    this.element.appendChild(hiddenField);
    
    // Enable submit button
    this.submitButtonTarget.disabled = false;
  }
}
