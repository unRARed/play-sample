// Entry point for the build script in your package.json
import "@hotwired/turbo-rails"
import "./controllers"

// Sample player functionality
function initializeSamplePlayer() {
  console.log("Initializing sample player...");
  
  // Audio playback functionality will be implemented here
}

// Make the function globally available
window.initializeSamplePlayer = initializeSamplePlayer;
