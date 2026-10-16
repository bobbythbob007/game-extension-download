const state = {
  balance: 200,
  chip: 10,
  betType: 'number',
  selectedNumber: 17,
  wheelRotation: 0,
  lastResult: null,
};

const SYNC_KEY = 'rouletteState';
const BALANCES_KEY = 'gameBalances';
const MAKE_MONEY_KEY = 'makeMoneyState';
const MAKE_NO_MONEY_KEY = 'makeNoMoneyState';
const CUBE_RUNNER_KEY = 'cubeRunnerState';
const CHIP_VALUES = [5, 10, 25, 50];
const BET_TYPES = ['number', 'red', 'black', 'even', 'odd', 'zero'];
const balanceEl = document.getElementById('balance');
const betAmountEl = document.getElementById('betAmount');
const wheelEl = document.getElementById('rouletteWheel');
const messageEl = document.getElementById('message');
const numberPicker = document.getElementById('numberPicker');
const numberPickerWrap = document.getElementById('numberPickerWrap');
const syncStatusEl = document.getElementById('syncStatus');
const gameMenuEl = document.getElementById('gameMenu');
const homeScreenEl = document.getElementById('homeScreen');
const gameScreenEl = document.getElementById('gameScreen');
const calculatorScreenEl = document.getElementById('calculatorScreen');
const rouletteGameEl = document.getElementById('rouletteGame');
const arcadeGameEl = document.getElementById('arcadeGame');
const gameScreenTitleEl = document.getElementById('gameScreenTitle');
const bankrollDisplayEl = document.getElementById('bankrollDisplay');
const bankrollResetButton = document.getElementById('bankrollReset');
const makeMoneyGameEl = document.getElementById('makeMoneyGame');
const cubeRunnerGameEl = document.getElementById('cubeRunnerGame');
const cubeCanvas = document.getElementById('cubeCanvas');
const cubeContext = cubeCanvas.getContext('2d');
const snakeGameEl = document.getElementById('snakeGame');
const snakeCanvas = document.getElementById('snakeCanvas');
const snakeContext = snakeCanvas.getContext('2d');
const blocksGameEl = document.getElementById('blocksGame');
const blocksBoardEl = document.getElementById('blocksBoard');
const blocksTrayEl = document.getElementById('blocksTray');
const tanksGameEl = document.getElementById('tanksGame');
const tanksCanvas = document.getElementById('tanksCanvas');
const tanksContext = tanksCanvas.getContext('2d');
const tetrisGameEl = document.getElementById('tetrisGame');
const tetrisBoardEl = document.getElementById('tetrisBoard');
const game2048El = document.getElementById('game2048');
const game2048BoardEl = document.getElementById('game2048Board');
const syncStorage = globalThis.chrome?.storage?.sync;
let stateReady = false;
let currentGameId = 'roulette';
const calculatorState = {
  display: '0',
  storedValue: null,
  operator: null,
  waitingForOperand: false,
};
const gameBalances = {};
const makeMoneyDefaultState = {
  balance: 0,
  baseIncome: 1,
  incomeBoostLevel: 0,
  bonusClickLevel: 0,
  bonusClicks: 0,
  prestigePoints: 0,
  decimalDigits: 3,
  instantGambling: false,
  purchasedUpgrades: [],
};
const makeNoMoneyState = { ...makeMoneyDefaultState, purchasedUpgrades: [] };
let makeMoneyState = makeMoneyDefaultState;
let makeMoneyPage = 'Money';
let updatePage = 1;
let helpPage = 1;
let casinoBet = '';
let casinoMessage = '';
let casinoSlots = [0, 0, 0];
let casinoSpinTimer = null;
let rouletteSpinTimer = null;
let casinoSpinActive = false;
let casinoSpinResults = null;
let casinoWager = 0;
let casinoSpinElapsed = 0;
let earnRepeatTimer = null;
const cubeRunnerState = {
  unlockedLevel: 1,
  selectedSkin: 'azure',
  bestScores: {},
};
let cubePage = 'menu';
let cubeAnimationFrame = null;
let cubeLastFrameTime = 0;
let cubeSpawnTimer = 0;
let cubeElapsed = 0;
let cubeScore = 0;
let cubeLane = 1;
let cubeJumpTime = 0;
let cubeObstacles = [];
let cubeRunStatus = 'running';
let cubeLevelIndex = 0;
const snakeDirections = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};
const snakeState = {
  body: [{ x: 7, y: 7 }, { x: 6, y: 7 }, { x: 5, y: 7 }],
  direction: 'right',
  nextDirection: 'right',
  food: { x: 10, y: 7 },
  score: 0,
  phase: 'ready',
  timer: null,
};
const blockShapes = [
  [[0, 0]],
  [[0, 0], [1, 0]],
  [[0, 0], [1, 0], [2, 0]],
  [[0, 0], [0, 1], [0, 2]],
  [[0, 0], [1, 0], [2, 0], [3, 0]],
  [[0, 0], [0, 1], [1, 0], [1, 1]],
  [[0, 0], [1, 0], [2, 0], [0, 1]],
  [[0, 0], [1, 0], [2, 0], [2, 1]],
  [[0, 0], [0, 1], [1, 1], [2, 1]],
  [[0, 0], [1, 0], [1, 1], [2, 1]],
  [[1, 0], [0, 1], [1, 1], [2, 1]],
  [[0, 0], [1, 0], [2, 0], [1, 1], [1, 2]],
  [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2]],
  [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]],
];
const blockColors = ['#3b82f6', '#ef4444', '#22c55e', '#a855f7', '#f59e0b', '#06b6d4'];
const blocksState = {
  board: [],
  pieces: [],
  selected: null,
  score: 0,
  phase: 'ready',
};
const tanksState = {
  mode: 'bot',
  level: 1,
  health: [3, 3],
  terrain: [],
  wind: 0,
  botAngle: 45,
  currentPlayer: 0,
  phase: 'menu',
  shell: null,
  animationFrame: null,
  botTimer: null,
};
const tetrisShapes = [
  { color: '#22c55e', cells: [[0, 0], [1, 0], [0, 1], [1, 1]] },
  { color: '#06b6d4', cells: [[0, 0], [1, 0], [2, 0], [3, 0]] },
  { color: '#a855f7', cells: [[1, 0], [0, 1], [1, 1], [2, 1]] },
  { color: '#3b82f6', cells: [[0, 0], [0, 1], [1, 1], [2, 1]] },
  { color: '#f97316', cells: [[2, 0], [0, 1], [1, 1], [2, 1]] },
  { color: '#ef4444', cells: [[1, 0], [2, 0], [0, 1], [1, 1]] },
  { color: '#eab308', cells: [[0, 0], [1, 0], [1, 1], [2, 1]] },
];
const tetrisState = {
  board: [],
  current: null,
  next: null,
  score: 0,
  lines: 0,
  phase: 'ready',
  timer: null,
};
const game2048State = {
  board: [],
  score: 0,
  best: 0,
  phase: 'playing',
  won: false,
};
const arcadeGames = new Set(['blackjack', 'slots', 'dice', 'coin', 'poker', 'memory']);
const arcadeRuntime = {
  blackjack: { phase: 'ready', deck: [], player: [], dealer: [], wager: 0, message: 'Place a bet to deal.' },
  slots: { result: ['-', '-', '-'], spinning: false, spinInterval: null, spinTimeout: null, message: 'Match numbers to win.' },
  dice: { result: null, message: 'Choose low or high. A correct call pays 2×.' },
  coin: { result: null, spinning: false, flipTimeout: null, message: 'Pick heads or tails. A correct call pays 2×.' },
  poker: { phase: 'ready', deck: [], player: [], dealer: [], held: [], wager: 0, message: 'Place a bet to draw five cards.' },
  memory: { cards: [], opened: [], matched: [], moves: 0, locked: false, best: null, message: 'Match pairs of numbers from 1 to 8.' },
};
let memoryHideTimer = null;

// Add games here and set usesMoney to control its independent bankroll display.
const games = [
  { id: 'roulette', title: 'Roulette', type: 'roulette', usesMoney: true },
  { id: 'blackjack', title: 'Blackjack', type: 'arcade', usesMoney: true },
  { id: 'slots', title: 'Slots', type: 'arcade', usesMoney: true },
  { id: 'dice', title: 'Dice', type: 'arcade', usesMoney: true },
  { id: 'coin', title: 'Coin Flip', type: 'arcade', usesMoney: true },
  { id: 'poker', title: 'Poker', type: 'arcade', usesMoney: true },
  { id: 'memory', title: 'Memory', type: 'arcade', usesMoney: false },
  { id: 'make-money', title: 'Make Money', type: 'make-money', usesMoney: false },
  { id: 'make-no-money', title: 'Make No Money', type: 'make-no-money', usesMoney: false },
  { id: 'snake', title: 'Snake', type: 'snake', usesMoney: false },
  { id: 'blocks', title: '10×10 Blocks', type: 'blocks', usesMoney: false },
  { id: 'tanks', title: 'Tanks', type: 'tanks', usesMoney: false },
  { id: 'tetris', title: 'Tetris', type: 'tetris', usesMoney: false },
  { id: '2048', title: '2048', type: '2048', usesMoney: false },
  { id: 'random', title: 'Random', type: 'random' },
];

const cubeSkins = [
  { id: 'azure', name: 'Azure', color: '#39c5ff', side: '#187fbc', top: '#8de4ff' },
  { id: 'coral', name: 'Coral', color: '#ff6c72', side: '#bd384f', top: '#ffb0a7' },
  { id: 'lime', name: 'Lime', color: '#9be15d', side: '#4d9a47', top: '#d6ff87' },
  { id: 'violet', name: 'Violet', color: '#b887ff', side: '#7043b5', top: '#e2c5ff' },
  { id: 'gold', name: 'Gold', color: '#ffc84a', side: '#b87520', top: '#ffe69a' },
];

const cubeLevels = [
  { name: 'First Steps', sky: '#bdeaff', track: '#536b82', accent: '#54d6c8', speed: 0.27, duration: 24 },
  { name: 'Neon Ridge', sky: '#252b5a', track: '#34396d', accent: '#ff64c8', speed: 0.32, duration: 27 },
  { name: 'Sunset Run', sky: '#ffbd86', track: '#8d5261', accent: '#ffe46b', speed: 0.36, duration: 30 },
  { name: 'Frostline', sky: '#b9e4ed', track: '#547b91', accent: '#f7ffff', speed: 0.4, duration: 32 },
  { name: 'Starlight', sky: '#14172f', track: '#35345e', accent: '#8dffed', speed: 0.44, duration: 35 },
];

const moneyUpgrades = [
  { name: 'Water Bottle', cost: 10, bonus: 1 },
  { name: 'Backpack', cost: 50, bonus: 1 },
  { name: 'Cart', cost: 100, bonus: 1 },
  { name: 'Bicycle', cost: 200, bonus: 2 },
  { name: 'Smartphone', cost: 750, bonus: 3 },
  { name: 'Gaming Laptop', cost: 2e3, bonus: 3 },
  { name: 'Plasma TV', cost: 5e3, bonus: 5 },
  { name: 'Motorcycle', cost: 15e3, bonus: 10 },
  { name: 'Car', cost: 35e3, bonus: 15 },
  { name: 'Luxury Car', cost: 1e5, bonus: 20 },
  { name: 'Apartment', cost: 3e5, bonus: 50 },
  { name: 'House', cost: 1e6, bonus: 250 },
  { name: 'Mansion', cost: 1e7, bonus: 1e3 },
  { name: 'Rocket', cost: 1e8, bonus: 3e3 },
  { name: 'Space Shuttle', cost: 1e9, bonus: 5e3 },
  { name: 'Saturn V', cost: 5e9, bonus: 1e4 },
  { name: 'Moon Landing', cost: 25e9, bonus: 1e5 },
  { name: "McDonald's", cost: 1e11, bonus: 1e6 },
  { name: 'Apple', cost: 1e12, bonus: 1e7 },
  { name: 'Fortune 500', cost: 2e13, bonus: 5e7 },
  { name: 'United States', cost: 2e14, bonus: 1e9 },
  { name: 'Everything on Earth', cost: 1e15, bonus: 1e10 },
  { name: 'Earth', cost: 1e17, bonus: 1e17 },
];

const incomeBoostCosts = [
  1e5, 1e6, 5e6, 1e7, 25e6, 5e7, 75e6, 1e8, 25e7, 5e8,
  75e7, 1e9, 5e9, 1e10, 5e10, 1e11, 25e10, 5e11, 75e10, 1e12,
  5e12, 1e13, 1e14, 5e14, 1e15,
];

const bonusClickCosts = [
  1e3, 1e4, 5e4, 1e5, 5e5, 1e6, 15e5, 2e6, 25e5, 3e6,
  35e5, 4e6, 45e6, 5e6, 75e5, 1e7, 15e6, 2e7, 25e6, 3e7,
  35e6, 4e7, 45e6, 5e7, 75e6, 1e8, 15e7, 2e8, 25e7, 3e8,
  35e7, 4e8, 45e8, 5e8, 75e7, 1e9, 15e8, 2e9, 25e8, 3e9,
  35e8, 4e9, 45e9, 5e9, 75e8, 1e10, 1e11, 1e12, 1e13, 1e14,
];

const numberSuffixes = [
  [1e33, 'decillion'], [1e30, 'nonillion'], [1e27, 'octillion'],
  [1e24, 'septillion'], [1e21, 'sextillion'], [1e18, 'quintillion'],
  [1e15, 'quadrillion'], [1e12, 'trillion'], [1e9, 'billion'], [1e6, 'million'],
];

const balanceStatuses = [
  [1e15, 'You have finally completed your quest; you own the planet Earth!'],
  [5e14, 'Aliens from other galaxies have invited you to speak to them about your wealth.'],
  [5e13, 'You are so wealthy that your money no longer fits on Earth!'],
  [5e12, 'The governments of major countries are asking you for donations to pay off their debts.'],
  [2e12, 'You have so much money conspiracy theorists think you are actually God in disguise.'],
  [1e12, 'You are so rich that you have 1% of the total US Dollars in circulation!'],
  [25e10, 'You have more than the value of all the gold in Fort Knox.'],
  [1e11, 'You were on the front cover of TIME MAGAZINE for being the richest person alive!'],
  [25e9, 'Rumors suggest Elon Musk is trying to figure out the secrets of your wealth.'],
  [3e9, 'You are wealthier than Donald Trump.'],
  [1e9, 'You are now one of the 2,208 billionares in the world!'],
  [25e7, 'Business analysts have already written numerous articles about you and your wealth.'],
  [1e8, 'You have been appointed the CEO of Money Inc, a company soley dedicated to advertising your wealth!'],
  [5e7, 'Your influence has caused the stock market to rise 5% in a week!'],
  [1e7, 'Various universities have invited you to give economics lectures about how you became so rich.'],
  [5e6, 'Foreign diplomats are meeting with you to see if you can help them make their countries more financially efficient!'],
  [1e6, 'You have been asked to give classes on making money so that others may learn your ways.'],
  [5e5, 'You are now in the top 1% of the everyone in the world by wealth.'],
  [25e4, "You are known in your community as 'The Money Man.'"],
  [1e5, 'People in your city are now coming to you asking for funding for their companies.'],
  [5e4, 'You are no longer below average wealth!'],
  [9e3, 'Your money is OVER 9000!'],
  [5e3, 'You no longer qualify as low income.'],
  [1e3, 'You are famous in your neighborhood for your rapid gain of wealth.'],
  [250, 'You are no longer considered food insecure!'],
  [50, 'You are very poor, but you are now above the poverty line!'],
  [10, 'You learned to click 10 times! Great job!'],
  [1, 'You are extremely poor.'],
];

function renderGameMenu() {
  games.forEach((game) => {
    const button = document.createElement('button');
    button.className = 'game-choice';
    button.type = 'button';
    button.dataset.game = game.id;
    button.setAttribute('aria-pressed', 'false');

    button.textContent = game.title;
    button.addEventListener('click', () => chooseGame(game.id));
    gameMenuEl.appendChild(button);
  });
}

function renderCalculator() {
  document.getElementById('calculatorDisplay').value = calculatorState.display;
}

function unlockGames() {
  calculatorScreenEl.hidden = true;
  homeScreenEl.hidden = false;
  document.querySelector('.game-choice')?.focus();
}

function calculate(left, right, operator) {
  if (operator === '+') return left + right;
  if (operator === '-') return left - right;
  if (operator === '*') return left * right;
  if (operator === '/') return right === 0 ? null : left / right;
  return right;
}

function formatCalculatorResult(value) {
  return String(Number(value.toPrecision(10)));
}

function calculatorAction(action, value = '') {
  if (action === 'digit') {
    calculatorState.display = calculatorState.waitingForOperand || calculatorState.display === '0'
      ? value
      : `${calculatorState.display}${value}`;
    calculatorState.waitingForOperand = false;
  } else if (action === 'decimal') {
    if (calculatorState.waitingForOperand) {
      calculatorState.display = '0.';
      calculatorState.waitingForOperand = false;
    } else if (!calculatorState.display.includes('.')) {
      calculatorState.display += '.';
    }
  } else if (action === 'clear') {
    calculatorState.display = '0';
    calculatorState.storedValue = null;
    calculatorState.operator = null;
    calculatorState.waitingForOperand = false;
  } else if (action === 'backspace') {
    if (!calculatorState.waitingForOperand) {
      calculatorState.display = calculatorState.display.length > 1
        ? calculatorState.display.slice(0, -1)
        : '0';
      if (calculatorState.display === '-') calculatorState.display = '0';
    }
  } else if (action === 'operator') {
    const currentValue = Number(calculatorState.display);
    if (calculatorState.operator && !calculatorState.waitingForOperand) {
      const result = calculate(calculatorState.storedValue, currentValue, calculatorState.operator);
      if (result === null) {
        calculatorState.display = 'Cannot divide by zero';
        calculatorState.storedValue = null;
        calculatorState.operator = null;
        calculatorState.waitingForOperand = true;
        renderCalculator();
        return;
      }
      calculatorState.display = formatCalculatorResult(result);
    }
    calculatorState.storedValue = Number(calculatorState.display);
    calculatorState.operator = value;
    calculatorState.waitingForOperand = true;
  } else if (action === 'enter') {
    if (calculatorState.display === '777') {
      unlockGames();
      return;
    }
    if (calculatorState.operator && !calculatorState.waitingForOperand) {
      const result = calculate(calculatorState.storedValue, Number(calculatorState.display), calculatorState.operator);
      if (result === null) {
        calculatorState.display = 'Cannot divide by zero';
      } else {
        calculatorState.display = formatCalculatorResult(result);
        calculatorState.storedValue = null;
        calculatorState.operator = null;
      }
      calculatorState.waitingForOperand = true;
    }
  }
  renderCalculator();
}

function chooseGame(gameId) {
  const selectedGame = games.find((game) => game.id === gameId);
  if (!selectedGame) return;
  stopSnakeGame();
  blocksState.selected = null;
  stopTanksGame();
  stopTetrisGame();

  let game = selectedGame;
  if (selectedGame.type === 'random') {
    const testGames = games.filter((item) => item.type === 'arcade');
    game = testGames[Math.floor(Math.random() * testGames.length)];
  }
  void saveState();
  currentGameId = game.id;
  if (game.usesMoney) {
    state.balance = gameBalances[currentGameId] ?? 200;
    gameBalances[currentGameId] = state.balance;
  }
  const isMakeNoMoney = game.type === 'make-no-money';
  makeMoneyState = isMakeNoMoney ? makeNoMoneyState : makeMoneyDefaultState;
  updateBankroll();
  bankrollDisplayEl.hidden = !game.usesMoney;
  bankrollResetButton.hidden = game.type === 'roulette' || !game.usesMoney;
  document.querySelectorAll('.game-choice').forEach((button) => {
    const active = button.dataset.game === gameId;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });

  homeScreenEl.hidden = true;
  gameScreenEl.hidden = false;
  document.body.classList.remove('home-view');
  document.body.classList.add('game-view-theme');
  const isRoulette = game.type === 'roulette';
  const isMakeMoney = game.type === 'make-money' || isMakeNoMoney;
  const isCubeRunner = game.type === 'cube-runner';
  const isArcade = game.type === 'arcade';
  const isSnake = game.type === 'snake';
  const isBlocks = game.type === 'blocks';
  const isTanks = game.type === 'tanks';
  const isTetris = game.type === 'tetris';
  const is2048 = game.type === '2048';
  rouletteGameEl.hidden = !isRoulette;
  makeMoneyGameEl.hidden = !isMakeMoney;
  cubeRunnerGameEl.hidden = !isCubeRunner;
  arcadeGameEl.hidden = !isArcade;
  snakeGameEl.hidden = !isSnake;
  blocksGameEl.hidden = !isBlocks;
  tanksGameEl.hidden = !isTanks;
  tetrisGameEl.hidden = !isTetris;
  game2048El.hidden = !is2048;
  gameScreenTitleEl.textContent = selectedGame.type === 'random' ? `Random: ${game.title}` : game.title;

  if (isMakeMoney) {
    document.getElementById('moneyTitle').textContent = isMakeNoMoney ? 'Make No Money' : 'Make Money';
    document.getElementById('makeMoneyStatus').classList.toggle('debt-status', isMakeNoMoney && makeMoneyState.balance < 0);
    setMoneyPage('Money');
  } else if (isCubeRunner) {
    setCubePage('menu');
  } else if (isArcade) {
    renderArcadeGame(game.id);
  } else if (isSnake) {
    drawSnakeGame();
  } else if (isBlocks) {
    startBlocksGame();
  } else if (isTanks) {
    startTanksMenu();
  } else if (isTetris) {
    startTetrisGame();
  } else if (is2048) {
    start2048Game();
  }
  void saveState();
}

document.getElementById('homeButton').addEventListener('click', returnHome);

function returnHome() {
  stopCubeAnimation();
  stopSnakeGame();
  stopTanksGame();
  stopTetrisGame();
  document.body.classList.add('home-view');
  document.body.classList.remove('game-view-theme');
  bankrollDisplayEl.hidden = true;
  void saveState();
  gameScreenEl.hidden = true;
  homeScreenEl.hidden = false;
  document.querySelector('.game-choice.active')?.focus();
}

document.querySelectorAll('[data-calculator-action]').forEach((button) => {
  button.addEventListener('click', () =>
    calculatorAction(button.dataset.calculatorAction, button.dataset.calculatorValue || ''),
  );
});
renderCalculator();

function setSyncStatus(text, isError = false) {
  if (!syncStatusEl) return;
  syncStatusEl.textContent = text;
  syncStatusEl.classList.toggle('error', isError);
}

function getSavedState() {
  return {
    balance: state.balance,
    chip: state.chip,
    betType: state.betType,
    selectedNumber: state.selectedNumber,
    wheelRotation: state.wheelRotation,
  };
}

function restoreSavedState(saved) {
  if (!saved || typeof saved !== 'object') {
    throw new Error('Saved game data is invalid.');
  }

  if (
    !Number.isFinite(saved.balance) || saved.balance < 0 ||
    !CHIP_VALUES.includes(saved.chip) ||
    !BET_TYPES.includes(saved.betType) ||
    !Number.isInteger(saved.selectedNumber) || saved.selectedNumber < 0 || saved.selectedNumber > 36 ||
    !Number.isFinite(saved.wheelRotation)
  ) {
    throw new Error('Saved game data is invalid.');
  }

  Object.assign(state, saved);
}

function restoreMakeMoneyState(saved, targetState, allowsDebt = false) {
  if (!saved || typeof saved !== 'object') {
    throw new Error('Saved Make Money data is invalid.');
  }

  if (Number.isFinite(saved.cash) && Number.isFinite(saved.income)) {
    targetState.balance = allowsDebt ? saved.cash : Math.max(0, saved.cash);
    targetState.baseIncome = Math.max(1, saved.income);
    targetState.purchasedUpgrades = [];
    return;
  }

  const numericKeys = ['balance', 'baseIncome', 'incomeBoostLevel', 'bonusClickLevel', 'bonusClicks', 'prestigePoints', 'decimalDigits'];
  if (
    numericKeys.some((key) => !Number.isFinite(saved[key])) ||
    (!allowsDebt && saved.balance < 0) || saved.baseIncome < 1 ||
    saved.incomeBoostLevel < 0 || saved.incomeBoostLevel > incomeBoostCosts.length ||
    saved.bonusClickLevel < 0 || saved.bonusClickLevel > bonusClickCosts.length ||
    saved.bonusClicks < 0 || saved.prestigePoints < 0 ||
    !Number.isInteger(saved.decimalDigits) || saved.decimalDigits < 2 || saved.decimalDigits > 4 ||
    typeof saved.instantGambling !== 'boolean' ||
    !Array.isArray(saved.purchasedUpgrades) ||
    saved.purchasedUpgrades.some((index) => !Number.isInteger(index) || index < 1 || index > moneyUpgrades.length)
  ) {
    throw new Error('Saved Make Money data is invalid.');
  }

  Object.assign(targetState, saved);
  targetState.purchasedUpgrades = [...new Set(saved.purchasedUpgrades)];
}

function restoreCubeRunnerState(saved) {
  if (!saved || typeof saved !== 'object' || Array.isArray(saved)) {
    throw new Error('Saved Cube Runner data is invalid.');
  }
  if (
    !Number.isInteger(saved.unlockedLevel) ||
    saved.unlockedLevel < 1 ||
    saved.unlockedLevel > cubeLevels.length ||
    !cubeSkins.some((skin) => skin.id === saved.selectedSkin) ||
    !saved.bestScores ||
    typeof saved.bestScores !== 'object' ||
    Array.isArray(saved.bestScores) ||
    Object.entries(saved.bestScores).some(([level, score]) =>
      !/^[0-4]$/.test(level) || !Number.isFinite(score) || score < 0)
  ) {
    throw new Error('Saved Cube Runner data is invalid.');
  }
  cubeRunnerState.unlockedLevel = saved.unlockedLevel;
  cubeRunnerState.selectedSkin = saved.selectedSkin;
  cubeRunnerState.bestScores = { ...saved.bestScores };
}

async function saveState() {
  if (!stateReady) return;

  if (!syncStorage) {
    setSyncStatus('Open this game as a Chrome extension to sync.', true);
    return;
  }

  const values = {};
  if (games.find((game) => game.id === currentGameId)?.usesMoney) {
    gameBalances[currentGameId] = state.balance;
    values[BALANCES_KEY] = { ...gameBalances };
  }
  if (currentGameId === 'roulette') {
    values[SYNC_KEY] = getSavedState();
  } else if (currentGameId === 'make-money') {
    values[MAKE_MONEY_KEY] = { ...makeMoneyDefaultState, purchasedUpgrades: [...makeMoneyDefaultState.purchasedUpgrades] };
  } else if (currentGameId === 'make-no-money') {
    values[MAKE_NO_MONEY_KEY] = { ...makeNoMoneyState, purchasedUpgrades: [...makeNoMoneyState.purchasedUpgrades] };
  } else if (currentGameId === 'cube-runner') {
    values[CUBE_RUNNER_KEY] = { ...cubeRunnerState, bestScores: { ...cubeRunnerState.bestScores } };
  }

  try {
    if (Object.keys(values).length > 0) {
      await syncStorage.set(values);
    }
    setSyncStatus('Saved to Chrome sync');
  } catch (error) {
    setSyncStatus(`Could not save synced game: ${error.message}`, true);
  }
}

async function loadSavedState() {
  if (!syncStorage) {
    setSyncStatus('Open this game as a Chrome extension to sync.', true);
    return { needsInitialSave: false };
  }

  try {
    const saved = await syncStorage.get([SYNC_KEY, BALANCES_KEY, MAKE_MONEY_KEY, MAKE_NO_MONEY_KEY, CUBE_RUNNER_KEY]);
    if (saved[BALANCES_KEY] !== undefined) {
      const storedBalances = saved[BALANCES_KEY];
      if (!storedBalances || typeof storedBalances !== 'object' || Array.isArray(storedBalances)) {
        throw new Error('Saved game balances are invalid.');
      }
      Object.entries(storedBalances).forEach(([gameId, balance]) => {
        if (!games.some((game) => game.id === gameId) || !Number.isFinite(balance) || balance < 0) {
          throw new Error('Saved game balances are invalid.');
        }
        gameBalances[gameId] = balance;
      });
    }

    if (saved[SYNC_KEY] !== undefined) {
      restoreSavedState(saved[SYNC_KEY]);
      if (gameBalances.roulette === undefined) {
        gameBalances.roulette = state.balance;
      }
      state.balance = gameBalances.roulette;
    } else if (saved[BALANCES_KEY] === undefined) {
      if (saved[MAKE_MONEY_KEY] === undefined && saved[MAKE_NO_MONEY_KEY] === undefined) {
        return { needsInitialSave: true };
      }
    }

    if (saved[MAKE_MONEY_KEY] !== undefined) {
      restoreMakeMoneyState(saved[MAKE_MONEY_KEY], makeMoneyDefaultState);
    }
    if (saved[MAKE_NO_MONEY_KEY] !== undefined) {
      restoreMakeMoneyState(saved[MAKE_NO_MONEY_KEY], makeNoMoneyState, true);
    }
    if (saved[CUBE_RUNNER_KEY] !== undefined) {
      restoreCubeRunnerState(saved[CUBE_RUNNER_KEY]);
    }

    setSyncStatus('Saved game loaded from Chrome sync');
    return { needsInitialSave: false };
  } catch (error) {
    setSyncStatus(`Could not load synced game: ${error.message}`, true);
    return { needsInitialSave: false };
  }
}

let numberSaveTimer;

function scheduleNumberSave() {
  clearTimeout(numberSaveTimer);
  numberSaveTimer = setTimeout(() => {
    void saveState();
  }, 800);
}

function clampNumber(value) {
  return Math.min(36, Math.max(0, Number.isFinite(value) ? value : 0));
}

async function initializeApp() {
  if (!balanceEl || !betAmountEl || !wheelEl || !messageEl || !numberPicker || !numberPickerWrap) {
    return;
  }

  const controls = document.querySelectorAll('.game-choice, .chip, .bet-type, #numberPicker, #spin, #clearBet, #earnMoney, .money-game button, #cubeRunnerGame button');
  controls.forEach((control) => {
    control.disabled = true;
  });

  const syncResult = await loadSavedState();
  stateReady = true;
  controls.forEach((control) => {
    control.disabled = false;
  });
  numberPicker.value = state.selectedNumber;
  wheelEl.style.transform = `rotate(${state.wheelRotation}deg)`;
  document.querySelectorAll('.chip').forEach((el) => {
    el.classList.toggle('active', Number(el.dataset.chip) === state.chip);
  });
  updateBankroll();
  setBetType(state.betType, false);
  bankrollDisplayEl.hidden = true;
  renderMakeMoneyGame();
  setMoneyPage('Money');
  setCubePage('menu');
  if (syncResult.needsInitialSave) void saveState();
}

function getNumberColor(number) {
  if (number === 0) return 'green';
  const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
  return redNumbers.includes(number) ? 'red' : 'black';
}

function formatMoney(amount) {
  return '$' + Math.max(0, amount);
}

function updateBankroll() {
  const gameBalance = gameBalances[currentGameId] ?? state.balance;
  balanceEl.textContent = formatMoney(gameBalance);
  betAmountEl.textContent = formatMoney(state.chip);
}

function resetGameBankroll() {
  if (!games.find((game) => game.id === currentGameId)?.usesMoney) return;

  if (currentGameId === 'roulette') {
    clearTimeout(rouletteSpinTimer);
    rouletteSpinTimer = null;
    state.wheelRotation = 0;
    wheelEl.style.transition = 'none';
    wheelEl.style.transform = 'rotate(0deg)';
    requestAnimationFrame(() => {
      wheelEl.style.transition = '';
    });
    state.chip = 10;
    state.betType = 'number';
    state.selectedNumber = 17;
    numberPicker.value = state.selectedNumber;
    document.querySelectorAll('.chip').forEach((chip) => {
      chip.classList.toggle('active', Number(chip.dataset.chip) === state.chip);
    });
    setBetType('number');
    setMessage('Fresh stack: $100. Pick a number and spin the wheel.', '');
  } else {
    const blackjack = arcadeRuntime.blackjack;
    blackjack.phase = 'ready';
    blackjack.deck = [];
    blackjack.player = [];
    blackjack.dealer = [];
    blackjack.wager = 0;
    blackjack.message = 'Bankroll reset to $100. Place a bet to deal.';

    const poker = arcadeRuntime.poker;
    poker.phase = 'ready';
    poker.deck = [];
    poker.player = [];
    poker.dealer = [];
    poker.held = [];
    poker.wager = 0;
    poker.message = 'Bankroll reset to $100. Place a bet to draw five cards.';

    const slots = arcadeRuntime.slots;
    clearInterval(slots.spinInterval);
    clearTimeout(slots.spinTimeout);
    slots.spinInterval = null;
    slots.spinTimeout = null;
    slots.spinning = false;
    slots.message = 'Bankroll reset to $100. Match numbers to win.';

    const coin = arcadeRuntime.coin;
    clearTimeout(coin.flipTimeout);
    coin.flipTimeout = null;
    coin.spinning = false;
    coin.result = null;
    coin.message = 'Bankroll reset to $100. Pick heads or tails.';

    arcadeRuntime.dice.result = null;
    arcadeRuntime.dice.message = 'Bankroll reset to $100. Choose low or high.';
  }

  state.balance = 100;
  gameBalances[currentGameId] = 100;
  updateBankroll();
  if (currentGameId !== 'roulette') renderArcadeGame(currentGameId);
  void saveState();
}

function calculateMoneyIncome() {
  return makeMoneyState.baseIncome * (1.1 ** makeMoneyState.incomeBoostLevel)
    * (1 + makeMoneyState.prestigePoints * 0.5);
}

function getBonusClickRate() {
  return makeMoneyState.bonusClickLevel * 0.1;
}

function formatGameMoney(amount) {
  const sign = amount < 0 ? '-$' : '$';
  const absoluteAmount = Math.abs(amount);
  for (const [threshold, suffix] of numberSuffixes) {
    if (absoluteAmount >= threshold) {
      return `${sign}${(absoluteAmount / threshold).toFixed(makeMoneyState.decimalDigits)} ${suffix}`;
    }
  }

  return sign + new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: makeMoneyState.decimalDigits,
  }).format(absoluteAmount);
}

function formatGameCount(amount) {
  return Number(amount.toFixed(makeMoneyState.decimalDigits)).toString();
}

function getMoneyStatus(amount) {
  if (currentGameId === 'make-no-money' && amount < 0) {
    return `You are ${formatGameMoney(Math.abs(amount))} in debt.`;
  }
  const status = balanceStatuses.find(([threshold]) => amount >= threshold);
  if (status) return status[1];
  return amount > 0 ? 'You are extremely poor.' : 'You are broke!';
}

function getAffordableMoneyUpgrade() {
  return moneyUpgrades.find((upgrade, index) =>
    !makeMoneyState.purchasedUpgrades.includes(index + 1) &&
    (currentGameId === 'make-no-money' || makeMoneyState.balance >= upgrade.cost));
}

function addMoneyParagraph(parent, text, className = 'money-help') {
  const paragraph = document.createElement('p');
  paragraph.className = className;
  paragraph.textContent = text;
  parent.appendChild(paragraph);
}

function renderMoneyMainPage(income) {
  document.getElementById('makeMoneyIncome').textContent = `Income: ${formatGameMoney(income)}`;
  document.getElementById('makeMoneyCash').textContent = formatGameMoney(makeMoneyState.balance);
  document.getElementById('makeMoneyStatus').textContent = getMoneyStatus(makeMoneyState.balance);
  document.getElementById('makeMoneyStatus').classList.toggle('debt-status', currentGameId === 'make-no-money' && makeMoneyState.balance < 0);
  document.getElementById('makeMoneyCash').classList.toggle('debt-status', currentGameId === 'make-no-money' && makeMoneyState.balance < 0);
  document.getElementById('bonusClickSummary').textContent =
    `${formatGameCount(makeMoneyState.bonusClicks)} (+${formatGameCount(getBonusClickRate())} / click)`;
  document.getElementById('useBonusClicks').disabled = makeMoneyState.bonusClicks <= 0;

  const offer = document.getElementById('moneyOffer');
  offer.replaceChildren();
  const upgrade = getAffordableMoneyUpgrade();
  if (upgrade) {
    addMoneyParagraph(offer, `You can afford a ${upgrade.name}! (${formatGameMoney(upgrade.cost)})`, 'money-small-text');
    addMoneyParagraph(offer, `(Income +${formatGameMoney(upgrade.bonus)})`, 'money-small-text');
    const buy = document.createElement('button');
    buy.className = 'money-native-button';
    buy.type = 'button';
    buy.textContent = 'Buy';
    buy.addEventListener('click', () => buyMoneyItem(upgrade));
    offer.appendChild(buy);
  }
}

function renderMoneyIncomePage(income) {
  document.getElementById('incomeTabAmount').textContent = formatGameMoney(income);
  document.getElementById('incomeBoostSummary').textContent =
    `Prestige Points: ${makeMoneyState.prestigePoints} (+${formatGameCount(makeMoneyState.prestigePoints * 50)}%)`;
  document.getElementById('incomeMultiplierSummary').textContent = makeMoneyState.incomeBoostLevel === 0
    ? 'Income Boosts: None'
    : `Income Boosts: ${makeMoneyState.incomeBoostLevel} (+10% each)`;

  const multiplier = (1.1 ** makeMoneyState.incomeBoostLevel) * (1 + makeMoneyState.prestigePoints * 0.5);
  document.getElementById('incomeTotalBoost').textContent = multiplier === 1
    ? 'Total Boost: None'
    : `Total Boost: +${formatGameCount((multiplier - 1) * 100)}%`;

  const possessions = document.getElementById('moneyPossessions');
  possessions.replaceChildren();
  const owned = moneyUpgrades.filter((_, index) => makeMoneyState.purchasedUpgrades.includes(index + 1));
  if (owned.length === 0) {
    addMoneyParagraph(possessions, 'You have no possessions! =(', 'money-list-row');
  } else {
    owned.forEach((upgrade) => {
      addMoneyParagraph(possessions, `${upgrade.name}: Income +${formatGameMoney(upgrade.bonus)}`, 'money-list-row');
    });
  }
}

function renderMoneyUpgrades(income) {
  const container = document.getElementById('moneyUpgradeList');
  container.replaceChildren();
  addMoneyParagraph(container, 'BOOSTS', 'money-section-title');

  const rows = [
    {
      title: 'INCOME BOOST',
      cost: incomeBoostCosts[makeMoneyState.incomeBoostLevel],
      description: 'Increases total income by 10%',
      action: buyIncomeBoost,
    },
    {
      title: 'BONUS CLICKS',
      cost: bonusClickCosts[makeMoneyState.bonusClickLevel],
      description: 'Increases bonus click rate by 0.1',
      action: buyBonusClickUpgrade,
    },
  ];

  rows.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'money-upgrade-row';
    const title = document.createElement('span');
    title.className = 'money-upgrade-title';
    title.textContent = item.title;
    const cost = document.createElement('span');
    cost.className = 'money-upgrade-cost';
    cost.textContent = item.cost ? formatGameMoney(item.cost) : 'MAX LEVEL';
    const description = document.createElement('div');
    description.className = 'money-upgrade-detail';
    description.textContent = item.description;
    const button = document.createElement('button');
    button.className = 'money-native-button money-upgrade-buy';
    button.type = 'button';
    button.disabled = !item.cost || (currentGameId !== 'make-no-money' && makeMoneyState.balance < item.cost);
    button.textContent = item.cost ? (button.disabled ? 'CANNOT\nAFFORD' : 'BUY') : 'MAX\nLEVEL';
    button.addEventListener('click', item.action);
    row.append(title, cost, description, button);
    container.appendChild(row);
  });

  const explanation = document.createElement('p');
  explanation.className = 'money-small-text';
  explanation.textContent = 'Bonus clicks are extra clicks that you get every time you click. These extra clicks are saved up. When used, they give you that many clicks worth of money, but are consumed.';
  container.appendChild(explanation);
  document.getElementById('incomeTabAmount').textContent = formatGameMoney(income);
}

function renderMoneyUpdates() {
  const content = document.getElementById('moneyUpdatesContent');
  content.replaceChildren();
  const updates = [
    ['UPDATE 2.0', 'March 3 2019', 'A very large update! A complete HTML and JavaScript rewrite of Make Money. Lots of new features added: improved buttons and navigation tabs; sync storage; settings for decimal digits; improved status messages; help and update notes; and a version display.'],
    ['UPDATE 2.0.1', 'March 8 2019', 'A minor update, mostly to fix a few bugs and rebalance late-game. Fixed storage and decimal digits bugs, and added income boosting to balance late game.'],
    ['UPDATE 2.0.23', 'October 4 2026', 'New clicker features and upgrades: mouse and hold-Enter earning, purchasable items, 25 Income Boost levels, bonus clicks, timed or instant Casino rolls, multi-page Help, Prestige resets and Settings controls.'],
  ];
  const update = updates[updatePage - 1];
  addMoneyParagraph(content, update[0], 'money-section-title');
  addMoneyParagraph(content, update[1], 'money-small-text');
  addMoneyParagraph(content, update[2], 'money-help');
  document.getElementById('previousUpdate').disabled = updatePage <= 1;
  document.getElementById('nextUpdate').disabled = updatePage >= updates.length;
}

function renderMoneyHelp() {
  const content = document.getElementById('moneyHelpContent');
  content.replaceChildren();
  const pages = [
    ['Basics', 'Make Money is a simple clicking game in which you try to earn as much money as possible. Click the Earn button and gain an amount equal to your income.', 'Navigation', 'Money is where you earn money. Income shows possessions and boosts. Upgrades improve your income and bonus clicks. Updates shows past update notes. Help explains the game. Settings controls options and reset. Prestige gives a permanent income boost. Casino is for gambling.'],
    ['Items', 'Items increase your income, but cost money to purchase. Items make it easier to progress in the game.', 'Upgrades', 'Income Boosts increase total income by 10% per level. Bonus Click upgrades save additional clicks whenever you earn money.'],
    ['Casino', 'You can bet any amount of money you have. The slot machine generates three random numbers from 1 to 7. Three 7s pays 25 times your bet; two 7s pays 8 times; three matching numbers pays 8 times; any other pair pays 3 times. Other combinations lose the bet.'],
  ];
  const page = pages[helpPage - 1];
  addMoneyParagraph(content, page[0], 'money-section-title');
  addMoneyParagraph(content, page[1]);
  if (page[2]) {
    addMoneyParagraph(content, page[2], 'money-section-title');
    addMoneyParagraph(content, page[3]);
  }
  document.getElementById('previousHelp').disabled = helpPage <= 1;
  document.getElementById('nextHelp').disabled = helpPage >= pages.length;
}

function renderCasino() {
  document.getElementById('casinoBalance').textContent = `Money: ${formatGameMoney(makeMoneyState.balance)}`;
  document.querySelectorAll('#casinoSlots span').forEach((slot, index) => {
    slot.textContent = casinoSlots[index];
  });
  document.getElementById('casinoMessage').textContent = casinoMessage;
  document.getElementById('casinoGamble').disabled = casinoSpinActive;
}

function renderMakeMoneyGame() {
  const isDebtGame = currentGameId === 'make-no-money';
  document.getElementById('moneyTitle').textContent = isDebtGame ? 'Make No Money' : 'Make Money';
  document.getElementById('makeNoMoneyNotice').hidden = !isDebtGame;
  const income = calculateMoneyIncome();
  renderMoneyMainPage(income);
  renderMoneyIncomePage(income);
  renderMoneyUpgrades(income);
  renderMoneyUpdates();
  renderMoneyHelp();
  renderCasino();
  document.getElementById('decimalDigits').value = makeMoneyState.decimalDigits;
  document.getElementById('decimalDigitsValue').textContent = makeMoneyState.decimalDigits;
  document.getElementById('instantGambling').textContent = makeMoneyState.instantGambling ? 'ON' : 'OFF';
  const prestigeReward = Math.max(0, makeMoneyState.purchasedUpgrades.length - 10);
  document.getElementById('prestigeButton').textContent =
    `PRESTIGE AND EARN\n${prestigeReward}\nPRESTIGE POINTS`;
  document.getElementById('prestigeButton').disabled = prestigeReward <= 0;
}

function setMoneyPage(pageName) {
  makeMoneyPage = pageName;
  if (pageName === 'Updates') updatePage = 1;
  if (pageName === 'Help') helpPage = 1;
  document.querySelectorAll('.money-tab').forEach((button) => {
    const active = button.dataset.moneyPage === pageName;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  document.querySelectorAll('[data-money-panel]').forEach((panel) => {
    panel.hidden = panel.dataset.moneyPanel !== pageName;
  });
  renderMakeMoneyGame();
}

const arcadeDescriptions = {
  blackjack: 'Get closer to 21 than the dealer without going over. Blackjack pays 3:2; a tie returns your bet.',
  slots: 'Spin three reels with numbers from 1 to 7. Three matching numbers pay 5×; any pair pays 2×.',
  dice: 'Call low (1–3) or high (4–6) on a six-sided die. A correct call pays 2×.',
  coin: 'Choose heads or tails. A correct call pays 2×.',
  poker: 'Five-card draw: choose which cards to hold, then draw. Pairs of Jacks or better pay.',
  memory: 'Flip cards and match the pairs of numbers from 1 to 8 in as few moves as possible. This game has no bankroll.',
};

function makeDeck() {
  const suits = ['♠', '♥', '♦', '♣'];
  const cards = [];
  for (const suit of suits) {
    for (let rank = 2; rank <= 14; rank += 1) cards.push({ rank, suit });
  }
  for (let index = cards.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [cards[index], cards[swapIndex]] = [cards[swapIndex], cards[index]];
  }
  return cards;
}

function shuffleItems(items) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
  }
  return items;
}

function cardLabel(card) {
  const ranks = { 11: 'J', 12: 'Q', 13: 'K', 14: 'A' };
  return `${ranks[card.rank] || card.rank}${card.suit}`;
}

function cardHtml(card, hidden = false, held = false) {
  if (hidden) return '<span class="arcade-card hidden-card">◆</span>';
  const red = card.suit === '♥' || card.suit === '♦' ? ' red' : '';
  const isHeld = held ? ' held' : '';
  return `<span class="arcade-card${red}${isHeld}">${cardLabel(card)}</span>`;
}

function renderArcadeGame(gameId) {
  if (!arcadeGames.has(gameId)) return;
  const memory = gameId === 'memory';
  if (memory && arcadeRuntime.memory.cards.length === 0) startMemoryGame(false);
  document.getElementById('arcadeIntro').textContent = arcadeDescriptions[gameId];
  document.getElementById('arcadeWagerWrap').hidden = memory;
  const board = document.getElementById('arcadeBoard');
  const actions = document.getElementById('arcadeActions');
  const status = document.getElementById('arcadeStatus');
  const runtime = arcadeRuntime[gameId];
  actions.replaceChildren();

  const button = (label, action, primary = false) => {
    const element = document.createElement('button');
    element.type = 'button';
    element.className = `arcade-button${primary ? ' primary' : ''}`;
    element.dataset.arcadeAction = action;
    element.textContent = label;
    actions.appendChild(element);
    return element;
  };

  if (gameId === 'blackjack') {
    if (runtime.phase === 'ready') {
      board.innerHTML = '<p>Dealer: —</p><p>Your hand: —</p>';
      button('Deal', 'blackjack-deal', true);
      status.textContent = runtime.message;
    } else {
      const revealDealer = runtime.phase === 'done';
      const dealerCards = runtime.dealer.map((card, index) =>
        cardHtml(card, !revealDealer && index === 1)).join('');
      const dealerTotal = revealDealer ? ` (${blackjackTotal(runtime.dealer)})` : '';
      const playerCards = runtime.player.map((card) => cardHtml(card)).join('');
      board.innerHTML = `<p>Dealer${dealerTotal}</p><div class="arcade-cards">${dealerCards}</div><p>You (${blackjackTotal(runtime.player)})</p><div class="arcade-cards">${playerCards}</div>`;
      if (runtime.phase === 'playing') {
        button('Hit', 'blackjack-hit');
        button('Stand', 'blackjack-stand', true);
      } else {
        button('New hand', 'blackjack-new', true);
      }
      status.textContent = runtime.message;
    }
  } else if (gameId === 'slots') {
    board.innerHTML = `<div class="arcade-reels${runtime.spinning ? ' spinning' : ''}" aria-live="${runtime.spinning ? 'off' : 'polite'}" aria-busy="${runtime.spinning}">${runtime.result.map((number) => `<span>${number}</span>`).join('')}</div>`;
    status.textContent = runtime.message;
    button('Spin', 'slots-spin', true).disabled = runtime.spinning;
  } else if (gameId === 'dice') {
    board.innerHTML = `<span class="arcade-die">${runtime.result ?? '?'}</span>`;
    status.textContent = runtime.message;
    button('Low · 1–3', 'dice-low');
    button('High · 4–6', 'dice-high', true);
  } else if (gameId === 'coin') {
    board.innerHTML = `<span class="arcade-coin${runtime.spinning ? ' spinning' : ''}" aria-live="${runtime.spinning ? 'off' : 'polite'}" aria-busy="${runtime.spinning}">${runtime.result || 'COIN'}</span>`;
    status.textContent = runtime.message;
    button('Heads', 'coin-heads').disabled = runtime.spinning;
    button('Tails', 'coin-tails', true).disabled = runtime.spinning;
  } else if (gameId === 'poker') {
    if (runtime.phase === 'ready') {
      board.innerHTML = '<p>Five-card draw</p><p>Jacks or better pays · See payout table below</p>';
      button('Deal', 'poker-deal', true);
      status.textContent = runtime.message;
    } else {
      board.innerHTML = `<div class="arcade-cards">${runtime.player.map((card, index) =>
        `<button class="arcade-card-button" type="button" data-poker-card="${index}" aria-pressed="${runtime.held.includes(index)}">${cardHtml(card, false, runtime.held.includes(index))}</button>`).join('')}</div><p>Tap cards to hold</p><p class="arcade-copy">Jacks+ 2× · Two pair 3× · Trips 4× · Straight 5× · Flush 7× · Full house 10× · Four kind 25× · Straight flush 50×</p>`;
      if (runtime.phase === 'draw') button('Draw', 'poker-draw', true);
      else button('New hand', 'poker-new', true);
      status.textContent = runtime.message;
    }
  } else if (gameId === 'memory') {
    board.innerHTML = `<div class="memory-board">${runtime.cards.map((card, index) => {
      const revealed = runtime.opened.includes(index) || runtime.matched.includes(index);
      const matched = runtime.matched.includes(index);
      return `<button class="memory-card${revealed ? ' revealed' : ''}${matched ? ' matched' : ''}" type="button" data-memory-card="${index}" aria-label="${revealed ? card : 'Hidden card'}" ${matched || runtime.locked ? 'disabled' : ''}>${revealed ? card : '?'}</button>`;
    }).join('')}</div><p>Moves: ${runtime.moves} · Pairs: ${runtime.matched.length / 2}/8${runtime.best === null ? '' : ` · Best: ${runtime.best}`}</p>`;
    status.textContent = runtime.message;
    button(runtime.cards.length ? 'Restart' : 'Start game', 'memory-start', true);
  }
}

function blackjackTotal(cards) {
  let total = cards.reduce((sum, card) => sum + (card.rank === 14 ? 11 : card.rank > 10 ? 10 : card.rank), 0);
  let aces = cards.filter((card) => card.rank === 14).length;
  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }
  return total;
}

function getArcadeWager() {
  const wager = Number(document.getElementById('arcadeWager').value);
  if (!Number.isSafeInteger(wager) || wager < 1 || wager > state.balance) {
    document.getElementById('arcadeStatus').textContent =
      `Enter a whole-number bet from $1 to ${formatMoney(state.balance)}.`;
    return null;
  }
  return wager;
}

function debitArcadeWager(wager) {
  state.balance -= wager;
  gameBalances[currentGameId] = state.balance;
  updateBankroll();
  void saveState();
}

function creditArcadeWager(wager, multiplier) {
  const payout = wager * multiplier;
  state.balance += payout;
  gameBalances[currentGameId] = state.balance;
  updateBankroll();
  void saveState();
  return payout;
}

function dealBlackjack() {
  const runtime = arcadeRuntime.blackjack;
  const wager = getArcadeWager();
  if (wager === null) return;
  debitArcadeWager(wager);
  runtime.deck = makeDeck();
  runtime.player = [runtime.deck.pop(), runtime.deck.pop()];
  runtime.dealer = [runtime.deck.pop(), runtime.deck.pop()];
  runtime.wager = wager;
  runtime.phase = 'playing';
  runtime.message = 'Hit or stand.';
  if (blackjackTotal(runtime.player) === 21) finishBlackjack();
  renderArcadeGame('blackjack');
}

function finishBlackjack() {
  const runtime = arcadeRuntime.blackjack;
  const playerTotal = blackjackTotal(runtime.player);
  while (blackjackTotal(runtime.dealer) < 17) runtime.dealer.push(runtime.deck.pop());
  const dealerTotal = blackjackTotal(runtime.dealer);
  const playerNatural = runtime.player.length === 2 && playerTotal === 21;
  const dealerNatural = runtime.dealer.length === 2 && dealerTotal === 21;
  runtime.phase = 'done';
  if (playerTotal > 21) {
    runtime.message = 'Bust! Your bet is lost.';
  } else if (playerNatural && !dealerNatural) {
    const payout = creditArcadeWager(runtime.wager, 2.5);
    runtime.message = `Blackjack! You win ${formatMoney(payout)}.`;
  } else if (dealerNatural && !playerNatural) {
    runtime.message = 'Dealer has blackjack. Your bet is lost.';
  } else if (dealerTotal > 21 || playerTotal > dealerTotal) {
    const payout = creditArcadeWager(runtime.wager, 2);
    runtime.message = `You win ${formatMoney(payout)}!`;
  } else if (playerTotal === dealerTotal) {
    creditArcadeWager(runtime.wager, 1);
    runtime.message = 'Push. Your bet was returned.';
  } else {
    runtime.message = 'Dealer wins. Your bet is lost.';
  }
}

function evaluatePokerHand(cards) {
  const ranks = cards.map((card) => card.rank).sort((a, b) => b - a);
  const counts = new Map();
  ranks.forEach((rank) => counts.set(rank, (counts.get(rank) || 0) + 1));
  const groups = [...counts.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0]);
  const flush = cards.every((card) => card.suit === cards[0].suit);
  const unique = [...new Set(ranks)];
  let straightHigh = unique.length === 5 && unique[0] - unique[4] === 4 ? unique[0] : 0;
  if (unique.join(',') === '14,5,4,3,2') straightHigh = 5;
  if (flush && straightHigh) return { rank: 8, name: 'Straight flush', payout: 50 };
  if (groups[0][1] === 4) return { rank: 7, name: 'Four of a kind', payout: 25 };
  if (groups[0][1] === 3 && groups[1][1] === 2) return { rank: 6, name: 'Full house', payout: 10 };
  if (flush) return { rank: 5, name: 'Flush', payout: 7 };
  if (straightHigh) return { rank: 4, name: 'Straight', payout: 5 };
  if (groups[0][1] === 3) return { rank: 3, name: 'Three of a kind', payout: 4 };
  if (groups[0][1] === 2 && groups[1][1] === 2) return { rank: 2, name: 'Two pair', payout: 3 };
  if (groups[0][1] === 2 && groups[0][0] >= 11) return { rank: 1, name: 'Jacks or better', payout: 2 };
  return { rank: 0, name: 'No winning hand', payout: 0 };
}

function playArcadeAction(action) {
  const runtime = arcadeRuntime[currentGameId];
  if (currentGameId === 'blackjack') {
    if (action === 'blackjack-deal') dealBlackjack();
    else if (action === 'blackjack-new') {
      runtime.phase = 'ready';
      runtime.message = 'Place a bet to deal.';
      renderArcadeGame(currentGameId);
    } else if (action === 'blackjack-hit' && runtime.phase === 'playing') {
      runtime.player.push(runtime.deck.pop());
      if (blackjackTotal(runtime.player) >= 21) finishBlackjack();
      renderArcadeGame(currentGameId);
    } else if (action === 'blackjack-stand' && runtime.phase === 'playing') {
      finishBlackjack();
      renderArcadeGame(currentGameId);
    }
  } else if (currentGameId === 'slots' && action === 'slots-spin') {
    if (runtime.spinning) return;
    const wager = getArcadeWager();
    if (wager === null) return;
    debitArcadeWager(wager);
    const result = Array.from({ length: 3 }, () => Math.floor(Math.random() * 7) + 1);
    runtime.spinning = true;
    runtime.message = 'Spinning...';
    renderArcadeGame(currentGameId);
    runtime.spinInterval = setInterval(() => {
      runtime.result = Array.from({ length: 3 }, () => Math.floor(Math.random() * 7) + 1);
      if (currentGameId === 'slots') {
        document.querySelectorAll('#arcadeBoard .arcade-reels span').forEach((reel, index) => {
          reel.textContent = runtime.result[index];
        });
      }
    }, 80);
    runtime.spinTimeout = setTimeout(() => {
      clearInterval(runtime.spinInterval);
      runtime.spinInterval = null;
      runtime.spinTimeout = null;
      runtime.result = result;
      runtime.spinning = false;
      const pair = result.some((number, index) => result.indexOf(number) !== index);
      const multiplier = result[0] === result[1] && result[1] === result[2] ? 5 : pair ? 2 : 0;
      if (multiplier) {
        const payout = creditArcadeWager(wager, multiplier);
        runtime.message = `Winner! ${formatMoney(payout)} returned (${multiplier}×).`;
      } else runtime.message = `No match. You lost ${formatMoney(wager)}.`;
      if (currentGameId === 'slots') renderArcadeGame('slots');
    }, 1200);
  } else if (currentGameId === 'dice' && (action === 'dice-low' || action === 'dice-high')) {
    const wager = getArcadeWager();
    if (wager === null) return;
    debitArcadeWager(wager);
    const roll = Math.floor(Math.random() * 6) + 1;
    const won = action === 'dice-low' ? roll <= 3 : roll >= 4;
    runtime.result = String(roll);
    runtime.message = won
      ? `Rolled ${roll}. Correct call — ${formatMoney(creditArcadeWager(wager, 2))} returned!`
      : `Rolled ${roll}. Your bet is lost.`;
    renderArcadeGame(currentGameId);
  } else if (currentGameId === 'coin' && (action === 'coin-heads' || action === 'coin-tails')) {
    if (runtime.spinning) return;
    const wager = getArcadeWager();
    if (wager === null) return;
    debitArcadeWager(wager);
    const result = Math.random() < 0.5 ? 'heads' : 'tails';
    runtime.spinning = true;
    runtime.result = 'COIN';
    runtime.message = 'Flipping...';
    renderArcadeGame(currentGameId);
    runtime.flipTimeout = setTimeout(() => {
      runtime.flipTimeout = null;
      runtime.result = result.toUpperCase();
      runtime.spinning = false;
      runtime.message = result === action.slice(5)
        ? `It's ${result}! ${formatMoney(creditArcadeWager(wager, 2))} returned!`
        : `It's ${result}. Your bet is lost.`;
      if (currentGameId === 'coin') renderArcadeGame('coin');
    }, 1200);
  } else if (currentGameId === 'poker') {
    if (action === 'poker-deal' && runtime.phase === 'ready') {
      const wager = getArcadeWager();
      if (wager === null) return;
      debitArcadeWager(wager);
      runtime.deck = makeDeck();
      runtime.player = runtime.deck.splice(0, 5);
      runtime.held = [];
      runtime.wager = wager;
      runtime.phase = 'draw';
      runtime.message = 'Choose cards to hold, then draw.';
      renderArcadeGame(currentGameId);
    } else if (action === 'poker-draw' && runtime.phase === 'draw') {
      runtime.player = runtime.player.map((card, index) =>
        runtime.held.includes(index) ? card : runtime.deck.pop());
      const hand = evaluatePokerHand(runtime.player);
      runtime.phase = 'done';
      runtime.message = hand.payout
        ? `${hand.name}! ${formatMoney(creditArcadeWager(runtime.wager, hand.payout))} returned.`
        : `${hand.name}. Your bet is lost.`;
      renderArcadeGame(currentGameId);
    } else if (action === 'poker-new') {
      runtime.phase = 'ready';
      runtime.message = 'Place a bet to draw five cards.';
      renderArcadeGame(currentGameId);
    }
  } else if (currentGameId === 'memory' && action === 'memory-start') {
    startMemoryGame(true);
  }
}

function startMemoryGame(shouldRender) {
  const runtime = arcadeRuntime.memory;
  clearTimeout(memoryHideTimer);
  memoryHideTimer = null;
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8];
  runtime.cards = shuffleItems([...numbers, ...numbers]);
  runtime.opened = [];
  runtime.matched = [];
  runtime.moves = 0;
  runtime.locked = false;
  runtime.message = 'Match pairs of numbers from 1 to 8.';
  if (shouldRender && currentGameId === 'memory') renderArcadeGame('memory');
}

function flipMemoryCard(index) {
  const runtime = arcadeRuntime.memory;
  if (runtime.locked || runtime.cards.length === 0 ||
      runtime.opened.includes(index) || runtime.matched.includes(index)) return;
  runtime.opened.push(index);
  if (runtime.opened.length === 2) {
    runtime.moves += 1;
    const [first, second] = runtime.opened;
    if (runtime.cards[first] === runtime.cards[second]) {
      runtime.matched.push(first, second);
      runtime.opened = [];
      if (runtime.matched.length === runtime.cards.length) {
        runtime.best = runtime.best === null ? runtime.moves : Math.min(runtime.best, runtime.moves);
        runtime.message = `You matched every pair in ${runtime.moves} moves!`;
      } else {
        runtime.message = 'Match! Find another pair.';
      }
    } else {
      runtime.locked = true;
      runtime.message = 'Not a match. Try again.';
      memoryHideTimer = setTimeout(() => {
        memoryHideTimer = null;
        runtime.opened = [];
        runtime.locked = false;
        if (currentGameId === 'memory') renderArcadeGame('memory');
      }, 750);
    }
  }
  renderArcadeGame('memory');
}

function drawSnakeGame() {
  const cellSize = 20;
  const cells = snakeCanvas.width / cellSize;
  snakeContext.fillStyle = '#fafafa';
  snakeContext.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height);
  snakeContext.strokeStyle = '#e5e7eb';
  snakeContext.lineWidth = 1;
  for (let cell = 1; cell < cells; cell += 1) {
    const coordinate = cell * cellSize;
    snakeContext.beginPath();
    snakeContext.moveTo(coordinate, 0);
    snakeContext.lineTo(coordinate, snakeCanvas.height);
    snakeContext.moveTo(0, coordinate);
    snakeContext.lineTo(snakeCanvas.width, coordinate);
    snakeContext.stroke();
  }

  if (snakeState.food) {
    snakeContext.fillStyle = '#ef4444';
    snakeContext.beginPath();
    snakeContext.arc(
      snakeState.food.x * cellSize + cellSize / 2,
      snakeState.food.y * cellSize + cellSize / 2,
      cellSize * 0.36,
      0,
      Math.PI * 2,
    );
    snakeContext.fill();
  }

  snakeState.body.forEach((segment, index) => {
    snakeContext.fillStyle = index === 0 ? '#15803d' : '#22c55e';
    snakeContext.fillRect(
      segment.x * cellSize + 2,
      segment.y * cellSize + 2,
      cellSize - 4,
      cellSize - 4,
    );
  });
  document.getElementById('snakeScore').textContent = `Score: ${snakeState.score}`;
}

function spawnSnakeFood() {
  const occupied = new Set(snakeState.body.map((segment) => `${segment.x},${segment.y}`));
  const available = [];
  for (let y = 0; y < snakeCanvas.height / 20; y += 1) {
    for (let x = 0; x < snakeCanvas.width / 20; x += 1) {
      if (!occupied.has(`${x},${y}`)) available.push({ x, y });
    }
  }
  return available.length ? available[Math.floor(Math.random() * available.length)] : null;
}

function setSnakeDirection(directionName) {
  if (snakeState.phase !== 'running') return;
  const next = snakeDirections[directionName];
  const current = snakeDirections[snakeState.direction];
  if (!next || (next.x === -current.x && next.y === -current.y)) return;
  snakeState.nextDirection = directionName;
}

function endSnakeGame(won) {
  clearInterval(snakeState.timer);
  snakeState.timer = null;
  snakeState.phase = won ? 'won' : 'over';
  document.getElementById('snakeStatus').textContent = won
    ? 'You filled the board! You win!'
    : 'Game over! Avoid the walls and your tail.';
  document.getElementById('snakeStart').textContent = 'Play again';
}

function advanceSnake() {
  snakeState.direction = snakeState.nextDirection;
  const direction = snakeDirections[snakeState.direction];
  const head = snakeState.body[0];
  const nextHead = { x: head.x + direction.x, y: head.y + direction.y };
  const eating = nextHead.x === snakeState.food.x && nextHead.y === snakeState.food.y;
  const collisionBody = eating ? snakeState.body : snakeState.body.slice(0, -1);
  const outsideBoard = nextHead.x < 0 || nextHead.y < 0 ||
    nextHead.x >= snakeCanvas.width / 20 || nextHead.y >= snakeCanvas.height / 20;
  if (outsideBoard || collisionBody.some((segment) =>
    segment.x === nextHead.x && segment.y === nextHead.y)) {
    endSnakeGame(false);
    return;
  }

  snakeState.body.unshift(nextHead);
  if (eating) {
    snakeState.score += 10;
    snakeState.food = spawnSnakeFood();
    if (!snakeState.food) {
      drawSnakeGame();
      endSnakeGame(true);
      return;
    }
  } else {
    snakeState.body.pop();
  }
  drawSnakeGame();
}

function startSnakeGame() {
  clearInterval(snakeState.timer);
  snakeState.body = [{ x: 7, y: 7 }, { x: 6, y: 7 }, { x: 5, y: 7 }];
  snakeState.direction = 'right';
  snakeState.nextDirection = 'right';
  snakeState.food = spawnSnakeFood();
  snakeState.score = 0;
  snakeState.phase = 'running';
  document.getElementById('snakeStatus').textContent = 'Eat the food to grow.';
  document.getElementById('snakeStart').textContent = 'Restart';
  drawSnakeGame();
  snakeState.timer = setInterval(advanceSnake, 140);
}

function stopSnakeGame() {
  clearInterval(snakeState.timer);
  snakeState.timer = null;
  if (snakeState.phase === 'running') {
    snakeState.phase = 'ready';
    document.getElementById('snakeStatus').textContent = 'Press Start to play.';
    document.getElementById('snakeStart').textContent = 'Start';
  }
}

function createTetrisPiece() {
  const source = tetrisShapes[Math.floor(Math.random() * tetrisShapes.length)];
  return {
    cells: source.cells.map(([x, y]) => [x, y]),
    color: source.color,
    x: 3,
    y: 0,
  };
}

function renderTetris() {
  const display = tetrisState.board.map((row) => row.slice());
  if (tetrisState.current) {
    tetrisState.current.cells.forEach(([x, y]) => {
      const boardX = tetrisState.current.x + x;
      const boardY = tetrisState.current.y + y;
      if (boardY >= 0 && boardY < 20 && boardX >= 0 && boardX < 10) {
        display[boardY][boardX] = tetrisState.current.color;
      }
    });
  }
  tetrisBoardEl.innerHTML = display.flat().map((color) =>
    `<span class="tetris-cell${color ? ' filled' : ''}"${color ? ` style="--tetris-color:${color}"` : ''}></span>`,
  ).join('');

  const nextCells = new Set(tetrisState.next?.cells.map(([x, y]) => `${x},${y}`) || []);
  document.getElementById('tetrisNext').innerHTML = Array.from({ length: 16 }, (_, index) => {
    const x = index % 4;
    const y = Math.floor(index / 4);
    const filled = nextCells.has(`${x},${y}`);
    return `<span class="tetris-next-cell${filled ? ' filled' : ''}"${filled ? ` style="--tetris-color:${tetrisState.next.color}"` : ''}></span>`;
  }).join('');
  document.getElementById('tetrisScore').textContent = `Score: ${tetrisState.score}`;
  document.getElementById('tetrisLines').textContent = `Lines: ${tetrisState.lines}`;
  document.getElementById('tetrisStart').textContent =
    tetrisState.phase === 'over' ? 'Play again' : 'Restart';
}

function tetrisCanPlace(piece, offsetX = piece.x, offsetY = piece.y) {
  return piece.cells.every(([x, y]) => {
    const boardX = offsetX + x;
    const boardY = offsetY + y;
    return boardX >= 0 && boardX < 10 && boardY < 20 &&
      (boardY < 0 || !tetrisState.board[boardY][boardX]);
  });
}

function spawnTetrisPiece() {
  tetrisState.current = tetrisState.next || createTetrisPiece();
  tetrisState.current.x = 3;
  tetrisState.current.y = 0;
  tetrisState.next = createTetrisPiece();
  if (!tetrisCanPlace(tetrisState.current)) {
    clearInterval(tetrisState.timer);
    tetrisState.timer = null;
    tetrisState.phase = 'over';
    document.getElementById('tetrisStatus').textContent =
      `Game over! Final score: ${tetrisState.score}. Press Play again to restart.`;
  }
  renderTetris();
}

function startTetrisGame() {
  clearInterval(tetrisState.timer);
  tetrisState.board = Array.from({ length: 20 }, () => Array(10).fill(null));
  tetrisState.score = 0;
  tetrisState.lines = 0;
  tetrisState.phase = 'playing';
  tetrisState.current = createTetrisPiece();
  tetrisState.next = createTetrisPiece();
  document.getElementById('tetrisStatus').textContent =
    'Arrows/A-D move · Down/S soft drop · Up/W/X rotate · Space hard drop.';
  spawnTetrisPiece();
  if (tetrisState.phase === 'playing') {
    tetrisState.timer = setInterval(tickTetris, 650);
  }
}

function stopTetrisGame() {
  clearInterval(tetrisState.timer);
  tetrisState.timer = null;
  if (tetrisState.phase === 'playing') tetrisState.phase = 'ready';
}

function lockTetrisPiece() {
  const piece = tetrisState.current;
  if (piece.cells.some(([, y]) => piece.y + y < 0)) {
    tetrisState.phase = 'over';
    clearInterval(tetrisState.timer);
    tetrisState.timer = null;
    document.getElementById('tetrisStatus').textContent =
      `Game over! Final score: ${tetrisState.score}. Press Play again to restart.`;
    renderTetris();
    return;
  }
  piece.cells.forEach(([x, y]) => {
    tetrisState.board[piece.y + y][piece.x + x] = piece.color;
  });

  const remainingRows = tetrisState.board.filter((row) => !row.every(Boolean));
  const cleared = 20 - remainingRows.length;
  if (cleared) {
    tetrisState.lines += cleared;
    tetrisState.score += [0, 100, 300, 500, 800][cleared] || cleared * 200;
    while (remainingRows.length < 20) remainingRows.unshift(Array(10).fill(null));
    tetrisState.board = remainingRows;
    document.getElementById('tetrisStatus').textContent =
      `Cleared ${cleared} ${cleared === 1 ? 'line' : 'lines'}!`;
  }
  spawnTetrisPiece();
}

function tickTetris() {
  if (tetrisState.phase !== 'playing') return;
  if (tetrisCanPlace(tetrisState.current, tetrisState.current.x, tetrisState.current.y + 1)) {
    tetrisState.current.y += 1;
    renderTetris();
  } else {
    lockTetrisPiece();
  }
}

function actTetris(action) {
  if (tetrisState.phase !== 'playing') return;
  const piece = tetrisState.current;
  if (action === 'left' || action === 'right') {
    const offset = action === 'left' ? -1 : 1;
    if (tetrisCanPlace(piece, piece.x + offset, piece.y)) piece.x += offset;
  } else if (action === 'down') {
    if (tetrisCanPlace(piece, piece.x, piece.y + 1)) {
      piece.y += 1;
      tetrisState.score += 1;
    } else lockTetrisPiece();
  } else if (action === 'drop') {
    while (tetrisCanPlace(piece, piece.x, piece.y + 1)) {
      piece.y += 1;
      tetrisState.score += 2;
    }
    lockTetrisPiece();
  } else if (action === 'rotate') {
    const maxY = Math.max(...piece.cells.map(([, y]) => y));
    const rotated = piece.cells.map(([x, y]) => [maxY - y, x]);
    const minX = Math.min(...rotated.map(([x]) => x));
    const minY = Math.min(...rotated.map(([, y]) => y));
    const normalized = rotated.map(([x, y]) => [x - minX, y - minY]);
    for (const kick of [0, -1, 1, -2, 2]) {
      const candidateX = Math.min(10 - Math.max(...normalized.map(([x]) => x)) - 1, Math.max(0, piece.x + kick));
      if (tetrisCanPlace({ ...piece, cells: normalized }, candidateX, piece.y)) {
        piece.cells = normalized;
        piece.x = candidateX;
        break;
      }
    }
  }
  renderTetris();
}

document.getElementById('tetrisStart').addEventListener('click', startTetrisGame);
document.querySelectorAll('[data-tetris-action]').forEach((button) => {
  button.addEventListener('click', () => actTetris(button.dataset.tetrisAction));
});

function spawn2048Tile() {
  const emptyCells = [];
  game2048State.board.forEach((row, rowIndex) => {
    row.forEach((value, columnIndex) => {
      if (!value) emptyCells.push([rowIndex, columnIndex]);
    });
  });
  if (!emptyCells.length) return;
  const [row, column] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  game2048State.board[row][column] = Math.random() < 0.9 ? 2 : 4;
}

function render2048() {
  game2048BoardEl.innerHTML = game2048State.board.flat().map((value) => {
    const tileClass = value ? ` tile-${value <= 2048 ? value : 'high'}` : '';
    return `<div class="game2048-tile${tileClass}" role="gridcell" aria-label="${value || 'Empty tile'}">${value || ''}</div>`;
  }).join('');
  document.getElementById('game2048Score').textContent = `Score: ${game2048State.score}`;
  document.getElementById('game2048Best').textContent = `Best: ${game2048State.best}`;
}

function has2048Moves() {
  if (game2048State.board.some((row) => row.includes(0))) return true;
  return game2048State.board.some((row, rowIndex) => row.some((value, columnIndex) =>
    (rowIndex < 3 && value === game2048State.board[rowIndex + 1][columnIndex]) ||
    (columnIndex < 3 && value === row[columnIndex + 1]),
  ));
}

function start2048Game() {
  game2048State.board = Array.from({ length: 4 }, () => Array(4).fill(0));
  game2048State.score = 0;
  game2048State.phase = 'playing';
  game2048State.won = false;
  spawn2048Tile();
  spawn2048Tile();
  document.getElementById('game2048Status').textContent =
    'Join matching numbers to reach 2048. Use the arrow keys, WASD, or buttons.';
  render2048();
}

function move2048(direction) {
  if (game2048State.phase !== 'playing') return;
  let changed = false;
  for (let lane = 0; lane < 4; lane += 1) {
    const positions = Array.from({ length: 4 }, (_, index) => {
      if (direction === 'left') return [lane, index];
      if (direction === 'right') return [lane, 3 - index];
      if (direction === 'up') return [index, lane];
      return [3 - index, lane];
    });
    const original = positions.map(([row, column]) => game2048State.board[row][column]);
    const compacted = original.filter(Boolean);
    const merged = [];
    for (let index = 0; index < compacted.length; index += 1) {
      if (compacted[index] === compacted[index + 1]) {
        const combined = compacted[index] * 2;
        merged.push(combined);
        game2048State.score += combined;
        index += 1;
      } else {
        merged.push(compacted[index]);
      }
    }
    while (merged.length < 4) merged.push(0);
    positions.forEach(([row, column], index) => {
      if (game2048State.board[row][column] !== merged[index]) changed = true;
      game2048State.board[row][column] = merged[index];
    });
  }
  if (!changed) return;

  spawn2048Tile();
  game2048State.best = Math.max(game2048State.best, game2048State.score);
  const reached2048 = !game2048State.won &&
    game2048State.board.some((row) => row.includes(2048));
  if (reached2048) game2048State.won = true;
  if (!has2048Moves()) {
    game2048State.phase = 'over';
    document.getElementById('game2048Status').textContent =
      `No more moves. Final score: ${game2048State.score}. Start a new game to play again.`;
  } else if (reached2048) {
    document.getElementById('game2048Status').textContent =
      'You made 2048! Keep playing or start a new game.';
  }
  render2048();
}

document.getElementById('game2048Reset').addEventListener('click', start2048Game);
document.querySelectorAll('[data-2048-direction]').forEach((button) => {
  button.addEventListener('click', () => move2048(button.dataset['2048Direction']));
});

function tanksGroundY(x) {
  const points = tanksState.terrain;
  if (points.length < 2) return tanksCanvas.height - 42;
  const step = tanksCanvas.width / (points.length - 1);
  const index = Math.min(points.length - 2, Math.max(0, Math.floor(x / step)));
  const fraction = (x - index * step) / step;
  return points[index].y + (points[index + 1].y - points[index].y) * fraction;
}

function generateTanksTerrain() {
  const pointCount = 31;
  tanksState.terrain = Array.from({ length: pointCount }, (_, index) => ({
    x: index * tanksCanvas.width / (pointCount - 1),
    y: 205 + Math.random() * 72,
  }));
  for (let pass = 0; pass < 2; pass += 1) {
    const heights = tanksState.terrain.map((point) => point.y);
    tanksState.terrain.forEach((point, index) => {
      const previous = heights[Math.max(0, index - 1)];
      const next = heights[Math.min(pointCount - 1, index + 1)];
      point.y = Math.max(190, Math.min(270, (previous + heights[index] * 2 + next) / 4));
    });
  }
  tanksState.wind = Math.floor(Math.random() * 61) - 30;
}

function drawTank(x, facing, color, angle) {
  const ground = tanksGroundY(x);
  const ctx = tanksContext;
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.ellipse(x, ground - 3, 23, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x - 17, ground - 7);
  ctx.lineTo(x - 12, ground - 19);
  ctx.lineTo(x + 12, ground - 19);
  ctx.lineTo(x + 18, ground - 7);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#1f2937';
  ctx.beginPath();
  ctx.arc(x, ground - 19, 7, Math.PI, Math.PI * 2);
  ctx.fill();
  const radians = angle * Math.PI / 180;
  const direction = facing === 'right' ? 1 : -1;
  ctx.strokeStyle = '#1f2937';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, ground - 19);
  ctx.lineTo(x + Math.cos(radians) * direction * 25, ground - 19 - Math.sin(radians) * 25);
  ctx.stroke();
}

function drawTanksScene() {
  const ctx = tanksContext;
  const width = tanksCanvas.width;
  const height = tanksCanvas.height;
  ctx.clearRect(0, 0, width, height);
  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, '#dbeafe');
  sky.addColorStop(1, '#f8fafc');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(505, 55, 22, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#9ca3af';
  ctx.beginPath();
  ctx.moveTo(0, tanksCanvas.height - 42);
  tanksState.terrain.forEach((point) => ctx.lineTo(point.x, point.y));
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#65a30d';
  ctx.lineWidth = 5;
  ctx.beginPath();
  tanksState.terrain.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.stroke();
  drawTank(54, 'right', '#2563eb', Number(document.getElementById('tankAngle').value));
  const opponentAngle = tanksState.mode === 'bot'
    ? tanksState.botAngle
    : Number(document.getElementById('tankAngle').value);
  drawTank(width - 54, 'left', '#dc2626', opponentAngle);
  if (tanksState.shell) {
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.arc(tanksState.shell.x, tanksState.shell.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#1f2937';
  ctx.font = '12px Arial';
  ctx.fillText(`Wind ${tanksState.wind < 0 ? '←' : '→'} ${Math.abs(tanksState.wind)}`, 12, 20);
  document.getElementById('tankPlayerOneHealth').textContent = '●'.repeat(tanksState.health[0]) + '○'.repeat(3 - tanksState.health[0]);
  document.getElementById('tankPlayerTwoHealth').textContent = '●'.repeat(tanksState.health[1]) + '○'.repeat(3 - tanksState.health[1]);
  document.getElementById('tankPlayerOneHealth').setAttribute('aria-label', `${tanksState.health[0]} hits remaining`);
  document.getElementById('tankPlayerTwoHealth').setAttribute('aria-label', `${tanksState.health[1]} hits remaining`);
}

function startTanksMenu() {
  tanksState.mode = 'bot';
  tanksState.level = 1;
  tanksState.phase = 'menu';
  tanksState.health = [3, 3];
  tanksState.terrain = [];
  document.getElementById('tanksModeSelect').hidden = false;
  document.getElementById('tanksControls').hidden = true;
  document.getElementById('tankNextLevel').hidden = true;
  document.getElementById('tankAngle').value = 45;
  document.getElementById('tankPower').value = 60;
  document.getElementById('tankAngleValue').textContent = '45°';
  document.getElementById('tankPowerValue').textContent = '60';
  document.getElementById('tankPlayerTwoName').textContent = 'Player 2';
  document.getElementById('tanksStatus').textContent = 'Choose a game mode.';
  generateTanksTerrain();
  drawTanksScene();
}

function startTanksBattle(mode, nextLevel = false) {
  stopTanksProjectile();
  if (!nextLevel) tanksState.level = 1;
  else tanksState.level += 1;
  tanksState.mode = mode;
  tanksState.botAngle = 45;
  document.getElementById('tankPlayerTwoName').textContent = mode === 'bot' ? 'Bot' : 'Player 2';
  tanksState.health = [3, 3];
  tanksState.currentPlayer = 0;
  tanksState.phase = 'playing';
  generateTanksTerrain();
  document.getElementById('tanksModeSelect').hidden = true;
  document.getElementById('tanksControls').hidden = false;
  document.getElementById('tankNextLevel').hidden = true;
  document.getElementById('tankFire').disabled = false;
  document.getElementById('tanksStatus').textContent =
    `Level ${tanksState.level} · Player 1's turn. Aim and fire! Wind ${tanksState.wind}.`;
  drawTanksScene();
}

function stopTanksProjectile() {
  if (tanksState.animationFrame !== null) {
    cancelAnimationFrame(tanksState.animationFrame);
    tanksState.animationFrame = null;
  }
  clearTimeout(tanksState.botTimer);
  tanksState.botTimer = null;
  tanksState.shell = null;
}

function stopTanksGame() {
  stopTanksProjectile();
  tanksState.phase = 'menu';
}

function tanksShotResult(player, angle, power) {
  const direction = player === 0 ? 1 : -1;
  const originX = player === 0 ? 54 : tanksCanvas.width - 54;
  const startY = tanksGroundY(originX) - 21;
  const radians = angle * Math.PI / 180;
  const speed = power * 3.6;
  let x = originX;
  let y = startY;
  let vx = Math.cos(radians) * speed * direction;
  let vy = -Math.sin(radians) * speed;
  let closest = Infinity;
  const targetX = player === 0 ? tanksCanvas.width - 54 : 54;
  for (let time = 0; time < 5; time += 0.025) {
    x += vx * 0.025;
    y += vy * 0.025;
    vy += 260 * 0.025;
    vx += tanksState.wind * 0.025;
    const targetY = tanksGroundY(targetX) - 16;
    closest = Math.min(closest, Math.hypot(x - targetX, y - targetY));
    if (closest <= 35) return { hit: true, distance: 0 };
    if (x < 0 || x > tanksCanvas.width || y >= tanksGroundY(x) || y > tanksCanvas.height) break;
  }
  return { hit: false, distance: closest };
}

function chooseBotShot() {
  const candidates = [];
  for (let angle = 15; angle <= 75; angle += 3) {
    for (let power = 30; power <= 100; power += 2) {
      const result = tanksShotResult(1, angle, power);
      candidates.push({ angle, power, distance: result.distance });
    }
  }
  candidates.sort((first, second) => first.distance - second.distance);
  const best = candidates[0];
  const chosen = Math.random() < 0.4
    ? candidates[Math.floor(Math.random() * candidates.length)]
    : best;
  const angle = Math.max(10, Math.min(80, Math.round(chosen.angle + (Math.random() * 24 - 12))));
  const power = Math.max(25, Math.min(100, Math.round(chosen.power + (Math.random() * 50 - 25))));
  tanksState.botAngle = angle;
  drawTanksScene();
  launchTankShot(1, angle, power);
}

function fireTank() {
  if (tanksState.phase !== 'playing' || (tanksState.mode === 'bot' && tanksState.currentPlayer === 1)) return;
  launchTankShot(
    tanksState.currentPlayer,
    Number(document.getElementById('tankAngle').value),
    Number(document.getElementById('tankPower').value),
  );
}

function launchTankShot(player, angle, power) {
  if (tanksState.phase !== 'playing') return;
  const direction = player === 0 ? 1 : -1;
  const originX = player === 0 ? 54 : tanksCanvas.width - 54;
  const radians = angle * Math.PI / 180;
  const speed = power * 3.6;
  tanksState.shell = {
    x: originX + Math.cos(radians) * 24 * direction,
    y: tanksGroundY(originX) - 21 - Math.sin(radians) * 24,
    vx: Math.cos(radians) * speed * direction,
    vy: -Math.sin(radians) * speed,
    player,
    previousTime: null,
  };
  tanksState.phase = 'firing';
  document.getElementById('tankFire').disabled = true;
  document.getElementById('tanksStatus').textContent =
    `${tanksState.mode === 'bot' && player === 1 ? 'Bot' : `Player ${player + 1}`} fired!`;
  tanksState.animationFrame = requestAnimationFrame(updateTankShell);
}

function createTankCrater(x) {
  const radius = 32;
  tanksState.terrain.forEach((point) => {
    const distance = Math.abs(point.x - x);
    if (distance < radius) {
      point.y = Math.min(270, point.y + (1 - distance / radius) * 18);
    }
  });
}

function finishTankShot(hitPlayer, impactX) {
  createTankCrater(impactX);
  tanksState.shell = null;
  tanksState.animationFrame = null;
  if (hitPlayer !== null) {
    tanksState.health[hitPlayer] = Math.max(0, tanksState.health[hitPlayer] - 1);
  }
  drawTanksScene();

  if (hitPlayer !== null && tanksState.health[hitPlayer] === 0) {
    tanksState.phase = 'over';
    const winner = hitPlayer === 0 ? (tanksState.mode === 'bot' ? 'Bot' : 'Player 2') : 'Player 1';
    document.getElementById('tanksStatus').textContent = `${winner} wins! The tank took three hits.`;
    document.getElementById('tankNextLevel').textContent = `Next level (${tanksState.level + 1})`;
    document.getElementById('tankNextLevel').hidden = false;
    document.getElementById('tankFire').disabled = true;
    return;
  }

  tanksState.currentPlayer = 1 - tanksState.currentPlayer;
  tanksState.phase = 'playing';
  document.getElementById('tankFire').disabled =
    tanksState.mode === 'bot' && tanksState.currentPlayer === 1;
  const playerName = tanksState.mode === 'bot' && tanksState.currentPlayer === 1
    ? 'Bot'
    : `Player ${tanksState.currentPlayer + 1}`;
  const hitPlayerName = hitPlayer === null
    ? ''
    : hitPlayer === 1 && tanksState.mode === 'bot' ? 'Bot' : `Player ${hitPlayer + 1}`;
  document.getElementById('tanksStatus').textContent = hitPlayer === null
    ? `Miss! ${playerName}'s turn.`
    : `${hitPlayerName} took a hit! ${playerName}'s turn.`;
  drawTanksScene();
  if (tanksState.mode === 'bot' && tanksState.currentPlayer === 1) {
    document.getElementById('tanksStatus').textContent = 'Bot is aiming...';
    tanksState.botTimer = setTimeout(chooseBotShot, 650);
  }
}

function updateTankShell(time) {
  const shell = tanksState.shell;
  if (!shell || tanksState.phase !== 'firing') return;
  if (shell.previousTime === null) shell.previousTime = time;
  const dt = Math.min(0.04, (time - shell.previousTime) / 1000);
  shell.previousTime = time;
  shell.x += shell.vx * dt;
  shell.y += shell.vy * dt;
  shell.vy += 260 * dt;
  shell.vx += tanksState.wind * dt;

  const targetPlayer = 1 - shell.player;
  const targetX = targetPlayer === 0 ? 54 : tanksCanvas.width - 54;
  const targetY = tanksGroundY(targetX) - 16;
  const hit = Math.hypot(shell.x - targetX, shell.y - targetY) <= 35;
  const outside = shell.x < 0 || shell.x > tanksCanvas.width || shell.y > tanksCanvas.height;
  const groundHit = shell.y >= tanksGroundY(shell.x);
  if (hit || outside || groundHit) {
    finishTankShot(hit ? targetPlayer : null, Math.max(0, Math.min(tanksCanvas.width, shell.x)));
    return;
  }
  drawTanksScene();
  tanksState.animationFrame = requestAnimationFrame(updateTankShell);
}

document.getElementById('tanksVsBot').addEventListener('click', () => startTanksBattle('bot'));
document.getElementById('tanksTwoPlayers').addEventListener('click', () => startTanksBattle('two'));
document.getElementById('tankFire').addEventListener('click', fireTank);
document.getElementById('tankNextLevel').addEventListener('click', () =>
  startTanksBattle(tanksState.mode, true),
);
document.getElementById('tankAngle').addEventListener('input', (event) => {
  document.getElementById('tankAngleValue').textContent = `${event.target.value}°`;
  drawTanksScene();
});
function aimTankAtPointer(event) {
  if (tanksState.phase !== 'playing') return false;
  if (tanksState.mode === 'bot' && tanksState.currentPlayer !== 0) return false;
  const bounds = tanksCanvas.getBoundingClientRect();
  const pointerX = (event.clientX - bounds.left) * tanksCanvas.width / bounds.width;
  const pointerY = (event.clientY - bounds.top) * tanksCanvas.height / bounds.height;
  const player = tanksState.currentPlayer;
  const originX = player === 0 ? 54 : tanksCanvas.width - 54;
  const facing = player === 0 ? pointerX > originX : pointerX < originX;
  if (!facing) return false;
  const originY = tanksGroundY(originX) - 19;
  const angle = Math.max(10, Math.min(80,
    Math.round(Math.atan2(originY - pointerY, Math.abs(pointerX - originX)) * 180 / Math.PI),
  ));
  document.getElementById('tankAngle').value = angle;
  document.getElementById('tankAngleValue').textContent = `${angle}°`;
  drawTanksScene();
  return true;
}
tanksCanvas.addEventListener('mousemove', aimTankAtPointer);
tanksCanvas.addEventListener('click', (event) => {
  if (aimTankAtPointer(event)) fireTank();
});
document.getElementById('tankPower').addEventListener('input', (event) => {
  document.getElementById('tankPowerValue').textContent = event.target.value;
});

function makeBlockPiece() {
  const shape = blockShapes[Math.floor(Math.random() * blockShapes.length)];
  return {
    shape: shape.map(([x, y]) => [x, y]),
    color: blockColors[Math.floor(Math.random() * blockColors.length)],
  };
}

function renderBlocksGame() {
  blocksBoardEl.innerHTML = blocksState.board.map((row, y) => row.map((color, x) =>
    `<button class="blocks-cell${color ? ' filled' : ''}" type="button" data-block-x="${x}" data-block-y="${y}" aria-label="Row ${y + 1}, column ${x + 1}${color ? ', filled' : ', empty'}"${color ? ` style="background:${color};border-color:${color}"` : ''}></button>`,
  ).join('')).join('');

  blocksTrayEl.replaceChildren();
  blocksState.pieces.forEach((piece, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'blocks-piece';
    button.dataset.blockPiece = String(index);
    button.disabled = blocksState.phase !== 'playing';
    button.draggable = blocksState.phase === 'playing';
    button.setAttribute('aria-pressed', String(blocksState.selected === index));
    button.setAttribute('aria-label', `Block ${index + 1}, ${piece.shape.length} squares`);
    const width = Math.max(...piece.shape.map(([x]) => x)) + 1;
    const height = Math.max(...piece.shape.map(([, y]) => y)) + 1;
    const occupied = new Set(piece.shape.map(([x, y]) => `${x},${y}`));
    const preview = document.createElement('span');
    preview.className = 'blocks-preview';
    preview.style.gridTemplateColumns = `repeat(${width}, 13px)`;
    preview.style.gridTemplateRows = `repeat(${height}, 13px)`;
    preview.innerHTML = Array.from({ length: width * height }, (_, cellIndex) => {
      const x = cellIndex % width;
      const y = Math.floor(cellIndex / width);
      return `<span class="blocks-preview-cell"${occupied.has(`${x},${y}`) ? ` style="--block-color:${piece.color}"` : ' style="visibility:hidden"'}></span>`;
    }).join('');
    button.appendChild(preview);
    blocksTrayEl.appendChild(button);
  });

  document.getElementById('blocksScore').textContent = `Score: ${blocksState.score}`;
}

function startBlocksGame() {
  blocksState.board = Array.from({ length: 10 }, () => Array(10).fill(null));
  blocksState.pieces = Array.from({ length: 3 }, makeBlockPiece);
  blocksState.selected = null;
  blocksState.score = 0;
  blocksState.phase = 'playing';
  document.getElementById('blocksStatus').textContent = 'Choose a block, then place it on the grid.';
  renderBlocksGame();
}

function canPlaceBlock(piece, originX, originY) {
  return piece.shape.every(([x, y]) => {
    const boardX = originX + x;
    const boardY = originY + y;
    return boardX >= 0 && boardX < 10 && boardY >= 0 && boardY < 10 &&
      !blocksState.board[boardY][boardX];
  });
}

function clearBlockPreview() {
  blocksBoardEl.querySelectorAll('.blocks-cell.preview, .blocks-cell.preview-invalid').forEach((cell) => {
    cell.classList.remove('preview', 'preview-invalid');
    cell.style.removeProperty('--preview-color');
  });
}

function showBlockPreview(pieceIndex, originX, originY) {
  clearBlockPreview();
  const piece = blocksState.pieces[pieceIndex];
  if (!piece) return;
  const valid = canPlaceBlock(piece, originX, originY);
  piece.shape.forEach(([x, y]) => {
    const cell = blocksBoardEl.querySelector(
      `[data-block-x="${originX + x}"][data-block-y="${originY + y}"]`,
    );
    if (cell) {
      cell.classList.add(valid ? 'preview' : 'preview-invalid');
      if (valid) cell.style.setProperty('--preview-color', piece.color);
    }
  });
}

function placeBlock(pieceIndex, originX, originY) {
  const piece = blocksState.pieces[pieceIndex];
  if (blocksState.phase !== 'playing' || !piece) return;
  if (!canPlaceBlock(piece, originX, originY)) {
    document.getElementById('blocksStatus').textContent = 'That shape does not fit there.';
    return;
  }

  piece.shape.forEach(([x, y]) => {
    blocksState.board[originY + y][originX + x] = piece.color;
  });
  blocksState.score += piece.shape.length;
  const fullRows = blocksState.board
    .map((row, index) => row.every(Boolean) ? index : -1)
    .filter((index) => index !== -1);
  const fullColumns = Array.from({ length: 10 }, (_, x) =>
    blocksState.board.every((row) => row[x]) ? x : -1,
  ).filter((index) => index !== -1);
  const clearedCells = new Set();
  fullRows.forEach((y) => {
    for (let x = 0; x < 10; x += 1) clearedCells.add(`${x},${y}`);
  });
  fullColumns.forEach((x) => {
    for (let y = 0; y < 10; y += 1) clearedCells.add(`${x},${y}`);
  });
  clearedCells.forEach((cell) => {
    const [x, y] = cell.split(',').map(Number);
    blocksState.board[y][x] = null;
  });
  const linesCleared = fullRows.length + fullColumns.length;
  blocksState.score += linesCleared * 10;
  blocksState.pieces.splice(pieceIndex, 1);
  blocksState.selected = null;
  clearBlockPreview();

  if (linesCleared) {
    document.getElementById('blocksStatus').textContent =
      `Cleared ${linesCleared} ${linesCleared === 1 ? 'line' : 'lines'}!`;
  } else {
    document.getElementById('blocksStatus').textContent = 'Block placed.';
  }

  if (!blocksState.pieces.length) {
    blocksState.pieces = Array.from({ length: 3 }, makeBlockPiece);
  }
  const hasMove = blocksState.pieces.some((remainingPiece) => {
    for (let boardY = 0; boardY < 10; boardY += 1) {
      for (let boardX = 0; boardX < 10; boardX += 1) {
        if (canPlaceBlock(remainingPiece, boardX, boardY)) return true;
      }
    }
    return false;
  });
  if (!hasMove) {
    blocksState.phase = 'over';
    document.getElementById('blocksStatus').textContent =
      `Game over! Final score: ${blocksState.score}. Start a new game to play again.`;
  }
  renderBlocksGame();
}

blocksBoardEl.addEventListener('click', (event) => {
  const cell = event.target.closest('[data-block-x]');
  if (!cell || blocksState.selected === null) return;
  placeBlock(blocksState.selected, Number(cell.dataset.blockX), Number(cell.dataset.blockY));
});
blocksBoardEl.addEventListener('pointerover', (event) => {
  const cell = event.target.closest('[data-block-x]');
  if (!cell || blocksState.selected === null) return;
  showBlockPreview(blocksState.selected, Number(cell.dataset.blockX), Number(cell.dataset.blockY));
});
blocksBoardEl.addEventListener('pointerleave', clearBlockPreview);
blocksBoardEl.addEventListener('dragover', (event) => event.preventDefault());
blocksBoardEl.addEventListener('drop', (event) => {
  event.preventDefault();
  const cell = event.target.closest('[data-block-x]');
  if (!cell) return;
  const draggedIndex = Number(event.dataTransfer.getData('text/plain'));
  const pieceIndex = Number.isInteger(blocksState.selected) ? blocksState.selected : draggedIndex;
  placeBlock(pieceIndex, Number(cell.dataset.blockX), Number(cell.dataset.blockY));
});
blocksTrayEl.addEventListener('click', (event) => {
  const button = event.target.closest('[data-block-piece]');
  if (!button || blocksState.phase !== 'playing') return;
  blocksState.selected = Number(button.dataset.blockPiece);
  document.getElementById('blocksStatus').textContent = 'Click a starting square on the grid.';
  renderBlocksGame();
});
blocksTrayEl.addEventListener('dragstart', (event) => {
  const button = event.target.closest('[data-block-piece]');
  if (!button || blocksState.phase !== 'playing') return;
  blocksState.selected = Number(button.dataset.blockPiece);
  event.dataTransfer.setData('text/plain', button.dataset.blockPiece);
});
blocksTrayEl.addEventListener('dragend', clearBlockPreview);
document.getElementById('blocksReset').addEventListener('click', startBlocksGame);

function setCubePage(pageName) {
  stopCubeAnimation();
  cubePage = pageName;
  document.querySelectorAll('[data-cube-page]').forEach((page) => {
    page.hidden = page.dataset.cubePage !== pageName;
  });
  if (pageName === 'menu') {
    const level = cubeLevels[cubeRunnerState.unlockedLevel - 1];
    document.getElementById('cubeContinueLabel').textContent = `Continue · ${level.name}`;
  } else if (pageName === 'levels') {
    renderCubeLevels();
  } else if (pageName === 'skins') {
    renderCubeSkins();
  } else if (pageName === 'results') {
    document.getElementById('cubeResultTitle').textContent =
      cubeRunStatus === 'complete' ? 'Level complete!' : 'Block hit!';
    document.getElementById('cubeResultCopy').textContent =
      `${cubeLevels[cubeLevelIndex].name} · ${cubeScore} points`;
    document.getElementById('cubeResultHint').textContent = cubeRunStatus === 'complete'
      ? 'New course unlocked. Ready for another run?'
      : 'Change lanes or jump with Space to avoid the blocks.';
  }
}

function renderCubeLevels() {
  const list = document.getElementById('cubeLevelList');
  list.replaceChildren();
  cubeLevels.forEach((level, index) => {
    const unlocked = index < cubeRunnerState.unlockedLevel;
    const button = document.createElement('button');
    button.className = 'cube-level-choice';
    button.type = 'button';
    button.disabled = !unlocked;
    button.innerHTML = `<strong>${index + 1}. ${level.name}</strong><span>${unlocked ? `${level.duration}s run` : 'Locked'}</span>`;
    if (unlocked) button.addEventListener('click', () => startCubeRun(index));
    list.appendChild(button);
  });
}

function renderCubeSkins() {
  const list = document.getElementById('cubeSkinList');
  list.replaceChildren();
  cubeSkins.forEach((skin) => {
    const button = document.createElement('button');
    button.className = 'cube-skin-choice';
    button.type = 'button';
    button.setAttribute('aria-pressed', String(cubeRunnerState.selectedSkin === skin.id));
    button.innerHTML = `<span class="cube-skin-swatch"></span><span>${skin.name}</span>`;
    button.querySelector('.cube-skin-swatch').style.background = skin.color;
    button.addEventListener('click', () => {
      cubeRunnerState.selectedSkin = skin.id;
      renderCubeSkins();
      void saveState();
    });
    list.appendChild(button);
  });
}

function startCubeRun(levelIndex) {
  if (!Number.isInteger(levelIndex) || levelIndex < 0 || levelIndex >= cubeRunnerState.unlockedLevel) return;
  cubeLevelIndex = levelIndex;
  cubeElapsed = 0;
  cubeScore = 0;
  cubeLane = 1;
  cubeJumpTime = 0;
  cubeSpawnTimer = 0.8;
  cubeObstacles = [];
  cubeRunStatus = 'running';
  setCubePage('run');
  document.getElementById('cubeRunLevel').textContent = cubeLevels[levelIndex].name;
  document.getElementById('cubeRunBest').textContent =
    `Best: ${cubeRunnerState.bestScores[levelIndex] || 0}`;
  cubeCanvas.focus();
  cubeLastFrameTime = performance.now();
  cubeAnimationFrame = requestAnimationFrame(updateCubeRun);
}

function stopCubeAnimation() {
  if (cubeAnimationFrame !== null) {
    cancelAnimationFrame(cubeAnimationFrame);
    cubeAnimationFrame = null;
  }
}

function moveCubeLane(direction) {
  if (cubePage === 'run') cubeLane = Math.max(0, Math.min(2, cubeLane + direction));
}

function jumpCube() {
  if (cubePage === 'run' && cubeJumpTime <= 0) cubeJumpTime = 0.62;
}

function endCubeRun(completed) {
  cubeRunStatus = completed ? 'complete' : 'crashed';
  const levelKey = String(cubeLevelIndex);
  cubeRunnerState.bestScores[levelKey] = Math.max(cubeRunnerState.bestScores[levelKey] || 0, cubeScore);
  if (completed) {
    cubeRunnerState.unlockedLevel = Math.min(cubeLevels.length, Math.max(cubeRunnerState.unlockedLevel, cubeLevelIndex + 2));
  }
  setCubePage('results');
  void saveState();
}

function cubeLaneX(lane, progress) {
  return 320 + (lane - 1) * (54 + progress * 103);
}

function drawCube(x, y, size, skin) {
  const half = size / 2;
  const depth = size * 0.27;
  const ctx = cubeContext;
  ctx.beginPath();
  ctx.moveTo(x - half, y - half);
  ctx.lineTo(x - half + depth, y - half - depth);
  ctx.lineTo(x + half + depth, y - half - depth);
  ctx.lineTo(x + half, y - half);
  ctx.closePath();
  ctx.fillStyle = skin.top;
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + half, y - half);
  ctx.lineTo(x + half + depth, y - half - depth);
  ctx.lineTo(x + half + depth, y + half - depth);
  ctx.lineTo(x + half, y + half);
  ctx.closePath();
  ctx.fillStyle = skin.side;
  ctx.fill();
  ctx.fillStyle = skin.color;
  ctx.fillRect(x - half, y - half, size, size);
}

function drawCubeScene() {
  const ctx = cubeContext;
  const level = cubeLevels[cubeLevelIndex];
  const skin = cubeSkins.find((item) => item.id === cubeRunnerState.selectedSkin) || cubeSkins[0];
  const horizon = 75;
  const bottom = 430;
  ctx.clearRect(0, 0, cubeCanvas.width, cubeCanvas.height);
  ctx.fillStyle = level.sky;
  ctx.fillRect(0, 0, 640, 420);
  ctx.fillStyle = `${level.accent}66`;
  ctx.beginPath();
  ctx.arc(510, 82, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = level.track;
  ctx.beginPath();
  ctx.moveTo(285, horizon);
  ctx.lineTo(355, horizon);
  ctx.lineTo(610, bottom);
  ctx.lineTo(30, bottom);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = `${level.accent}88`;
  ctx.lineWidth = 3;
  for (let laneLine = 0; laneLine < 2; laneLine += 1) {
    const topX = 308 + laneLine * 24;
    const bottomX = 223 + laneLine * 97;
    ctx.beginPath();
    ctx.moveTo(topX, horizon);
    ctx.lineTo(bottomX, bottom);
    ctx.stroke();
  }
  for (let stripe = 0; stripe < 8; stripe += 1) {
    const progress = ((stripe / 8 + cubeElapsed * level.speed * 0.65) % 1);
    const y = horizon + progress * (bottom - horizon);
    const halfWidth = 35 + progress * 255;
    ctx.fillStyle = `${level.accent}${progress > 0.5 ? '55' : '33'}`;
    ctx.fillRect(320 - halfWidth, y, halfWidth * 2, 2 + progress * 3);
  }
  cubeObstacles.forEach((obstacle) => {
    const x = cubeLaneX(obstacle.lane, obstacle.z);
    const y = horizon + obstacle.z * 285;
    drawCube(x, y, 15 + obstacle.z * 29, {
      color: '#ff6b5e',
      side: '#ae3c50',
      top: '#ffb174',
    });
  });
  const jumpProgress = cubeJumpTime > 0 ? 1 - cubeJumpTime / 0.62 : 0;
  const jumpHeight = cubeJumpTime > 0 ? Math.sin(jumpProgress * Math.PI) * 95 : 0;
  const playerY = 350 - jumpHeight;
  const shadowX = cubeLaneX(cubeLane, 1);
  ctx.fillStyle = '#00000044';
  ctx.beginPath();
  ctx.ellipse(shadowX + 7, 369, 24, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  drawCube(shadowX, playerY, 39, skin);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 17px Arial';
  ctx.fillText(`${Math.max(0, Math.ceil(level.duration - cubeElapsed))}s`, 18, 30);
}

function updateCubeRun(time) {
  if (cubePage !== 'run') return;
  const level = cubeLevels[cubeLevelIndex];
  const dt = Math.min(0.04, (time - cubeLastFrameTime) / 1000);
  cubeLastFrameTime = time;
  cubeElapsed += dt;
  cubeSpawnTimer -= dt;
  if (cubeJumpTime > 0) cubeJumpTime = Math.max(0, cubeJumpTime - dt);
  if (cubeSpawnTimer <= 0) {
    cubeObstacles.push({ lane: Math.floor(Math.random() * 3), z: 0, hit: false });
    cubeSpawnTimer = Math.max(0.65, 1.48 - level.speed * 1.25) + Math.random() * 0.42;
  }
  cubeObstacles.forEach((obstacle) => {
    obstacle.z += dt * level.speed;
    if (obstacle.z >= 0.87 && obstacle.z < 0.93 && !obstacle.hit) {
      obstacle.hit = true;
      if (obstacle.lane === cubeLane && cubeJumpTime <= 0.06) {
        drawCubeScene();
        endCubeRun(false);
        return;
      }
      cubeScore += 10;
    }
  });
  if (cubePage !== 'run') return;
  cubeObstacles = cubeObstacles.filter((obstacle) => obstacle.z <= 1.08);
  document.getElementById('cubeRunScore').textContent = `Score: ${cubeScore}`;
  drawCubeScene();
  if (cubeElapsed >= level.duration) {
    endCubeRun(true);
    return;
  }
  cubeAnimationFrame = requestAnimationFrame(updateCubeRun);
}

document.getElementById('cubePlay').addEventListener('click', () => {
  startCubeRun(cubeRunnerState.unlockedLevel - 1);
});
document.getElementById('cubeShowLevels').addEventListener('click', () => setCubePage('levels'));
document.getElementById('cubeShowSkins').addEventListener('click', () => setCubePage('skins'));
document.querySelectorAll('[data-cube-back]').forEach((button) => {
  button.addEventListener('click', () => setCubePage('menu'));
});
document.getElementById('cubeRetry').addEventListener('click', () => startCubeRun(cubeLevelIndex));
document.getElementById('cubeResultLevels').addEventListener('click', () => setCubePage('levels'));
document.getElementById('cubeLeft').addEventListener('click', () => moveCubeLane(-1));
document.getElementById('cubeRight').addEventListener('click', () => moveCubeLane(1));
document.getElementById('cubeJump').addEventListener('click', jumpCube);
document.getElementById('snakeStart').addEventListener('click', startSnakeGame);
document.querySelectorAll('[data-snake-direction]').forEach((button) => {
  button.addEventListener('click', () => setSnakeDirection(button.dataset.snakeDirection));
});
document.addEventListener('keydown', (event) => {
  if (!calculatorScreenEl.hidden) {
    const key = event.key;
    if (/^\d$/.test(key)) calculatorAction('digit', key);
    else if (key === '.' || key === ',') calculatorAction('decimal');
    else if (['+', '-', '*', '/'].includes(key)) calculatorAction('operator', key);
    else if (key === 'Enter' || key === '=') calculatorAction('enter');
    else if (key === 'Backspace') calculatorAction('backspace');
    else if (key === 'Escape' || key === 'Delete') calculatorAction('clear');
    else return;
    event.preventDefault();
    return;
  }
  if (currentGameId === '2048') {
    const directions = {
      ArrowLeft: 'left',
      ArrowRight: 'right',
      ArrowUp: 'up',
      ArrowDown: 'down',
      a: 'left',
      d: 'right',
      w: 'up',
      s: 'down',
    };
    const direction = directions[event.key] || directions[event.key.toLowerCase()];
    if (direction) {
      event.preventDefault();
      move2048(direction);
    }
    return;
  }
  if (currentGameId === 'tetris') {
    const key = event.key.toLowerCase();
    const actions = {
      ArrowLeft: 'left',
      ArrowRight: 'right',
      ArrowDown: 'down',
      ArrowUp: 'rotate',
      a: 'left',
      d: 'right',
      s: 'down',
      w: 'rotate',
      x: 'rotate',
    };
    const action = event.code === 'Space' ? 'drop' : actions[event.key] || actions[key];
    if (action) {
      event.preventDefault();
      actTetris(action);
    }
    return;
  }
  if (currentGameId === 'snake') {
    const directions = {
      ArrowUp: 'up',
      ArrowDown: 'down',
      ArrowLeft: 'left',
      ArrowRight: 'right',
      w: 'up',
      s: 'down',
      a: 'left',
      d: 'right',
    };
    const direction = directions[event.key] || directions[event.key.toLowerCase()];
    if (direction) {
      event.preventDefault();
      setSnakeDirection(direction);
    }
    return;
  }
  if (currentGameId !== 'cube-runner' || cubePage !== 'run') return;
  if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') {
    event.preventDefault();
    moveCubeLane(-1);
  } else if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') {
    event.preventDefault();
    moveCubeLane(1);
  } else if (event.code === 'Space' || event.key === 'ArrowUp' || event.key.toLowerCase() === 'w') {
    event.preventDefault();
    jumpCube();
  }
});

function earnMoney() {
  const income = calculateMoneyIncome();
  makeMoneyState.balance += income;
  makeMoneyState.bonusClicks += getBonusClickRate();
  renderMakeMoneyGame();
  void saveState();
}

function buyMoneyItem(upgrade) {
  const index = moneyUpgrades.indexOf(upgrade) + 1;
  if (
    index <= 0 ||
    makeMoneyState.purchasedUpgrades.includes(index) ||
    (currentGameId !== 'make-no-money' && makeMoneyState.balance < upgrade.cost)
  ) return;
  makeMoneyState.balance -= upgrade.cost;
  makeMoneyState.baseIncome += upgrade.bonus;
  makeMoneyState.purchasedUpgrades.push(index);
  renderMakeMoneyGame();
  void saveState();
}

function buyIncomeBoost() {
  const cost = incomeBoostCosts[makeMoneyState.incomeBoostLevel];
  if (!cost || (currentGameId !== 'make-no-money' && makeMoneyState.balance < cost)) return;
  makeMoneyState.balance -= cost;
  makeMoneyState.incomeBoostLevel += 1;
  renderMakeMoneyGame();
  void saveState();
}

function buyBonusClickUpgrade() {
  const cost = bonusClickCosts[makeMoneyState.bonusClickLevel];
  if (!cost || (currentGameId !== 'make-no-money' && makeMoneyState.balance < cost)) return;
  makeMoneyState.balance -= cost;
  makeMoneyState.bonusClickLevel += 1;
  renderMakeMoneyGame();
  void saveState();
}

function useBonusClicks() {
  if (makeMoneyState.bonusClicks <= 0) return;
  makeMoneyState.balance += makeMoneyState.bonusClicks * calculateMoneyIncome();
  makeMoneyState.bonusClicks = 0;
  renderMakeMoneyGame();
  void saveState();
}

function resetMakeMoney() {
  makeMoneyState.balance = 0;
  makeMoneyState.baseIncome = 1;
  makeMoneyState.incomeBoostLevel = 0;
  makeMoneyState.bonusClickLevel = 0;
  makeMoneyState.bonusClicks = 0;
  makeMoneyState.prestigePoints = 0;
  makeMoneyState.purchasedUpgrades = [];
  makeMoneyState.decimalDigits = 3;
  makeMoneyState.instantGambling = false;
  renderMakeMoneyGame();
  setMoneyPage('Money');
  void saveState();
}

function prestigeMakeMoney() {
  const reward = Math.max(0, makeMoneyState.purchasedUpgrades.length - 10);
  if (reward <= 0) return;
  makeMoneyState.prestigePoints += reward;
  makeMoneyState.balance = 0;
  makeMoneyState.baseIncome = 1;
  makeMoneyState.incomeBoostLevel = 0;
  makeMoneyState.bonusClickLevel = 0;
  makeMoneyState.bonusClicks = 0;
  makeMoneyState.purchasedUpgrades = [];
  renderMakeMoneyGame();
  setMoneyPage('Money');
  void saveState();
}

function getCasinoMultiplier(slots) {
  const sevens = slots.filter((number) => number === 7).length;
  if (sevens === 3) return 25;
  if (sevens === 2) return 8;
  if (slots[0] === slots[1] && slots[1] === slots[2]) return 8;
  if (slots[0] === slots[1] || slots[0] === slots[2] || slots[1] === slots[2]) return 3;
  return 0;
}

function finishCasinoSpin() {
  if (!casinoSpinResults) return;
  casinoSlots = casinoSpinResults;
  const multiplier = getCasinoMultiplier(casinoSlots);
  if (multiplier) {
    const winnings = casinoWager * multiplier;
    makeMoneyState.balance += winnings;
    casinoMessage = `You won ${formatGameMoney(winnings)}!`;
  } else {
    casinoMessage = `No win. You lost ${formatGameMoney(casinoWager)}.`;
  }
  casinoSpinActive = false;
  casinoSpinResults = null;
  clearInterval(casinoSpinTimer);
  casinoSpinTimer = null;
  renderMakeMoneyGame();
  void saveState();
}

function gambleCasino() {
  if (casinoSpinActive) return;
  if (casinoBet === '4039985230') {
    makeMoneyState.prestigePoints += 10;
    casinoMessage = 'Secret code! You received 10 prestige points.';
    renderMakeMoneyGame();
    void saveState();
    return;
  }

  const wager = Number(casinoBet);
  if (!Number.isFinite(wager) || wager <= 0 ||
      (currentGameId !== 'make-no-money' && wager > makeMoneyState.balance)) {
    casinoMessage = 'Enter a valid bet within your balance.';
    renderCasino();
    return;
  }

  casinoWager = wager;
  makeMoneyState.balance -= wager;
  casinoSpinResults = [1, 2, 3].map(() => Math.floor(Math.random() * 7) + 1);
  casinoMessage = makeMoneyState.instantGambling ? '' : 'Rolling...';
  casinoSpinElapsed = 0;
  if (makeMoneyState.instantGambling) {
    casinoSlots = casinoSpinResults;
    finishCasinoSpin();
  } else {
    casinoSpinActive = true;
    casinoSpinTimer = setInterval(() => {
      casinoSpinElapsed += 0.07;
      casinoSlots = casinoSpinResults.map((result, index) =>
        casinoSpinElapsed >= index + 1 ? result : Math.floor(Math.random() * 7) + 1);
      if (casinoSpinElapsed >= 3) finishCasinoSpin();
      else renderCasino();
    }, 70);
    renderCasino();
  }
  void saveState();
}

function updateNumberInput() {
  state.selectedNumber = clampNumber(Number(numberPicker.value));
  numberPicker.value = state.selectedNumber;
  numberPickerWrap.classList.toggle('visible', state.betType === 'number');
}

function setBetType(type, shouldSave = true) {
  state.betType = type;
  document.querySelectorAll('.bet-type').forEach((el) => {
    el.classList.toggle('active', el.dataset.betType === type);
  });
  updateNumberInput();
  if (shouldSave) void saveState();
}

function setMessage(text, tone = '') {
  messageEl.textContent = text;
  messageEl.className = 'message';
  if (tone) messageEl.classList.add(tone);
}

function evaluateBet(winningNumber) {
  const winningColor = getNumberColor(winningNumber);
  let payout = 0;
  let outcome = 'lose';

  if (state.betType === 'number' && state.selectedNumber === winningNumber) {
    payout = state.chip * 35;
    outcome = 'win';
  } else if (state.betType === 'red' && winningColor === 'red') {
    payout = state.chip * 2;
    outcome = 'win';
  } else if (state.betType === 'black' && winningColor === 'black') {
    payout = state.chip * 2;
    outcome = 'win';
  } else if (state.betType === 'even' && winningNumber !== 0 && winningNumber % 2 === 0) {
    payout = state.chip * 2;
    outcome = 'win';
  } else if (state.betType === 'odd' && winningNumber !== 0 && winningNumber % 2 !== 0) {
    payout = state.chip * 2;
    outcome = 'win';
  } else if (state.betType === 'zero' && winningNumber === 0) {
    payout = state.chip * 35;
    outcome = 'win';
  }

  const netChange = payout - state.chip;
  state.balance += netChange;
  gameBalances[currentGameId] = state.balance;
  state.lastResult = { winningNumber, winningColor, outcome, payout, netChange };

  if (state.balance <= 0) {
    state.balance = 0;
    setMessage('Bankroll empty. Reset the game to play again.', 'loss');
  } else if (outcome === 'win') {
    setMessage(`Winner! ${winningNumber} landed. You won ${formatMoney(payout)}.`, 'win');
  } else {
    setMessage(`No luck this round. The ball landed on ${winningNumber} (${winningColor}).`, 'loss');
  }

  updateBankroll();
  void saveState();
}

function spinWheel() {
  if (state.balance < state.chip) {
    setMessage('Not enough chips for this bet. Lower the amount or reset the game.', 'loss');
    return;
  }

  const winningNumber = Math.floor(Math.random() * 37);
  const wheelTurn = (360 * 8) + (360 - winningNumber * 9.72);

  state.wheelRotation += wheelTurn;

  wheelEl.style.transform = `rotate(${state.wheelRotation}deg)`;

  setMessage('Spinning... good luck!', '');

  rouletteSpinTimer = setTimeout(() => {
    rouletteSpinTimer = null;
    evaluateBet(winningNumber);
  }, 2800);
}

document.querySelectorAll('.chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    state.chip = Number(chip.dataset.chip);
    document.querySelectorAll('.chip').forEach((el) => {
      el.classList.toggle('active', Number(el.dataset.chip) === state.chip);
    });
    updateBankroll();
    void saveState();
  });
});

document.querySelectorAll('.bet-type').forEach((button) => {
  button.addEventListener('click', () => setBetType(button.dataset.betType));
});

numberPicker.addEventListener('input', () => {
  updateNumberInput();
  scheduleNumberSave();
});

arcadeGameEl.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const cardButton = target.closest('[data-memory-card]');
  if (cardButton) {
    flipMemoryCard(Number(cardButton.dataset.memoryCard));
    return;
  }
  const pokerButton = target.closest('[data-poker-card]');
  if (pokerButton && arcadeRuntime.poker.phase === 'draw') {
    const index = Number(pokerButton.dataset.pokerCard);
    arcadeRuntime.poker.held = arcadeRuntime.poker.held.includes(index)
      ? arcadeRuntime.poker.held.filter((held) => held !== index)
      : [...arcadeRuntime.poker.held, index];
    renderArcadeGame('poker');
    return;
  }
  const actionButton = target.closest('[data-arcade-action]');
  if (actionButton) playArcadeAction(actionButton.dataset.arcadeAction);
});

const spinButton = document.getElementById('spin');
const clearBetButton = document.getElementById('clearBet');

if (spinButton) {
  spinButton.addEventListener('click', spinWheel);
}

if (clearBetButton) {
  clearBetButton.addEventListener('click', resetGameBankroll);
}

bankrollResetButton.addEventListener('click', resetGameBankroll);
document.getElementById('earnMoney').addEventListener('click', earnMoney);
document.getElementById('useBonusClicks').addEventListener('click', useBonusClicks);
document.querySelectorAll('[data-money-page]').forEach((button) => {
  button.addEventListener('click', () => setMoneyPage(button.dataset.moneyPage));
});
document.querySelectorAll('[data-money-back]').forEach((button) => {
  button.addEventListener('click', () => setMoneyPage('Money'));
});
document.getElementById('casinoHelpLink').addEventListener('click', () => {
  helpPage = 3;
  setMoneyPage('Help');
  helpPage = 3;
  renderMoneyHelp();
});
document.getElementById('nextUpdate').addEventListener('click', () => {
  updatePage = Math.min(updatePage + 1, 3);
  renderMoneyUpdates();
});
document.getElementById('previousUpdate').addEventListener('click', () => {
  updatePage = Math.max(updatePage - 1, 1);
  renderMoneyUpdates();
});
document.getElementById('nextHelp').addEventListener('click', () => {
  helpPage = Math.min(helpPage + 1, 3);
  renderMoneyHelp();
});
document.getElementById('previousHelp').addEventListener('click', () => {
  helpPage = Math.max(helpPage - 1, 1);
  renderMoneyHelp();
});
document.getElementById('casinoGamble').addEventListener('click', gambleCasino);
document.getElementById('casinoBet').addEventListener('input', (event) => {
  casinoBet = event.target.value;
});
document.getElementById('decimalDigits').addEventListener('input', (event) => {
  makeMoneyState.decimalDigits = Number(event.target.value);
  renderMakeMoneyGame();
  void saveState();
});
document.getElementById('instantGambling').addEventListener('click', () => {
  makeMoneyState.instantGambling = !makeMoneyState.instantGambling;
  renderMakeMoneyGame();
  void saveState();
});
document.getElementById('prestigeButton').addEventListener('click', prestigeMakeMoney);
document.getElementById('resetMakeMoney').addEventListener('click', () => {
  if (window.confirm('Reset all money, items, upgrades, bonus clicks, and prestige progress?')) {
    resetMakeMoney();
  }
});
document.addEventListener('keydown', (event) => {
  if (currentGameId !== 'make-money') return;
  if (makeMoneyPage === 'Money' && (event.code === 'Space' || event.key === 'Enter')) {
    event.preventDefault();
    if (!event.repeat || event.code === 'Space') earnMoney();
    if (event.key === 'Enter' && !event.repeat && earnRepeatTimer === null) {
      earnRepeatTimer = setInterval(earnMoney, 25);
    }
  } else if (makeMoneyPage === 'Casino' && event.key === 'Enter' && !event.repeat) {
    gambleCasino();
  }
});
document.addEventListener('keyup', (event) => {
  if (event.key === 'Enter' && earnRepeatTimer !== null) {
    clearInterval(earnRepeatTimer);
    earnRepeatTimer = null;
  }
});

renderGameMenu();
void initializeApp();
