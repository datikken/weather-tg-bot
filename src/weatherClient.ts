import axios from 'axios';

const API_KEY = process.env.OPENWEATHER_API_KEY;
if (!API_KEY) {
    console.error('Missing OPENWEATHER_API_KEY in .env');
}

const API_URL = 'https://api.openweathermap.org/data/2.5/find';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0/direct';

export type Units = 'metric' | 'imperial';

export type ParsedWeather = {
    cityName: string;
    description: string;
    temperature: number;
    feelsLike: number;
    windSpeed: number;
};

type FindApiItem = {
    name: string;
    main: { temp: number; feels_like: number };
    wind: { speed: number };
    weather?: { description: string }[];
};

type FindApiResponse = { list: FindApiItem[] };

export function parseWeatherResponse(responseJson: FindApiResponse): ParsedWeather {
    if (!responseJson.list || responseJson.list.length === 0) {
        throw new Error('Something went wrong, try again later');
    }

    const item = responseJson.list[0];

    return {
        cityName: item.name,
        description: Array.isArray(item.weather) && item.weather.length > 0 ? item.weather[0].description : '',
        temperature: item.main.temp,
        feelsLike: item.main.feels_like,
        windSpeed: item.wind.speed,
    };
}

async function geocodeCity(city: string): Promise<{ lat: number; lon: number; displayName: string }>{
    const url = `${GEO_URL}?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`;
    const { data } = await axios.get(url, { timeout: 8000 });
    if (!Array.isArray(data) || data.length === 0) {
        throw new Error('City not found');
    }
    const item = data[0];
    const nameParts = [item.name, item.state, item.country].filter(Boolean);
    return {
        lat: item.lat,
        lon: item.lon,
        displayName: nameParts.join(', '),
    };
}

export async function getWeatherByCity(city: string, units?: Units): Promise<ParsedWeather> {
    if (!API_KEY) throw new Error('Missing OPENWEATHER_API_KEY');
    const resolvedUnits = units || 'metric';
    const { lat, lon } = await geocodeCity(city);
    const data = await getWeatherByCoords(lat, lon, resolvedUnits);
    return parseWeatherResponse(data);
}

export async function getWeatherByCoords(lat: number, lon: number, units?: Units): Promise<FindApiResponse> {
    if (!API_KEY) throw new Error('Missing OPENWEATHER_API_KEY');
    const resolvedUnits = units || 'metric';
    const url = `${API_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${resolvedUnits}&lang=ru`;
    const { data } = await axios.get(url, { timeout: 8000 });
    return data;
}
