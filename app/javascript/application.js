// Entry point for the build script in your package.json
import "@hotwired/turbo";
import "@rails/activestorage";

// Modal handling
document.addEventListener("turbo:frame-load", (event) => {
  if (event.target.id === "modal") {
    document.getElementById("modal-container").classList.remove("hidden");
  }
});

// Close modal when clicking the close button or outside the modal
document.addEventListener("click", (event) => {
  const modalContainer = document.getElementById("modal-container");
  const closeButton = modalContainer.querySelector("button");
  
  if (event.target === modalContainer || event.target === closeButton || event.target.closest('button[data-action="click->modal#close"]')) {
    modalContainer.classList.add("hidden");
  }
});

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
      } else if (data.play_mode === 'loop') {
        // Set to loop continuously
        console.log("Setting loop mode for sample", data.id);
      }
      
      // Create and play the audio element
      const audio = new Audio(data.audio_url);
      audio.dataset.sampleId = data.id;
      
      // Configure loop mode if needed
      if (data.play_mode === 'loop') {
        audio.loop = true;
      }
      
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
                <p class="font-bold">Now Playing: ${data.name}</p>
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
  
  console.log("All audio stopped");
};

// Global function for the PANIC button
window.stopAllSamples = function() {
  console.log("PANIC button pressed - stopping all sounds");
  window.stopAllAudio();
  return false; // Prevent default form submission
};

// Also handle stop button clicks from Turbo Stream updates
document.addEventListener('click', (event) => {
  if (event.target.closest('button[onclick="stopAllAudio()"]')) {
    stopAllAudio();
  }
});

// Swipe functionality for mobile sample pad navigation
document.addEventListener('DOMContentLoaded', () => {
  const swipeContainer = document.querySelector('[data-controller="swipe"]');
  if (!swipeContainer) return;
  
  const pages = document.querySelectorAll('[data-swipe-target="page"]');
  const indicators = document.querySelectorAll('[data-swipe-target="indicator"]');
  let currentPage = 1;
  let touchStartX = 0;
  let touchEndX = 0;
  
  // Handle touch start
  swipeContainer.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, false);
  
  // Handle touch end
  swipeContainer.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, false);
  
  // Calculate swipe direction and change page
  const handleSwipe = () => {
    const swipeThreshold = 50; // Minimum distance to register as a swipe
    const swipeDistance = touchEndX - touchStartX;
    
    if (Math.abs(swipeDistance) < swipeThreshold) return;
    
    if (swipeDistance > 0 && currentPage > 1) {
      // Swipe right - go to previous page
      changePage(currentPage - 1);
    } else if (swipeDistance < 0 && currentPage < pages.length) {
      // Swipe left - go to next page
      changePage(currentPage + 1);
    }
  };
  
  // Change to specified page
  const changePage = (newPage) => {
    // Hide all pages
    pages.forEach(page => {
      page.classList.add('hidden');
    });
    
    // Show new page
    document.querySelector(`[data-page="${newPage}"]`).classList.remove('hidden');
    
    // Update indicators
    indicators.forEach(indicator => {
      indicator.classList.remove('bg-primary');
      indicator.classList.add('bg-gray-400');
      indicator.setAttribute('data-active', 'false');
    });
    
    document.querySelector(`#dot-${newPage}`).classList.remove('bg-gray-400');
    document.querySelector(`#dot-${newPage}`).classList.add('bg-primary');
    document.querySelector(`#dot-${newPage}`).setAttribute('data-active', 'true');
    
    // Update current page
    currentPage = newPage;
    
    console.log(`Swiped to page ${currentPage}`);
  };
});
