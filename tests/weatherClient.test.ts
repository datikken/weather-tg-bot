import { parseWeatherResponse } from '../src/weatherClient';

describe('weatherClient parseWeatherResponse', () => {
  test('parses find current weather', () => {
    const sample = {
      list: [{
        name: 'Moscow',
        main: { temp: 2.7, feels_like: -1.1 },
        wind: { speed: 3.9 },
        weather: [{ description: 'overcast clouds' }]
      }]
    };
    const parsed = parseWeatherResponse(sample as any);
    expect(parsed.cityName).toBe('Moscow');
    expect(parsed.temperature).toBe(2.7);
    expect(parsed.feelsLike).toBe(-1.1);
    expect(parsed.windSpeed).toBe(3.9);
  });
});
