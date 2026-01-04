# StockItUp

StockItUp is a responsive, theme-aware stock market tracking web application built entirely using **vanilla HTML, CSS, and JavaScript**. It integrates real-time data via the **Finnhub API** and includes comprehensive mock data fallbacks for testing and offline environments.

The application allows users to track specific stocks, visualize live price movements, manage watchlists, and monitor global market trends through a unified, frontend-only interface.

## Project Structure

├── index.html      # Landing page with feature overview and market preview
├── dashboard.html  # Core application interface (Real-time dashboard)
├── styles.css      # Global styling, variable definitions, and dark mode logic
└── script.js       # Application logic, API integration, and chart rendering

## Features

* **Real-Time Data Integration:** Fetches live stock quotes and market data via the Finnhub API with automatic refresh capabilities.
* **Watchlist Management:** Allows users to track preferred stocks with persistence enabled via LocalStorage.
* **Global Market Indices:** Displays data for major indices including S&P 500, NASDAQ, and NIFTY 50.
* **News Aggregation:** Curated news feeds categorized by International and Indian markets.
* **Search Functionality:** Debounced search input with live results and immediate dashboard updates.
* **Theme Support:** Built-in dark and light modes with automatic system preference detection.
* **Data Visualization:** Interactive line charts rendering price history using Chart.js.
* **Offline Fallback:** Robust mock data implementation ensures UI functionality when the API is unreachable.

## Technical Stack

* **Core:** HTML5, CSS3, JavaScript (ES6+)
* **Data Provider:** Finnhub API
* **Visualization:** Chart.js
* **Iconography:** Lucide Icons
* **State Management:** Browser LocalStorage

## Architecture & Components

### index.html - Landing Page
Serves as the entry point for the application.
* **Header:** Contains branding and theme toggle controls.
* **Market Preview:** Grid layout displaying data cards (utilizing loading skeletons prior to JS initialization).
* **Feature Overview:** Highlights core application capabilities.

### dashboard.html - Core Dashboard
The main interface for stock tracking and analysis.
* **Navigation:** Includes connection status indicators, search input, and navigation controls.
* **Sidebar:** Displays a list of popular stocks for quick access.
* **Main Panel:** Divided into three functional tabs:
    * **Overview:** Live stock metrics, company profile, and interactive charts.
    * **Watchlist:** Management interface for saved stocks.
    * **News:** Filterable list of market news.

### styles.css - Styling System
* **CSS Variables:** Defines the color palette, typography, and spacing for consistent theming.
* **Theme Logic:** Implements dark mode via a specific class on the document root.
* **Responsiveness:** Utilizes media queries to ensure compatibility across desktop and mobile devices.

### script.js - Application Logic
* **State Management:** Centralized state object manages the selected stock, active theme, and watchlist data.
* **API Layer:** Handles asynchronous requests to Finnhub for quotes, profiles, and news. Implements error handling to switch to mock data upon failure.
* **Chart Rendering:** Configures Chart.js to render dynamic data with context-aware coloring based on price performance.
* **Search Algorithm:** Implements debouncing to optimize API calls during user input.
* **Persistence:** Manages read/write operations to LocalStorage for user preferences.

## Screenshots

<details>
<summary>Landing Page</summary>

**Light Theme**

<img width="1145" height="2975" alt="index page" src="https://github.com/user-attachments/assets/4b2f5da8-f832-4ec5-8208-89ec2d4962e1" />

**Dark Theme**

<img width="1145" height="2975" alt="index page black theme" src="https://github.com/user-attachments/assets/4a623820-c969-47d1-a8f1-da2efe8cbbd9" />

</details>


<details>
<summary>Dashboard - Overview Tab</summary>

**Light Theme**

<img width="1145" height="2200" alt="dashboard page" src="https://github.com/user-attachments/assets/52fd5c89-625e-42ec-8efd-16ac532dbcca" />

**Dark Theme**

<img width="1145" height="2200" alt="dashboard page black theme" src="https://github.com/user-attachments/assets/f40eb6a4-7e8e-4c08-a293-a37c133f9403" />

</details>

<details>
<summary>Watchlist Tab</summary>

**Light Theme**

<img width="1145" height="1205" alt="Wishlist" src="https://github.com/user-attachments/assets/bdc16d97-6559-4306-8e46-3a04f2c39202" />

**Dark Theme**

<img width="1145" height="1205" alt="Wishlist black theme" src="https://github.com/user-attachments/assets/0c43253c-0f74-4d1c-b169-7c207fa47340" />

</details>

## Setup and Installation

This project is a frontend-only application requiring no backend configuration or build steps.

1.  **Download:** Clone the repository or download the source ZIP file.
2.  **Run:** Open the `index.html` file directly in any modern web browser.
3.  **Usage:** The application is immediately ready for use. By default, it may use mock data if an API key is not configured or if the request limit is reached.
