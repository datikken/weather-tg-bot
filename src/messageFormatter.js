function formatTemp(value, units) {
  if (value === null || value === undefined) return '—';
  return units === 'imperial' ? `${Math.round(value)} °F` : `${Math.round(value)} °C`;
}

function formatWind(value, units) {
  if (value === null || value === undefined) return '—';
    return units === 'imperial' ? `${Math.round(value)} mph` : `${Math.round(value)} m/s`;
}

function formatWeatherMessage(parsed, units) {
  const city = parsed.cityName || '—';
  const desc = parsed.description ? (parsed.description[0].toUpperCase() + parsed.description.slice(1)) : '—';
  const temp = formatTemp(parsed.temperature, units);
  const feels = formatTemp(parsed.feelsLike, units);
  const wind = formatWind(parsed.windSpeed, units);

  return `*${city}*\n${desc}\nТемпература: ${temp}\nОщущается как: ${feels}\nВетер: ${wind}`;
}

module.exports = {
  formatWeatherMessage,
};
