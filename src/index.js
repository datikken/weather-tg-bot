require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const { getWeatherByCity } = require('./weatherClient');
const { formatWeatherMessage } = require('./messageFormatter');
const { createTtlCache } = require('./ttlCache');

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error('Missing BOT_TOKEN in .env');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

// In-memory per-chat units preference and weather cache
const chatUnits = new Map(); // chatId -> 'metric' | 'imperial'
const cache = createTtlCache({ ttlMs: 5 * 60 * 1000 });

function getUnitsForChat(chatId) {
  return chatUnits.get(chatId) || process.env.DEFAULT_UNITS || 'metric';
}

bot.onText(/^\/start$/, async (msg) => {
  const chatId = msg.chat.id;
  const text = 'Привет! Я бот погоды. Используй:\n' +
    '/weather <город> — текущая погода\n' +
    'Отправь геолокацию — получишь погоду по координатам\n' +
    '/celsius или /fahrenheit — переключить единицы измерения';
  await bot.sendMessage(chatId, text);
});

bot.onText(/^\/celsius$/, async (msg) => {
  const chatId = msg.chat.id;
  chatUnits.set(chatId, 'metric');
  await bot.sendMessage(chatId, 'Единицы измерения: °C');
});

bot.onText(/^\/fahrenheit$/, async (msg) => {
  const chatId = msg.chat.id;
  chatUnits.set(chatId, 'imperial');
  await bot.sendMessage(chatId, 'Единицы измерения: °F');
});

bot.onText(/^\/weather\s+(.+)/i, async (msg, match) => {
  const chatId = msg.chat.id;
  const city = (match && match[1]) ? match[1].trim() : '';
  if (!city) {
    await bot.sendMessage(chatId, 'Пожалуйста, укажи город: /weather Moscow');
    return;
  }
  const units = getUnitsForChat(chatId);
  const cacheKey = `city:${units}:${city.toLowerCase()}`;

  try {
    let data = cache.get(cacheKey);
    if (!data) {
      data = await getWeatherByCity(city, units);
      cache.set(cacheKey, data);
    }

    const message = formatWeatherMessage(data, units);
    console.log(message)
    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (err) {
    await bot.sendMessage(chatId, 'Не удалось получить погоду. Проверь город или попробуй позже.');
  }
});


