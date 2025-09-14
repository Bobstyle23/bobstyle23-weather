import { WeatherData } from "./weather-data";
import { utilities } from "./utilities";
const _locationData = new WeakMap();

// NOTE: TODO
// 0. Add loading state for initial loading
// 1. Get users location on initial loading
// 2. Display user's current city with country and current date with current weather degree with weather condition icon
// 3. Display feels like, humidity, wind, and precipitation indicators for the user's location below current weather indicator
// 4. Display daily forecasts (day of the week, weather condition icon, high temp and low temp) for each day of the week starting from users current day of the week
// 5. Display hourly forecasts (max for 8 hours starting from current time) while weekdays dropdown indicating current day of the week

// WARN: On user search
// 1. Set loading state to true until api returns data and then set to false
// 2. Show dropdown below search bar with similar cities
// 3. If city is selected from the dropdown then replace the input value with selected city
// 4. On search button click set loading state to true until api returns a value and then set the loading state to false
// 5. Update weather for the selected city (create updateWeatherMethod)

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
    this.currentCity = document.querySelector(".current__city");
    this.currentDate = document.querySelector(".current__date");
    this.currentDegree = document.querySelector(".current__weather-degree");
    this.currentWeatherIcon = document.querySelector(".current__weather-icon");
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

          this.updateCurrentUserWeather();
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
      month: "short",
      day: "numeric",
      hour: "numeric",
    };

    const formattedTime = now.toLocaleString(undefined, options);
    console.log(formattedTime.split(" "));

    Main.userCurrentData.dateAndTime = formattedTime.split(",").slice(0, 3);
  }

  updateCurrentUserWeather() {
    const { latitude, longitude } = Main.userCurrentData;
    Main.weatherData.fetchWeatherData({ latitude, longitude }).then((data) => {
      console.log(data);
    });
    Main.weatherData
      .fetchUsersCountry(latitude, longitude)
      .then((countryData) => {
        Main.weatherData
          .fetchFullCountryName(`${countryData.country}`)
          .then((data) => {
            this.currentCity.textContent = `${countryData.name}, ${data.name.common}`;
          });
      });
    this.currentDate.textContent = Main.userCurrentData.dateAndTime;
  }
}

new Main();
