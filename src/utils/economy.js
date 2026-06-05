const fs   = require('fs');
const path = require('path');

const DATA_PATH       = path.join(__dirname, '../../data/economy.json');
const STARTING_BALANCE = 500;
const WORK_COOLDOWN    = 30 * 60 * 1000;       // 30 minutos
const DAILY_COOLDOWN   = 24 * 60 * 60 * 1000;  // 24 horas

function load() {
  if (!fs.existsSync(DATA_PATH)) {
    fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
    fs.writeFileSync(DATA_PATH, JSON.stringify({ users: {} }, null, 2));
  }
  return JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
}

function save(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

function ensureUser(data, userId) {
  if (!data.users[userId]) {
    data.users[userId] = { balance: STARTING_BALANCE, lastWork: null, lastDaily: null };
  }
}

function getBalance(userId) {
  const data = load();
  ensureUser(data, userId);
  save(data);
  return data.users[userId].balance;
}

// Returns new balance or false if insufficient funds
function deductBalance(userId, amount) {
  const data = load();
  ensureUser(data, userId);
  if (data.users[userId].balance < amount) return false;
  data.users[userId].balance -= amount;
  save(data);
  return data.users[userId].balance;
}

function addBalance(userId, amount) {
  const data = load();
  ensureUser(data, userId);
  data.users[userId].balance += amount;
  save(data);
  return data.users[userId].balance;
}

function workCooldownRemaining(userId) {
  const data = load();
  ensureUser(data, userId);
  if (!data.users[userId].lastWork) return 0;
  return Math.max(0, WORK_COOLDOWN - (Date.now() - data.users[userId].lastWork));
}

function dailyCooldownRemaining(userId) {
  const data = load();
  ensureUser(data, userId);
  if (!data.users[userId].lastDaily) return 0;
  return Math.max(0, DAILY_COOLDOWN - (Date.now() - data.users[userId].lastDaily));
}

function setLastWork(userId) {
  const data = load();
  ensureUser(data, userId);
  data.users[userId].lastWork = Date.now();
  save(data);
}

function setLastDaily(userId) {
  const data = load();
  ensureUser(data, userId);
  data.users[userId].lastDaily = Date.now();
  save(data);
}

function getLeaderboard() {
  const data = load();
  return Object.entries(data.users)
    .map(([id, u]) => ({ userId: id, balance: u.balance }))
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 10);
}

function formatMs(ms) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

module.exports = {
  STARTING_BALANCE,
  getBalance, deductBalance, addBalance,
  workCooldownRemaining, dailyCooldownRemaining,
  setLastWork, setLastDaily,
  getLeaderboard, formatMs,
};
