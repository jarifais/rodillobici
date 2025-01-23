// Duraciones de las zonas en segundos
const warmupDuration = 10 * 60;       // 10 minutos
const mainDuration = 25 * 60;         // 25 minutos
const cooldownDuration = 10 * 60;     // 10 minutos

// Variables de control de tiempo
let currentDuration = warmupDuration;
let currentPhase = 'Calentamiento';
let intervalID;
let warningTriggered = false;

// Elementos del DOM
const display = document.querySelector('#display');
const button = document.querySelector('#start-button');
const resetButton = document.querySelector('#reset-button');
const phaseDisplay = document.querySelector('#phase-display');
const pulseRange = document.querySelector('#pulse-range');
const zoneFill = document.querySelector('#zone-fill');
const iconAnimation = document.querySelector('#icon-animation');
const zones = document.querySelectorAll('.zone');

button.addEventListener('click', startSession);
resetButton.addEventListener('click', resetSession);

// Función para iniciar la sesión
function startSession() {
    button.style.display = 'none';
    resetButton.style.display = 'inline-block';
    intervalID = setInterval(updateTimer, 1000);
    iconAnimation.classList.add('bounce'); // Animación del icono
}

// Función para reiniciar la sesión
function resetSession() {
    clearInterval(intervalID);
    currentPhase = 'Calentamiento';
    currentDuration = warmupDuration;
    phaseDisplay.textContent = currentPhase;
    display.textContent = formatTime(currentDuration);
    pulseRange.textContent = 'Zona: 50-60% FC máx.';
    zoneFill.style.width = '0%';
    zoneFill.className = 'zone-fill zone-1';
    zones.forEach(zone => zone.classList.remove('active-zone')); // Eliminar efecto de zona activa
    zones[0].classList.add('active-zone'); // Inicialmente en zona 1
    button.style.display = 'inline-block';
    resetButton.style.display = 'none';
    iconAnimation.classList.remove('bounce'); // Quitar animación
}

// Función para actualizar el temporizador
function updateTimer() {
    currentDuration--;
    display.textContent = formatTime(currentDuration);

    // Emitir pitidos 3 segundos antes del cambio de fase
    if (currentDuration <= 3 && !warningTriggered) {
        warningTriggered = true;
        beepAndAnnounce("Cambio de fase en 3 segundos");
    }

    if (currentDuration <= 0) {
        warningTriggered = false;
        switchPhase();
    }
}

// Función para cambiar de fase
function switchPhase() {
    zones.forEach(zone => zone.classList.remove('active-zone')); // Eliminar la clase activa de todas las zonas
    if (currentPhase === 'Calentamiento') {
        currentPhase = 'Parte Principal';
        currentDuration = mainDuration;
        pulseRange.textContent = 'Zona: 61-70% FC máx.';
        zoneFill.style.width = '40%';
        zoneFill.className = 'zone-fill zone-2'; // Cambiar a zona azul
        zones[1].classList.add('active-zone'); // Activa la zona 3 (70-80%)
    } else if (currentPhase === 'Parte Principal') {
        currentPhase = 'Enfriamiento';
        currentDuration = cooldownDuration;
        pulseRange.textContent = 'Zona: 50-60% FC máx.';
        zoneFill.style.width = '40%';
        zoneFill.className = 'zone-fill zone-1'; // Cambiar a zona gris
        zones[0].classList.add('active-zone'); // Activa la zona 1 (50-60%)
    } else {
        clearInterval(intervalID);
        currentPhase = 'Completado';
        beepAndAnnounce("¡Sesión completa!", true);
        alert('¡Sesión completa!');
        iconAnimation.classList.remove('bounce'); // Quitar animación al finalizar sesión
        return;
    }
    phaseDisplay.textContent = currentPhase;
    display.textContent = formatTime(currentDuration);
}

// Función para emitir pitidos
function beepAndAnnounce(message, isFinal = false) {
    if ('speechSynthesis' in window) {
        const utter = new SpeechSynthesisUtterance(message);
        speechSynthesis.speak(utter);
    }

    // Generar 3 pitidos
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const frequency = 440; // Nota A4

    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            const oscillator = context.createOscillator();
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(frequency, context.currentTime);
            oscillator.connect(context.destination);
            oscillator.start(context.currentTime);
            oscillator.stop(context.currentTime + (isFinal && i === 2 ? 1.5 : i === 2 ? 1 : 0.2)); // Pitido más largo en el tercero
        }, i * 1000);
    }
}

// Función para formatear el tiempo (mm:ss)
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}