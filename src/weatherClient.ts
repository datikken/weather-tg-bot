import axios from 'axios';

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

export class WeatherClient {
    private apiKey: string;
    private apiUrl = 'https://api.openweathermap.org/data/2.5/find';
    private geoUrl = 'https://api.openweathermap.org/geo/1.0/direct';

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    static parseWeatherResponse(responseJson: FindApiResponse): ParsedWeather {
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

    private async geocodeCity(city: string): Promise<{ lat: number; lon: number; displayName: string }> {
        const url = `${this.geoUrl}?q=${encodeURIComponent(city)}&limit=1&appid=${this.apiKey}`;
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

    async getWeatherByCity(city: string, units: Units = 'metric'): Promise<ParsedWeather> {
        const { lat, lon } = await this.geocodeCity(city);
        const data = await this.getWeatherByCoords(lat, lon, units);
        return WeatherClient.parseWeatherResponse(data);
    }

    async getWeatherByCoords(lat: number, lon: number, units: Units = 'metric'): Promise<FindApiResponse> {
        const url = `${this.apiUrl}?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=${units}&lang=ru`;
        const { data } = await axios.get(url, { timeout: 8000 });
        return data;
    }
}

// For backward compatibility
export const parseWeatherResponse = WeatherClient.parseWeatherResponse;
