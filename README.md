# AI-Powered Smart Life Event Planner 2.0

An intelligent event planning web app that helps users plan, predict, and perfect any kind of event — personal, college, or professional — by combining AI recommendations, real-time weather data, calendar management, reminders & notifications, and collaboration tools.

## Features

- 🌦️ Smart Weather Engine (OpenWeatherMap API)
- 🧠 AI Event Assistant (OpenAI API Integration)
- 🗓️ Interactive Event Calendar (FullCalendar.js)
- 👥 Multi-User Collaboration (Socket.io)
- 🔔 Smart Reminders & Notifications
- 📊 Event Analytics Dashboard (Chart.js)
- 🧾 Event Budget & Resource Tracker
- 🧍‍♂️ Personalized User Dashboard
- 🌐 Smart Venue & Map Integration (Google Maps API)
- 💬 Voice & Chatbot Commands (Web Speech API)
- 🧩 Offline-First + PWA Support
- 🔒 Advanced Authentication (JWT)

## Tech Stack

- **Frontend**: React.js + TailwindCSS + FullCalendar.js + Chart.js + Socket.io
- **Backend**: Node.js + Express.js
- **Database**: MongoDB (Mongoose)
- **AI**: OpenAI API
- **Weather**: OpenWeatherMap API
- **Maps**: Google Maps API
- **Auth**: JWT + Bcrypt
- **Notifications**: Firebase Cloud Messaging + Nodemailer
- **Deployment**: Vercel (frontend) + Render (backend) + MongoDB Atlas

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- API Keys for:
  - OpenAI
  - OpenWeatherMap
  - Google Maps
  - Firebase

### Backend Setup
1. Navigate to backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Create `.env` file with required environment variables
4. Start server: `npm start`

### Frontend Setup
1. Navigate to frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Create `.env` file with required environment variables
4. Start development server: `npm start`

## Project Structure

```
smart-life-event-planner/
├── backend/
│   ├── server.js
│   ├── config/
│   │   ├── db.js
│   │   ├── authMiddleware.js
│   ├── controllers/
│   │   ├── userController.js
│   │   ├── eventController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Event.js
│   ├── routes/
│   │   ├── userRoutes.js
│   │   ├── eventRoutes.js
│   ├── utils/
│   │   ├── weatherAPI.js
│   │   ├── aiHelper.js
│   │   ├── mailer.js
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── components/
│   │   │   ├── EventForm.jsx
│   │   │   ├── WeatherWidget.jsx
│   │   │   ├── AIPlanner.jsx
│   │   │   ├── CalendarView.jsx
│   │   │   ├── AnalyticsDashboard.jsx
│   │   │   ├── ChatAssistant.jsx
│   │   ├── pages/
│   │       ├── Login.jsx
│   │       ├── Register.jsx
│   │       ├── Dashboard.jsx
│   │       ├── AdminPanel.jsx
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License.
