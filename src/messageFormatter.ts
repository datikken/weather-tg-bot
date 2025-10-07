import type { ParsedWeather, Units } from './weatherClient';

export class MessageFormatter {
  static formatTemp(value: number | null | undefined, units: Units): string {
    if (value === null || value === undefined) return '—';
    return units === 'imperial' ? `${Math.round(value)} °F` : `${Math.round(value)} °C`;
  }

  static formatWind(value: number | null | undefined, units: Units): string {
    if (value === null || value === undefined) return '—';
    const speed = units === 'imperial' ? `${Math.round(value)} mph` : `${Math.round(value)} m/s`;
    return speed;
  }

  static formatWeatherMessage(parsed: ParsedWeather, units: Units): string {
    const city = parsed.cityName || '—';
    const desc = parsed.description ? (parsed.description[0].toUpperCase() + parsed.description.slice(1)) : '—';
    const temp = this.formatTemp(parsed.temperature, units);
    const feels = this.formatTemp(parsed.feelsLike, units);
    const wind = this.formatWind(parsed.windSpeed, units);

    return `*${city}*\n\n${desc}\nТемпература: ${temp}\nОщущается как: ${feels}\nВетер: ${wind}`;
  }
}

// For backward compatibility
export function formatWeatherMessage(parsed: ParsedWeather, units: Units): string {
  return MessageFormatter.formatWeatherMessage(parsed, units);
}

export function formatTemp(value: number | null | undefined, units: Units): string {
  return MessageFormatter.formatTemp(value, units);
}

export function formatWind(value: number | null | undefined, units: Units): string {
  return MessageFormatter.formatWind(value, units);
}
