const warmupDuration = 10 * 60;
const mainDuration = 25 * 60;
const cooldownDuration = 10 * 60;

let currentDuration = warmupDuration;
let currentPhase = 'Calentamiento';
let intervalID;
let warningTriggered = false;

const display = document.querySelector('#display');
const button = document.querySelector('#start-button');
const resetButton = document.querySelector('#reset-button');
const phaseDisplay = document.querySelector('#phase-display');
const pulseRange = document.querySelector('#pulse-range');
const zoneFill = document.querySelector('#zone-fill');
const iconAnimation = document.querySelector('#icon-animation');

button.addEventListener('click', startSession);
resetButton.addEventListener('click', resetSession);

function startSession() {
    button.style.display = 'none';
    resetButton.style.display = 'inline-block';
    intervalID = setInterval(updateTimer, 1000);
    iconAnimation.classList.add('bounce'); // Añadir animación al icono
}

function resetSession() {
    clearInterval(intervalID);
    currentPhase = 'Calentamiento';
    currentDuration = warmupDuration;
    phaseDisplay.textContent = currentPhase;
    display.textContent = formatTime(currentDuration);
    pulseRange.textContent = 'Zona: 50-60% FC máx.';
    zoneFill.style.width = '20%';
    zoneFill.className = 'zone-fill zone-2'; // Restablecer zona
    button.style.display = 'inline-block';
    resetButton.style.display = 'none';
    iconAnimation.classList.remove('bounce'); // Quitar animación del icono
}

function updateTimer() {
    currentDuration--;
    display.textContent = formatTime(currentDuration);

    if (currentDuration <= 3 && !warningTriggered) {
        warningTriggered = true;
        beepAndAnnounce("Cambio de fase en 3 segundos");
    }

    if (currentDuration <= 0) {
        warningTriggered = false;
        switchPhase();
    }
}

function switchPhase() {
    if (currentPhase === 'Calentamiento') {
        currentPhase = 'Parte Principal';
        currentDuration = mainDuration;
        pulseRange.textContent = 'Zona: 70-80% FC máx.';
        zoneFill.style.width = '60%';
        zoneFill.className = 'zone-fill zone-3'; // Cambiar a zona verde
    } else if (currentPhase === 'Parte Principal') {
        currentPhase = 'Enfriamiento';
        currentDuration = cooldownDuration;
        pulseRange.textContent = 'Zona: 50-60% FC máx.';
        zoneFill.style.width = '40%';
        zoneFill.className = 'zone-fill zone-2'; // Cambiar a zona azul claro
    } else {
        clearInterval(intervalID);
        currentPhase = 'Completado';
        beepAndAnnounce("¡Sesión completa!", true);
        alert('¡Sesión completa!');
        iconAnimation.classList.remove('bounce'); // Detener animación al completar sesión
        return;
    }
    phaseDisplay.textContent = currentPhase;
    display.textContent = formatTime(currentDuration);
}

function beepAndAnnounce(message, isFinal = false) {
    if ('speechSynthesis' in window) {
        const utter = new SpeechSynthesisUtterance(message);
        speechSynthesis.speak(utter);
    } else {
        alert(message);
    }
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}