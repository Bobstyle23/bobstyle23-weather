class LocationData {
  constructor(location) {
    this.location = location;
  }

  async fetchLocationData(location) {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${location}`,
    );
    const data = await response.json();
    return data;
  }
}

class WeatherData {
  constructor() {}

  async fetchWeatherData(lat, long) {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&hourly=temperature_2m,relative_humidity_2m,precipitation,weathercode,windspeed_10m,cloudcover&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum&timezone=auto`,
    );

    const data = response.json();
    return data;
  }
}
