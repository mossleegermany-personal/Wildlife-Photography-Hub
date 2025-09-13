# Wildlife Photography Hub

A comprehensive web application for wildlife photographers to record, track, and visualize wildlife sightings with interactive maps and real-time observations.

## 🚀 Features

- **Interactive Map**: Google Maps integration with marker clustering for wildlife sightings
- **Real-time Observations**: Live updates of wildlife sightings with detailed information
- **Species Tracking**: Categorize and track different wildlife species
- **Location Recording**: GPS-based location recording with coordinate validation
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Data Persistence**: MongoDB backend for reliable data storage

## 🛠️ Technology Stack

### Frontend
- **React.js** - Component-based UI framework
- **Vite** - Fast build tool and development server
- **Google Maps API** - Interactive mapping functionality
- **CSS3** - Modern styling with custom properties

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database for data storage
- **Axios** - HTTP client for API requests

## 📁 Project Structure

```
moses-wildlife/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── MainPage.jsx
│   │   │   ├── subcomponents/
│   │   │   │   ├── ControlPanel/
│   │   │   │   ├── MapContainer/
│   │   │   │   └── ObservationsList/
│   │   │   └── WildlifeSightingModal/
│   │   ├── css/
│   │   ├── services/
│   │   └── utils/
│   ├── public/
│   └── package.json
└── backend/
    └── node/
        ├── controllers/
        ├── database/
        ├── routes/
        └── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Google Maps API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mossleegermany-personal/Wildlife-Photography-Hub.git
   cd Wildlife-Photography-Hub
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd ../backend/node
   npm install
   ```

4. **Set up Google Maps API**
   - Get a Google Maps API key from Google Cloud Console
   - Update the API key in the MapContainer components

5. **Configure Database**
   - Ensure MongoDB is running on your system
   - Update database connection settings in `backend/node/database/connection.js`

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd backend/node
   npm start
   ```

2. **Start the Frontend Development Server**
   ```bash
   cd frontend
   npm start
   ```

3. **Access the Application**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:3001`

## 🗺️ Features Overview

### Wildlife Sighting Recording
- Click on the map to record new wildlife sightings
- GPS location detection or manual coordinate selection
- Species categorization with emoji indicators
- Date and time tracking

### Interactive Map
- Hybrid map view for detailed terrain and satellite imagery
- Marker clustering for locations with multiple sightings
- Click markers to view all observations at that location
- Restricted to Singapore region with appropriate zoom levels

### Observations List
- Real-time display of wildlife sightings
- Filterable by location and species
- Detailed view with species information, timestamps, and coordinates
- Responsive design for mobile and desktop viewing

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Maps API for mapping functionality
- MongoDB for reliable data storage
- React.js community for excellent documentation
- Wildlife photography community for inspiration

## 📧 Contact

Moses Lee - [@mossleegermany-personal](https://github.com/mossleegermany-personal)

Project Link: [https://github.com/mossleegermany-personal/Wildlife-Photography-Hub](https://github.com/mossleegermany-personal/Wildlife-Photography-Hub)
