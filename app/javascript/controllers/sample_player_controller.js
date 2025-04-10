import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["statusPanel", "playingArea", "uploadModal"]
  
  connect() {
    console.log("Sample player controller connected");
  }
  
  playSample(event) {
    const sampleId = event.currentTarget.dataset.sampleId;
    console.log(`Playing sample: ${sampleId}`);
    
    // Send Turbo Stream request to play the sample
    fetch(`/samples/${sampleId}/play`, {
      method: 'POST',
      headers: {
        'X-CSRF-Token': document.querySelector("meta[name='csrf-token']").content,
        'Accept': 'text/vnd.turbo-stream.html'
      }
    });
  }
  
  stopAll() {
    console.log("Stopping all samples");
    
    // Send Turbo Stream request to stop all samples
    fetch('/samples/stop_all', {
      method: 'POST',
      headers: {
        'X-CSRF-Token': document.querySelector("meta[name='csrf-token']").content,
        'Accept': 'text/vnd.turbo-stream.html'
      }
    });
  }
  
  stopSample(event) {
    const sampleId = event.currentTarget.dataset.sampleId;
    console.log(`Stopping sample: ${sampleId}`);
    
    // Stop the specific sample
    const audio = document.querySelector(`audio[data-sample-id="${sampleId}"]`);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    
    // Reset the progress bar
    const progressBar = document.querySelector(`.progress-bar[data-sample-id="${sampleId}"]`);
    if (progressBar) {
      progressBar.style.width = '0%';
    }
  }
  
  showUploadForm(event) {
    // Prevent default behavior
    event.preventDefault();
    
    const position = event.currentTarget.dataset.position;
    console.log(`Setting position to: ${position}`);
    
    // Step 1: Set the position in the hidden field
    const positionInput = document.querySelector('[data-position-input="true"]');
    if (positionInput) {
      positionInput.value = position;
    } else {
      console.error('Position input field not found');
    }
    
    // Step 2: Update the position display in the modal
    const positionDisplay = document.querySelector('[data-position-display="true"]');
    if (positionDisplay) {
      positionDisplay.textContent = position;
    }
    
    // Step 3: Open the modal
    this.uploadModalTarget.classList.add('modal-open');
    
    // Step 4: Find and click the file input after a short delay
    setTimeout(() => {
      // Look for the file input within the modal
      const audioFileInput = this.uploadModalTarget.querySelector('input[type="file"]');
      console.log('Audio file input found:', audioFileInput);
      
      if (audioFileInput) {
        try {
          audioFileInput.click();
          console.log('File input click triggered');
        } catch (error) {
          console.error('Error triggering file input click:', error);
        }
      } else {
        console.error('Audio file input not found in the modal');
      }
    }, 500); // Longer delay to ensure the DOM is fully updated
  }
  
  closeUploadForm() {
    this.uploadModalTarget.classList.remove('modal-open');
  }
}
