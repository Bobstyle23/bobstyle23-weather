import { WeatherData } from "./weather-data";
import { utilities } from "./utilities";
const _locationData = new WeakMap();

// NOTE: TODO
// 1. Move weather updating functions into utilities with necessary parameters
// 2. On city/location search show dropdown list with similar city names
// 3. On city/location select from search dropdown list set the search field value to selected value
// 4. On search button click trigger loading state until api returns a data
// 5. After api data returned set loading state to false and populate api data according to location
//

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
    country: null,
    city: null,
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

    this.daysDropdown = document.querySelectorAll(
      '[data-type="days"] .select__dropdown li',
    );

    this.daysDropdownDefault = document.querySelector(
      '[data-type="days"] .selected__value',
    );

    this.dailyForecastUnit = document.querySelector(
      ".forecast--daily .forecast__units",
    );
    this.hourlyForecastUnit = document.querySelector(
      ".forecast--hourly .forecast__units",
    );

    this.initialSelectedDay = this.daysDropdownDefault.textContent;
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
        (value) => value.cloneNode(true),
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
      this.daysDropdownDefault.textContent = "-";
    } else {
      this.currentWeatherBgContainer.removeAttribute("hidden");
      this.currentWeatherBgLoading.setAttribute("hidden", "");
      this.forecastUnits.forEach((unit, i) => {
        this.savedForecastUnits[i].forEach((child) => unit.appendChild(child));
      });
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

  // PERF: RETURNS LIST OF LOCATION BY SEARCH KEYWORD
  getLocationData(location) {
    Main.weatherData.fetchLocationData(location).then((data) => {
      this.locationData = data.results;
      console.log(data.results);
    });
  }

  // PERF: RETURNS ACTUAL WEATHER DATA BY LOCATION
  getWeatherDataByLocation(param) {
    Main.weatherData.fetchWeatherData(param).then((data) => {
      Main.weatherData
        .fetchUsersCountry(data.latitude, data.longitude)
        .then((res) => {
          console.log(res);
        });
      console.log(data);
    });
  }

  // PERF: UPDATES USER'S LOCATION AUTOMATICALLY ON INITIAL LOAD
  async getUsersLocation() {
    try {
      this.loadingState(true);
      const userLocationData = await Main.weatherData.fetchUsersLocation();

      Main.userCurrentData.latitude = userLocationData.latitude;
      Main.userCurrentData.longitude = userLocationData.longitude;
      Main.userCurrentData.country = userLocationData.country_name;
      Main.userCurrentData.city = userLocationData.region;

      await this.updateCurrentUserWeather();
      this.loadingState(false);
    } catch (error) {
      console.error(error);
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

  static #dayNames(data, weekdayOption = "short") {
    return data.daily.time.map((date) => {
      const day = new Date(date);
      return day.toLocaleDateString("en-US", { weekday: weekdayOption });
    });
  }

  static #formatTime(time) {
    const formattedTime = new Date(time).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    return formattedTime;
  }

  async updateCurrentUserWeather() {
    try {
      const { latitude, longitude } = Main.userCurrentData;

      const weatherData = await Main.weatherData.fetchWeatherData({
        latitude,
        longitude,
      });
      console.log(weatherData);

      // const currentTime = new Date().toLocaleString();

      const currentDate = new Date();
      const currentLocalDate = currentDate.toLocaleDateString("en-CA"); //returns year-month-date
      const currentHourOnly = new Date(
        currentDate.getTime() + 9 * 60 * 60 * 1000,
      );

      currentHourOnly.setMinutes(0, 0, 0);
      const isoCurrentHour = currentHourOnly.toISOString().slice(0, 13) + ":00";

      const timeIndex = weatherData.hourly.time.indexOf(isoCurrentHour);
      const dayIndex = weatherData.daily.time.indexOf(currentLocalDate);

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
          sunrise: weatherData.daily.sunrise[dayIndex],
          sunset: weatherData.daily.sunset[dayIndex],
          pressure: weatherData.hourly.pressure_msl[timeIndex],
          visibility: weatherData.hourly.visibility[timeIndex],
        };

        const dayNames = Main.#dayNames(weatherData);
        const longDayNames = Main.#dayNames(weatherData, "long").map(
          (day) => day,
        );

        this.daysDropdown.forEach((dropdown, idx) => {
          dropdown.textContent = longDayNames[idx];
          dropdown.dataset.value = longDayNames[idx].toLowerCase();
        });

        this.daysDropdownDefault.textContent = longDayNames[0];

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

        const hoursArray = weatherData.hourly.time.slice(
          timeIndex + 1,
          timeIndex + 9,
        );

        hoursArray.map((hour) => {
          const hourIndex = weatherData.hourly.time.indexOf(hour);

          if (hourIndex !== -1) {
            const hourlyForecastArray = hoursArray
              .map((hour) => {
                const hourIndex = weatherData.hourly.time.indexOf(hour);

                if (hourIndex !== -1) {
                  return {
                    temperature: weatherData.hourly.temperature_2m[hourIndex],
                    weatherCode: weatherData.hourly.weathercode[hourIndex],
                    time: weatherData.hourly.time[hourIndex],
                  };
                }
                return null;
              })
              .filter(Boolean);

            const hourltForecastHTML = hourlyForecastArray.map((weather) => {
              const date = new Date(weather.time);
              const formatterHour = date.toLocaleString("en-US", {
                hour: "numeric",
                hours12: true,
              });

              return `<article class="forecast__unit forecast__unit--hourly"><img class="forecast__unit--hourly-icon" src="./img/icon-${utilities.getWeatherGroupByCode(weather.weatherCode)}.webp"/><p class="forecast__unit--hourly-time">${formatterHour}</p><p class="forecast__unit--hourly-temp">${weather.temperature.toFixed()}&deg;</p></article>`;
            });

            this.hourlyForecastUnit.innerHTML = hourltForecastHTML.join("");
          }
        });

        const currentWeatherUnits = [
          `${Main.#formatTime(currentWeather.sunrise)}`,
          `${currentWeather.apparentTemperature.toFixed(0)}&deg;`,
          `${currentWeather.humidity}%`,
          `${currentWeather.windSpeed} ${weatherData.hourly_units.windspeed_10m}`,
          `${currentWeather.precipitation} ${weatherData.hourly_units.precipitation}`,
          `${Math.round(currentWeather.uvIndex * 1).toFixed()}`,
          `${Number(currentWeather.pressure.toFixed(0)).toLocaleString("en-US")} ${weatherData.hourly_units.pressure_msl}`,
          `${Math.floor(currentWeather.visibility / 1000)} km`,
          `${Main.#formatTime(currentWeather.sunset)}`,
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
      }

      this.currentCity.textContent = `${Main.userCurrentData.city}, ${Main.userCurrentData.country}`;
      this.currentDate.textContent = Main.userCurrentData.dateAndTime;
    } catch (error) {
      console.error("Error updating current user weather:", error);
    }
  }
}

new Main();
