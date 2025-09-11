import { WEATHER_CODES } from "./constants";

export class Utilities {
  constructor() {}

  getWeatherGroupByCode(weatherCode) {
    for (const [group, codes] of Object.entries(WEATHER_CODES)) {
      if (codes.includes(weatherCode)) {
        return group;
      }
    }
    return "unknown";
  }

  debounce(callback, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => callback(...args), delay);
    };
  }
}
