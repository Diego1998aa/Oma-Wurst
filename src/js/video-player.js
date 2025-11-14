document.addEventListener('DOMContentLoaded', () => {
    // --- Video Player para la sección Historia ---
    const historiaVideo = document.getElementById('historia-video');
    const playPauseBtn = document.getElementById('play-pause-historia');
    const progressBarContainer = document.getElementById('progress-bar-container-historia');
    const progressBar = document.getElementById('progress-bar-historia');
    const timeDisplay = document.getElementById('time-display-historia');
    const volumeToggleBtn = document.getElementById('volume-toggle-historia');
    const volumeSlider = document.getElementById('volume-slider-historia');

    if (!historiaVideo || !playPauseBtn || !progressBarContainer || !progressBar || !timeDisplay || !volumeToggleBtn || !volumeSlider) {
        console.warn('Algunos elementos del video player no fueron encontrados');
        return;
    }

    let isPlaying = false;
    let isDragging = false;
    let lastVolume = 0.5; // Volumen anterior antes de mutear

    // Función para formatear tiempo en MM:SS
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    // Función para actualizar la barra de progreso
    function updateProgressBar() {
        if (!isDragging && historiaVideo.duration) {
            const progress = (historiaVideo.currentTime / historiaVideo.duration) * 100;
            progressBar.style.width = `${progress}%`;
        }
    }

    // Función para actualizar el display de tiempo
    function updateTimeDisplay() {
        const currentTime = formatTime(historiaVideo.currentTime);
        const duration = formatTime(historiaVideo.duration || 0);
        timeDisplay.textContent = `${currentTime} / ${duration}`;
    }

    // Función para reproducir/pausar
    function togglePlayPause() {
        if (isPlaying) {
            historiaVideo.pause();
        } else {
            historiaVideo.play().catch(error => {
                console.error('Error al reproducir el video:', error);
            });
        }
    }

    // Función para alternar mute/unmute
    function toggleMute() {
        if (historiaVideo.muted || historiaVideo.volume === 0) {
            // Unmute: restaurar volumen anterior o establecer 0.5 por defecto
            historiaVideo.muted = false;
            historiaVideo.volume = lastVolume > 0 ? lastVolume : 0.5;
            volumeSlider.value = historiaVideo.volume;
            updateVolumeIcon();
        } else {
            // Mute: guardar volumen actual y silenciar
            lastVolume = historiaVideo.volume;
            historiaVideo.muted = true;
            updateVolumeIcon();
        }
    }

    // Función para actualizar el icono de volumen
    function updateVolumeIcon() {
        const icon = volumeToggleBtn.querySelector('i');
        icon.classList.remove('fa-volume-xmark', 'fa-volume-low', 'fa-volume-high');
        
        if (historiaVideo.muted || historiaVideo.volume === 0) {
            icon.classList.add('fa-volume-xmark');
            volumeToggleBtn.setAttribute('aria-label', 'Activar sonido');
        } else if (historiaVideo.volume < 0.5) {
            icon.classList.add('fa-volume-low');
            volumeToggleBtn.setAttribute('aria-label', 'Silenciar');
        } else {
            icon.classList.add('fa-volume-high');
            volumeToggleBtn.setAttribute('aria-label', 'Silenciar');
        }
    }

    // Función para cambiar el volumen
    function changeVolume(value) {
        const volume = parseFloat(value);
        historiaVideo.volume = volume;
        historiaVideo.muted = volume === 0;
        
        if (volume > 0) {
            lastVolume = volume;
        }
        
        updateVolumeIcon();
    }

    // Event listeners para el video
    historiaVideo.addEventListener('loadedmetadata', () => {
        updateTimeDisplay();
        updateProgressBar();
    });

    historiaVideo.addEventListener('timeupdate', () => {
        updateProgressBar();
        updateTimeDisplay();
    });

    historiaVideo.addEventListener('play', () => {
        isPlaying = true;
        const icon = playPauseBtn.querySelector('i');
        icon.classList.remove('fa-play');
        icon.classList.add('fa-pause');
        playPauseBtn.setAttribute('aria-label', 'Pausar');
    });

    historiaVideo.addEventListener('pause', () => {
        isPlaying = false;
        const icon = playPauseBtn.querySelector('i');
        icon.classList.remove('fa-pause');
        icon.classList.add('fa-play');
        playPauseBtn.setAttribute('aria-label', 'Reproducir');
    });

    historiaVideo.addEventListener('ended', () => {
        isPlaying = false;
        const icon = playPauseBtn.querySelector('i');
        icon.classList.remove('fa-pause');
        icon.classList.add('fa-play');
        playPauseBtn.setAttribute('aria-label', 'Reproducir');
        progressBar.style.width = '0%';
        historiaVideo.currentTime = 0;
    });

    // Event listener para el botón play/pause
    playPauseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        togglePlayPause();
    });

    // Event listener para el botón de volumen
    volumeToggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleMute();
    });

    // Event listener para el slider de volumen
    volumeSlider.addEventListener('input', (e) => {
        changeVolume(e.target.value);
    });

    // Event listener para cambios de volumen del video (por teclado u otros medios)
    historiaVideo.addEventListener('volumechange', () => {
        volumeSlider.value = historiaVideo.volume;
        updateVolumeIcon();
    });

    // Event listeners para la barra de progreso
    progressBarContainer.addEventListener('mousedown', (e) => {
        isDragging = true;
        updateVideoTime(e);
    });

    progressBarContainer.addEventListener('mousemove', (e) => {
        if (isDragging) {
            updateVideoTime(e);
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    progressBarContainer.addEventListener('click', (e) => {
        updateVideoTime(e);
    });

    // Función para actualizar el tiempo del video basado en la posición del click
    function updateVideoTime(e) {
        const rect = progressBarContainer.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const containerWidth = rect.width;
        const percentage = Math.max(0, Math.min(1, clickX / containerWidth));
        
        if (historiaVideo.duration) {
            historiaVideo.currentTime = percentage * historiaVideo.duration;
            progressBar.style.width = `${percentage * 100}%`;
        }
    }

    // Click en el video para play/pause
    historiaVideo.addEventListener('click', (e) => {
        // Solo si no se hizo click en los controles
        if (!e.target.closest('.video-controls-historia')) {
            togglePlayPause();
        }
    });

    // Teclas de acceso rápido
    document.addEventListener('keydown', (e) => {
        // Solo si el video está visible en la pantalla
        const videoRect = historiaVideo.getBoundingClientRect();
        const isVideoVisible = videoRect.top < window.innerHeight && videoRect.bottom > 0;
        
        if (isVideoVisible) {
            switch(e.code) {
                case 'Space':
                    e.preventDefault();
                    togglePlayPause();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    historiaVideo.currentTime = Math.max(0, historiaVideo.currentTime - 10);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    historiaVideo.currentTime = Math.min(historiaVideo.duration, historiaVideo.currentTime + 10);
                    break;
            }
        }
    });

    // Inicializar el estado del video
    if (historiaVideo.readyState >= 1) {
        updateTimeDisplay();
        updateProgressBar();
    }

    // Inicializar controles de volumen
    historiaVideo.volume = 0;
    historiaVideo.muted = true;
    volumeSlider.value = 0;
    updateVolumeIcon();

    // Manejar autoplay - intentar reproducir automáticamente pero sin sonido
    historiaVideo.play().catch(() => {
        // Si el autoplay falla, simplemente no hacemos nada
        // El usuario podrá hacer click para reproducir
        console.log('Autoplay bloqueado, se requiere interacción del usuario');
    });
});
