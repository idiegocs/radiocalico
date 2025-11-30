// ===========================
// Audio Visualizer Class
// ===========================
class AudioVisualizer {
    constructor(canvasId, sectionId, titleId, artistId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.section = document.getElementById(sectionId);
        this.titleElement = document.getElementById(titleId);
        this.artistElement = document.getElementById(artistId);

        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
        this.bufferLength = 0;
        this.animationId = null;
        this.hue = 0;
    }

    setup(audioElement) {
        console.log('🎨 Configurando visualizador...');

        if (!this.audioContext) {
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                this.analyser = this.audioContext.createAnalyser();
                const source = this.audioContext.createMediaElementSource(audioElement);

                source.connect(this.analyser);
                this.analyser.connect(this.audioContext.destination);

                this.analyser.fftSize = 256;
                this.bufferLength = this.analyser.frequencyBinCount;
                this.dataArray = new Uint8Array(this.bufferLength);

                console.log('✅ Audio context creado');
            } catch (error) {
                console.error('❌ Error creando audio context:', error);
            }
        }

        // Configurar canvas
        setTimeout(() => {
            const rect = this.canvas.getBoundingClientRect();
            this.canvas.width = rect.width * window.devicePixelRatio;
            this.canvas.height = rect.height * window.devicePixelRatio;
            this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

            console.log('✅ Canvas configurado:', {
                width: this.canvas.width,
                height: this.canvas.height
            });
        }, 100);
    }

    start() {
        if (!this.animationId) {
            console.log('🎬 Iniciando animación del visualizador');
            this.animate();
        }
    }

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.clear();
    }

    clear() {
        const width = this.canvas.width / window.devicePixelRatio;
        const height = this.canvas.height / window.devicePixelRatio;
        this.ctx.clearRect(0, 0, width, height);
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());

        if (!this.analyser) return;

        this.analyser.getByteFrequencyData(this.dataArray);

        const width = this.canvas.width / window.devicePixelRatio;
        const height = this.canvas.height / window.devicePixelRatio;

        this.ctx.clearRect(0, 0, width, height);

        const barCount = 64;
        const barWidth = width / barCount;

        this.hue = (this.hue + 0.5) % 360;

        for (let i = 0; i < barCount; i++) {
            const dataIndex = Math.floor(i * this.bufferLength / barCount);
            const barHeight = (this.dataArray[dataIndex] / 255) * height * 0.9;

            const x = i * barWidth;
            const y = height - barHeight;

            const barHue = (this.hue + (i * 360 / barCount)) % 360;
            const saturation = 70 + (this.dataArray[dataIndex] / 255) * 30;
            const lightness = 50 + (this.dataArray[dataIndex] / 255) * 20;

            const gradient = this.ctx.createLinearGradient(x, height, x, y);
            gradient.addColorStop(0, `hsla(${barHue}, ${saturation}%, ${lightness}%, 0.8)`);
            gradient.addColorStop(0.5, `hsla(${(barHue + 20) % 360}, ${saturation}%, ${lightness + 10}%, 0.9)`);
            gradient.addColorStop(1, `hsla(${(barHue + 40) % 360}, ${saturation}%, ${lightness + 20}%, 1)`);

            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x, y, barWidth - 2, barHeight);

            const reflectionGradient = this.ctx.createLinearGradient(x, height, x, height - barHeight * 0.3);
            reflectionGradient.addColorStop(0, `hsla(${barHue}, ${saturation}%, ${lightness}%, 0.1)`);
            reflectionGradient.addColorStop(1, `hsla(${barHue}, ${saturation}%, ${lightness}%, 0)`);

            this.ctx.fillStyle = reflectionGradient;
            this.ctx.fillRect(x, height, barWidth - 2, -barHeight * 0.3);
        }
    }

    show() {
        this.section.style.display = 'block';
    }

    hide() {
        this.section.style.display = 'none';
    }

    updateInfo(title, artist) {
        this.titleElement.textContent = title;
        this.artistElement.textContent = artist;
    }
}

// ===========================
// Audio Player Class
// ===========================
class AudioPlayer {
    constructor(audioElement, playerElement) {
        this.audio = audioElement;
        this.player = playerElement;

        // UI Elements
        this.titleElement = document.getElementById('player-title');
        this.artistElement = document.getElementById('player-artist');
        this.imageElement = document.getElementById('player-image');
        this.playPauseBtn = document.getElementById('btn-play-pause');
        this.playIcon = document.getElementById('play-icon');
        this.pauseIcon = document.getElementById('pause-icon');
        this.prevBtn = document.getElementById('btn-prev');
        this.nextBtn = document.getElementById('btn-next');
        this.progressBar = document.getElementById('progress-bar');
        this.currentTimeEl = document.getElementById('current-time');
        this.totalTimeEl = document.getElementById('total-time');
        this.volumeBar = document.getElementById('volume-bar');
        this.muteBtn = document.getElementById('btn-mute');
        this.volumeIcon = document.getElementById('volume-icon');
        this.muteIcon = document.getElementById('mute-icon');

        this.visualizer = null;
        this.setupEventListeners();
        this.audio.volume = 0.7;
    }

    setVisualizer(visualizer) {
        this.visualizer = visualizer;
    }

    setupEventListeners() {
        // Play/Pause
        this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());

        // Previous/Next
        this.prevBtn.addEventListener('click', () => this.onPrevious && this.onPrevious());
        this.nextBtn.addEventListener('click', () => this.onNext && this.onNext());

        // Progress bar
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('loadedmetadata', () => this.updateDuration());
        this.progressBar.addEventListener('input', (e) => this.seek(e.target.value));

        // Volume
        this.volumeBar.addEventListener('input', (e) => this.setVolume(e.target.value / 100));
        this.muteBtn.addEventListener('click', () => this.toggleMute());

        // Auto next
        this.audio.addEventListener('ended', () => this.onEnded && this.onEnded());
    }

    play(song) {
        this.audio.src = song.audio_file;

        this.audio.play().then(() => {
            this.updateUI(song);
            this.show();
            this.updatePlayPauseIcon(true);

            if (this.visualizer) {
                this.visualizer.start();
            }

            // Registrar reproducción
            if (this.onPlay && song.id) {
                this.onPlay(song.id);
            }
        }).catch(error => {
            console.log('Error al reproducir:', error);
        });

        this.extractAlbumArt(song);
    }

    togglePlayPause() {
        if (this.audio.paused) {
            this.audio.play();
            this.updatePlayPauseIcon(true);
            if (this.visualizer) this.visualizer.start();
        } else {
            this.audio.pause();
            this.updatePlayPauseIcon(false);
            if (this.visualizer) this.visualizer.stop();
        }
    }

    updateUI(song) {
        this.titleElement.textContent = song.title;
        this.artistElement.textContent = song.artist;
        this.imageElement.src = song.image_url || '/images/placeholder-1.svg';

        if (this.visualizer) {
            this.visualizer.updateInfo(song.title, song.artist);
            this.visualizer.show();
        }
    }

    updatePlayPauseIcon(isPlaying) {
        if (isPlaying) {
            this.playIcon.style.display = 'none';
            this.pauseIcon.style.display = 'block';
        } else {
            this.playIcon.style.display = 'block';
            this.pauseIcon.style.display = 'none';
        }
    }

    updateProgress() {
        if (this.audio.duration) {
            const progress = (this.audio.currentTime / this.audio.duration) * 100;
            this.progressBar.value = progress;
            this.currentTimeEl.textContent = this.formatTime(this.audio.currentTime);
        }
    }

    updateDuration() {
        this.totalTimeEl.textContent = this.formatTime(this.audio.duration);
    }

    seek(value) {
        const time = (value / 100) * this.audio.duration;
        this.audio.currentTime = time;
    }

    setVolume(volume) {
        this.audio.volume = volume;
        this.updateVolumeIcon();
    }

    toggleMute() {
        this.audio.muted = !this.audio.muted;
        this.updateVolumeIcon();
    }

    updateVolumeIcon() {
        if (this.audio.muted || this.audio.volume === 0) {
            this.volumeIcon.style.display = 'none';
            this.muteIcon.style.display = 'block';
        } else {
            this.volumeIcon.style.display = 'block';
            this.muteIcon.style.display = 'none';
        }
    }

    show() {
        this.player.style.display = 'block';
    }

    hide() {
        this.player.style.display = 'none';
    }

    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    extractAlbumArt(song) {
        if (window.jsmediatags) {
            fetch(song.audio_file)
                .then(response => response.blob())
                .then(blob => {
                    jsmediatags.read(blob, {
                        onSuccess: (tag) => {
                            if (tag.tags.picture) {
                                const picture = tag.tags.picture;
                                let base64String = '';

                                for (let i = 0; i < picture.data.length; i++) {
                                    base64String += String.fromCharCode(picture.data[i]);
                                }

                                const imageUrl = `data:${picture.format};base64,${window.btoa(base64String)}`;
                                this.imageElement.src = imageUrl;

                                console.log('✅ Portada extraída del MP3:', song.title);
                            }
                        },
                        onError: () => {
                            console.log('ℹ️ No se pudieron leer metadatos del MP3');
                        }
                    });
                })
                .catch(() => {
                    console.log('ℹ️ No se pudo cargar el MP3 para extraer metadatos');
                });
        }
    }
}

// ===========================
// Song Manager Class
// ===========================
class SongManager {
    constructor() {
        this.songs = [];
        this.currentIndex = 0;
        this.loadingEl = document.getElementById('loading');
        this.errorEl = document.getElementById('error');
        this.containerEl = document.getElementById('songs-container');
    }

    async load() {
        try {
            const response = await fetch('/api/songs');
            const result = await response.json();

            this.loadingEl.style.display = 'none';

            if (!result.success) {
                throw new Error(result.message);
            }

            if (result.data.length === 0) {
                this.containerEl.innerHTML = '<p style="text-align: center; color: #666;">No hay canciones disponibles</p>';
                return [];
            }

            this.songs = result.data;

            // Buscar carátulas para canciones que usan placeholder
            this.songs.forEach(async (song) => {
                if (!song.image_url || song.image_url.includes('placeholder')) {
                    await this.fetchCoverArt(song.id);
                }
            });

            return this.songs;
        } catch (error) {
            console.error('Error al cargar canciones:', error);
            this.loadingEl.style.display = 'none';
            this.errorEl.style.display = 'block';
            this.errorEl.innerHTML = `
                <p style="text-align: center; color: #d32f2f; padding: 2rem;">
                    Error al cargar las canciones: ${error.message}
                </p>
            `;
            return [];
        }
    }

    async fetchCoverArt(songId) {
        try {
            const response = await fetch(`/api/songs/${songId}/cover`);
            const result = await response.json();

            if (result.success && result.coverUrl) {
                // Actualizar la imagen en el array de canciones
                const songIndex = this.songs.findIndex(s => s.id == songId);
                if (songIndex !== -1) {
                    this.songs[songIndex].image_url = result.coverUrl;

                    // Actualizar la imagen en la UI
                    const imgElement = document.querySelector(`.song-card[data-song-id="${songId}"] img`);
                    if (imgElement) {
                        imgElement.src = result.coverUrl;
                    }
                }
            }
        } catch (error) {
            console.error('Error al obtener carátula:', error);
        }
    }

    render(onPlayCallback) {
        this.containerEl.innerHTML = this.songs.map((song, index) => `
            <article class="song-card" data-song-id="${song.id}">
                <div class="song-image">
                    <img src="${song.image_url || '/images/placeholder-1.svg'}"
                         alt="Portada de ${this.escapeHtml(song.title)}"
                         loading="lazy">
                </div>
                <div class="song-info">
                    <h3 class="song-title">${this.escapeHtml(song.title)}</h3>
                    <p class="song-artist">${this.escapeHtml(song.artist)}</p>
                    <p class="song-description" data-song-id="${song.id}">
                        ${this.escapeHtml(song.description || 'Sin descripción disponible')}
                    </p>
                    <span class="song-description-toggle" data-song-id="${song.id}" style="display: none;" title="Leer más">
                        <span class="dot"></span>
                        <span class="dot"></span>
                        <span class="dot"></span>
                    </span>
                    <div class="song-meta">
                        ${song.genre ? `<span class="song-genre">${this.escapeHtml(song.genre)}</span>` : ''}
                        ${song.duration ? `<span class="song-duration">${this.escapeHtml(song.duration)}</span>` : ''}
                    </div>
                    <div class="song-stats">
                        <div class="song-votes">
                            <button class="btn-vote" data-song-id="${song.id}" title="Me gusta esta canción">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                </svg>
                                <span class="vote-count" data-song-id="${song.id}">${song.votes || 0}</span>
                            </button>
                        </div>
                        <div class="song-plays">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 5v14l11-7z"/>
                            </svg>
                            <span class="play-count" data-song-id="${song.id}">${song.play_count || 0} reproducciones</span>
                        </div>
                    </div>
                    <div class="song-links">
                        ${song.audio_file ? `
                            <a href="#" class="btn btn-play" data-index="${index}" data-song-id="${song.id}">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M8 5v14l11-7z"/>
                                </svg>
                                Reproducir
                            </a>
                        ` : ''}
                        ${song.spotify_url ? `
                            <a href="${song.spotify_url}" target="_blank" class="btn btn-secondary">
                                Spotify
                            </a>
                        ` : ''}
                        ${song.youtube_url ? `
                            <a href="${song.youtube_url}" target="_blank" class="btn btn-secondary">
                                YouTube Music
                            </a>
                        ` : ''}
                    </div>
                </div>
            </article>
        `).join('');

        // Add event listeners to play buttons
        document.querySelectorAll('.btn-play').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const index = parseInt(btn.dataset.index);
                this.currentIndex = index;
                if (onPlayCallback) {
                    onPlayCallback(this.songs[index], index);
                }
            });
        });

        // Add event listeners to vote buttons
        document.querySelectorAll('.btn-vote').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const songId = btn.dataset.songId;
                this.voteSong(songId);
            });
        });

        // Add event listeners to descriptions for expand/collapse
        document.querySelectorAll('.song-description').forEach(desc => {
            const songId = desc.dataset.songId;
            const toggle = document.querySelector(`.song-description-toggle[data-song-id="${songId}"]`);

            // Check if description is truncated
            if (desc.scrollHeight > desc.clientHeight) {
                if (toggle) toggle.style.display = 'inline-block';
            }

            // Toggle expansion on description click
            desc.addEventListener('click', () => {
                this.toggleDescription(songId);
            });

            // Toggle expansion on "Ver más/menos" click
            if (toggle) {
                toggle.addEventListener('click', () => {
                    this.toggleDescription(songId);
                });
            }
        });
    }

    toggleDescription(songId) {
        const desc = document.querySelector(`.song-description[data-song-id="${songId}"]`);
        const toggle = document.querySelector(`.song-description-toggle[data-song-id="${songId}"]`);

        if (desc && toggle) {
            desc.classList.toggle('expanded');
            toggle.classList.toggle('expanded');

            if (desc.classList.contains('expanded')) {
                toggle.setAttribute('title', 'Leer menos');
            } else {
                toggle.setAttribute('title', 'Leer más');
            }
        }
    }

    async voteSong(songId) {
        try {
            const response = await fetch(`/api/songs/${songId}/vote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();

            if (result.success) {
                // Actualizar el contador en la UI
                const voteCountEl = document.querySelector(`.vote-count[data-song-id="${songId}"]`);
                if (voteCountEl) {
                    voteCountEl.textContent = result.data.votes;

                    // Añadir animación de feedback
                    const btnVote = voteCountEl.closest('.btn-vote');
                    btnVote.classList.add('voted');
                    setTimeout(() => {
                        btnVote.classList.remove('voted');
                    }, 300);
                }

                // Actualizar el array de canciones
                const songIndex = this.songs.findIndex(s => s.id == songId);
                if (songIndex !== -1) {
                    this.songs[songIndex].votes = result.data.votes;
                }
            }
        } catch (error) {
            console.error('Error al votar:', error);
        }
    }

    async registerPlay(songId) {
        try {
            const response = await fetch(`/api/songs/${songId}/play`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();

            if (result.success) {
                // Actualizar el contador en la UI
                const playCountEl = document.querySelector(`.play-count[data-song-id="${songId}"]`);
                if (playCountEl) {
                    const count = result.data.play_count;
                    playCountEl.textContent = `${count} ${count === 1 ? 'reproducción' : 'reproducciones'}`;
                }

                // Actualizar el array de canciones
                const songIndex = this.songs.findIndex(s => s.id == songId);
                if (songIndex !== -1) {
                    this.songs[songIndex].play_count = result.data.play_count;
                }
            }
        } catch (error) {
            console.error('Error al registrar reproducción:', error);
        }
    }

    getCurrent() {
        return this.songs[this.currentIndex];
    }

    getNext() {
        this.currentIndex = (this.currentIndex + 1) % this.songs.length;
        return this.songs[this.currentIndex];
    }

    getPrevious() {
        this.currentIndex = (this.currentIndex - 1 + this.songs.length) % this.songs.length;
        return this.songs[this.currentIndex];
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// ===========================
// Main Application
// ===========================
class RadioCalicoApp {
    constructor() {
        this.visualizer = new AudioVisualizer(
            'main-visualizer',
            'visualizer-section',
            'vis-title',
            'vis-artist'
        );

        this.player = new AudioPlayer(
            document.getElementById('audio-element'),
            document.getElementById('audio-player')
        );

        this.songManager = new SongManager();

        this.player.setVisualizer(this.visualizer);

        // Setup player callbacks
        this.player.onPrevious = () => this.playPrevious();
        this.player.onNext = () => this.playNext();
        this.player.onEnded = () => this.playNext();
        this.player.onPlay = (songId) => this.songManager.registerPlay(songId);

        this.init();
    }

    async init() {
        const songs = await this.songManager.load();

        if (songs.length > 0) {
            this.songManager.render((song, index) => this.playSong(song, index));
        }
    }

    playSong(song, index) {
        this.songManager.currentIndex = index;
        this.visualizer.setup(this.player.audio);
        this.player.play(song);
        this.highlightNowPlaying(song.id);
    }

    highlightNowPlaying(songId) {
        // Quitar la clase now-playing y el indicador de todas las canciones
        document.querySelectorAll('.song-card.now-playing').forEach(card => {
            card.classList.remove('now-playing');
            const indicator = card.querySelector('.now-playing-indicator');
            if (indicator) {
                indicator.remove();
            }
        });

        // Agregar la clase now-playing a la canción actual
        const currentCard = document.querySelector(`.song-card[data-song-id="${songId}"]`);
        if (currentCard) {
            currentCard.classList.add('now-playing');

            // Crear y agregar el indicador animado
            const indicator = document.createElement('div');
            indicator.className = 'now-playing-indicator';
            indicator.innerHTML = `
                <div class="bar"></div>
                <div class="bar"></div>
                <div class="bar"></div>
                <div class="bar"></div>
            `;

            // Agregar el indicador a la imagen de la canción
            const songImage = currentCard.querySelector('.song-image');
            if (songImage) {
                songImage.style.position = 'relative';
                songImage.appendChild(indicator);
            }
        }
    }

    playNext() {
        const song = this.songManager.getNext();
        this.player.play(song);
        this.highlightNowPlaying(song.id);
    }

    playPrevious() {
        const song = this.songManager.getPrevious();
        this.player.play(song);
        this.highlightNowPlaying(song.id);
    }
}

// ===========================
// Initialize App
// ===========================
document.addEventListener('DOMContentLoaded', () => {
    window.app = new RadioCalicoApp();
});
