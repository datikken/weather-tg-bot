const { formatWeatherMessage } = require('../src/messageFormatter');

describe('messageFormatter', () => {
  test('formats message in metric', () => {
    const parsed = {
      cityName: 'Moscow',
      description: 'ясно',
      temperature: 3.6,
      feelsLike: 1.2,
      windSpeed: 4.7,
    };
    const msg = formatWeatherMessage(parsed, 'metric');
    expect(msg).toContain('*Moscow*');
    expect(msg).toContain('Ясно');
    expect(msg).toContain('Температура: 4 °C');
    expect(msg).toContain('Ощущается как: 1 °C');
    expect(msg).toContain('Ветер: 5 m/s');
  });

  test('formats message in imperial', () => {
    const parsed = {
      cityName: 'New York',
      description: 'broken clouds',
      temperature: 68.1,
      feelsLike: 66.5,
      windSpeed: 8.9,
    };
    const msg = formatWeatherMessage(parsed, 'imperial');
    expect(msg).toContain('*New York*');
    expect(msg).toContain('Broken clouds');
    expect(msg).toContain('Температура: 68 °F');
    expect(msg).toContain('Ощущается как: 67 °F');
    expect(msg).toContain('Ветер: 9 mph');
  });
});


