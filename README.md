# AeroCore // System Hub

AeroCore is an advanced, cinematic, suborbital and international Flight Control Dashboard. Built using **React 19** and custom **Vanilla CSS variables**, it features an Apple-style "Liquid Glass" theme with rich frosted translucency, vibrant background animations, and an interactive airspace telemetry radar.

AeroCore links seamlessly with your local **Eclipse Java REST Backend** (coupled to a MySQL database) and features a smart client-side **Demo Mode fallback** so that the entire visual suite and state operations remain active even when the database server is offline.

---

## 🎨 Theme & Visual Philosophy

AeroCore supports dual high-fidelity themes, toggled dynamically via a header control:

### 🌙 Dark Mode (Cyber Obsidian)
*   **Aesthetics**: Deep dark slate card overlays (`rgba(13, 17, 28, 0.55)`) with a high blur saturation on top of floating neon cyan, indigo, and violet background blobs.
*   **Visual Highlights**: Radiant neon boundaries, glowing text gradients, and high-frequency scan indicators.

### ☀️ Light Mode (Apple Liquid Glass)
*   **Aesthetics**: Ultra-transparent white frosted glass panels (`rgba(255, 255, 255, 0.22)`) overlaying an Apple off-white (`#f0f3f8`) workspace.
*   **Visual Highlights**: Vivid pastel peach, rose, and sky blue background blobs that refract and bleed through the cards on scroll/drag, finished with a distinct white specular border glare (`rgba(255, 255, 255, 0.85)` at the top edge).

---

## 🚀 Key Features

1.  **Airspace Telemetry Radar (SVG)**: Renders coordinates for all registered flights as active blips on an animated rotating sweep grid. Hovering over a blip displays detailed flight statistics; clicking locks focus on that flight manifest.
2.  **Live Boarding Pass Ticket**: Filling out the flight registration form updates a virtual airport boarding ticket in real-time, rendering custom barcodes, ticket class, gate assignments, and flight routing lines.
3.  **Four-Mode manifest search**: Capsule-style switcher corresponding directly to Eclipse database query endpoints:
    *   **Code Search**: Lookup specific details for a unique flight code.
    *   **Carrier Search**: Filter manifests by airline company.
    *   **Route Search**: Query departures and arrivals (Origin ✈ Destination).
    *   **Price Range Slider**: Filter schedules by minimum and maximum fare caps.
4.  **macOS-style Notifications**: Replaces standard browser alerts with custom slide-in glass toast notifications that animate at the top-right.
5.  **Fail-safe Demo Mode**: Pings the Eclipse server on startup. If unreachable, it launches local storage simulation loaded with default international flights (Emirates, Singapore Airlines, Lufthansa) so you can test all operations (Save, Delete, Search) offline.

---

## 🛠 Tech Stack

*   **Core**: React 19, JavaScript (ES6+), HTML5
*   **Styling**: Vanilla CSS3, Google Fonts (*Space Grotesk* for HUD readouts & *Inter* for interfaces)
*   **REST Client**: Axios
*   **Graphics**: Scalable Vector Graphics (SVG)

---

## ⚙️ REST API Endpoints

The dashboard integrates with your Eclipse Java service running at `http://localhost:8080/api/flights` using these schemas:

| HTTP Method | API Path | Action |
| :--- | :--- | :--- |
| `POST` | `/api/flights` | Save a new flight |
| `GET` | `/api/flights/{code}` | Retrieve single flight details |
| `GET` | `/api/flights/carrier/{carrier}` | Fetch flights by carrier |
| `GET` | `/api/flights/route?source={src}&destination={dst}` | Fetch flights by route |
| `GET` | `/api/flights/price?min={min}&max={max}` | Fetch flights by price range |
| `GET` | `/api/flights` | Fetch all registered flights |
| `DELETE` | `/api/flights/{code}` | Decommission flight record |

---

## 📦 Directory Structure

```bash
flight-app/
├── public/
│   └── index.html             # Main template with SEO meta tags and titles
├── src/
│   ├── components/
│   │   ├── BoardingPassTicket.jsx  # Boarding ticket preview widget
│   │   ├── FlightRadar.jsx         # SVG Radar Sweep visualizer
│   │   ├── FlightSearchPanel.jsx   # Multi-mode switcher and query panels
│   │   └── GlassNotification.jsx   # macOS style slide-out toast system
│   ├── services/
│   │   └── FlightService.js        # Axios endpoints configurations
│   ├── App.js                 # Global state controller and layout grid
│   ├── index.js               # React bootstrap file
│   └── index.css              # Apple Liquid Glass variable overrides and keyframes
└── README.md
```

---

## 🚀 Running the Project

### 1. Install Dependencies
Run this in the project directory to fetch all node packages:
```bash
npm install
```

### 2. Launch Development Server
```bash
npm start
```
The application will launch on [http://localhost:3000](http://localhost:3000).

### 3. Build for Production
Creates minified bundles inside the `/build` folder:
```bash
npm run build
```
