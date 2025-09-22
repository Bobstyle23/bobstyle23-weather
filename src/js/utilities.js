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

  convert(type, value) {
    switch (type) {
      case "fahrenheit":
        return Math.round(value * 1.8 + 32);
      case "mph":
        return Math.round(value / 1.60934134);
      case "inch":
        return Math.round(value / 25.4);
      default:
        console.log("Enter valid value and type");
        break;
    }
  }
}

class Observable {
  constructor() {
    this.observables = [];
  }

  subscribe(callback) {
    this.observables.push(callback);
  }

  unsubscribe(callback) {
    this.observables = this.observables.filter(
      (observable) => observable !== callback,
    );
  }

  notify(data) {
    this.observables.forEach((observable) => observable(data));
  }
}

export const observable = new Observable();
export const utilities = new Utilities();
