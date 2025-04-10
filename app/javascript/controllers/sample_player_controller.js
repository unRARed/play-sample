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
    const position = event.currentTarget.dataset.position;
    document.querySelector('#sample_position').value = position;
    this.uploadModalTarget.classList.add('modal-open');
  }
  
  closeUploadForm() {
    this.uploadModalTarget.classList.remove('modal-open');
  }
}
