const getLocationDetails = async (location) => {
  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${location}`,
  );

  return response.json();
};
