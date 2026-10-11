# WeatherSense AI — AI-Powered Weather Monitoring System

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646cff.svg)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6.svg)](https://www.typescriptlang.org/)
[![Node Express](https://img.shields.io/badge/Node%20Express-Full--Stack-000000.svg)](https://expressjs.com/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-3.8%20Flash-8e75ff.svg)](https://aistudio.google.com/)

> **Intelligent Weather Monitoring and Forecasting System with AI Analysis and IoT Sensor Telemetry**

---

## 1. Project Introduction & Objectives

**WeatherSense AI** is an advanced, production-grade meteorological telemetry and analytics platform developed as a comprehensive Computer Science and Engineering demonstration project. 

The application integrates real-time meteorological observation feeds, interactive numerical forecast modeling, generative AI synthesis (powered by Google Gemini), geospatial mapping with Leaflet, autonomous weather alert thresholds, and physical IoT weather station ingestion (ESP32 microcontrollers with DHT22 & BMP280 sensors).

### Primary Objectives
- **Zero-Barrier Demonstration:** Operates immediately out-of-the-box in **Demonstration Mode** using verified baseline datasets without requiring immediate API keys or external databases.
- **Full-Stack Extensibility:** Features an integrated Node.js Express backend (`server.ts`) capable of querying OpenWeather API, Open-Meteo Global Sensor Mesh, Google Gemini API, and MongoDB Atlas.
- **Scientific Rigor & Transparency:** Clearly delineates live sensor data from sample data. AI analysis never fabricates measurements or impersonates official government storm warnings.
- **Hardware-in-the-Loop Readiness:** Provides real REST ingestion endpoints (`POST /api/stations/readings`) alongside ready-to-flash Arduino C++ firmware for ESP32 microcontrollers.

---

## 2. Core Features

| Feature Module | Capabilities |
| :--- | :--- |
| **Main Dashboard** | Current temperature, feels-like, min/max bounds, 8 physical telemetry cards (humidity, wind speed, wind vector, pressure, visibility, cloud cover, precipitation, UV index), daylight solar arc, and 7-day synopsis strip. |
| **City Search & Geolocation** | Instant fuzzy search across Indian metros (Bengaluru, Mysuru, Vijayapura, Hyderabad, Chennai, Mumbai, Delhi, Pune) and worldwide capitals, favorite locations manager, and HTML5 GPS geolocation. |
| **Detailed Forecast & Trends** | 24-hour hourly timeline and 7-day multi-day outlook with 4 interactive Recharts canvases (Temperature, Humidity, Wind Velocity, Rain Accumulation). |
| **AI Weather Synthesis** | Secure server-side Google Gemini 3.8 Flash analysis generating thermodynamic heat index insights, fluid dynamics explanations, and actionable lifestyle/agricultural precautions. |
| **WeatherSense AI Assistant** | Conversational chat interface grounded strictly in live station telemetry, supporting prompt chips and markdown dialogue. |
| **Autonomous Alert System** | Configurable user thresholds (high temp, gusty winds, heavy humidity, rain accumulation), severity classification (Information, Advisory, Warning, Severe), and acknowledgement workflow. |
| **Historical Analytics** | 7-day and 14-day historical climate records, aggregate statistical indicators (mean, peak, minimum, cumulative precipitation), and one-click **CSV export**. |
| **Dual City Comparison** | Side-by-side metric differential (e.g., Bengaluru vs. Mysuru) with comparative BarCharts and automated AI comparative synthesis. |
| **Geospatial Weather Map** | Interactive Leaflet + OpenStreetMap engine with custom station pins, live popups, Dark Radar tiles, street maps, and topography. |
| **IoT Weather Station** | Virtual & physical ESP32 telemetry dashboard, live sensor history curves, built-in packet simulator, and complete C++ Arduino firmware source code. |

---

## 3. Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React Icons
- **Data Visualization:** Recharts (Area, Line, Bar, Tooltip, ResponsiveContainer)
- **Geospatial Mapping:** Leaflet, OpenStreetMap, CartoDB Dark Tiles
- **Backend & Middleware:** Node.js, Express.js, `tsx`
- **Artificial Intelligence:** Google Gemini API (`@google/genai` TypeScript SDK, `gemini-3.8-flash`)
- **IoT Firmware Architecture:** C++ / Arduino ESP32 HTTP Client (DHT22, BMP280, Rain sensor)
- **Database (Optional/Supported):** MongoDB Atlas / Mongoose

---

## 4. Local Execution Instructions (Visual Studio Code on Windows / Mac / Linux)

Follow these exact steps to run WeatherSense AI on your computer:

### STEP 1: Extract the Downloaded ZIP
In Google AI Studio, click **Download ZIP**. Extract the archive to a folder on your computer (for example: `C:\Users\YourName\Projects\weathersense-ai`).

### STEP 2: Open in Visual Studio Code
Open VS Code, select **File &rarr; Open Folder...**, and select the extracted `weathersense-ai` directory.

### STEP 3: Open the Integrated Terminal
Press `Ctrl + \`` (backtick) or select **Terminal &rarr; New Terminal** from the top menu.

### STEP 4: Install Dependencies
In the terminal, run:
```bash
npm install
```

### STEP 5: Start the Development Server
Launch the unified full-stack server with Vite middlewares:
```bash
npm run dev
```

### STEP 6: Open the Application
Open your web browser and navigate to:
```
http://localhost:3000
```
The application will launch immediately in **Demonstration Mode**, fully interactive, with zero database or API key setup required!

---

## 5. Environment Variables & API Configuration

Create a `.env` file in the project root (copied from `.env.example`):

```bash
cp .env.example .env
```

### Available Keys:

```env
# Full-Stack Server Port (Default: 3000)
PORT=3000

# Google Gemini API Key (Required for live Gemini generative analysis & chat)
# Get a free key at: https://aistudio.google.com/app/apikey
GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"

# OpenWeather API Key (Optional)
# If left empty, WeatherSense seamlessly queries Open-Meteo live API or verified sample datasets.
OPENWEATHER_API_KEY="YOUR_OPENWEATHER_API_KEY_HERE"

# MongoDB Atlas URI (Optional for persistent database storage)
MONGODB_URI="mongodb://localhost:27017/weathersense"
```

> **Security Note:** Private API keys are accessed exclusively inside `server.ts` on the Node.js backend. They are **never** exposed in client-side bundles or sent to the browser.

---

## 6. Project File Structure

```
weathersense-ai/
├── .env.example                # Documented environment variables template
├── .gitignore                  # Git ignore rules for node_modules and .env
├── index.html                  # HTML entry point with Leaflet and typography assets
├── metadata.json               # AI Studio application metadata and capabilities
├── package.json                # Project dependencies and npm scripts
├── README.md                   # Comprehensive engineering documentation
├── server.ts                   # Full-stack Node.js + Express backend with Gemini & Vite
├── tsconfig.json               # TypeScript compiler configuration
├── vite.config.ts              # Vite configuration with Tailwind CSS plugin
└── src/
    ├── App.tsx                 # Root application component and state orchestration
    ├── index.css               # Global Tailwind CSS and Leaflet custom styling
    ├── main.tsx                # React DOM entry point
    ├── components/
    │   ├── common/             # StatusBanner, ThemeToggle, MetricCard, Skeleton, Error, Empty
    │   ├── forecast/           # Recharts visualization canvas (ForecastCharts)
    │   ├── layout/             # Header, Sidebar, Footer components
    │   └── weather/            # CurrentWeatherCard, WeatherStatsGrid, SunMoonCard, ForecastStrip, CitySearchModal
    ├── data/
    │   ├── sampleData.ts       # High-fidelity verified baseline meteorological datasets
    │   └── supportedCities.ts  # Supported Indian metros and global coordinate indexes
    ├── hooks/
    │   ├── useAlerts.ts        # Dynamic meteorological threshold rules engine
    │   ├── useTheme.ts         # Dark and light mode manager with persistence
    │   └── useWeather.ts       # Centralized telemetry fetching, units, and favorites hook
    ├── pages/
    │   ├── AIAnalysisPage.tsx  # Google Gemini structured meteorological synthesis view
    │   ├── AIChatPage.tsx      # WeatherSense AI Assistant interactive chatbot view
    │   ├── AlertsPage.tsx      # Autonomous alarm threshold configuration view
    │   ├── ComparisonPage.tsx  # Dual-city differential and comparative analytics view
    │   ├── DashboardPage.tsx   # Primary meteorological telemetry dashboard
    │   ├── DocsPage.tsx        # VS Code local run and project architecture guide view
    │   ├── ForecastPage.tsx    # Multi-day and hourly synoptic forecast view
    │   ├── HistoryPage.tsx     # Historical climate archive and CSV export view
    │   ├── IoTPage.tsx         # ESP32 hardware telemetry and packet simulator view
    │   └── MapPage.tsx         # Leaflet OpenStreetMap interactive geospatial view
    ├── services/
    │   ├── api.ts              # Centralized fetch wrapper with fallback resilience
    │   ├── aiService.ts        # Client service for Gemini backend routes
    │   ├── iotService.ts       # Client service for IoT station endpoints
    │   └── weatherService.ts   # Weather API client and unit conversion utilities
    └── types/
        └── weather.ts          # Strongly typed TypeScript interfaces
```

---

## 7. Backend API Contract

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/health` | `GET` | System heartbeat, uptime, and credential configuration status. |
| `/api/weather/current?city=Bengaluru` | `GET` | Current observation with WMO weather condition code resolution. |
| `/api/weather/forecast?city=Bengaluru` | `GET` | 24-hour hourly intervals and 7-day numerical weather predictions. |
| `/api/weather/compare?cities=Bengaluru,Mysuru` | `GET` | Multi-city synchronous parameter extraction. |
| `/api/ai/weather-analysis` | `POST` | Calls Gemini 3.8 Flash with structured JSON schema for scientific weather analysis. |
| `/api/ai/chat` | `POST` | Conversational assistant grounded in validated station telemetry. |
| `/api/history?city=Bengaluru` | `GET` | Historical multi-parameter observations with statistical aggregates. |
| `/api/alerts` | `GET` | Triggered threshold alerts. |
| `/api/alerts/acknowledge` | `POST` | Acknowledges an active threshold alert. |
| `/api/stations` | `GET` | Telemetry status of registered IoT microcontroller nodes. |
| `/api/stations/readings` | `POST` | Ingests telemetry packets from physical ESP32 HTTP clients. |

---

## 8. Physical IoT Weather Station Integration (ESP32)

WeatherSense AI is engineered to integrate with physical microcontrollers.

### Supported Sensor Pinout:
- **MCU:** ESP32 NodeMCU (38-pin or 30-pin)
- **Temperature & Humidity:** DHT22 connected to **GPIO 4**
- **Atmospheric Pressure:** BMP280 via I2C (**SDA = GPIO 21, SCL = GPIO 22**)
- **Rain Sensor:** Analog resistive sensor connected to **GPIO 34**
- **Transmission:** HTTP POST over WiFi every 60 seconds to `http://<YOUR_IP>:3000/api/stations/readings`

The complete, ready-to-flash Arduino sketch is accessible directly from the **IoT Weather Station** page within the application, featuring one-click copy.

---

## 9. Academic Engineering Viva & Defense Talking Points

For computer science and electronics engineering presentations:
1. **Separation of Concerns:** Client UI is completely decoupled from API credentials; all LLM invocations occur server-side through Node.js Express.
2. **Graceful Degradation:** The application implements a multi-tier fallback architecture: OpenWeather &rarr; Open-Meteo &rarr; Deterministic Local Sample Engine.
3. **Data Integrity:** AI outputs are strictly constrained against hallucination through strict prompt grounding in current sensor telemetry.
4. **IoT Microcontroller Protocol:** Edge nodes transmit lightweight JSON payloads over standard REST HTTP, allowing horizontal scaling across multiple campus or agricultural sensor nodes.

---

## 10. License

This project is licensed under the **Apache-2.0 License**.
