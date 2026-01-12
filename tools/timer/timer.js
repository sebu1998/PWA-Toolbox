if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('../../sw.js');
}

const STORAGE_KEY = 'pwa-toolbox-timer';

const minutesInput = document.getElementById('minutes');
const secondsInput = document.getElementById('seconds');
const display = document.getElementById('time-display');
const statusEl = document.getElementById('status');

const startBtn = document.getElementById('start');
const pauseBtn = document.getElementById('pause');
const resetBtn = document.getElementById('reset');

let state = {
  remaining: 0,
  isRunning: false,
  endTime: null
};

let tickId = null;

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const saved = JSON.parse(raw);
    if (typeof saved.remaining === 'number' && saved.remaining >= 0) {
      state.remaining = saved.remaining;
    }
    if (typeof saved.isRunning === 'boolean') {
      state.isRunning = saved.isRunning;
    }
    if (typeof saved.endTime === 'number') {
      state.endTime = saved.endTime;
    }
  } catch (err) {
    state = { remaining: 0, isRunning: false, endTime: null };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function updateDisplay(seconds) {
  display.textContent = formatTime(seconds);
}

function setInputsFromSeconds(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  minutesInput.value = String(minutes);
  secondsInput.value = String(seconds);
}

function readInputSeconds() {
  const minutes = Math.min(999, Math.max(0, parseInt(minutesInput.value, 10) || 0));
  const seconds = Math.min(59, Math.max(0, parseInt(secondsInput.value, 10) || 0));
  return minutes * 60 + seconds;
}

function setStatus(message, highlight) {
  statusEl.textContent = message;
  statusEl.classList.toggle('alert', Boolean(highlight));
}

function updateButtons() {
  startBtn.disabled = state.isRunning;
  pauseBtn.disabled = !state.isRunning;
}

function stopTicker() {
  if (tickId) {
    clearInterval(tickId);
    tickId = null;
  }
}

function finishTimer() {
  state.remaining = 0;
  state.isRunning = false;
  state.endTime = null;
  stopTicker();
  updateDisplay(0);
  setStatus('Fertig! Timer beendet.', true);
  if (navigator.vibrate) {
    navigator.vibrate([200, 120, 200]);
  }
  updateButtons();
  saveState();
}

function tick() {
  if (!state.isRunning || !state.endTime) return;
  const remaining = Math.max(0, Math.ceil((state.endTime - Date.now()) / 1000));
  state.remaining = remaining;
  updateDisplay(remaining);
  if (remaining <= 0) {
    finishTimer();
  }
}

function startTicker() {
  stopTicker();
  tick();
  tickId = setInterval(tick, 250);
}

function startTimer() {
  if (state.isRunning) return;
  const total = state.remaining > 0 ? state.remaining : readInputSeconds();
  if (total <= 0) {
    setStatus('Bitte Zeit eingeben.', false);
    return;
  }
  state.remaining = total;
  state.isRunning = true;
  state.endTime = Date.now() + total * 1000;
  setStatus('Timer laeuft.', false);
  startTicker();
  updateButtons();
  saveState();
}

function pauseTimer() {
  if (!state.isRunning) return;
  const remaining = Math.max(0, Math.ceil((state.endTime - Date.now()) / 1000));
  state.remaining = remaining;
  state.isRunning = false;
  state.endTime = null;
  stopTicker();
  setInputsFromSeconds(remaining);
  updateDisplay(remaining);
  setStatus('Pausiert.', false);
  updateButtons();
  saveState();
}

function resetTimer() {
  state.remaining = 0;
  state.isRunning = false;
  state.endTime = null;
  stopTicker();
  minutesInput.value = '0';
  secondsInput.value = '0';
  updateDisplay(0);
  setStatus('Zurueckgesetzt.', false);
  updateButtons();
  saveState();
}

startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

loadState();

if (state.isRunning && state.endTime) {
  const remaining = Math.max(0, Math.ceil((state.endTime - Date.now()) / 1000));
  if (remaining > 0) {
    state.remaining = remaining;
    startTicker();
    setStatus('Timer laeuft.', false);
  } else {
    finishTimer();
  }
} else if (state.remaining > 0) {
  setInputsFromSeconds(state.remaining);
  updateDisplay(state.remaining);
} else {
  updateDisplay(0);
}

updateButtons();
