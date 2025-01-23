// script.js

// Duraciones de las zonas en segundos
const warmupDuration = 10 * 60;        // 10 minutos
const mainDuration = 25 * 60;          // 25 minutos
const cooldownDuration = 10 * 60;      // 10 minutos

// Variables de control de tiempo
let currentDuration = warmupDuration;
let currentPhase = 'Calentamiento';
let intervalID;
let warningTriggered = false;

// Elementos del DOM
const display = document.querySelector('#display');
const button = document.querySelector('#start-button');
const phaseDisplay = document.querySelector('#phase-display');
const progressBar = document.querySelector('.progress-bar');
const cyclingIcon = document.querySelector('.cycling-icon');

button.addEventListener('click', startSession);

// Función para iniciar la sesión
function startSession() {
    intervalID = setInterval(updateTimer, 1000);
}

// Función para actualizar el temporizador y la barra de intensidad
function updateTimer() {
    currentDuration--;

    // Actualizar la pantalla del temporizador
    display.textContent = formatTime(currentDuration);

    // Emitir pitido 3 segundos antes del cambio de fase
    if (currentDuration <= 3 && !warningTriggered) {
        warningTriggered = true;
        beepAndAnnounce("Cambio de fase en 3 segundos");
    }

    // Cambiar de fase al llegar a 0
    if (currentDuration <= 0) {
        warningTriggered = false;
        switchPhase();
    }

    // Actualizar la barra de intensidad según la fase
    updateProgressBar();
}

// Función para cambiar de fase
function switchPhase() {
    if (currentPhase === 'Calentamiento') {
        currentPhase = 'Parte Principal';
        currentDuration = mainDuration;

        // Cambiar el color del icono de bicicleta
        cyclingIcon.style.color = '#FFEB3B'; // Color amarillo para la fase principal

    } else if (currentPhase === 'Parte Principal') {
        currentPhase = 'Enfriamiento';
        currentDuration = cooldownDuration;

        // Cambiar el color del icono de bicicleta
        cyclingIcon.style.color = '#4CAF50'; // Color verde para enfriamiento

    } else {
        clearInterval(intervalID);
        currentPhase = 'Completado';
        beepAndAnnounce("¡Sesión completa!", true);
        alert('¡Sesión completa!');
        return;
    }

    // Actualizar la pantalla de fase
    phaseDisplay.textContent = currentPhase;
    display.textContent = formatTime(currentDuration);
    phaseDisplay.classList.add('fadeIn');
    setTimeout(() => phaseDisplay.classList.remove('fadeIn'), 1500);
}

// Función para actualizar la barra de intensidad
function updateProgressBar() {
    let percentage;

    if (currentPhase === 'Calentamiento') {
        percentage = (warmupDuration - currentDuration) / warmupDuration * 100;
        progressBar.style.width = `${percentage}%`;
        progressBar.classList.remove('medium-intensity', 'high-intensity');
        progressBar.classList.add('low-intensity');
    } else if (currentPhase === 'Parte Principal') {
        percentage = (mainDuration - currentDuration) / mainDuration * 100;
        progressBar.style.width = `${percentage}%`;
        progressBar.classList.remove('low-intensity', 'high-intensity');
        progressBar.classList.add('medium-intensity');
    } else if (currentPhase === 'Enfriamiento') {
        percentage = (cooldownDuration - currentDuration) / cooldownDuration * 100;
        progressBar.style.width = `${percentage}%`;
        progressBar.classList.remove('medium-intensity', 'low-intensity');
        progressBar.classList.add('high-intensity');
    }
}

// Función para formatear el tiempo (hh:mm:ss)
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

// Función para emitir un pitido y guía de voz
function beepAndAnnounce(message, isFinal = false) {
    if ('speechSynthesis' in window) {
        const utter = new SpeechSynthesisUtterance(message);
        speechSynthesis.speak(utter);
    } else {
        alert(message);
    }
}