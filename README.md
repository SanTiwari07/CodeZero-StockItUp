# StockItUp

**StockItUp** is a responsive and theme-aware stock market tracking web application built entirely using **vanilla HTML, CSS, and JavaScript**. It integrates real-time data via the [Finnhub API](https://finnhub.io/) and also includes mock data as fallback for testing and offline use.

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

Light Theme

<img width="1145" height="2975" alt="index page" src="https://github.com/user-attachments/assets/4b2f5da8-f832-4ec5-8208-89ec2d4962e1" />

Dark Theme

<img width="1145" height="2975" alt="index page black theme" src="https://github.com/user-attachments/assets/4a623820-c969-47d1-a8f1-da2efe8cbbd9" />

</details>


<details>
<summary>Dashboard - Overview Tab</summary>

Light Theme

<img width="1145" height="2200" alt="dashboard page" src="https://github.com/user-attachments/assets/52fd5c89-625e-42ec-8efd-16ac532dbcca" />

Dark Theme

<img width="1145" height="2200" alt="dashboard page black theme" src="https://github.com/user-attachments/assets/f40eb6a4-7e8e-4c08-a293-a37c133f9403" />

</details>



<details>
<summary>Watchlist Tab</summary>

Light Theme

<img width="1145" height="1205" alt="Wishlist" src="https://github.com/user-attachments/assets/bdc16d97-6559-4306-8e46-3a04f2c39202" />

Dark Theme

<img width="1145" height="1205" alt="Wishlist black theme" src="https://github.com/user-attachments/assets/0c43253c-0f74-4d1c-b169-7c207fa47340" />

</details>

---

## ⚙️ Setup Instructions

> This is a frontend-only project — no backend or database setup required.
> Download the zip file, you are good to go.
