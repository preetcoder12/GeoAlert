# 🌍 **Disaster Alert & Response System (MERN + Geospatial API)**

A real-time **Disaster Alert & Response System** that tracks global disasters using **NASA**, **OpenWeatherMap**, and **OpenStreetMap** APIs. Users receive location-based alerts via **WebSockets** and can report emergencies manually.

---

## 📌 **Features**

✅ Real-time disaster tracking (Earthquakes, Wildfires, Floods, Storms)  
✅ Interactive map with disaster markers (Leaflet.js)  
✅ User location-based alerts using WebSockets  
✅ Disaster reporting via manual input  
✅ Secure backend using Node.js, Express.js, and MongoDB  
✅ API integration (NASA, OpenWeatherMap, OpenStreetMap)  
✅ Scalable and deployable (MongoDB Atlas, Render, Vercel)  

---

## 🛠️ **Tech Stack**

- **Frontend**: React.js, Leaflet.js (for maps)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Atlas)
- **APIs**: NASA API, OpenWeatherMap API, OpenStreetMap API
- **Real-time**: Socket.io (WebSockets)

---

## 📊 **Core Components**

### 🧰 **Backend Components (Node.js + Express)**

1. **Server (Express.js)**: Handles API requests and serves disaster data.
2. **API Handlers**: Fetches data from NASA, OpenWeatherMap, and OpenStreetMap.
3. **WebSocket (Socket.io)**: Sends real-time alerts to users.
4. **Database (MongoDB)**: Stores user profiles, disaster reports, and event logs.

### 🎨 **Frontend Components (React + Leaflet.js)**

1. **Navbar**: Navigation links (Home, Reports, Alerts, Settings).
2. **Dashboard**: Interactive map with disaster markers.
3. **Alert List**: Displays recent disaster events.
4. **User Location Input**: Allows users to set their location.
5. **Emergency Report Form**: Users can manually report disasters.

---

## 📡 **API Integration**

1. **NASA API**: Fetches wildfire, earthquake, and global event data.
2. **OpenWeatherMap API**: Provides weather-related disaster information.
3. **OpenStreetMap API**: Enables geolocation tracking.

---

## 📤 **Deployment**

### **Backend Deployment**

1. Use **MongoDB Atlas** for cloud-based data storage.
2. Deploy backend using **Render**, **Railway**, or **DigitalOcean**.

### **Frontend Deployment**

1. Host the frontend on **Vercel**, **Netlify**, or **Firebase**.
2. Ensure the frontend interacts correctly with the deployed backend.

---

## 📣 **Bonus Features**

✅ **Push Notifications**: Use Firebase to deliver alerts.  
✅ **SMS Alerts**: Integrate Twilio to notify users via SMS.

---

### 🎥 **Project Walkthrough**  
[![GeoAlert - Disaster Alert System](https://img.youtube.com/vi/C7IQvMs5buw/0.jpg)](https://www.youtube.com/watch?v=C7IQvMs5buw)

Check out the full code and documentation on GitHub:  
👉 [**GeoAlert GitHub Repository**](https://github.com/preetcoder12/GeoAlert)
