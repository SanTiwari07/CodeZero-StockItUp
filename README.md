<div align="center">

# StockItUp

**A high-performance, vanilla JavaScript equity tracking dashboard.**

Real-time data • Theme-aware • Zero Dependencies

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)


### [**View Live Demo**](https://santiwari07.github.io/CodeZero-StockItUp/)

</div>

---

## Table of Contents

- [About the Project](#about-the-project)
- [Technical Architecture](#technical-architecture)
- [Key Features](#key-features)
- [Visual Showcase](#visual-showcase)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)

---

## About the Project

**StockItUp** is a comprehensive financial dashboard engineered to demonstrate the capabilities of modern, vanilla web technologies. It bypasses heavy frameworks to deliver a lightweight, high-performance interface for tracking global markets.

The application integrates seamlessly with the **Finnhub API** to provide real-time quotes, news, and technical indicators, featuring a robust offline mode that utilizes mock data when network requests fail.

---

## Technical Architecture

This project is built on a "No-Framework" philosophy to ensure maximum performance and understanding of core web principles.

| Component | Technology | Description |
|:----------|:-----------|:------------|
| **Core Logic** | ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black) | ES6+ syntax, asynchronous fetching, and state management. |
| **Structure** | ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white) | Semantic markup with accessibility best practices. |
| **Styling** | ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white) | CSS Variables for theming, Flexbox/Grid for layout. |
| **Data Viz** | ![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=flat-square&logo=chartdotjs&logoColor=white) | Interactive canvas-based line charts. |
| **API** | ![Finnhub](https://img.shields.io/badge/Finnhub-API-green?style=flat-square) | Real-time stock quotes, company profiles, and news. |

---

## Key Features

| Feature | Description |
|:--------|:------------|
| **Real-Time Updates** | Live price tracking with automatic polling intervals. |
| **Dark/Light Mode** | System-aware theming with manual override persistence. |
| **Offline Resilience** | Sophisticated fallback system uses mock data when the API is unreachable. |
| **Smart Watchlist** | LocalStorage persistence allows users to save and track favorites. |
| **Interactive Charts** | Dynamic visualization of price history with color-coded trends. |
| **Live Search** | Debounced search algorithm prevents API rate limiting. |

---

## Visual Showcase

Click the headers below to expand the preview images.

<details>
<summary><strong>Landing Page</strong></summary>

| Light Mode | Dark Mode |
|:----------:|:---------:|
| <img src="https://github.com/user-attachments/assets/4b2f5da8-f832-4ec5-8208-89ec2d4962e1" alt="Landing Light" width="400"/> | <img src="https://github.com/user-attachments/assets/4a623820-c969-47d1-a8f1-da2efe8cbbd9" alt="Landing Dark" width="400"/> |

</details>

<details>
<summary><strong>Analytics Dashboard</strong></summary>

| Light Mode | Dark Mode |
|:----------:|:---------:|
| <img src="https://github.com/user-attachments/assets/52fd5c89-625e-42ec-8efd-16ac532dbcca" alt="Dashboard Light" width="400"/> | <img src="https://github.com/user-attachments/assets/f40eb6a4-7e8e-4c08-a293-a37c133f9403" alt="Dashboard Dark" width="400"/> |

</details>

<details>
<summary><strong>Watchlist Interface</strong></summary>

| Light Mode | Dark Mode |
|:----------:|:---------:|
| <img src="https://github.com/user-attachments/assets/bdc16d97-6559-4306-8e46-3a04f2c39202" alt="Watchlist Light" width="400"/> | <img src="https://github.com/user-attachments/assets/0c43253c-0f74-4d1c-b169-7c207fa47340" alt="Watchlist Dark" width="400"/> |

</details>

---

## Getting Started

This project requires no build tools, bundlers, or backend servers.

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- (Optional) A text editor like VS Code to view the source

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SanTiwari07/StockItUp.git
   ```

2. **Navigate to project directory**
   ```bash
   cd StockItUp
   ```

3. **Open in browser**
   ```bash
   # Simply open index.html in your browser
   # Or use a local server (optional):
   python -m http.server 8000
   # Then visit: http://localhost:8000
   ```

---

## Project Structure

```
StockItUp/
├── index.html      # Entry point: Landing page & feature overview
├── dashboard.html  # Main App: Real-time tracking interface
├── styles.css      # Design System: Variables, Dark Mode, Responsive Grid
└── script.js       # Logic: API Integration, Charts, State Management
```

---

<div align="center">

**StockItUp** © 2024. All Rights Reserved.

Built with precision and vanilla JavaScript.

</div>
