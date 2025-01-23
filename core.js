const { phases } = require("./phases");

// Duraciones de las fases en segundos
const warmupDuration = 10 * 60;
const mainDuration = 25 * 60;
const cooldownDuration = 10 * 60;

let currentDuration = warmupDuration;
let currentPhase = 'Calentamiento';
let intervalID;
let warningTriggered = false;
let isRunning = false;

// Elementos del DOM
const display = document.querySelector('#display');
const button = document.querySelector('#start-button');
const resetButton = document.querySelector('#reset-button');
const phaseDisplay = document.querySelector('#phase-display');
const pulseInfo = document.querySelector('#pulse-info');
const phaseInfo = document.querySelector('#phase-info');
const phaseIcon = document.querySelector('#phase-icon');
const pulseBar = document.querySelector('#pulse-bar');

// Iniciar la sesión
button.addEventListener('click', startSession);
resetButton.addEventListener('click', resetSession);

function startSession() {
    if (isRunning) return;
    isRunning = true;
    button.style.display = 'none';
    resetButton.style.display = 'inline-block';
    intervalID = setInterval(updateTimer, 1000);
}

function updateTimer() {
    currentDuration--;

    display.textContent = formatTime(currentDuration);

    // Pitido 3 segundos antes del cambio de fase
    if (currentDuration <= 3 && !warningTriggered) {
        warningTriggered = true;
        beepAndAnnounce("Cambio de fase en 3 segundos");
    }

    // Cambiar de fase cuando llega a 0
    if (currentDuration <= 0) {
        warningTriggered = false;
        switchPhase();
    }
}

function switchPhase() {
    if (currentPhase === 'Calentamiento') {
        currentPhase = 'Parte Principal';
        currentDuration = mainDuration;
    } else if (currentPhase === 'Parte Principal') {
        currentPhase = 'Enfriamiento';
        currentDuration = cooldownDuration;
    } else {
        clearInterval(intervalID);
        currentPhase = 'Completado';
        beepAndAnnounce("¡Sesión completa!", true);
        alert('¡Sesión completa!');
        return;
    }

    updatePhaseUI();
}

function updatePhaseUI() {
    phaseDisplay.textContent = currentPhase;
    phaseInfo.textContent = `Fase: ${currentPhase}`;
    pulseInfo.textContent = `Zona de pulso: ${phases[currentPhase].pulseRange} FC máx.`;
    pulseBar.style.width = '100%';
    pulseBar.style.backgroundColor = phases[currentPhase].pulseColor;
    phaseIcon.textContent = phases[currentPhase].icon;
}

function resetSession() {
    clearInterval(intervalID);
    currentDuration = warmupDuration;
    currentPhase = 'Calentamiento';
    updatePhaseUI();
    display.textContent = formatTime(currentDuration);
    isRunning = false;
    button.style.display = 'inline-block';
    resetButton.style.display = 'none';
}

function beepAndAnnounce(message, isFinal = false) {
    if ('speechSynthesis' in window) {
        const utter = new SpeechSynthesisUtterance(message);
        speechSynthesis.speak(utter);
    } else {
        alert(message);
    }

    const context = new (window.AudioContext || window.webkitAudioContext)();
    const frequency = 440;

    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            const oscillator = context.createOscillator();
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(frequency, context.currentTime);
            oscillator.connect(context.destination);
            oscillator.start();
            oscillator.stop(context.currentTime + (isFinal && i === 2 ? 1.5 : i === 2 ? 1 : 0.2));
        }, i * 1000);
    }
}

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}