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

// Handle playing samples
document.addEventListener('click', (event) => {
  // Simple audio playback
  const playLink = event.target.closest('a[href*="/play"]');
  if (playLink) {
    // Update the status bar to show what's playing
    const padElement = playLink.closest('.sample-pad');
    if (padElement) {
      const sampleId = padElement.dataset.sampleId;
      const sampleName = padElement.querySelector('.text-xs').textContent;
      const sampleLabel = padElement.querySelector('.font-bold').textContent;
      
      // Update player bar
      const playerBar = document.querySelector('#player-bar');
      if (playerBar) {
        playerBar.innerHTML = `
          <div class="bg-base-300 p-4 border-t flex items-center justify-between">
            <div class="flex items-center">
              <i class="fas fa-play-circle text-xl mr-3 text-primary"></i>
              <div class="text-sm">
                <p class="font-bold">Now Playing: ${sampleLabel}</p>
                <p class="text-xs">${sampleName}</p>
              </div>
            </div>
            <button class="btn btn-sm btn-ghost" onclick="stopAllAudio()">
              <i class="fas fa-stop mr-1"></i> Stop
            </button>
          </div>
        `;
      }
    }
  }
});

// Helper function to stop all audio
window.stopAllAudio = function() {
  // Simple implementation for now
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
