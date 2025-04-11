// Entry point for the build script in your package.json
import "@hotwired/turbo";
import "@rails/activestorage";

// Initialize ActiveStorage
addEventListener("turbo:load", () => {
  const directUploadInput = document.querySelector('input[type="file"][direct_upload]');
  if (directUploadInput) {
    console.log("Direct upload input found");
  }
});

// Store active audio elements to be able to stop them later
window.activeAudioElements = [];

// Handle playing samples with actual audio playback
document.addEventListener('click', (event) => {
  // Get the play link if it was clicked (or a child of it was clicked)
  const playLink = event.target.closest('a[href*="/play"]');
  if (playLink && playLink.href) {
    // Prevent the default navigation
    event.preventDefault();
    
    // Extract sample_pad_id and sample_id from the URL
    const urlParts = playLink.href.split('/');
    const sample_pad_id = urlParts[urlParts.indexOf('sample_pads') + 1];
    const sample_id = urlParts[urlParts.indexOf('samples') + 1];
    
    // Fetch the sample data including audio URL
    fetch(`/sample_pads/${sample_pad_id}/samples/${sample_id}/play`, {
      headers: {
        'Accept': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => {
      console.log("Sample data:", data);
      
      // Get play mode and handle accordingly
      if (data.play_mode === 'exclusive') {
        // Stop all currently playing audio
        stopAllAudio();
      }
      
      // Create and play the audio element
      const audio = new Audio(data.audio_url);
      audio.dataset.sampleId = data.id;
      audio.play();
      
      // Store the audio element for later reference
      window.activeAudioElements.push(audio);
      
      // Update the player bar UI
      const playerBar = document.querySelector('#player-bar');
      if (playerBar) {
        playerBar.innerHTML = `
          <div class="bg-base-300 p-4 border-t flex items-center justify-between">
            <div class="flex items-center">
              <i class="fas fa-play-circle text-xl mr-3 text-primary"></i>
              <div class="text-sm">
                <p class="font-bold">Now Playing: ${data.label}</p>
                <p class="text-xs">${data.name}</p>
              </div>
            </div>
            <button class="btn btn-sm btn-ghost" onclick="stopAllAudio()">
              <i class="fas fa-stop mr-1"></i> Stop
            </button>
          </div>
        `;
      }
    })
    .catch(error => {
      console.error("Error playing sample:", error);
    });
  }
});

// Helper function to stop all audio
window.stopAllAudio = function() {
  // Stop all active audio elements
  window.activeAudioElements.forEach(audio => {
    audio.pause();
    audio.currentTime = 0;
  });
  
  // Clear the active audio elements array
  window.activeAudioElements = [];
  
  // Update the player bar UI
  const playerBar = document.querySelector('#player-bar');
  if (playerBar) {
    playerBar.innerHTML = `
      <div class="bg-base-300 p-4 border-t flex items-center justify-between">
        <div class="flex items-center">
          <i class="fas fa-music text-xl mr-3"></i>
          <div class="text-sm">
            <p class="font-bold">No sample playing</p>
            <p class="text-xs">Select a sample to play</p>
          </div>
        </div>
      </div>
    `;
  }
};

// Also handle stop button clicks from Turbo Stream updates
document.addEventListener('click', (event) => {
  if (event.target.closest('button[onclick="stopAllAudio()"]')) {
    stopAllAudio();
  }
});
