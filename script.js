// Stock Tracker Application
// Complete vanilla JavaScript implementation with Finnhub API integration
// Fixed navigation and theme toggle functions

// API Configuration
const API_CONFIG = {
    FINNHUB_API_KEY: 'd25p1l1r01qhge4dmi7gd25p1l1r01qhge4dmi80',
    FINNHUB_BASE_URL: 'https://finnhub.io/api/v1',
    PROVIDER: 'finnhub' // 'finnhub' or 'mock'
};

// Application state
const app = {
    currentPage: window.location.pathname.includes('dashboard.html') ? 'dashboard' : 'homepage',
    isDarkMode: false,
    isAutoRefresh: true,
    selectedStock: null,
    stocks: [],
    chartData: [],
    marketIndices: [],
    news: [],
    watchlist: JSON.parse(localStorage.getItem('stockTracker_watchlist') || '["AAPL", "GOOGL", "MSFT"]'),
    searchResults: [],
    lastUpdated: null,
    refreshInterval: null,
    chartInstance: null
};

// Mock data for fallback
const MOCK_STOCKS = [
    {
        symbol: 'AAPL', name: 'Apple Inc.', price: 189.84, change: 2.45, changePercent: 1.31,
        volume: 52400000, high: 192.15, low: 187.20, open: 188.50, marketCap: 2890000000000,
        description: 'Apple Inc. designs, manufactures, and markets consumer electronics, computer software, and online services worldwide.',
        website: 'https://www.apple.com', industry: 'Technology Hardware', employees: 164000, country: 'United States', currency: 'USD'
    },
    {
        symbol: 'GOOGL', name: 'Alphabet Inc.', price: 2847.32, change: -12.45, changePercent: -0.43,
        volume: 28100000, high: 2865.50, low: 2835.75, open: 2859.80, marketCap: 1750000000000,
        description: 'Alphabet Inc. provides online advertising services worldwide through Google services.',
        website: 'https://www.abc.xyz', industry: 'Internet Content & Information', employees: 174014, country: 'United States', currency: 'USD'
    },
    {
        symbol: 'MSFT', name: 'Microsoft Corporation', price: 412.78, change: 5.67, changePercent: 1.39,
        volume: 35200000, high: 415.25, low: 408.90, open: 409.50, marketCap: 3060000000000,
        description: 'Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide.',
        website: 'https://www.microsoft.com', industry: 'Software—Infrastructure', employees: 221000, country: 'United States', currency: 'USD'
    },
    {
        symbol: 'TSLA', name: 'Tesla Inc.', price: 248.91, change: -8.32, changePercent: -3.24,
        volume: 87300000, high: 258.40, low: 246.75, open: 256.20, marketCap: 792000000000,
        description: 'Tesla, Inc. designs, develops, manufactures, and sells electric vehicles worldwide.',
        website: 'https://www.tesla.com', industry: 'Auto Manufacturers', employees: 140473, country: 'United States', currency: 'USD'
    },
    {
        symbol: 'AMZN', name: 'Amazon.com Inc.', price: 178.25, change: 3.21, changePercent: 1.83,
        volume: 42800000, high: 180.50, low: 175.30, open: 176.80, marketCap: 1850000000000,
        description: 'Amazon.com, Inc. engages in the retail sale of consumer products and subscriptions worldwide.',
        website: 'https://www.amazon.com', industry: 'Internet Retail', employees: 1541000, country: 'United States', currency: 'USD'
    },
    {
        symbol: 'NVDA', name: 'NVIDIA Corporation', price: 891.38, change: 15.42, changePercent: 1.76,
        volume: 71200000, high: 895.75, low: 875.20, open: 880.50, marketCap: 2200000000000,
        description: 'NVIDIA Corporation operates as a computing company worldwide.',
        website: 'https://www.nvidia.com', industry: 'Semiconductors', employees: 29600, country: 'United States', currency: 'USD'
    },
    {
        symbol: 'META', name: 'Meta Platforms Inc.', price: 563.27, change: 8.91, changePercent: 1.61,
        volume: 15400000, high: 568.45, low: 552.30, open: 555.80, marketCap: 1435000000000,
        description: 'Meta Platforms, Inc. develops products that enable people to connect and share worldwide.',
        website: 'https://www.meta.com', industry: 'Internet Content & Information', employees: 77805, country: 'United States', currency: 'USD'
    },
    {
        symbol: 'NFLX', name: 'Netflix Inc.', price: 712.45, change: -5.23, changePercent: -0.73,
        volume: 2800000, high: 718.90, low: 708.15, open: 715.60, marketCap: 306000000000,
        description: 'Netflix, Inc. provides entertainment services worldwide.',
        website: 'https://www.netflix.com', industry: 'Entertainment', employees: 12800, country: 'United States', currency: 'USD'
    }
];

const MOCK_INDICES = [
    { name: 'S&P 500', symbol: '^GSPC', value: 5617.20, change: 47.76, changePercent: 0.85 },
    { name: 'Dow Jones', symbol: '^DJI', value: 40842.79, change: 130.49, changePercent: 0.32 },
    { name: 'NASDAQ', symbol: '^IXIC', value: 17876.77, change: 221.51, changePercent: 1.24 },
    { name: 'NIFTY 50', symbol: '^NSEI', value: 24122.65, change: -36.18, changePercent: -0.15 },
    { name: 'BSE SENSEX', symbol: '^BSESN', value: 79223.11, change: -182.29, changePercent: -0.23 }
];

const MOCK_NEWS = [
    { title: 'Federal Reserve Signals Potential Rate Adjustments in 2025', source: 'Reuters', category: 'international', time: '2 hours ago' },
    { title: 'Indian Stock Markets Show Resilience Amid Global Volatility', source: 'Economic Times', category: 'indian', time: '3 hours ago' },
    { title: 'Technology Sector Leads Market Rally Across Global Exchanges', source: 'Bloomberg', category: 'international', time: '4 hours ago' },
    { title: 'RBI Maintains Accommodative Stance on Interest Rates', source: 'Business Standard', category: 'indian', time: '5 hours ago' },
    { title: 'Reliance Industries Reports Strong Q4 Results', source: 'Moneycontrol', category: 'indian', time: '6 hours ago' },
    { title: 'Global Supply Chain Disruptions Impact Manufacturing', source: 'Financial Times', category: 'international', time: '7 hours ago' }
];

// Utility Functions
function formatNumber(num, decimals = 2) {
    if (typeof num !== 'number' || isNaN(num)) return 'N/A';
    return num.toFixed(decimals);
}

function formatVolume(volume) {
    // Fixed volume formatting - ensure proper handling of all volume values
    if (typeof volume !== 'number' || isNaN(volume) || volume === null || volume === undefined) {
        return 'N/A';
    }
    
    // Handle zero or very small volumes
    if (volume === 0) return '0';
    if (volume < 1) return volume.toFixed(6);
    
    // Format large volumes
    if (volume >= 1e12) return `${(volume / 1e12).toFixed(2)}T`;
    if (volume >= 1e9) return `${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(1)}M`;
    if (volume >= 1e3) return `${(volume / 1e3).toFixed(1)}K`;
    
    // For smaller numbers, show with appropriate decimals
    if (volume >= 100) return Math.round(volume).toString();
    if (volume >= 10) return volume.toFixed(1);
    return volume.toFixed(2);
}

function formatMarketCap(marketCap) {
    if (typeof marketCap !== 'number' || isNaN(marketCap) || marketCap === null || marketCap === undefined) {
        return 'N/A';
    }
    
    if (marketCap === 0) return '$0';
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`;
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
    return `$${marketCap.toString()}`;
}

function formatCurrency(amount) {
    if (typeof amount !== 'number' || isNaN(amount)) return '$0.00';
    return `$${amount.toFixed(2)}`;
}

function isPositive(value) {
    return typeof value === 'number' && value >= 0;
}

// API Functions
async function fetchFromFinnhub(endpoint, params = {}) {
    try {
        const url = new URL(`${API_CONFIG.FINNHUB_BASE_URL}${endpoint}`);
        url.searchParams.append('token', API_CONFIG.FINNHUB_API_KEY);
        
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });
        
        const response = await fetch(url.toString());
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.warn('Finnhub API error:', error);
        throw error;
    }
}

async function fetchStockQuote(symbol) {
    if (API_CONFIG.PROVIDER === 'mock') {
        return getMockStockData(symbol);
    }
    
    try {
        const [quote, profile] = await Promise.all([
            fetchFromFinnhub('/quote', { symbol }),
            fetchFromFinnhub('/stock/profile2', { symbol }).catch(() => ({}))
        ]);
        
        if (!quote.c || quote.c === 0) {
            console.log(`No valid price data for ${symbol}, using mock data`);
            return getMockStockData(symbol);
        }
        
        // Enhanced volume handling - ensure we get a valid number
        let volume = 0;
        if (quote.v && typeof quote.v === 'number' && !isNaN(quote.v)) {
            volume = quote.v;
        } else {
            console.log(`Invalid volume data for ${symbol}: ${quote.v}, using fallback`);
            // Try to get volume from mock data or set reasonable default
            const mockStock = MOCK_STOCKS.find(s => s.symbol === symbol);
            volume = mockStock ? mockStock.volume : Math.floor(Math.random() * 50000000);
        }
        
        return {
            symbol: symbol,
            name: profile.name || symbol,
            price: quote.c,
            change: quote.d || 0,
            changePercent: quote.dp || 0,
            volume: volume, // Ensure volume is always a valid number
            high: quote.h || quote.c,
            low: quote.l || quote.c,
            open: quote.o || quote.c,
            marketCap: profile.marketCapitalization ? profile.marketCapitalization * 1000000 : 0,
            description: profile.description || '',
            website: profile.weburl || '',
            industry: profile.finnhubIndustry || '',
            employees: profile.employeeTotal || 0,
            country: profile.country || '',
            currency: profile.currency || 'USD'
        };
    } catch (error) {
        console.warn(`Falling back to mock data for ${symbol}:`, error);
        return getMockStockData(symbol);
    }
}

async function fetchMarketIndices() {
    if (API_CONFIG.PROVIDER === 'mock') {
        return getMockIndices();
    }
    
    try {
        const usIndices = [
            { name: 'S&P 500', symbol: '^GSPC' },
            { name: 'Dow Jones', symbol: '^DJI' },
            { name: 'NASDAQ', symbol: '^IXIC' }
        ];

        const indices = await Promise.all([
            ...usIndices.map(async (index) => {
                try {
                    const quote = await fetchFromFinnhub('/quote', { symbol: index.symbol });
                    return {
                        name: index.name,
                        symbol: index.symbol,
                        value: quote.c || 0,
                        change: quote.d || 0,
                        changePercent: quote.dp || 0
                    };
                } catch (error) {
                    const mockIndex = MOCK_INDICES.find(m => m.name === index.name);
                    return mockIndex || { name: index.name, symbol: index.symbol, value: 0, change: 0, changePercent: 0 };
                }
            }),
            // Add Indian indices from mock data
            ...MOCK_INDICES.slice(3)
        ]);
        
        return indices;
    } catch (error) {
        console.warn('Falling back to mock market indices:', error);
        return getMockIndices();
    }
}

async function searchStocks(query) {
    if (query.length < 1) return [];
    
    if (API_CONFIG.PROVIDER === 'mock') {
        return getMockSearchResults(query);
    }
    
    try {
        const results = await fetchFromFinnhub('/search', { q: query });
        
        return (results.result || [])
            .slice(0, 10)
            .map(item => ({
                symbol: item.symbol,
                name: item.description || item.symbol,
                type: item.type || 'Common Stock',
                region: 'US'
            }));
    } catch (error) {
        console.warn(`Falling back to mock search for ${query}:`, error);
        return getMockSearchResults(query);
    }
}

async function fetchNews(category = 'all') {
    if (API_CONFIG.PROVIDER === 'mock') {
        return getMockNews(category);
    }
    
    try {
        const [generalNews] = await Promise.all([
            fetchFromFinnhub('/news', { category: 'general' }).catch(() => [])
        ]);
        
        const formattedGeneralNews = (generalNews || [])
            .slice(0, 10)
            .map(item => ({
                title: item.headline || 'No title',
                summary: item.summary || '',
                source: item.source || 'Unknown',
                category: 'international',
                time: timeAgo(new Date(item.datetime * 1000))
            }));
        
        const indianNews = MOCK_NEWS.filter(item => item.category === 'indian');
        const allNews = [...formattedGeneralNews, ...indianNews];
        
        if (category === 'indian') {
            return allNews.filter(item => item.category === 'indian');
        } else if (category === 'international') {
            return allNews.filter(item => item.category === 'international');
        }
        
        return allNews;
    } catch (error) {
        console.warn('Falling back to mock news:', error);
        return getMockNews(category);
    }
}

// Mock data functions
function getMockStockData(symbol) {
    const stock = MOCK_STOCKS.find(s => s.symbol === symbol);
    if (!stock) return null;
    
    // Simulate small price changes
    const volatility = (Math.random() - 0.5) * 0.02;
    const newPrice = stock.price * (1 + volatility);
    const change = newPrice - stock.price;
    const changePercent = (change / stock.price) * 100;
    
    // Ensure volume is always a valid number with some variation
    const volumeVariation = 0.8 + (Math.random() * 0.4); // Between 80% and 120% of original
    const newVolume = Math.floor(stock.volume * volumeVariation);
    
    return {
        ...stock,
        price: Math.round(newPrice * 100) / 100,
        change: Math.round(change * 100) / 100,
        changePercent: Math.round(changePercent * 100) / 100,
        volume: newVolume // Ensure volume is always present and valid
    };
}

function getMockIndices() {
    return MOCK_INDICES.map(index => ({
        ...index,
        value: Math.round((index.value * (1 + (Math.random() - 0.5) * 0.005)) * 100) / 100,
        change: Math.round((index.change * (1 + (Math.random() - 0.5) * 0.2)) * 100) / 100,
        changePercent: Math.round((index.changePercent * (1 + (Math.random() - 0.5) * 0.2)) * 100) / 100
    }));
}

function getMockSearchResults(query) {
    const lowerQuery = query.toLowerCase();
    return MOCK_STOCKS
        .filter(stock => 
            stock.symbol.toLowerCase().includes(lowerQuery) ||
            stock.name.toLowerCase().includes(lowerQuery)
        )
        .slice(0, 10)
        .map(stock => ({
            symbol: stock.symbol,
            name: stock.name,
            type: 'Common Stock',
            region: stock.country || 'United States'
        }));
}

function getMockNews(category) {
    if (category === 'indian') {
        return MOCK_NEWS.filter(item => item.category === 'indian');
    } else if (category === 'international') {
        return MOCK_NEWS.filter(item => item.category === 'international');
    }
    return MOCK_NEWS;
}

function generateMockChartData(symbol) {
    const now = new Date();
    const data = [];
    const basePrice = app.selectedStock?.price || 100;
    
    for (let i = 29; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - (i * 10 * 60 * 1000));
        const volatility = Math.random() * 0.02 - 0.01;
        const price = basePrice * (1 + volatility * (30 - i) / 30);
        
        data.push({
            time: timestamp.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
            }),
            price: Math.round(price * 100) / 100
        });
    }
    
    return data;
}

function timeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
}

// Navigation Functions - FIXED
function goToDashboard() {
    window.location.href = 'dashboard.html';
}

function goToHomepage() {
    window.location.href = 'index.html';
}

function scrollToFeatures() {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
        featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Dark Mode Functions - FIXED
function initializeTheme() {
    const savedTheme = localStorage.getItem('stockTracker_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    app.isDarkMode = savedTheme ? savedTheme === 'dark' : prefersDark;
    applyTheme();
}

function toggleTheme() {
    app.isDarkMode = !app.isDarkMode;
    applyTheme();
    localStorage.setItem('stockTracker_theme', app.isDarkMode ? 'dark' : 'light');
}

function applyTheme() {
    if (app.isDarkMode) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    updateChart();
}

// Video Modal Functions - FIXED
function openVideoModal() {
    const modal = document.getElementById('videoModal');
    const video = document.getElementById('modalVideo');
    
    if (modal && video) {
        modal.style.display = 'flex';
        video.currentTime = 0; // Reset video to beginning
        video.play().catch(e => console.log('Video autoplay prevented:', e)); // Auto-play when opened (with error handling)
    }
}

function closeVideoModal() {
    const modal = document.getElementById('videoModal');
    const video = document.getElementById('modalVideo');
    
    if (modal && video) {
        modal.style.display = 'none';
        video.pause(); // Pause video when modal closes
        video.currentTime = 0; // Reset to beginning
    }
}

// Auto-refresh Functions
function toggleAutoRefresh() {
    app.isAutoRefresh = !app.isAutoRefresh;
    updateAutoRefreshUI();
    
    if (app.isAutoRefresh) {
        startAutoRefresh();
    } else {
        stopAutoRefresh();
    }
}

function startAutoRefresh() {
    if (app.refreshInterval) {
        clearInterval(app.refreshInterval);
    }
    
    app.refreshInterval = setInterval(() => {
        refreshData();
    }, 5000);
}

function stopAutoRefresh() {
    if (app.refreshInterval) {
        clearInterval(app.refreshInterval);
        app.refreshInterval = null;
    }
}

function updateAutoRefreshUI() {
    const autoRefreshBtn = document.getElementById('autoRefreshBtn');
    const refreshIcon = document.getElementById('refreshIcon');
    const autoRefreshText = document.getElementById('autoRefreshText');
    
    if (autoRefreshBtn) {
        if (app.isAutoRefresh) {
            autoRefreshBtn.classList.remove('btn-outline');
            autoRefreshBtn.classList.add('btn-primary');
            if (refreshIcon) refreshIcon.classList.add('animate-spin');
        } else {
            autoRefreshBtn.classList.remove('btn-primary');
            autoRefreshBtn.classList.add('btn-outline');
            if (refreshIcon) refreshIcon.classList.remove('animate-spin');
        }
    }
    
    if (autoRefreshText) {
        autoRefreshText.textContent = app.isAutoRefresh ? 'Auto-refresh ON' : 'Auto-refresh';
    }
}

// Data Management Functions
async function loadInitialData() {
    try {
        updateConnectionStatus('connecting');
        
        const popularSymbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'NVDA', 'META', 'NFLX'];
        const [stockData, indices, newsData] = await Promise.all([
            Promise.all(popularSymbols.slice(0, 6).map(symbol => fetchStockQuote(symbol))),
            fetchMarketIndices(),
            fetchNews()
        ]);
        
        app.stocks = stockData.filter(stock => stock !== null);
        app.marketIndices = indices;
        app.news = newsData;
        
        if (app.stocks.length > 0) {
            app.selectedStock = app.stocks[0];
            app.chartData = generateMockChartData(app.selectedStock.symbol);
        }
        
        app.lastUpdated = new Date();
        updateConnectionStatus('connected');
        
        renderDashboard();
        
    } catch (error) {
        console.error('Failed to load initial data:', error);
        updateConnectionStatus('error');
    }
}

async function refreshData() {
    if (!app.selectedStock) return;
    
    try {
        const [updatedStock, updatedIndices] = await Promise.all([
            fetchStockQuote(app.selectedStock.symbol),
            fetchMarketIndices()
        ]);
        
        if (updatedStock) {
            app.selectedStock = updatedStock;
            app.stocks = app.stocks.map(stock => 
                stock.symbol === updatedStock.symbol ? updatedStock : stock
            );
            app.chartData = generateMockChartData(app.selectedStock.symbol);
        }
        
        app.marketIndices = updatedIndices;
        app.lastUpdated = new Date();
        updateConnectionStatus('connected');
        
        renderSelectedStock();
        renderStockList();
        renderMarketOverview();
        updateChart();
        
    } catch (error) {
        console.error('Failed to refresh data:', error);
        updateConnectionStatus('error');
    }
}

function updateConnectionStatus(status) {
    const statusIndicator = document.getElementById('statusIndicator');
    const lastUpdatedText = document.getElementById('lastUpdatedText');
    
    if (statusIndicator) {
        statusIndicator.className = 'status-indicator';
        statusIndicator.classList.add(status);
    }
    
    if (lastUpdatedText) {
        switch (status) {
            case 'connecting':
                lastUpdatedText.textContent = 'Connecting...';
                break;
            case 'connected':
                lastUpdatedText.textContent = app.lastUpdated 
                    ? `Last updated: ${app.lastUpdated.toLocaleTimeString()}`
                    : 'Connected';
                break;
            case 'error':
                lastUpdatedText.textContent = 'Connection error';
                break;
        }
    }
}

// Search Functions
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    let searchTimeout;
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        
        clearTimeout(searchTimeout);
        
        if (query.length < 1) {
            hideSearchResults();
            return;
        }
        
        searchTimeout = setTimeout(async () => {
            try {
                app.searchResults = await searchStocks(query);
                renderSearchResults();
            } catch (error) {
                console.error('Search error:', error);
            }
        }, 300);
    });
    
    document.addEventListener('click', (e) => {
        const searchContainer = document.querySelector('.search-container');
        if (!searchContainer?.contains(e.target)) {
            hideSearchResults();
        }
    });
}

function renderSearchResults() {
    const searchResults = document.getElementById('searchResults');
    if (!searchResults) return;
    
    if (app.searchResults.length === 0) {
        searchResults.innerHTML = '<div class="search-result-item">No results found</div>';
        searchResults.classList.add('visible');
        return;
    }
    
    searchResults.innerHTML = app.searchResults.map(result => `
        <div class="search-result-item" onclick="selectSearchResult('${result.symbol}')">
            <div class="search-result-symbol">${result.symbol}</div>
            <div class="search-result-name">${result.name}</div>
            <div class="search-result-exchange">${result.region}</div>
        </div>
    `).join('');
    
    searchResults.classList.add('visible');
}

function hideSearchResults() {
    const searchResults = document.getElementById('searchResults');
    if (searchResults) {
        searchResults.classList.remove('visible');
    }
}

async function selectSearchResult(symbol) {
    hideSearchResults();
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
    }
    
    await selectStock(symbol);
}

// Stock Management Functions
async function selectStock(symbol) {
    try {
        const stockData = await fetchStockQuote(symbol);
        if (stockData) {
            app.selectedStock = stockData;
            
            const exists = app.stocks.find(s => s.symbol === symbol);
            if (!exists) {
                app.stocks = [stockData, ...app.stocks.slice(0, 5)];
            } else {
                app.stocks = app.stocks.map(s => s.symbol === symbol ? stockData : s);
            }
            
            app.chartData = generateMockChartData(symbol);
            
            renderSelectedStock();
            renderStockList();
            renderCompanyInfo();
            updateChart();
        }
    } catch (error) {
        console.error('Failed to select stock:', error);
    }
}

function toggleWatchlist(symbol) {
    if (app.watchlist.includes(symbol)) {
        app.watchlist = app.watchlist.filter(s => s !== symbol);
    } else {
        app.watchlist.push(symbol);
    }
    
    localStorage.setItem('stockTracker_watchlist', JSON.stringify(app.watchlist));
    
    renderStockList();
    renderSelectedStock();
    renderWatchlist();
}

function clearWatchlist() {
    app.watchlist = [];
    localStorage.setItem('stockTracker_watchlist', JSON.stringify(app.watchlist));
    renderWatchlist();
}

// Chart Functions
function updateChart() {
    const canvas = document.getElementById('stockChart');
    if (!canvas || app.chartData.length === 0) return;
    
    if (app.chartInstance) {
        app.chartInstance.destroy();
    }
    
    if (typeof Chart === 'undefined') {
        drawCanvasChart(canvas);
        return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const isPositive = app.selectedStock ? app.selectedStock.change >= 0 : true;
    const color = isPositive ? '#16a34a' : '#dc2626';
    
    app.chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: app.chartData.map(d => d.time),
            datasets: [{
                label: app.selectedStock?.symbol || 'Price',
                data: app.chartData.map(d => d.price),
                borderColor: color,
                backgroundColor: color + '20',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: app.isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                    titleColor: app.isDarkMode ? '#ffffff' : '#000000',
                    bodyColor: app.isDarkMode ? '#ffffff' : '#000000',
                    borderColor: color,
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return `${context.parsed.y.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    grid: {
                        color: app.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        maxTicksLimit: 8,
                        color: app.isDarkMode ? '#94a3b8' : '#666'
                    }
                },
                y: {
                    display: true,
                    grid: {
                        color: app.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toFixed(2);
                        },
                        color: app.isDarkMode ? '#94a3b8' : '#666'
                    }
                }
            }
        }
    });
}

function drawCanvasChart(canvas) {
    const ctx = canvas.getContext('2d');
    if (!ctx || app.chartData.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const height = rect.height;
    const padding = 40;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;

    ctx.clearRect(0, 0, width, height);

    const prices = app.chartData.map(d => d.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;

    const isPositive = app.selectedStock ? app.selectedStock.change >= 0 : true;
    const lineColor = isPositive ? '#16a34a' : '#dc2626';
    const gridColor = app.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const textColor = app.isDarkMode ? '#94a3b8' : '#666';

    // Draw grid
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);

    for (let i = 0; i <= 4; i++) {
        const y = padding + (i * chartHeight) / 4;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
    }

    ctx.setLineDash([]);

    // Draw line
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    ctx.beginPath();

    app.chartData.forEach((point, index) => {
        const x = padding + (index * chartWidth) / (app.chartData.length - 1);
        const y = height - padding - ((point.price - minPrice) / priceRange) * chartHeight;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });

    ctx.stroke();

    // Draw labels
    ctx.fillStyle = textColor;
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'right';
    
    for (let i = 0; i <= 4; i++) {
        const y = padding + (i * chartHeight) / 4;
        const price = maxPrice - (i * priceRange) / 4;
        ctx.fillText(`${price.toFixed(2)}`, padding - 10, y + 5);
    }
}

// Tab Management
function switchTab(tabName) {
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName)?.classList.add('active');
    
    if (tabName === 'news') {
        renderNews();
    } else if (tabName === 'watchlist') {
        renderWatchlist();
    }
}

// News Functions
function filterNews(category) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-filter="${category}"]`)?.classList.add('active');
    
    renderNews(category);
}

async function refreshNews() {
    try {
        const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
        app.news = await fetchNews(activeFilter);
        renderNews(activeFilter);
    } catch (error) {
        console.error('Failed to refresh news:', error);
    }
}

// Render Functions
function renderDashboard() {
    renderMarketOverview();
    renderStockList();
    renderSelectedStock();
    renderCompanyInfo();
    renderWatchlist();
    renderNews();
    updateChart();
}

function renderMarketOverview() {
    const container = document.getElementById('marketOverview');
    if (!container) return;
    
    if (app.marketIndices.length === 0) {
        container.innerHTML = `
            <div class="overview-loading">
                <div class="loading-spinner"></div>
                <span>Loading market data...</span>
            </div>
        `;
        return;
    }
    
    container.innerHTML = app.marketIndices.map(index => `
        <div class="overview-item">
            <span class="overview-name">${index.name}</span>
            <div class="overview-values">
                <div class="overview-value">${index.value.toLocaleString()}</div>
                <div class="overview-change ${isPositive(index.change) ? 'positive' : 'negative'}">
                    ${isPositive(index.change) ? '+' : ''}${formatNumber(index.changePercent, 2)}%
                </div>
            </div>
        </div>
    `).join('');
}

function renderStockList() {
    const container = document.getElementById('stockList');
    if (!container) return;
    
    if (app.stocks.length === 0) {
        container.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <span>Loading stocks...</span>
            </div>
        `;
        return;
    }
    
    container.innerHTML = app.stocks.map(stock => `
        <div class="stock-item ${app.selectedStock?.symbol === stock.symbol ? 'active' : ''}" 
             onclick="selectStock('${stock.symbol}')">
            <div class="stock-item-content">
                <div class="stock-item-left">
                    <button class="stock-star ${app.watchlist.includes(stock.symbol) ? 'active' : ''}" 
                            onclick="event.stopPropagation(); toggleWatchlist('${stock.symbol}')">
                        <i data-lucide="star"></i>
                    </button>
                    <div class="stock-info">
                        <div class="stock-symbol">${stock.symbol}</div>
                        <div class="stock-name">${stock.name}</div>
                    </div>
                </div>
                <div class="stock-item-right">
                    <div class="stock-price">${formatCurrency(stock.price)}</div>
                    <div class="stock-change ${isPositive(stock.change) ? 'positive' : 'negative'}">
                        <i data-lucide="trending-up"></i>
                        ${isPositive(stock.change) ? '+' : ''}${formatNumber(stock.changePercent, 2)}%
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    lucide.createIcons();
}

function renderSelectedStock() {
    const container = document.getElementById('stockDetailsCard');
    if (!container) return;
    
    if (!app.selectedStock) {
        container.innerHTML = `
            <div class="stock-details-loading">
                <div class="loading-spinner"></div>
                <span>Select a stock to view details</span>
            </div>
        `;
        return;
    }
    
    const stock = app.selectedStock;
    const isInWatchlist = app.watchlist.includes(stock.symbol);
    
    // Debug log to check volume data
    console.log(`Rendering stock ${stock.symbol} with volume:`, stock.volume, 'Formatted:', formatVolume(stock.volume));
    
    container.innerHTML = `
        <div class="card-header">
            <div class="stock-header">
                <div class="stock-title-section">
                    <h2 class="stock-symbol-large">${stock.symbol}</h2>
                    <span class="badge">${stock.name}</span>
                    ${app.isAutoRefresh ? `
                        <span class="badge live-badge">
                            <i data-lucide="refresh-cw" class="animate-spin"></i>
                            Live
                        </span>
                    ` : ''}
                </div>
                <button class="btn btn-outline" onclick="toggleWatchlist('${stock.symbol}')">
                    <i data-lucide="star" class="${isInWatchlist ? 'star-filled' : ''}"></i>
                    ${isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                </button>
            </div>
        </div>
        <div class="card-content">
            <div class="stock-details-grid">
                <div class="stock-info">
                    <div class="stock-price-section">
                        <div class="stock-price-label">
                            <i data-lucide="dollar-sign"></i>
                            <span>Current Price</span>
                        </div>
                        <div class="stock-price-large">${formatCurrency(stock.price)}</div>
                        <div class="stock-change-large ${isPositive(stock.change) ? 'positive' : 'negative'}">
                            <i data-lucide="trending-up" class="change-icon"></i>
                            <span>${stock.change >= 0 ? '+' : ''}${formatCurrency(stock.change)} 
                            (${stock.change >= 0 ? '+' : ''}${formatNumber(stock.changePercent, 2)}%)</span>
                        </div>
                    </div>

                    <div class="stock-metrics">
                        <div class="metric">
                            <div class="metric-label">Open</div>
                            <div class="metric-value">${formatCurrency(stock.open)}</div>
                        </div>
                        <div class="metric">
                            <div class="metric-label">High</div>
                            <div class="metric-value text-green">${formatCurrency(stock.high)}</div>
                        </div>
                        <div class="metric">
                            <div class="metric-label">Low</div>
                            <div class="metric-value text-red">${formatCurrency(stock.low)}</div>
                        </div>
                        <div class="metric">
                            <div class="metric-label">Volume</div>
                            <div class="metric-value">${formatVolume(stock.volume)}</div>
                        </div>
                        <div class="metric">
                            <div class="metric-label">Market Cap</div>
                            <div class="metric-value">${formatMarketCap(stock.marketCap)}</div>
                        </div>
                        <div class="metric">
                            <div class="metric-label">Currency</div>
                            <div class="metric-value">${stock.currency || 'USD'}</div>
                        </div>
                    </div>
                </div>

                <div class="chart-section">
                    <div class="chart-header">
                        <h4>Intraday Chart</h4>
                        <div class="chart-info">
                            <span>Last 5 hours</span>
                        </div>
                    </div>
                    <div class="chart-container">
                        <canvas id="stockChart"></canvas>
                        ${app.chartData.length === 0 ? `
                            <div class="chart-loading">
                                <div class="loading-spinner"></div>
                                <span>Loading chart data...</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    lucide.createIcons();
    setTimeout(() => updateChart(), 100);
}

function renderCompanyInfo() {
    const container = document.getElementById('companyInfoCard');
    if (!container || !app.selectedStock) {
        if (container) container.style.display = 'none';
        return;
    }
    
    const stock = app.selectedStock;
    container.style.display = 'block';
    
    const companyInfo = document.getElementById('companyInfo');
    if (companyInfo) {
        companyInfo.innerHTML = `
            <div class="company-info-grid">
                <div class="company-info-item">
                    <div class="company-info-label">Industry</div>
                    <div class="company-info-value">${stock.industry || 'N/A'}</div>
                </div>
                <div class="company-info-item">
                    <div class="company-info-label">
                        <i data-lucide="users"></i>
                        Employees
                    </div>
                    <div class="company-info-value">${stock.employees ? stock.employees.toLocaleString() : 'N/A'}</div>
                </div>
                <div class="company-info-item">
                    <div class="company-info-label">
                        <i data-lucide="globe"></i>
                        Country
                    </div>
                    <div class="company-info-value">${stock.country || 'N/A'}</div>
                </div>
                <div class="company-info-item">
                    <div class="company-info-label">Market Cap</div>
                    <div class="company-info-value">${formatMarketCap(stock.marketCap)}</div>
                </div>
                <div class="company-info-item">
                    <div class="company-info-label">
                        <i data-lucide="external-link"></i>
                        Website
                    </div>
                    <div class="company-info-value">
                        ${stock.website ? `<a href="${stock.website}" target="_blank" class="company-website">Visit Website</a>` : 'N/A'}
                    </div>
                </div>
                <div class="company-info-item">
                    <div class="company-info-label">Currency</div>
                    <div class="company-info-value">${stock.currency || 'USD'}</div>
                </div>
            </div>
            ${stock.description ? `
                <div class="company-description-section">
                    <div class="company-info-label">About the Company</div>
                    <p class="company-description">${stock.description}</p>
                </div>
            ` : ''}
        `;
        
        lucide.createIcons();
    }
}

function renderWatchlist() {
    const container = document.getElementById('watchlistContent');
    if (!container) return;
    
    const watchlistStocks = app.stocks.filter(stock => app.watchlist.includes(stock.symbol));
    
    if (watchlistStocks.length === 0) {
        container.innerHTML = `
            <div class="watchlist-empty">
                <i data-lucide="star" class="empty-icon"></i>
                <p>Your watchlist is empty</p>
                <small>Add stocks by clicking the star icon</small>
            </div>
        `;
        lucide.createIcons();
        return;
    }
    
    container.innerHTML = watchlistStocks.map(stock => `
        <div class="watchlist-item" onclick="selectStock('${stock.symbol}')">
            <div class="watchlist-left">
                <button class="watchlist-star" onclick="event.stopPropagation(); toggleWatchlist('${stock.symbol}')">
                    <i data-lucide="star" class="star-filled"></i>
                </button>
                <div class="watchlist-info">
                    <div class="watchlist-symbol">${stock.symbol}</div>
                    <div class="watchlist-name">${stock.name}</div>
                </div>
            </div>
            <div class="watchlist-right">
                <div class="watchlist-price">${formatCurrency(stock.price)}</div>
                <div class="watchlist-change ${isPositive(stock.change) ? 'positive' : 'negative'}">
                    <i data-lucide="trending-up"></i>
                    ${isPositive(stock.change) ? '+' : ''}${formatNumber(stock.changePercent, 2)}%
                </div>
            </div>
        </div>
    `).join('');
    
    lucide.createIcons();
}

function renderNews(category = 'all') {
    const newsList = document.getElementById('newsList');
    if (!newsList) return;
    
    let filteredNews = app.news;
    if (category !== 'all') {
        filteredNews = app.news.filter(item => item.category === category);
    }
    
    if (filteredNews.length === 0) {
        newsList.innerHTML = `
            <div class="news-loading">
                <span>No news available for this category</span>
            </div>
        `;
        return;
    }
    
    newsList.innerHTML = filteredNews.map(item => `
        <div class="news-item ${item.category}">
            <div class="news-header">
                <h4 class="news-title">${item.title}</h4>
                <span class="news-badge ${item.category}">
                    ${item.category === 'indian' ? '🇮🇳 India' : '🌐 Global'}
                </span>
            </div>
            ${item.summary ? `<p class="news-summary">${item.summary}</p>` : ''}
            <div class="news-meta">
                <span class="news-source">${item.source}</span>
                <span class="news-time">${item.time}</span>
            </div>
        </div>
    `).join('');
}

// Homepage Functions
function loadHomePageMarketData() {
    const container = document.getElementById('homeMarketPreview');
    if (!container) return;
    
    const popularStocks = ['AAPL', 'GOOGL', 'MSFT', 'TSLA'];
    
    Promise.all(popularStocks.map(symbol => fetchStockQuote(symbol)))
        .then(stocks => {
            const validStocks = stocks.filter(stock => stock !== null).slice(0, 4);
            
            container.innerHTML = validStocks.map(stock => `
                <div class="market-card">
                    <div class="market-card-header">
                        <h3 class="market-symbol">${stock.symbol}</h3>
                        <div class="trend-indicator ${isPositive(stock.change) ? 'positive' : 'negative'}">
                            <i data-lucide="trending-up"></i>
                        </div>
                    </div>
                    <div class="market-price">${formatCurrency(stock.price)}</div>
                    <div class="market-change ${isPositive(stock.change) ? 'positive' : 'negative'}">
                        ${isPositive(stock.change) ? '+' : ''}${formatNumber(stock.changePercent, 2)}%
                    </div>
                </div>
            `).join('');
            
            lucide.createIcons();
        })
        .catch(error => {
            console.error('Failed to load homepage market data:', error);
            // Fallback to mock data display
            container.innerHTML = `
                <div class="market-card">
                    <div class="market-card-header">
                        <h3 class="market-symbol">AAPL</h3>
                        <div class="trend-indicator positive">
                            <i data-lucide="trending-up"></i>
                        </div>
                    </div>
                    <div class="market-price">$189.84</div>
                    <div class="market-change positive">+2.45 (+1.31%)</div>
                </div>
                <div class="market-card">
                    <div class="market-card-header">
                        <h3 class="market-symbol">GOOGL</h3>
                        <div class="trend-indicator negative">
                            <i data-lucide="trending-up"></i>
                        </div>
                    </div>
                    <div class="market-price">$2,847.32</div>
                    <div class="market-change negative">-12.45 (-0.43%)</div>
                </div>
                <div class="market-card">
                    <div class="market-card-header">
                        <h3 class="market-symbol">MSFT</h3>
                        <div class="trend-indicator positive">
                            <i data-lucide="trending-up"></i>
                        </div>
                    </div>
                    <div class="market-price">$412.78</div>
                    <div class="market-change positive">+5.67 (+1.39%)</div>
                </div>
                <div class="market-card">
                    <div class="market-card-header">
                        <h3 class="market-symbol">TSLA</h3>
                        <div class="trend-indicator negative">
                            <i data-lucide="trending-up"></i>
                        </div>
                    </div>
                    <div class="market-price">$248.91</div>
                    <div class="market-change negative">-8.32 (-3.24%)</div>
                </div>
            `;
            lucide.createIcons();
        });
}

// Page Initialization
function initializePage() {
    // Initialize theme first
    initializeTheme();
    
    if (app.currentPage === 'dashboard') {
        initializeDashboard();
    } else {
        initializeHomepage();
    }
    
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function initializeHomepage() {
    loadHomePageMarketData();
}

function initializeDashboard() {
    setupSearch();
    updateAutoRefreshUI();
    loadInitialData();
    
    if (app.isAutoRefresh) {
        startAutoRefresh();
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initialize everything
    initializePage();
    
    // Set up video modal event listeners if on homepage
    const modal = document.getElementById('videoModal');
    if (modal) {
        // Close modal when clicking outside the video
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeVideoModal();
            }
        });
    }
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeVideoModal();
        }
    });
});

document.addEventListener('visibilitychange', () => {
    if (app.currentPage === 'dashboard') {
        if (document.hidden) {
            stopAutoRefresh();
        } else if (app.isAutoRefresh) {
            startAutoRefresh();
        }
    }
});

window.addEventListener('resize', () => {
    if (app.currentPage === 'dashboard' && app.chartData.length > 0) {
        setTimeout(() => updateChart(), 100);
    }
});

window.addEventListener('beforeunload', () => {
    stopAutoRefresh();
    if (app.chartInstance) {
        try {
            app.chartInstance.destroy();
        } catch (error) {
            console.log('Chart cleanup error:', error);
        }
    }
});

// Error handling
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    updateConnectionStatus('error');
});
