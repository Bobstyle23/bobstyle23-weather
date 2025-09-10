const path = require("path");
const fs = require("fs");

const jsDir = path.resolve(__dirname, "./src/js");

const generateEntryPoints = () => {
  const files = fs.readdirSync(jsDir);
  const entry = {};

  files.forEach((file) => {
    if (file.endsWith("js")) {
      const name = path.basename(file, ".js");
      entry[name] = path.join(jsDir, file);
    }
  });

  return entry;
};

const config = {
  mode: "production",
  entry: generateEntryPoints(),

  // PERF: for a reference
  entry: {
    index: "./src/js/index.js",
    dropdown: "./src/js/dropdown.js",
    weatherData: "./src/js/weather-data.js",
    constants: "./src/js/constants.js",
    utilities: "./src/js/utilities.js",
  },
  output: {
    filename: "[name].bundle.js",
  },

  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
};

module.exports = config;
