import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["fileInput"]
  
  connect() {
    console.log("Sample upload controller connected");
  }
  
  triggerFileInput(event) {
    // Prevent default behavior to avoid any unexpected interactions
    event.preventDefault();
    
    console.log("Triggering file input");
    
    // Directly trigger the file input click
    if (this.hasFileInputTarget) {
      this.fileInputTarget.click();
    } else {
      console.error("File input target not found");
    }
  }
  
  handleFileSelected(event) {
    const file = event.target.files[0];
    const position = event.target.dataset.position;
    
    if (!file) {
      console.log("No file selected");
      return;
    }
    
    console.log(`File selected: ${file.name} for position: ${position}`);
    
    // Show loading state on the square
    this.element.classList.add("animate-pulse");
    
    // Open the modal and set the position
    this.openModalWithFile(file, position);
  }
  
  openModalWithFile(file, position) {
    // Find the modal
    const modal = document.querySelector('#sample-form');
    
    // Set the position in both visible and hidden fields
    const positionInput = document.querySelector('[data-position-input="true"]');
    const positionDisplay = document.querySelector('[data-position-display="true"]');
    
    if (positionInput) {
      positionInput.value = position;
    }
    
    if (positionDisplay) {
      positionDisplay.textContent = position;
    }
    
    // Prepare the form controller for this file
    const formController = this.application.getControllerForElementAndIdentifier(
      document.querySelector('form#sample-form'), 
      'sample-form'
    );
    
    if (formController) {
      // Wait for next tick to ensure modal is open
      setTimeout(() => {
        // Open the modal first
        modal.classList.add('modal-open');
        
        // Then manually set the file in the file input and trigger validation
        const audioFileInput = document.querySelector('[data-sample-form-target="audioFile"]');
        if (audioFileInput) {
          // Create a DataTransfer to manually set the file
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          audioFileInput.files = dataTransfer.files;
          
          // Trigger the change event to run validation
          audioFileInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, 100);
    } else {
      console.error("Sample form controller not found");
      modal.classList.add('modal-open');
    }
    
    // Remove loading state
    this.element.classList.remove("animate-pulse");
  }
}
