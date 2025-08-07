# 📈 StockTracker

**StockTracker** is a responsive and theme-aware stock market tracking web application built entirely using **vanilla HTML, CSS, and JavaScript**. It integrates real-time data via the [Finnhub API](https://finnhub.io/) and also includes mock data as fallback for testing and offline use.

> 🚀 Track stocks like a pro. Visualize live prices, build watchlists, and follow global market trends — all in one beautiful frontend-only app.

---

## 📁 Project Structure
├── index.html # Landing page with features overview and preview
├── dashboard.html # Real-time stock dashboard (core app)
├── styles.css # Complete styling with dark mode + responsiveness
└── script.js # JavaScript logic for API, charts, interactivity


---

## 🖥️ Features

- 📊 **Real-Time Stock Quotes** with auto-refresh (via Finnhub API)
- ⭐ **Watchlist** to track your favorite stocks (stored in localStorage)
- 🌍 **Global Market Indices** (S&P 500, NASDAQ, NIFTY 50, etc.)
- 📰 **Latest News Feed** (categorized into International and Indian markets)
- 🔍 **Search Bar** with live search results and selection
- 🌙 **Dark Mode Toggle**
- 📈 **Interactive Line Chart** with Chart.js (price vs time)
- 💾 **Mock Data Support** for offline/limited API use
- 🔄 **Auto-Refresh Switch** to control background data updates

---

## 🔧 Technologies Used

- HTML5 & CSS3
- JavaScript (no frameworks!)
- [Finnhub API](https://finnhub.io/) for stock, index & news data
- [Chart.js](https://www.chartjs.org/) for real-time charts
- [Lucide Icons](https://lucide.dev/) for UI icons
- LocalStorage for watchlist & theme persistence

---

## 📄 File-by-File Explanation

### 📍 `index.html` — Landing Page

- **Header** with logo and dark mode toggle.
- **Hero Section** encourages users to track stocks with a call-to-action.
- **Market Preview Grid** shows real-time data cards (loading skeletons until JavaScript populates).
- **Feature Cards** highlight what the app can do (real-time data, watchlist, charts, analysis, etc.).
- **Footer** with credits and app branding.

### 📍 `dashboard.html` — Core Dashboard

- **Header** with:
  - Live connection status indicator
  - Dark mode toggle
  - Auto-refresh toggle
  - Search input with result dropdown
  - Home button

- **Sidebar**:
  - Lists popular stocks
  - Shows a loading spinner initially

- **Main Panel** has 3 tabs:
  - `Overview`: Live stock details, company info, and chart
  - `Watchlist`: Add/remove favorite stocks using star icons
  - `News`: Latest categorized news with filter buttons

### 📍 `styles.css` — Styling & Themes

- CSS variables define colors, fonts, and design system.
- **Dark Mode Support** using `.dark` class on `<html>` element.
- **Components styled**: buttons, cards, inputs, tabs, lists, tooltips, and animations.
- **Responsive Grid Layouts** for preview, features, and dashboard panels.
- **Loading Skeletons** and spinners for better UX on slow connections.

### 📍 `script.js` — Core Logic

- **App State**: Central object (`app`) stores selected stock, theme, watchlist, etc.
- **Finnhub API Integration**:
  - Fetches stock quote, company profile, news, and indices
  - Auto fallback to `MOCK_STOCKS`, `MOCK_NEWS`, and `MOCK_INDICES` when API fails
- **Chart Generation**:
  - Uses Chart.js for live line chart
  - Dynamic color based on stock price movement
- **Search Logic**:
  - Debounced live search input
  - Selection updates the dashboard
- **Watchlist Management**:
  - Toggle star icon to add/remove stocks
  - Persists in `localStorage`
- **Theme Toggle**:
  - Stored in `localStorage`
  - Auto-detects system preference on first load
- **Auto-Refresh**:
  - Updates selected stock & indices every 5s (can be turned off)
- **News Handling**:
  - Filters for Indian, International, or All
  - Includes time formatting (e.g., "2 hours ago")

---

## 📷 Screenshots

<details>
<summary>Landing Page</summary>
<img src="assets/landing.png" alt="Landing Page Screenshot" />
</details>

<details>
<summary>Dashboard - Overview Tab</summary>
<img src="assets/dashboard-overview.png" alt="Dashboard Overview Screenshot" />
</details>

<details>
<summary>Watchlist Tab</summary>
<img src="assets/watchlist.png" alt="Watchlist Screenshot" />
</details>

---

## ⚙️ Setup Instructions

> This is a frontend-only project — no backend or database setup required.

1. **Clone the repo**:
   ```bash
   git clone https://github.com/yourusername/stocktracker.git
   cd stocktracker
