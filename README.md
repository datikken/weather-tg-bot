## Telegram Weather Bot (Light)

Simple Telegram bot that returns current weather and a short forecast by city name or user location.

### Features
- /start greeting
- /weather <city>
- Send location → weather by coordinates
- /celsius and /fahrenheit to switch units
- In-memory cache (5 minutes)

### Prerequisites
- Docker 20+
- Telegram Bot Token (via BotFather)
- OpenWeather API key (`https://openweathermap.org/api`)

### Run with Docker (recommended)
Build image:
```bash
docker build -t weather-bot .
```

Run container (replace values):
```bash
echo "BOT_TOKEN=YOUR_TELEGRAM_BOT_TOKEN" > .env
echo "OPENWEATHER_API_KEY=YOUR_OPENWEATHER_KEY" >> .env
echo "DEFAULT_UNITS=metric" >> .env
docker run -d --name weather-bot --restart unless-stopped --env-file ./.env weather-bot:latest
```

### Commands
- /start — greeting and help
- /weather <city> — current weather and brief details
- /celsius — switch to °C
- /fahrenheit — switch to °F

### Testing (inside Docker)
```bash
docker run --rm -e CI=true weather-bot npm test
```

### Notes
- Cache TTL is 5 minutes and stored in-memory.
- Units are stored in-memory per chat and reset on restart.
- This project is intended to be run via Docker only.


