if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('../../sw.js');
}

const display = document.getElementById('display');
const startBtn = document.getElementById('start');
const stopBtn = document.getElementById('stop');
const resetBtn = document.getElementById('reset');
const lapBtn = document.getElementById('lap');
const lapsEl = document.getElementById('laps');

let running = false;
let startTime = 0;
let elapsed = 0;
let timerId = null;

function formatTime(ms) {
  const total = Math.max(0, ms);
  const minutes = Math.floor(total / 60000);
  const seconds = Math.floor(total / 1000) % 60;
  const centis = Math.floor(total / 10) % 100;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centis).padStart(2, '0')}`;
}

function updateDisplay() {
  display.textContent = formatTime(elapsed);
}

function tick() {
  elapsed = Date.now() - startTime;
  updateDisplay();
}

function updateButtons() {
  startBtn.disabled = running;
  stopBtn.disabled = !running;
  lapBtn.disabled = !running;
}

function start() {
  if (running) return;
  running = true;
  startTime = Date.now() - elapsed;
  timerId = setInterval(tick, 31);
  updateButtons();
}

function stop() {
  if (!running) return;
  running = false;
  clearInterval(timerId);
  timerId = null;
  updateButtons();
}

function reset() {
  running = false;
  clearInterval(timerId);
  timerId = null;
  elapsed = 0;
  lapsEl.innerHTML = '';
  updateDisplay();
  updateButtons();
}

function addLap() {
  if (!running) return;
  const lapNumber = lapsEl.children.length + 1;
  const li = document.createElement('li');
  li.textContent = `Runde ${lapNumber} - ${formatTime(elapsed)}`;
  lapsEl.prepend(li);
}

startBtn.addEventListener('click', start);
stopBtn.addEventListener('click', stop);
resetBtn.addEventListener('click', reset);
lapBtn.addEventListener('click', addLap);

updateDisplay();
updateButtons();
