import React, { useState, useEffect } from 'react';

const WeatherWidget = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCurrentLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const locationName = await getLocationName(latitude, longitude);
            fetchWeather(latitude, longitude, locationName);
          },
          (error) => {
            console.error('Error getting location:', error);
            // Fallback to IP-based location or default location
            fetchWeatherByIP();
          }
        );
      } else {
        console.error('Geolocation is not supported by this browser');
        fetchWeatherByIP();
      }
    };

    const getLocationName = async (lat, lon) => {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`);
        const data = await response.json();

        if (data && data.address) {
          // Try to get the most specific location name (village, town, suburb, etc.)
          const location = data.address.village ||
            data.address.town ||
            data.address.suburb ||
            data.address.city ||
            data.address.county ||
            data.display_name.split(',')[0];
          return location;
        }
        return 'Your Location';
      } catch (err) {
        console.error('Error getting location name:', err);
        return 'Your Location';
      }
    };

    const fetchWeatherByIP = async () => {
      try {
        // Get location from IP
        const locationResponse = await fetch('http://ip-api.com/json/');
        const locationData = await locationResponse.json();

        if (locationData.status === 'success') {
          fetchWeather(locationData.lat, locationData.lon, locationData.city);
        } else {
          // Fallback to default location
          fetchWeather(17.3850, 78.4867, 'Hyderabad');
        }
      } catch (err) {
        console.error('Error fetching location by IP:', err);
        fetchWeather(17.3850, 78.4867, 'Hyderabad');
      }
    };

    const fetchWeather = async (lat, lon, cityName = null) => {
      try {
        const response = await fetch(`http://localhost:5001/api/weather?lat=${lat}&lon=${lon}`);
        const data = await response.json();

        if (data.success) {
          setWeather({
            temperature: Math.round(data.temperature),
            condition: data.condition,
            location: cityName || data.location || 'Your Location',
            humidity: data.humidity,
            windSpeed: data.windSpeed,
            forecast: data.forecast || []
          });
        } else {
          throw new Error(data.message || 'Failed to fetch weather data');
        }
      } catch (err) {
        console.error('Weather API error:', err);
        // Fallback to mock data if API fails
        setWeather({
          temperature: 28,
          condition: 'Sunny',
          location: cityName || 'Your Location',
          humidity: 65,
          windSpeed: 12,
          forecast: [
            { day: 'Today', temp: 28, condition: 'Sunny' },
            { day: 'Tomorrow', temp: 30, condition: 'Partly Cloudy' },
            { day: 'Day 3', temp: 27, condition: 'Rainy' },
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    getCurrentLocation();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-400 to-blue-600 text-white p-4 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">{weather.location}</h3>
        <span className="text-2xl">☀️</span>
      </div>
      <div className="text-3xl font-bold mb-1">{weather.temperature}°C</div>
      <div className="text-sm opacity-90">{weather.condition}</div>
      <div className="mt-2 text-xs opacity-75">
        Humidity: {weather.humidity}% | Wind: {weather.windSpeed} km/h
      </div>
    </div>
  );
};

export default WeatherWidget;