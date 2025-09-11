import { WeatherData } from "./weather-data";
import { Utilities } from "./utilities";

const _locationData = new WeakMap();

class Main {
  constructor() {
    this.cacheDOM();
    this.bindEvents();
    this.weatherData = new WeatherData();
  }

  set locationData(newData) {
    _locationData.set(this, newData);
  }

  get locationData() {
    return _locationData.get(this);
  }

  cacheDOM() {
    this.searchField = document.querySelector(".search__field");
    this.searchBtn = document.querySelector(".search__btn");
  }

  bindEvents() {
    const utilities = new Utilities();
    this.searchField.addEventListener(
      "input",
      utilities.debounce((e) => this.getLocationData(e.target.value), 500),
    );

    this.searchBtn.addEventListener("click", () =>
      this.getWeatherDataByLocation({
        latitude: this.locationData[0].latitude,
        longitude: this.locationData[0].longitude,
      }),
    );
  }

  getLocationData(location) {
    this.weatherData.fetchLocationData(location).then((data) => {
      this.locationData = data.results;
      console.log(data.results);
    });
  }

  getWeatherDataByLocation(param) {
    this.weatherData.fetchWeatherData(param).then((data) => {
      console.log(data);
    });
  }
}

new Main();
