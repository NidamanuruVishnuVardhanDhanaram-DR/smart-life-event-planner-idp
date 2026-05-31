const axios = require('axios');

const getWeatherForecast = async (lat, lon, apiKey) => {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
    return response.data;
  } catch (error) {
    console.error('Weather API error:', error.message);
    throw new Error('Failed to fetch weather data');
  }
};

const getCurrentWeather = async (lat, lon, apiKey) => {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
    return response.data;
  } catch (error) {
    console.error('Current weather API error:', error.message);
    throw new Error('Failed to fetch current weather');
  }
};

const analyzeWeatherForEvent = (forecast, eventDate) => {
  const eventDay = new Date(eventDate).toISOString().split('T')[0];
  const eventForecast = forecast.list.find(item => {
    const itemDate = new Date(item.dt * 1000).toISOString().split('T')[0];
    return itemDate === eventDay;
  });

  if (!eventForecast) {
    return {
      condition: 'unknown',
      temperature: 'N/A',
      alerts: [],
      suggestions: ['Weather data not available for this date'],
    };
  }

  const { main, weather } = eventForecast;
  const condition = weather[0].main.toLowerCase();
  const temp = Math.round(main.temp);

  let alerts = [];
  let suggestions = [];

  // Weather alerts
  if (condition.includes('rain') || condition.includes('drizzle')) {
    alerts.push('Rain expected on event day 🌧️');
    suggestions.push('Consider indoor venue or provide rain covers');
  } else if (condition.includes('snow')) {
    alerts.push('Snow expected on event day ❄️');
    suggestions.push('Check road conditions and provide warm facilities');
  } else if (temp > 35) {
    alerts.push('Hot weather expected 🔥');
    suggestions.push('Provide shade and hydration stations');
  } else if (temp < 5) {
    alerts.push('Cold weather expected 🥶');
    suggestions.push('Provide heating and warm refreshments');
  }

  // General suggestions
  if (condition.includes('clear') && temp > 20) {
    suggestions.push('Perfect weather for outdoor activities!');
  }

  return {
    condition,
    temperature: temp,
    alerts,
    suggestions,
  };
};

const getWeatherColorCode = (condition) => {
  if (condition.includes('rain') || condition.includes('drizzle') || condition.includes('snow')) {
    return 'red';
  } else if (condition.includes('cloud')) {
    return 'yellow';
  } else {
    return 'green';
  }
};

module.exports = {
  getWeatherForecast,
  getCurrentWeather,
  analyzeWeatherForEvent,
  getWeatherColorCode,
};
