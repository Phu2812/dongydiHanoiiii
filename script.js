// YouTube Player API Integration
let player;
let playerReady = false;
let queuedSongIndex = null;
let currentSongIndex = -1;
let targetVolume = 75; // Default playback volume
let volumeFadeInterval = null;

const songs = [
  { id: 'w7lPq5YQG0E', title: 'Bao Tiền Một Mớ Bình Yên - 14 Casper & Bon', start: 0 },
  { id: 'LIKOvbJ-DZg', title: 'fishy - VẾT THƯƠNG', start: 0 },
  { id: 'ZsEsft2bWnU', title: 'Anh Sẽ Gọi Tên Em Là Nốt Chu Sa - FiGDee', start: 0 },
  { id: 'Nr8gWRPPBwQ', title: 'TỪ ĐẦU - CHILLIES', start: 0 },
  { id: 'fD_pVFCA6-0', title: 'Em - MAYDAYs', start: 120 }
];

// Load YouTube IFrame Player API
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

window.onYouTubeIframeAPIReady = function() {
  player = new YT.Player('youtube-player', {
    height: '0',
    width: '0',
    videoId: songs[0].id,
    playerVars: {
      'autoplay': 0,
      'controls': 0,
      'loop': 1,
      'playlist': songs[0].id,
      'playsinline': 1
    },
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
};

function onPlayerReady(event) {
  playerReady = true;
  if (queuedSongIndex !== null) {
    fadeToSong(queuedSongIndex);
    queuedSongIndex = null;
  }
}

function onPlayerStateChange(event) {
  const vinylDisc = document.getElementById('vinyl-disc');
  const playIcon = document.getElementById('play-icon');
  const pauseIcon = document.getElementById('pause-icon');

  if (event.data === YT.PlayerState.PLAYING) {
    vinylDisc.classList.add('playing');
    playIcon.classList.add('hidden');
    pauseIcon.classList.remove('hidden');
  } else {
    vinylDisc.classList.remove('playing');
    playIcon.classList.remove('hidden');
    pauseIcon.classList.add('hidden');
  }
}

// Fade volume out, switch track, fade volume in
function fadeToSong(songIdx) {
  if (songIdx === currentSongIndex) return;
  
  if (!playerReady) {
    queuedSongIndex = songIdx;
    return;
  }
  
  const nextSong = songs[songIdx];
  currentSongIndex = songIdx;
  
  // Update song label immediately
  document.getElementById('song-title').textContent = nextSong.title;
  
  if (player && typeof player.getPlayerState === 'function') {
    const state = player.getPlayerState();
    if (state === YT.PlayerState.PLAYING) {
      fadeOutVolume(() => {
        loadAndFadeIn(nextSong);
      });
    } else {
      loadAndFadeIn(nextSong);
    }
  } else {
    loadAndFadeIn(nextSong);
  }
}

function fadeOutVolume(callback) {
  clearInterval(volumeFadeInterval);
  if (!player || typeof player.getVolume !== 'function') {
    if (callback) callback();
    return;
  }
  
  let currentVol = player.getVolume();
  const step = 5;
  const intervalTime = 30; // 30ms * 20 steps = 600ms fade out
  
  volumeFadeInterval = setInterval(() => {
    currentVol -= step;
    if (currentVol <= 0) {
      currentVol = 0;
      player.setVolume(currentVol);
      clearInterval(volumeFadeInterval);
      if (callback) callback();
    } else {
      player.setVolume(currentVol);
    }
  }, intervalTime);
}

function loadAndFadeIn(song) {
  clearInterval(volumeFadeInterval);
  if (!player) return;
  
  try {
    player.setVolume(0);
    player.loadVideoById({
      videoId: song.id,
      startSeconds: song.start
    });
    player.playVideo();
    
    let currentVol = 0;
    const step = 4;
    const intervalTime = 30; // 30ms * 25 steps = 750ms fade in
    
    volumeFadeInterval = setInterval(() => {
      currentVol += step;
      if (currentVol >= targetVolume) {
        currentVol = targetVolume;
        player.setVolume(currentVol);
        clearInterval(volumeFadeInterval);
      } else {
        player.setVolume(currentVol);
      }
    }, intervalTime);
  } catch (e) {
    console.error("Lỗi khi phát bài hát:", e);
    // Fallback direct play
    player.setVolume(targetVolume);
    player.playVideo();
  }
}

// App Elements
const slides = Array.from(document.querySelectorAll('.slide'));
const btnOpenEnvelope = document.getElementById('btn-open-envelope');
const envelopeSealed = document.getElementById('envelope-sealed');
const envelopeOpened = document.getElementById('envelope-opened');
const btnStart = document.getElementById('btn-start');
const btnNext = document.getElementById('btn-next');
const btnPrev = document.getElementById('btn-prev');
const btnTogglePlay = document.getElementById('btn-toggle-play');
const progressContainer = document.getElementById('progress-bar-container');
const progressBar = document.getElementById('progress-bar');
const navControls = document.getElementById('navigation-controls');
const musicWidget = document.getElementById('music-widget');
const slideIndicator = document.getElementById('slide-indicator');
const btnReject = document.getElementById('btn-reject');
const btnAccept = document.getElementById('btn-accept');
const rejectWrapper = document.getElementById('reject-wrapper');

let currentSlideIdx = 0;
let typingTimeouts = [];
let isTyping = false;
let currentTypedText = "";
let currentTypeTarget = null;

// Background particles config (cats, dogs, sweets, cherry blossoms, and hearts)
const backgroundEmojis = ['🐱', '🐶', '🍬', '🍭', '🌸', '❤️', '💖', '✨', '🐾', '🍰', '🍩'];

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  // Setup float particles loop
  setInterval(createParticle, 450);
  
  // Envelope opening click
  btnOpenEnvelope.addEventListener('click', openEnvelope);
  
  // Navigation event listeners
  btnStart.addEventListener('click', startStory);
  btnNext.addEventListener('click', handleNext);
  btnPrev.addEventListener('click', handlePrev);
  btnTogglePlay.addEventListener('click', togglePlay);
  
  // Runaway "Từ chối" button (desktop hover + mobile touch + click block)
  btnReject.addEventListener('mouseover', runawayReject);
  btnReject.addEventListener('touchstart', (e) => {
    e.preventDefault();
    runawayReject();
  });
  btnReject.addEventListener('click', (e) => {
    e.preventDefault();
    runawayReject();
  });
  
  btnAccept.addEventListener('click', acceptConfession);

  // Fix: on iOS, overflow:hidden on body/html blocks touch scroll inside child elements.
  // We intercept touchmove on scrollable story containers and stop propagation so the
  // inner element can scroll instead of the blocked body.
  document.addEventListener('touchmove', (e) => {
    const scrollable = e.target.closest('.story-content.scrollable');
    if (scrollable) {
      // Allow touch scroll inside this element; stop it from bubbling to body
      e.stopPropagation();
    }
  }, { passive: true });
});

// Envelope Opening transition
function openEnvelope() {
  // Play start screen song ("Bao Tiền Một Mớ Bình Yên")
  fadeToSong(0);
  
  // Show vinyl player
  musicWidget.classList.remove('hidden');
  
  // Reveal note text
  envelopeSealed.classList.add('hidden-state');
  envelopeOpened.classList.remove('hidden-state');
}

// Start Story Transition (from note page to chapter 1)
function startStory() {
  // Show navigation bar and progress
  progressContainer.classList.remove('hidden');
  navControls.classList.remove('hidden');
  
  // Move to Slide 1
  goToSlide(1);
}

// Slide Navigation Engine
function goToSlide(idx) {
  if (idx < 0 || idx >= slides.length) return;
  
  // Stop existing typing animation
  clearTyping();
  
  const currentSlide = slides[currentSlideIdx];
  const targetSlide = slides[idx];
  
  currentSlide.classList.remove('active');
  
  // Force layout reflow for CSS transitions
  targetSlide.offsetHeight; 
  
  targetSlide.classList.add('active');
  currentSlideIdx = idx;
  
  // Update indicator and progress bar
  const totalSteps = slides.length - 2; // exclude start and success
  const currentStep = idx;
  
  if (idx > 0 && idx <= totalSteps) {
    slideIndicator.textContent = `${currentStep} / ${totalSteps}`;
    const percentage = (currentStep / totalSteps) * 100;
    progressBar.style.width = `${percentage}%`;
  }
  
  // Disable prev button on start note
  btnPrev.disabled = (idx <= 1);
  
  // Hide next button on the final letter decision slide
  if (idx === totalSteps) {
    btnNext.classList.add('hidden');
  } else {
    btnNext.classList.remove('hidden');
    resetRejectButton(); // Restore button to its normal layout
  }
  
  // Handle song change with fade
  const songIdx = parseInt(targetSlide.getAttribute('data-song-idx'));
  fadeToSong(songIdx);
  
  // Start typewriter effect if element exists
  const textEl = targetSlide.querySelector('.typewriter-text');
  if (textEl) {
    triggerTypewriter(textEl);
  }
}

function handleNext() {
  if (isTyping) {
    skipTypewriter();
  } else {
    goToSlide(currentSlideIdx + 1);
  }
}

function handlePrev() {
  if (currentSlideIdx > 1) {
    goToSlide(currentSlideIdx - 1);
  }
}

function togglePlay() {
  if (!playerReady) return;
  
  const state = player.getPlayerState();
  if (state === YT.PlayerState.PLAYING) {
    player.pauseVideo();
  } else {
    player.playVideo();
  }
}

// Typewriter Engine
function triggerTypewriter(element) {
  isTyping = true;
  currentTypeTarget = element;
  
  const rawText = element.innerHTML.trim();
  currentTypedText = rawText; 
  
  element.textContent = "";
  element.style.minHeight = "auto";
  
  let i = 0;
  const delay = parseInt(element.getAttribute('data-delay')) || 30;
  
  function typeChar() {
    if (i < rawText.length) {
      element.textContent += rawText.charAt(i);
      i++;
      const timeoutId = setTimeout(typeChar, delay);
      typingTimeouts.push(timeoutId);
    } else {
      isTyping = false;
      element.innerHTML = rawText;
    }
  }
  
  typeChar();
}

function clearTyping() {
  typingTimeouts.forEach(t => clearTimeout(t));
  typingTimeouts = [];
  isTyping = false;
}

function skipTypewriter() {
  clearTyping();
  if (currentTypeTarget) {
    currentTypeTarget.innerHTML = currentTypedText;
  }
}

// Runaway "Từ chối" Button logic
const teaseTexts = [
  "ở đây nè 😜",
  "lêu lêu sao bấm được 🤪",
  "thách bấm được luôn 🎯",
  "Muốn từ chối hả, không có đâu nha! 💖",
  "bên trái nè... à không, bên phải 🤣",
  "Chấp nhận đi Hân ơi 🥺"
];

function runawayReject() {
  const rect = btnReject.getBoundingClientRect();
  
  // Capture coordinates for tease comments
  const oldLeft = rect.left + window.scrollX;
  const oldTop = rect.top + window.scrollY;
  
  // Move to body so it can teleport anywhere in viewport
  if (btnReject.parentNode !== document.body) {
    document.body.appendChild(btnReject);
    btnReject.style.position = 'fixed';
    btnReject.style.zIndex = '9999';
  }
  
  const acceptRect = btnAccept.getBoundingClientRect();
  const navRect = navControls.getBoundingClientRect();
  const isNavVisible = !navControls.classList.contains('hidden');
  
  // Set safety padding margins (narrower on mobile for more jump room)
  const isMobile = window.innerWidth <= 480;
  const padding = isMobile ? 20 : 50;
  
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  
  const maxLeft = screenWidth - rect.width - padding;
  const maxTop = screenHeight - rect.height - padding;
  
  let newLeft = rect.left;
  let newTop = rect.top;
  let attempts = 0;
  let hasOverlap = true;
  
  function checkOverlap(r1, r2) {
    return !(r1.right < r2.left || 
             r1.left > r2.right || 
             r1.bottom < r2.top || 
             r1.top > r2.bottom);
  }
  
  while (hasOverlap && attempts < 40) {
    newLeft = Math.random() * (maxLeft - padding) + padding;
    newTop = Math.random() * (maxTop - padding) + padding;
    
    // Create candidate bounding rectangle with safety margin
    const candidate = {
      left: newLeft - 15,
      right: newLeft + rect.width + 15,
      top: newTop - 15,
      bottom: newTop + rect.height + 15
    };
    
    const overlapAccept = checkOverlap(candidate, acceptRect);
    const overlapNav = isNavVisible ? checkOverlap(candidate, navRect) : false;
    const overlapOld = (Math.abs(newLeft - rect.left) < 95 && Math.abs(newTop - rect.top) < 95);
    
    hasOverlap = overlapAccept || overlapNav || overlapOld;
    attempts++;
  }
  
  btnReject.style.left = `${newLeft}px`;
  btnReject.style.top = `${newTop}px`;
  
  // Spawn tease comment at the OLD position
  spawnTeaseComment(oldLeft + rect.width / 2, oldTop + rect.height / 2);
}

function resetRejectButton() {
  if (btnReject && rejectWrapper && btnReject.parentNode !== rejectWrapper) {
    rejectWrapper.appendChild(btnReject);
    btnReject.style.position = 'static';
    btnReject.style.left = '';
    btnReject.style.top = '';
    btnReject.style.zIndex = '';
  }
}

function spawnTeaseComment(x, y) {
  const comment = document.createElement('div');
  comment.className = 'tease-comment';
  
  const text = teaseTexts[Math.floor(Math.random() * teaseTexts.length)];
  comment.textContent = text;
  
  comment.style.left = `${x}px`;
  comment.style.top = `${y}px`;
  comment.style.transform = 'translate(-50%, -50%)';
  
  document.body.appendChild(comment);
  
  setTimeout(() => {
    comment.remove();
  }, 1800);
}

// Confession Acceptance (Success Screen)
function acceptConfession() {
  // Go to success slide
  goToSlide(slides.length - 1);
  
  // Hide control bars
  navControls.classList.add('hidden');
  progressContainer.classList.add('hidden');
  
  // Put Reject button back
  resetRejectButton();
  
  // Spawns celebration hearts
  for (let i = 0; i < 70; i++) {
    setTimeout(createCelebrationHeart, i * 140);
  }
  
  // Send email alert via Formspree
  sendNotification();
}

function sendNotification() {
  fetch('https://formspree.io/f/xykavbkk', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      email: "webtotinh@automail.com",
      message: "Hân đã nhấp vào nút CHẤP NHẬN trên website tỏ tình của bạn rồi nhé! Chúc mừng hai bạn bắt đầu chương mới hạnh phúc. ❤️",
      timestamp: new Date().toLocaleString('vi-VN')
    })
  })
  .then(() => {
    console.log("Đã gửi email thông báo thành công!");
  })
  .catch(err => {
    console.error("Lỗi gửi email:", err);
  });
}

// Particle Effects - Floating Background elements (Cats, Dogs, Sweets, Blossoms, Hearts)
function createParticle() {
  const container = document.getElementById('hearts-container');
  if (!container) return;
  
  const particle = document.createElement('div');
  particle.className = 'heart-particle';
  
  // Select random emoji
  const emoji = backgroundEmojis[Math.floor(Math.random() * backgroundEmojis.length)];
  particle.innerHTML = emoji;
  
  // Random sizing & floating speed
  const size = Math.random() * 20 + 10;
  const left = Math.random() * 100;
  const duration = Math.random() * 5 + 6;
  const delay = Math.random() * 1.5;
  
  particle.style.fontSize = `${size}px`;
  particle.style.left = `${left}vw`;
  particle.style.animationDuration = `${duration}s`;
  particle.style.animationDelay = `${delay}s`;
  
  container.appendChild(particle);
  
  setTimeout(() => {
    particle.remove();
  }, (duration + delay) * 1000);
}

// Emojis explosion when accepted
function createCelebrationHeart() {
  const container = document.getElementById('hearts-container');
  if (!container) return;
  
  const celebrationEmojis = ['❤️', '💖', '🌸', '✨', '🐾', '🍬', '🍭', '🐈', '🐕'];
  const particle = document.createElement('div');
  particle.className = 'heart-particle';
  
  const size = Math.random() * 26 + 16;
  const startLeft = 50 + (Math.random() * 40 - 20); // cluster around center
  const duration = Math.random() * 3.5 + 3.5;
  
  particle.innerHTML = celebrationEmojis[Math.floor(Math.random() * celebrationEmojis.length)];
  particle.style.fontSize = `${size}px`;
  particle.style.left = `${startLeft}vw`;
  particle.style.bottom = '10px';
  particle.style.opacity = '0.7';
  particle.style.animationDuration = `${duration}s`;
  particle.style.transform = `scale(${Math.random() * 0.4 + 0.8})`;
  
  container.appendChild(particle);
  
  setTimeout(() => {
    particle.remove();
  }, duration * 1000);
}
