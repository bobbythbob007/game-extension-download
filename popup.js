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
const rouletteGameEl = document.getElementById('rouletteGame');
const arcadeGameEl = document.getElementById('arcadeGame');
const gameScreenTitleEl = document.getElementById('gameScreenTitle');
const bankrollDisplayEl = document.getElementById('bankrollDisplay');
const makeMoneyGameEl = document.getElementById('makeMoneyGame');
const cubeRunnerGameEl = document.getElementById('cubeRunnerGame');
const cubeCanvas = document.getElementById('cubeCanvas');
const cubeContext = cubeCanvas.getContext('2d');
const syncStorage = globalThis.chrome?.storage?.sync;
let stateReady = false;
let currentGameId = 'roulette';
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
const arcadeGames = new Set(['blackjack', 'slots', 'dice', 'coin', 'poker', 'memory']);
const arcadeRuntime = {
  blackjack: { phase: 'ready', deck: [], player: [], dealer: [], wager: 0, message: 'Place a bet to deal.' },
  slots: { result: ['-', '-', '-'], message: 'Match symbols to win.' },
  dice: { result: null, message: 'Choose low or high. A correct call pays 2×.' },
  coin: { result: null, message: 'Pick heads or tails. A correct call pays 2×.' },
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

function chooseGame(gameId) {
  const selectedGame = games.find((game) => game.id === gameId);
  if (!selectedGame) return;

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
  rouletteGameEl.hidden = !isRoulette;
  makeMoneyGameEl.hidden = !isMakeMoney;
  cubeRunnerGameEl.hidden = !isCubeRunner;
  arcadeGameEl.hidden = !isArcade;
  gameScreenTitleEl.textContent = selectedGame.type === 'random' ? `Random: ${game.title}` : game.title;

  if (isMakeMoney) {
    document.getElementById('moneyTitle').textContent = isMakeNoMoney ? 'Make No Money' : 'Make Money';
    document.getElementById('makeMoneyStatus').classList.toggle('debt-status', isMakeNoMoney && makeMoneyState.balance < 0);
    setMoneyPage('Money');
  } else if (isCubeRunner) {
    setCubePage('menu');
  } else if (isArcade) {
    renderArcadeGame(game.id);
  }
  void saveState();
}

document.getElementById('homeButton').addEventListener('click', returnHome);

function returnHome() {
  stopCubeAnimation();
  document.body.classList.add('home-view');
  document.body.classList.remove('game-view-theme');
  bankrollDisplayEl.hidden = true;
  void saveState();
  gameScreenEl.hidden = true;
  homeScreenEl.hidden = false;
  document.querySelector('.game-choice.active')?.focus();
}

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
  slots: 'Spin three reels. Three matching symbols pay 5×; any pair pays 2×.',
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
    board.innerHTML = `<div class="arcade-reels">${runtime.result.map((symbol) => `<span>${symbol}</span>`).join('')}</div>`;
    status.textContent = runtime.message;
    button('Spin', 'slots-spin', true);
  } else if (gameId === 'dice') {
    board.innerHTML = `<span class="arcade-die">${runtime.result ?? '?'}</span>`;
    status.textContent = runtime.message;
    button('Low · 1–3', 'dice-low');
    button('High · 4–6', 'dice-high', true);
  } else if (gameId === 'coin') {
    board.innerHTML = `<span class="arcade-coin">${runtime.result || 'COIN'}</span>`;
    status.textContent = runtime.message;
    button('Heads', 'coin-heads');
    button('Tails', 'coin-tails', true);
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
    const wager = getArcadeWager();
    if (wager === null) return;
    debitArcadeWager(wager);
    const symbols = ['7', '$', 'BAR', 'BELL', 'STAR'];
    const result = Array.from({ length: 3 }, () => symbols[Math.floor(Math.random() * symbols.length)]);
    const pair = result.some((symbol, index) => result.indexOf(symbol) !== index);
    const multiplier = result[0] === result[1] && result[1] === result[2] ? 5 : pair ? 2 : 0;
    runtime.result = result;
    if (multiplier) {
      const payout = creditArcadeWager(wager, multiplier);
      runtime.message = `Winner! ${formatMoney(payout)} returned (${multiplier}×).`;
    } else runtime.message = `No match. You lost ${formatMoney(wager)}.`;
    renderArcadeGame(currentGameId);
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
    const wager = getArcadeWager();
    if (wager === null) return;
    debitArcadeWager(wager);
    const result = Math.random() < 0.5 ? 'heads' : 'tails';
    runtime.result = result.toUpperCase();
    runtime.message = result === action.slice(5)
      ? `It's ${result}! ${formatMoney(creditArcadeWager(wager, 2))} returned!`
      : `It's ${result}. Your bet is lost.`;
    renderArcadeGame(currentGameId);
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
document.addEventListener('keydown', (event) => {
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

  setTimeout(() => {
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
  clearBetButton.addEventListener('click', () => {
    state.balance = 200;
    gameBalances[currentGameId] = state.balance;
    state.chip = 10;
    state.betType = 'number';
    state.selectedNumber = 17;
    numberPicker.value = state.selectedNumber;
    document.querySelectorAll('.chip').forEach((el) => {
      el.classList.toggle('active', Number(el.dataset.chip) === 10);
    });
    setBetType('number');
    updateBankroll();
    setMessage('Fresh stack. Pick a number and start again.', '');
    void saveState();
  });
}

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
