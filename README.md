## Telegram Weather Bot (Light)

Simple Telegram bot that returns current weather and a short forecast by city name or user location.

### Features
- /start greeting
- /weather <city>
- Send location → weather by coordinates
- /celsius and /fahrenheit to switch units
- In-memory cache (5 minutes)

### Prerequisites
- Node.js 18+
- Telegram Bot Token (via BotFather)
- OpenWeather API key (`https://openweathermap.org/api`)

### Setup
1. Clone the repo and install dependencies:
```bash
npm install
```
2. Create `.env` from example and fill values:
```bash
cp .env.example .env
```
3. Start the bot:
```bash
npm run start
```

### Commands
- /start — greeting and help
- /weather <city> — current weather and brief details
- /celsius — switch to °C
- /fahrenheit — switch to °F

### Testing
```bash
npm test
```

### Notes
- Cache TTL is 5 minutes and stored in-memory.
- Units are stored in-memory per chat and reset on restart.


