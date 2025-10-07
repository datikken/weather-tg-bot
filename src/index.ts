import 'dotenv/config';
import TelegramBot from 'node-telegram-bot-api';
import { WeatherClient, type ParsedWeather, type Units } from './weatherClient';
import { MessageFormatter } from './messageFormatter';
import { TtlCache } from './ttlCache';

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const BOT_TOKEN = process.env.BOT_TOKEN;

if (!OPENWEATHER_API_KEY) {
  console.error('Missing OPENWEATHER_API_KEY in .env');
  process.exit(1);
}
if (!BOT_TOKEN) {
  console.error('Missing BOT_TOKEN in .env');
  process.exit(1);
}

export class WeatherBot {
  private bot: any;
  private weatherClient: WeatherClient;
  private cache: TtlCache<ParsedWeather>;
  private chatUnits: Map<number, Units>;
  private defaultUnits: Units;

  constructor(botToken: string, apiKey: string, defaultUnits: Units = 'metric') {
    this.bot = new TelegramBot(botToken, { polling: true });
    this.weatherClient = new WeatherClient(apiKey);
    this.cache = new TtlCache<ParsedWeather>({ ttlMs: 5 * 60 * 1000 });
    this.chatUnits = new Map();
    this.defaultUnits = defaultUnits;
    this.setupHandlers();
  }

  private getUnitsForChat(chatId: number): Units {
    return this.chatUnits.get(chatId) || this.defaultUnits;
  }

  private setupHandlers(): void {
    this.bot.onText(/^\/start$/, this.handleStart.bind(this));
    this.bot.onText(/^\/celsius$/, this.handleCelsius.bind(this));
    this.bot.onText(/^\/fahrenheit$/, this.handleFahrenheit.bind(this));
    this.bot.onText(/^\/weather\s+(.+)/i, this.handleWeatherCommand.bind(this));
    this.bot.on('message', this.handleLocationMessage.bind(this));
  }

  private async handleStart(msg: any): Promise<void> {
    const chatId = msg.chat.id;
    const text = 'Привет! Я бот погоды. Используй:\n' +
      '/weather <город> — текущая погода\n' +
      'Отправь геолокацию — получишь погоду по координатам\n' +
      '/celsius или /fahrenheit — переключить единицы измерения';
    await this.bot.sendMessage(chatId, text);
  }

  private async handleCelsius(msg: any): Promise<void> {
    const chatId = msg.chat.id;
    this.chatUnits.set(chatId, 'metric');
    await this.bot.sendMessage(chatId, 'Единицы измерения: °C');
  }

  private async handleFahrenheit(msg: any): Promise<void> {
    const chatId = msg.chat.id;
    this.chatUnits.set(chatId, 'imperial');
    await this.bot.sendMessage(chatId, 'Единицы измерения: °F');
  }

  private async handleWeatherCommand(msg: any, match: RegExpExecArray | null): Promise<void> {
    const chatId = msg.chat.id;
    const city = (match && match[1]) ? match[1].trim() : '';
    if (!city) {
      await this.bot.sendMessage(chatId, 'Пожалуйста, укажи город: /weather Moscow');
      return;
    }
    const units = this.getUnitsForChat(chatId);
    const cacheKey = `city:${units}:${city.toLowerCase()}`;

    try {
      let data = this.cache.get(cacheKey);
      if (!data) {
        data = await this.weatherClient.getWeatherByCity(city, units);
        this.cache.set(cacheKey, data);
      }

      const message = MessageFormatter.formatWeatherMessage(data, units);
      await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (err) {
      await this.bot.sendMessage(chatId, 'Не удалось получить погоду. Проверь город или попробуй позже.');
    }
  }

  private async handleLocationMessage(msg: any): Promise<void> {
    try {
      const chatId = msg.chat.id;
      const location = msg.location;
      if (!location) return;

      const units = this.getUnitsForChat(chatId);
      const latRounded = Math.round(location.latitude * 100) / 100;
      const lonRounded = Math.round(location.longitude * 100) / 100;
      const cacheKey = `coords:${units}:${latRounded},${lonRounded}`;

      let data = this.cache.get(cacheKey);
      if (!data) {
        const raw = await this.weatherClient.getWeatherByCoords(location.latitude, location.longitude, units);
        data = WeatherClient.parseWeatherResponse(raw);
        this.cache.set(cacheKey, data);
      }

      const message = MessageFormatter.formatWeatherMessage(data, units);
      await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (err) {
      const chatId = msg && msg.chat.id;
      if (chatId) {
        await this.bot.sendMessage(chatId, 'Не удалось получить погоду по геолокации. Попробуй позже.');
      }
    }
  }

  start(): void {
    console.log('Weather bot started');
  }
}

// Instantiate and start the bot
const defaultUnits = (process.env.DEFAULT_UNITS as Units) || 'metric';
const bot = new WeatherBot(BOT_TOKEN, OPENWEATHER_API_KEY, defaultUnits);
bot.start();
