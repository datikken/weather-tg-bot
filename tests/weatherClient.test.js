const { parseWeatherResponse } = require('../src/weatherClient');

describe('weatherClient parseWeatherResponse', () => {
  test('parses One Call current weather', () => {
    const sample = {
      lat: 55.7512,
      lon: 37.6184,
      timezone: 'Europe/Moscow',
      current: {
        dt: 1684929490,
        temp: 2.7,
        feels_like: -1.1,
        wind_speed: 3.9,
        weather: [{ description: 'overcast clouds' }]
      }
    };
    const parsed = parseWeatherResponse(sample, 'Moscow');
    expect(parsed.cityName).toBe('Moscow');
    expect(parsed.description).toBe('overcast clouds');
    expect(parsed.temperature).toBe(2.7);
    expect(parsed.feelsLike).toBe(-1.1);
    expect(parsed.windSpeed).toBe(3.9);
  });
});


