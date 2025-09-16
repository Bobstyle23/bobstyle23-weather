import { WeatherData } from "./weather-data";
import { observable, utilities } from "./utilities";
const _locationData = new WeakMap();

// NOTE: TODO
// 0. Add loading state for initial loading ✅
// 1. Get users location on initial loading ✅
// 2. Display user's current city with country and current date with current weather degree with weather condition icon ✅
// 3. Display feels like, humidity, wind, and precipitation indicators for the user's location below current weather indicator ✅
// 4. Display daily forecasts (day of the week, weather condition icon, high temp and low temp) for each day of the week starting from users current day of the week ✅
// 5. Display hourly forecasts (max for 8 hours starting from current time) while weekdays dropdown indicating current day of the week

class Main {
  constructor() {
    this.cacheDOM();
    this.bindEvents();
    this.loading = false;

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
    this.currentWeatherBgContainer = document.querySelector(".current__bg-img");
    this.currentWeatherBgLoading = document.querySelector(".current__loading");
    this.currentCity = document.querySelector(".current__city");
    this.currentDate = document.querySelector(".current__date");
    this.currentDegree = document.querySelector(".current__weather-degree");
    this.currentWeatherIcon = document.querySelector(".current__weather-icon");
    this.currentUnitValues = document.querySelectorAll(".current__unit--value");
    this.forecastUnits = document.querySelectorAll(".forecast__unit");

    this.dailyForecastUnit = document.querySelector(
      ".forecast--daily .forecast__units",
    );

    this.hourlyDropdownSelected = document.querySelector(
      ".forecast__header .selected__value",
    );
    this.initialSelectedDay = this.hourlyDropdownSelected.textContent;
  }

  loadingState(loading) {
    this.loading = loading;

    if (!this.savedForecastUnits) {
      this.savedForecastUnits = [...this.forecastUnits].map((unit) =>
        [...unit.children].map((child) => child.cloneNode(true)),
      );
    }

    if (!this.savedCurrentUnitValues) {
      this.savedCurrentUnitValues = Array.from(this.currentUnitValues).map(
        (value) => value.cloneNode(true), // clone the <p> element with content
      );
    }

    if (loading) {
      this.currentWeatherBgContainer.setAttribute("hidden", "");
      this.currentWeatherBgLoading.removeAttribute("hidden");
      this.currentUnitValues.forEach((value) => {
        const loadingIcon = "-";
        value.textContent = loadingIcon;
      });
      this.forecastUnits.forEach((unit) => (unit.innerHTML = ""));
      this.hourlyDropdownSelected.textContent = "-";
    } else {
      this.currentWeatherBgContainer.removeAttribute("hidden");
      this.currentWeatherBgLoading.setAttribute("hidden", "");
      this.forecastUnits.forEach((unit, i) => {
        this.savedForecastUnits[i].forEach((child) => unit.appendChild(child));
      });

      this.hourlyDropdownSelected.textContent = this.initialSelectedDay;
    }
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
    try {
      this.loadingState(true);
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            Main.userCurrentData.latitude = latitude;
            Main.userCurrentData.longitude = longitude;

            this.loadingState(true);
            await this.updateCurrentUserWeather();

            this.loadingState(false);
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

            this.loadingState(false);
          },
        );
      } else {
        console.error("geolocation is not supporter by this browser");
        this.loadingState(false);
      }
    } catch (error) {
      console.log(error);
      this.loadingState(false);
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

    Main.userCurrentData.dateAndTime = formattedTime.split(",").slice(0, 3);
  }

  async updateCurrentUserWeather() {
    try {
      const { latitude, longitude } = Main.userCurrentData;

      const weatherData = await Main.weatherData.fetchWeatherData({
        latitude,
        longitude,
      });
      console.log(weatherData);

      const currentTime = new Date().toLocaleString();

      const currentDate = new Date();
      const currentISODate = currentDate.toISOString().slice(0, 10); //returns year-month-date
      const currentHourOnly = new Date(
        currentDate.getTime() + 9 * 60 * 60 * 1000,
      );

      currentHourOnly.setMinutes(0, 0, 0);
      const isoCurrentHour = currentHourOnly.toISOString().slice(0, 13) + ":00";
      const timeIndex = weatherData.hourly.time.indexOf(isoCurrentHour);
      const dayIndex = weatherData.daily.time.indexOf(currentISODate);

      if (timeIndex !== -1) {
        const currentWeather = {
          temperature: weatherData.hourly.temperature_2m[timeIndex],
          apparentTemperature:
            weatherData.hourly.apparent_temperature[timeIndex],
          humidity: weatherData.hourly.relative_humidity_2m[timeIndex],
          precipitation: weatherData.hourly.precipitation[timeIndex],
          weatherCode: weatherData.hourly.weathercode[timeIndex],
          windSpeed: weatherData.hourly.windspeed_10m[timeIndex],
          cloudCover: weatherData.hourly.cloudcover[timeIndex],
          uvIndex: weatherData.hourly.uv_index[timeIndex],
        };

        const dayNames = weatherData.daily.time.map((date) => {
          const day = new Date(date);
          return day.toLocaleDateString("en-US", { weekday: "short" });
        });

        const dailyWeatherDatas = {
          dailyTemperatures: {
            high: weatherData.daily.temperature_2m_max.map((temp) => temp),
            low: weatherData.daily.temperature_2m_min.map((temp) => temp),
          },
          days: dayNames,
          weatherCodes: weatherData.daily.weathercode.map((code) => code),
        };

        const dailyWeatherItems = dailyWeatherDatas.days.map((day, idx) => ({
          day,
          highTemp: dailyWeatherDatas.dailyTemperatures.high[idx],
          lowTemp: dailyWeatherDatas.dailyTemperatures.low[idx],
          code: dailyWeatherDatas.weatherCodes[idx],
        }));

        const dailyForecastHTML = dailyWeatherItems.map((weather) => {
          return `<article class="forecast__unit"> <p class="forecast__unit--day">${weather.day}</p> 
        <img class="forecast__unit--icon" src="./img/icon-${utilities.getWeatherGroupByCode(weather.code)}.webp" /> <div>
        <p class="forecast__unit--high">${weather.highTemp.toFixed(0)}&deg;</p>
        <p class="forecast__unit--low">${weather.lowTemp.toFixed(0)}&deg;</p>
        </div></article>`;
        });

        this.dailyForecastUnit.innerHTML = dailyForecastHTML.join("");

        const currentWeatherUnits = [
          `${currentWeather.apparentTemperature.toFixed(0)}&deg;`,
          `${currentWeather.humidity}%`,
          `${currentWeather.windSpeed} ${weatherData.hourly_units.windspeed_10m}`,
          `${currentWeather.precipitation} ${weatherData.hourly_units.precipitation}`,
        ];

        this.currentDegree.innerHTML = `${currentWeather.temperature.toFixed(0)}&deg;`;
        const weatherIcon = utilities.getWeatherGroupByCode(
          currentWeather.weatherCode,
        );
        this.currentWeatherIcon.setAttribute(
          "src",
          `./img/icon-${weatherIcon}.webp`,
        );

        this.currentUnitValues.forEach((unit, idx) => {
          unit.innerHTML = currentWeatherUnits[idx];
        });
        console.log(currentWeather);
      }

      const countryData = await Main.weatherData.fetchUsersCountry(
        latitude,
        longitude,
      );

      const fullCountry = await Main.weatherData.fetchFullCountryName(
        countryData.country,
      );

      this.currentCity.textContent = `${countryData.name}, ${fullCountry.name.common}`;
      this.currentDate.textContent = Main.userCurrentData.dateAndTime;
    } catch (error) {
      console.error("Error updating current user weather:", error);
    }
  }
}

new Main();
