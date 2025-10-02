import type { ParsedWeather, Units } from './weatherClient';

function formatTemp(value: number | null | undefined, units: Units): string {
  if (value === null || value === undefined) return '—';
  return units === 'imperial' ? `${Math.round(value)} °F` : `${Math.round(value)} °C`;
}

function formatWind(value: number | null | undefined, units: Units): string {
  if (value === null || value === undefined) return '—';
  const speed = units === 'imperial' ? `${Math.round(value)} mph` : `${Math.round(value)} m/s`;
  return speed;
}

export function formatWeatherMessage(parsed: ParsedWeather, units: Units): string {
  const city = parsed.cityName || '—';
  const desc = parsed.description ? (parsed.description[0].toUpperCase() + parsed.description.slice(1)) : '—';
  const temp = formatTemp(parsed.temperature, units);
  const feels = formatTemp(parsed.feelsLike, units);
  const wind = formatWind(parsed.windSpeed, units);

  return `*${city}*\n\n${desc}\nТемпература: ${temp}\nОщущается как: ${feels}\nВетер: ${wind}`;
}

export { formatTemp, formatWind };

