if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('../../sw.js');
}

const puzzles = [
  { hints: ['SONNE', 'BRILLE', 'STRAND', 'HITZE'], answer: 'SOMMER' },
  { hints: ['MOND', 'STERNE', 'DUNKEL', 'SCHLAF'], answer: 'NACHT' },
  { hints: ['APFEL', 'BANANE', 'ORANGE', 'TRAUBE'], answer: 'OBST' },
  { hints: ['SCHLUESSEL', 'TUER', 'SICHER', 'SCHLOSS'], answer: 'SCHLOSS' },
  { hints: ['SCHNEE', 'SKI', 'KALT', 'EIS'], answer: 'WINTER' }
];

const tiles = Array.from(document.querySelectorAll('.tile'));
const progressEl = document.getElementById('progress');
const inputEl = document.getElementById('answer');
const checkBtn = document.getElementById('check');
const nextBtn = document.getElementById('next');
const statusEl = document.getElementById('status');

let index = 0;
let lock = false;

function renderPuzzle() {
  const puzzle = puzzles[index];
  tiles.forEach((tile, i) => {
    tile.textContent = puzzle.hints[i];
  });
  progressEl.textContent = `Raetsel ${index + 1}/${puzzles.length}`;
  inputEl.value = '';
  statusEl.textContent = '';
  statusEl.className = 'status';
  inputEl.focus();
}

function normalize(value) {
  return value.trim().toUpperCase().replace(/\s+/g, '');
}

function setStatus(message, success) {
  statusEl.textContent = message;
  statusEl.classList.toggle('ok', Boolean(success));
  statusEl.classList.toggle('bad', !success && message !== '');
}

function checkAnswer() {
  if (lock) return;
  const puzzle = puzzles[index];
  const guess = normalize(inputEl.value);
  if (!guess) {
    setStatus('Bitte ein Wort eingeben.', false);
    return;
  }
  if (guess === puzzle.answer) {
    setStatus('Richtig!', true);
    lock = true;
    setTimeout(() => {
      lock = false;
      nextPuzzle();
    }, 700);
  } else {
    setStatus('Leider falsch.', false);
  }
}

function nextPuzzle() {
  index = (index + 1) % puzzles.length;
  renderPuzzle();
}

checkBtn.addEventListener('click', checkAnswer);
nextBtn.addEventListener('click', nextPuzzle);
inputEl.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    checkAnswer();
  }
});

renderPuzzle();
