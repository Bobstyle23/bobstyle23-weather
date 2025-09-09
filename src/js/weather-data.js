const _locationData = new WeakMap();
const _weatherData = new WeakMap();

class LocationData {
  constructor(location) {
    this.location = location;
  }

  set locationData(data) {
    _locationData.set(this, data);
  }

  get locationData() {
    _locationData.get(this);
  }

  async fetchLocationData(location) {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${location}`,
    );
    const data = await response.json();
    this.locationData = data;
    return data;
  }
}

const locationData = new LocationData();
locationData.fetchLocationData("tashkent").then((data) => {
  console.log(data);
});

class WeatherData {
  constructor() {}

  set weatherData(data) {
    _weatherData.set(this, data);
  }

  get weatherData() {
    _weatherData.get(this);
  }

  async fetchWeatherData(lat, long) {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&hourly=temperature_2m,relative_humidity_2m,precipitation,weathercode,windspeed_10m,cloudcover&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum&timezone=auto`,
    );
    this.weatherData = response.json();
    return this.weatherData;
  }
}
