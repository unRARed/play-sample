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
window.sampleAudioCache = {};
window.activeBufferSources = [];
window.sampleAudioBuffers = {};
window.sampleAudioBufferLoads = {};
window.sampleAudioUnlocked = false;
window.sampleAudioReady = false;
window.sampleAudioCacheName = "play-sample-audio-v1";
window.lastSampleTrigger = { href: null, at: 0 };
window.sampleAudioMode = isIOSWebKit() ? "html" : "buffer";

const AudioContextClass = window.AudioContext || window.webkitAudioContext;
window.sampleAudioContext = AudioContextClass ? new AudioContextClass({ latencyHint: "interactive" }) : null;

function isIOSWebKit() {
  const ua = navigator.userAgent || "";
  return /iPad|iPhone|iPod/.test(ua);
}

function primeAudioContextInGesture() {
  if (!window.sampleAudioContext) return;

  if (window.sampleAudioContext.state !== "running") {
    window.sampleAudioContext.resume();
  }

  const source = window.sampleAudioContext.createBufferSource();
  const buffer = window.sampleAudioContext.createBuffer(1, 1, 22050);
  source.buffer = buffer;
  source.connect(window.sampleAudioContext.destination);
  source.start(0);
}

function getVisiblePlayLinks() {
  const visiblePage = document.querySelector('[data-swipe-target="page"]:not(.hidden)');
  if (visiblePage) {
    return Array.from(visiblePage.querySelectorAll('a[href*="/play"][data-sample-audio-url]'));
  }

  return Array.from(document.querySelectorAll('a[href*="/play"][data-sample-audio-url]'));
}

function getAllPlayLinks() {
  return Array.from(document.querySelectorAll('a[href*="/play"][data-sample-audio-url]'));
}

function preloadHtmlAudioElements() {
  const links = getAllPlayLinks();
  links.forEach((link) => {
    const sampleId = link.dataset.sampleId;
    const audioUrl = link.dataset.sampleAudioUrl;
    if (!sampleId || !audioUrl || window.sampleAudioCache[sampleId]) return;

    const audio = new Audio(audioUrl);
    audio.dataset.sampleId = sampleId;
    audio.preload = "auto";
    audio.load();
    window.sampleAudioCache[sampleId] = audio;
  });
}

async function fetchAudioArrayBuffer(audioUrl) {
  if (window.caches) {
    const cache = await caches.open(window.sampleAudioCacheName);
    const cachedResponse = await cache.match(audioUrl);
    if (cachedResponse) {
      return cachedResponse.arrayBuffer();
    }

    const networkResponse = await fetch(audioUrl, { cache: "no-cache" });
    if (!networkResponse.ok) throw new Error(`Failed to fetch audio: ${networkResponse.status}`);
    await cache.put(audioUrl, networkResponse.clone());
    return networkResponse.arrayBuffer();
  }

  const response = await fetch(audioUrl);
  if (!response.ok) throw new Error(`Failed to fetch audio: ${response.status}`);
  return response.arrayBuffer();
}

function preloadSampleBuffer(sampleId, audioUrl) {
  if (!sampleId || !audioUrl) return Promise.resolve();
  if (window.sampleAudioBuffers[sampleId]) return Promise.resolve();
  if (window.sampleAudioBufferLoads[sampleId]) return window.sampleAudioBufferLoads[sampleId];

  window.sampleAudioBufferLoads[sampleId] = fetchAudioArrayBuffer(audioUrl)
    .then((arrayBuffer) => window.sampleAudioContext.decodeAudioData(arrayBuffer.slice(0)))
    .then((buffer) => {
      window.sampleAudioBuffers[sampleId] = buffer;
    })
    .catch((error) => {
      console.error("Error preloading sample buffer:", sampleId, error);
    })
    .finally(() => {
      delete window.sampleAudioBufferLoads[sampleId];
    });

  return window.sampleAudioBufferLoads[sampleId];
}

function preloadVisibleSamples() {
  const links = getVisiblePlayLinks();
  links.forEach((link) => {
    preloadSampleBuffer(link.dataset.sampleId, link.dataset.sampleAudioUrl);
  });
}

function preloadAllSamples(onProgress) {
  const links = getAllPlayLinks();
  let loaded = 0;

  return Promise.allSettled(
    links.map((link) =>
      preloadSampleBuffer(link.dataset.sampleId, link.dataset.sampleAudioUrl).finally(() => {
        loaded += 1;
        if (onProgress) onProgress(loaded, links.length);
      })
    )
  );
}

async function unlockSampleAudio() {
  const unlockButton = document.getElementById("enable-audio-playback");
  if (window.sampleAudioMode === "html") {
    window.sampleAudioUnlocked = true;
    preloadHtmlAudioElements();
    window.sampleAudioReady = true;
    const cta = document.getElementById("audio-unlock-cta");
    if (cta) cta.classList.add("hidden");
    return;
  }

  if (!window.sampleAudioContext) return;

  try {
    if (unlockButton) {
      unlockButton.disabled = true;
      unlockButton.textContent = "Loading audio...";
    }

    await window.sampleAudioContext.resume();
    window.sampleAudioUnlocked = true;
    await preloadAllSamples((loaded, total) => {
      if (unlockButton) {
        unlockButton.textContent = `Loading audio... ${loaded}/${total}`;
      }
    });
    window.sampleAudioReady = true;

    const cta = document.getElementById("audio-unlock-cta");
    if (cta) cta.classList.add("hidden");
  } catch (error) {
    console.error("Error unlocking audio context:", error);
    if (unlockButton) {
      unlockButton.disabled = false;
      unlockButton.textContent = "Enable instant audio";
    }
  }
}

function initAudioUnlockUI() {
  const cta = document.getElementById("audio-unlock-cta");
  if (!cta) return;

  const hasPlayableSamples = getAllPlayLinks().length > 0;
  if (!hasPlayableSamples) {
    cta.classList.add("hidden");
    return;
  }

  if (window.sampleAudioUnlocked && window.sampleAudioReady) {
    cta.classList.add("hidden");
  } else {
    cta.classList.remove("hidden");
  }
}

function playSample(data) {
  if (data.play_mode === "exclusive") {
    stopAllAudio();
  }

  const playWithHtmlAudio = () => {
    let audio = window.sampleAudioCache[data.id];
    if (!audio) {
      audio = new Audio(data.audio_url);
      audio.dataset.sampleId = data.id;
      audio.preload = "auto";
      window.sampleAudioCache[data.id] = audio;
    }

    audio.loop = data.play_mode === "loop";
    audio.currentTime = 0;
    audio.play().catch((error) => {
      console.error("HTML audio play failed:", error);
    });

    if (!window.activeAudioElements.includes(audio)) {
      window.activeAudioElements.push(audio);
    }
  };

  const playFromBuffer = () => {
    if (!window.sampleAudioBuffers[data.id] || !window.sampleAudioContext) return false;

    const existingSources = window.activeBufferSources.filter((entry) => entry.sampleId === String(data.id));
    existingSources.forEach((entry) => {
      try {
        entry.source.stop();
      } catch (_) {}
    });
    window.activeBufferSources = window.activeBufferSources.filter((entry) => entry.sampleId !== String(data.id));

    const source = window.sampleAudioContext.createBufferSource();
    source.buffer = window.sampleAudioBuffers[data.id];
    source.loop = data.play_mode === "loop";
    source.connect(window.sampleAudioContext.destination);
    source.start(0);

    const sourceEntry = { sampleId: String(data.id), source };
    window.activeBufferSources.push(sourceEntry);
    source.onended = () => {
      window.activeBufferSources = window.activeBufferSources.filter((entry) => entry !== sourceEntry);
    };
    return true;
  };

  if (window.sampleAudioMode === "html") {
    playWithHtmlAudio();
  } else if (window.sampleAudioUnlocked && playFromBuffer()) {
    // played from preloaded, decoded buffer
  } else {
    // If unlocked but this sample isn't decoded yet, load it on-demand and then play.
    if (window.sampleAudioUnlocked) {
      preloadSampleBuffer(data.id, data.audio_url).then(() => {
        if (!playFromBuffer()) {
          playWithHtmlAudio();
        }
      });
    } else {
      playWithHtmlAudio();
    }
  }

  const playerBar = document.querySelector("#player-bar");
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
}

function handleSampleTrigger(event) {
  // Get the play link if it was clicked (or a child of it was clicked)
  const playLink = event.target.closest('a[href*="/play"]');
  if (!playLink || !playLink.href) return;

  if (event.type === "pointerdown" && event.pointerType === "mouse" && event.button !== 0) return;
  if (event.type === "touchend" && event.changedTouches && event.changedTouches.length > 1) return;
  if (event.type === "pointerdown" && event.pointerType === "touch" && isIOSWebKit()) return;

  const now = Date.now();
  if (event.type === "click" && window.lastSampleTrigger.href === playLink.href && now - window.lastSampleTrigger.at < 500) {
    event.preventDefault();
    return;
  }

  event.preventDefault();
  window.lastSampleTrigger = { href: playLink.href, at: now };

  if (window.sampleAudioMode === "buffer" && isIOSWebKit() && event.type === "touchend") {
    primeAudioContextInGesture();
  }

  if (!window.sampleAudioUnlocked) {
    const ctaButton = document.getElementById("enable-audio-playback");
    if (ctaButton) {
      ctaButton.classList.add("btn-warning");
      setTimeout(() => ctaButton.classList.remove("btn-warning"), 250);
    }
    return;
  }

  if (window.sampleAudioMode === "buffer" && window.sampleAudioContext && window.sampleAudioContext.state !== "running") {
    window.sampleAudioContext.resume();
  }

  if (playLink.dataset.sampleAudioUrl) {
    playSample({
      id: playLink.dataset.sampleId,
      name: playLink.dataset.sampleName,
      color: playLink.dataset.sampleColor,
      play_mode: playLink.dataset.samplePlayMode,
      audio_url: playLink.dataset.sampleAudioUrl
    });
    return;
  }
  
  // Fallback path (should be rare)
  const urlParts = playLink.href.split('/');
  const sample_pad_id = urlParts[urlParts.indexOf('sample_pads') + 1];
  const sample_id = urlParts[urlParts.indexOf('samples') + 1];

  fetch(`/sample_pads/${sample_pad_id}/samples/${sample_id}/play`, {
    headers: {
      'Accept': 'application/json'
    }
  })
  .then(response => response.json())
  .then(data => {
    playSample(data);
  })
  .catch(error => {
    console.error("Error playing sample:", error);
  });
}

// Helper function to stop all audio
window.stopAllAudio = function() {
  window.activeBufferSources.forEach((entry) => {
    try {
      entry.source.stop();
    } catch (_) {}
  });
  window.activeBufferSources = [];

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
function initSwipeNavigation() {
  const swipeContainer = document.querySelector('[data-controller="swipe"]');
  if (!swipeContainer || swipeContainer.dataset.swipeInitialized === "true") return;
  swipeContainer.dataset.swipeInitialized = "true";
  
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

    if (window.sampleAudioUnlocked) {
      preloadVisibleSamples();
    }
    
    console.log(`Swiped to page ${currentPage}`);
  };
}

document.addEventListener("turbo:load", initSwipeNavigation);
document.addEventListener("DOMContentLoaded", initSwipeNavigation);
document.addEventListener("turbo:load", initAudioUnlockUI);
document.addEventListener("DOMContentLoaded", initAudioUnlockUI);
document.addEventListener("touchend", handleSampleTrigger, { passive: false });
document.addEventListener("pointerdown", handleSampleTrigger);
document.addEventListener("click", handleSampleTrigger);
document.addEventListener("click", (event) => {
  const unlockButton = event.target.closest("#enable-audio-playback");
  if (unlockButton) {
    unlockSampleAudio();
  }
});
