import 'dotenv/config';
import TelegramBot from 'node-telegram-bot-api';
import { getWeatherByCity, getWeatherByCoords, parseWeatherResponse } from './weatherClient';
import { formatWeatherMessage } from './messageFormatter';
import { createTtlCache } from './ttlCache';

type Units = 'metric' | 'imperial';

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error('Missing BOT_TOKEN in .env');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

const chatUnits: Map<number, Units> = new Map();
const cache = createTtlCache<{ cityName: string; description: string; temperature: number; feelsLike: number; windSpeed: number }>({ ttlMs: 5 * 60 * 1000 });

function getUnitsForChat(chatId: number): Units {
  return (chatUnits.get(chatId) as Units) || (process.env.DEFAULT_UNITS as Units) || 'metric';
}

bot.onText(/^\/start$/, async (msg: any) => {
  const chatId = msg.chat.id;
  const text = 'Привет! Я бот погоды. Используй:\n' +
    '/weather <город> — текущая погода\n' +
    'Отправь геолокацию — получишь погоду по координатам\n' +
    '/celsius или /fahrenheit — переключить единицы измерения';
  await bot.sendMessage(chatId, text);
});

bot.onText(/^\/celsius$/, async (msg: any) => {
  const chatId = msg.chat.id;
  chatUnits.set(chatId, 'metric');
  await bot.sendMessage(chatId, 'Единицы измерения: °C');
});

bot.onText(/^\/fahrenheit$/, async (msg: any) => {
  const chatId = msg.chat.id;
  chatUnits.set(chatId, 'imperial');
  await bot.sendMessage(chatId, 'Единицы измерения: °F');
});

bot.onText(/^\/weather\s+(.+)/i, async (msg: any, match: RegExpExecArray | null) => {
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
    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (err) {
    await bot.sendMessage(chatId, 'Не удалось получить погоду. Проверь город или попробуй позже.');
  }
});

bot.on('message', async (msg: any) => {
  try {
    const chatId = msg.chat.id;
    const location = msg.location;
    if (!location) return;

    const units = getUnitsForChat(chatId);
    const latRounded = Math.round(location.latitude * 100) / 100;
    const lonRounded = Math.round(location.longitude * 100) / 100;
    const cacheKey = `coords:${units}:${latRounded},${lonRounded}`;

    let data = cache.get(cacheKey);
    if (!data) {
      const raw = await getWeatherByCoords(location.latitude, location.longitude, units);
      data = parseWeatherResponse(raw);
      cache.set(cacheKey, data);
    }

    const message = formatWeatherMessage(data, units);
    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (err) {
    const chatId = msg.chat && msg.chat.id;
    if (chatId) {
      await bot.sendMessage(chatId, 'Не удалось получить погоду по геолокации. Попробуй позже.');
    }
  }
});
