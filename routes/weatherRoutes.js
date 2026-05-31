import express from 'express';
import axios from 'axios';

const router = express.Router();

// Weather routes (public access for now)
router.get('/forecast', async (req, res) => {
  try {
    const { city } = req.query;
    if (!city) {
      return res.status(400).json({ message: 'City parameter is required' });
    }

    // Mock weather data for testing
    const mockWeatherData = {
      city: city,
      temperature: 28,
      condition: 'Sunny',
      humidity: 65,
      windSpeed: 12,
      forecast: [
        { day: 'Today', temp: 28, condition: 'Sunny' },
        { day: 'Tomorrow', temp: 26, condition: 'Partly Cloudy' },
        { day: 'Day 3', temp: 30, condition: 'Sunny' },
        { day: 'Day 4', temp: 27, condition: 'Light Rain' },
        { day: 'Day 5', temp: 29, condition: 'Sunny' }
      ]
    };

    res.json(mockWeatherData);
  } catch (error) {
    console.error('Weather API error:', error);
    res.status(500).json({ message: 'Failed to fetch weather data' });
  }
});

export default router;
