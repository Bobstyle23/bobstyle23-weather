export class WeatherData {
  constructor() {}

  async fetchLocationData(location) {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${location}`,
    );
    const data = await response.json();
    return data;
  }

  async fetchWeatherData(params) {
    const {
      latitude,
      longitude,
      temperatureUnit = "celsius",
      windspeed = "kmh",
      precipitation = "mm",
    } = params;

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weathercode,windspeed_10m,cloudcover,uv_index
&daily=temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,precipitation_sum,uv_index_max
&temperature_unit=${temperatureUnit}
&windspeed_unit=${windspeed}
&precipitation_unit=${precipitation}
&timezone=auto`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
  }
}
