import { WeatherData } from "./weather-data";
import { utilities } from "./utilities";
const _locationData = new WeakMap();

class Main {
  constructor() {
    this.cacheDOM();
    this.bindEvents();
    this.getUsersLocation();
    this.getUsersTime();
  }

  static weatherData = new WeatherData();
  static searchValue = "";
  static userCurrentData = {
    latitude: null,
    longitude: null,
    dateAndTime: null,
  };

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
    const getLocationWithDebounce = utilities.debounce((e) => {
      this.getLocationData(e.target.value);
    }, 500);

    this.searchField.addEventListener("input", (e) => {
      Main.searchValue = e.target.value;
      getLocationWithDebounce(e);
    });

    this.searchBtn.addEventListener("click", () =>
      this.getWeatherDataByLocation({
        latitude: this.locationData[0].latitude,
        longitude: this.locationData[0].longitude,
      }),
    );
  }

  getLocationData(location) {
    Main.weatherData.fetchLocationData(location).then((data) => {
      this.locationData = data.results;
      console.log(data.results);
    });
  }

  getWeatherDataByLocation(param) {
    Main.weatherData.fetchWeatherData(param).then((data) => {
      console.log(data);
    });
  }

  getUsersLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          Main.userCurrentData.latitude = latitude;
          Main.userCurrentData.longitude = longitude;

          console.log(Main.userCurrentData);
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              console.error("User denied the request for geolocation");
              break;

            case error.POSITION_UNAVAILABLE:
              console.error("Location information unavailable");
              break;

            case error.TIMEOUT:
              console.error("The request to get user location timed out");
              break;

            default:
              console.error("Unknown error occured.");
              break;
          }
        },
      );
    } else {
      console.error("geolocation is not supporter by this browser");
    }
  }

  getUsersTime() {
    const now = new Date();

    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    const formattedTime = now.toLocaleString(undefined, options);

    Main.userCurrentData.dateAndTime = formattedTime.split(",");

    console.log(Main.userCurrentData);
  }
}

new Main();
