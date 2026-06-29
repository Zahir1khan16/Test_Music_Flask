let player;
let isPlaying = false;
let isPlayerReady = false;

// DOM Elements
const btnPlay = document.getElementById('btn-play');
const btnNext = document.getElementById('btn-next');
const btnPrev = document.getElementById('btn-prev');
const trackTitle = document.getElementById('track-title');
const trackStatus = document.getElementById('track-status');
const trackArt = document.getElementById('track-art');
const artworkContainer = document.querySelector('.artwork-container');
const volumeSlider = document.getElementById('volume-slider');

// This function creates an <iframe> (and YouTube player) after the API code downloads.
function onYouTubeIframeAPIReady() {
    player = new YT.Player('yt-player', {
        height: '0',
        width: '0',
        playerVars: {
            'playsinline': 1,
            'controls': 0,
            'disablekb': 1,
            'fs': 0,
            'modestbranding': 1,
            'rel': 0
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onError': onPlayerError
        }
    });
}

function onPlayerReady(event) {
    isPlayerReady = true;
    btnPlay.disabled = false;
    btnNext.disabled = false;
    btnPrev.disabled = false;
    player.setVolume(volumeSlider.value);
    
    // Automatically fetch the first song when ready
    fetchNextSong();
}

function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING) {
        isPlaying = true;
        btnPlay.innerHTML = '&#10074;&#10074;'; // Pause icon
        artworkContainer.classList.add('playing');
        trackStatus.innerText = "Now Playing...";
    } else if (event.data == YT.PlayerState.PAUSED || event.data == YT.PlayerState.ENDED) {
        isPlaying = false;
        btnPlay.innerHTML = '&#9658;'; // Play icon
        artworkContainer.classList.remove('playing');
        if (event.data == YT.PlayerState.ENDED) {
            fetchNextSong(); // Auto-play next on end
        } else {
            trackStatus.innerText = "Paused";
        }
    } else if (event.data == YT.PlayerState.BUFFERING) {
        trackStatus.innerText = "Bleeding... (Buffering)";
    }
}

function onPlayerError(event) {
    trackStatus.innerText = "Error playing track. Skipping...";
    setTimeout(fetchNextSong, 2000);
}

// Fetch a random song from the backend
async function fetchNextSong() {
    try {
        btnPlay.disabled = true;
        btnNext.disabled = true;
        btnPrev.disabled = true;
        trackTitle.innerText = "Summoning...";
        trackStatus.innerText = "Searching the crypts...";
        artworkContainer.classList.remove('playing');

        const response = await fetch('/api/random_song');
        const data = await response.json();

        if (data.success && data.video_id) {
            trackTitle.innerText = data.query; // Show our curated query instead of messy YT title
            if (data.thumbnail) {
                trackArt.src = data.thumbnail;
            }
            trackStatus.innerText = "Ready to bleed.";
            
            // Load the video but don't play immediately unless it was already playing
            if (isPlaying) {
                player.loadVideoById(data.video_id);
            } else {
                player.cueVideoById(data.video_id);
            }
        } else {
            trackTitle.innerText = "Failed to summon.";
            trackStatus.innerText = data.error || "Unknown error.";
        }
    } catch (error) {
        trackTitle.innerText = "Error!";
        trackStatus.innerText = "Connection to underworld lost.";
    } finally {
        btnPlay.disabled = false;
        btnNext.disabled = false;
        btnPrev.disabled = false;
    }
}

// Controls Logic
btnPlay.addEventListener('click', () => {
    if (!isPlayerReady) return;
    
    if (isPlaying) {
        player.pauseVideo();
    } else {
        player.playVideo();
    }
});

btnNext.addEventListener('click', () => {
    if (!isPlayerReady) return;
    isPlaying = true; // Force play when skipped
    fetchNextSong();
});

btnPrev.addEventListener('click', () => {
    if (!isPlayerReady) return;
    isPlaying = true; // Force play when skipped
    fetchNextSong();
});

volumeSlider.addEventListener('input', (e) => {
    if (isPlayerReady) {
        player.setVolume(e.target.value);
    }
});
