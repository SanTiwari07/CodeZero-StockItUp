// StockTracker JavaScript - Complete functionality for stock tracking application
// Includes Finnhub API integration with fallback to mock data

// ========================================
// Configuration and Constants
// ========================================

const FINNHUB_CONFIG = {
    API_KEY: 'd25p1l1r01qhge4dmi7gd25p1l1r01qhge4dmi80', // Replace with your actual Finnhub API key
    BASE_URL: 'https://finnhub.io/api/v1',
    WEBSOCKET_URL: 'wss://ws.finnhub.io'
};

// Mock data for demonstration and fallback
const MOCK_STOCKS = [
    {
        symbol: 'AAPL', name: 'Apple Inc.', price: 189.84, previousClose: 187.39,
        high: 192.15, low: 187.20, open: 188.50, volume: 52400000,
        marketCap: 2890000000000, peRatio: 28.5
    },
    {
        symbol: 'GOOGL', name: 'Alphabet Inc.', price: 2847.32, previousClose: 2859.77,
        high: 2865.50, low: 2835.75, open: 2859.80, volume: 28100000,
        marketCap: 1750000000000, peRatio: 24.2
    },
    {
        symbol: 'MSFT', name: 'Microsoft Corporation', price: 412.78, previousClose: 407.11,
        high: 415.25, low: 408.90, open: 409.50, volume: 35200000,
        marketCap: 3060000000000, peRatio: 35.8
    },
    {
        symbol: 'TSLA', name: 'Tesla Inc.', price: 248.91, previousClose: 257.23,
        high: 258.40, low: 246.75, open: 256.20, volume: 87300000,
        marketCap: 792000000000, peRatio: 45.6
    },
    {
        symbol: 'AMZN', name: 'Amazon.com Inc.', price: 178.25, previousClose: 175.04,
        high: 180.50, low: 175.30, open: 176.80, volume: 42800000,
        marketCap: 1850000000000, peRatio: 52.3
    },
    {
        symbol: 'NVDA', name: 'NVIDIA Corporation', price: 891.38, previousClose: 875.96,
        high: 895.75, low: 875.20, open: 880.50, volume: 71200000,
        marketCap: 2200000000000, peRatio: 65.4
    }
];

const MOCK_MARKET_INDICES = [
    { symbol: '^GSPC', name: 'S&P 500', price: 5617.20, change: 47.85, changePercent: 0.86 },
    { symbol: '^DJI', name: 'Dow Jones', price: 40842.79, change: 129.44, changePercent: 0.32 },
    { symbol: '^IXIC', name: 'NASDAQ', price: 17876.77, change: 218.16, changePercent: 1.24 }
];

const MOCK_NEWS = [
    {
        headline: 'Federal Reserve Signals Potential Rate Adjustments in Upcoming Meeting',
        summary: 'Federal Reserve officials hint at possible monetary policy changes as inflation data shows mixed signals across different sectors.',
        url: '#', datetime: Date.now() / 1000 - 7200, source: 'Reuters',
        image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=200&fit=crop'
    },
    {
        headline: 'Tech Giants Report Strong Q4 Earnings Despite Market Volatility',
        summary: 'Major technology companies exceed analyst expectations with robust revenue growth driven by AI and cloud computing initiatives.',
        url: '#', datetime: Date.now() / 1000 - 14400, source: 'Bloomberg',
        image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=200&fit=crop'
    },
    {
        headline: 'Energy Sector Surges on Supply Chain Concerns and Geopolitical Tensions',
        summary: 'Oil and gas stocks climb as global supply chain disruptions raise concerns about energy security and pricing.',
        url: '#', datetime: Date.now() / 1000 - 21600, source: 'CNBC',
        image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=200&fit=crop'
    },
    {
        headline: 'Cryptocurrency Markets Show Renewed Institutional Interest',
        summary: 'Digital assets gain momentum as institutional investors increase allocation amid regulatory clarity improvements.',
        url: '#', datetime: Date.now() / 1000 - 28800, source: 'MarketWatch',
        image: 'https://images.unsplash.com/photo-1640826843936-834f3dfff419?w=400&h=200&fit=crop'
    }
];

// ========================================
// Global State
// ========================================

let globalState = {
    stocks: [],
    selectedStock: null,
    watchlist: ['AAPL', 'GOOGL', 'MSFT'],
    marketIndices: [],
    newsItems: [],
    chartData: [],
    isAutoRefresh: true,
    lastUpdated: null,
    chartInstance: null,
    refreshInterval: null,
    apiStatus: {
        isConnected: false,
        usingMockData: true,
        message: 'Using demo data - Set up Finnhub API key for live data',
        needsSetup: true
    }
};

// ========================================
// Stock API Service
// ========================================

class StockAPIService {
    constructor() {
        this.cache = new Map();
        this.CACHE_DURATION = 30000; // 30 seconds
    }

    isCacheValid(key) {
        const cached = this.cache.get(key);
        if (!cached) return false;
        return Date.now() - cached.timestamp < this.CACHE_DURATION;
    }

    setCache(key, data) {
        this.cache.set(key, { data, timestamp: Date.now() });
    }

    isValidApiKey() {
        return FINNHUB_CONFIG.API_KEY !== 'YOUR_FINNHUB_API_KEY' && FINNHUB_CONFIG.API_KEY.length > 10;
    }

    async fetchFromFinnhub(endpoint, params = {}) {
        if (!this.isValidApiKey()) {
            throw new Error('API key not configured');
        }

        const url = new URL(`${FINNHUB_CONFIG.BASE_URL}${endpoint}`);
        url.searchParams.append('token', FINNHUB_CONFIG.API_KEY);
        
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });

        const response = await fetch(url.toString());
        
        if (!response.ok) {
            if (response.status === 401) {
                globalState.apiStatus = {
                    isConnected: false,
                    usingMockData: true,
                    message: 'Invalid API key - Using demo data',
                    needsSetup: true
                };
                throw new Error('Invalid API key');
            }
            throw new Error(`Finnhub API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Update API status on successful call
        globalState.apiStatus = {
            isConnected: true,
            usingMockData: false,
            message: 'Connected to live market data',
            needsSetup: false
        };
        
        return data;
    }

    generateMockStockData(baseStock) {
        const volatility = (Math.random() - 0.5) * 0.04; // ±2% volatility
        const currentPrice = baseStock.price * (1 + volatility);
        const change = currentPrice - baseStock.previousClose;
        const changePercent = (change / baseStock.previousClose) * 100;

        const high = Math.max(currentPrice, baseStock.high * (1 + Math.random() * 0.01));
        const low = Math.min(currentPrice, baseStock.low * (1 - Math.random() * 0.01));

        return {
            symbol: baseStock.symbol,
            name: baseStock.name,
            price: Math.round(currentPrice * 100) / 100,
            change: Math.round(change * 100) / 100,
            changePercent: Math.round(changePercent * 100) / 100,
            volume: this.formatVolume(baseStock.volume * (0.8 + Math.random() * 0.4)),
            high: Math.round(high * 100) / 100,
            low: Math.round(low * 100) / 100,
            open: Math.round(baseStock.open * (1 + (Math.random() - 0.5) * 0.02) * 100) / 100,
            previousClose: baseStock.previousClose,
            marketCap: this.formatMarketCap(baseStock.marketCap),
            peRatio: baseStock.peRatio,
            lastUpdated: new Date().toISOString()
        };
    }

    generateMockIntradayData(symbol) {
        const baseStock = MOCK_STOCKS.find(s => s.symbol === symbol);
        if (!baseStock) return [];

        const now = new Date();
        const data = [];
        let currentPrice = baseStock.previousClose;

        // Generate 78 data points (6.5 hours of 5-minute intervals)
        for (let i = 78; i >= 0; i--) {
            const timestamp = new Date(now.getTime() - (i * 5 * 60 * 1000));
            
            const volatility = (Math.random() - 0.5) * 0.005; // ±0.5% per 5-minute interval
            const trend = (78 - i) / 78 * (baseStock.price - baseStock.previousClose) / baseStock.previousClose;
            
            currentPrice = currentPrice * (1 + volatility + trend * 0.1);
            
            data.push({
                time: timestamp.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false 
                }),
                price: Math.round(currentPrice * 100) / 100,
                timestamp: timestamp.getTime()
            });
        }

        return data;
    }

    async fetchStockQuote(symbol) {
        const cacheKey = `quote_${symbol}`;
        
        if (this.isCacheValid(cacheKey)) {
            return this.cache.get(cacheKey).data;
        }

        try {
            // Try real API first
            const quote = await this.fetchFromFinnhub('/quote', { symbol });
            const profile = await this.fetchFromFinnhub('/stock/profile2', { symbol });
            const metrics = await this.fetchFromFinnhub('/stock/metric', { 
                symbol, 
                metric: 'all' 
            });

            if (!quote || quote.c === 0) return null;

            const result = {
                symbol: symbol.toUpperCase(),
                name: profile.name || symbol,
                price: quote.c || 0,
                change: quote.d || 0,
                changePercent: quote.dp || 0,
                volume: this.formatVolume(quote.v || 0),
                high: quote.h || 0,
                low: quote.l || 0,
                open: quote.o || 0,
                previousClose: quote.pc || 0,
                marketCap: this.formatMarketCap(profile.marketCapitalization || 0),
                peRatio: metrics?.metric?.peBasicExclExtraTTM || 0,
                lastUpdated: new Date().toISOString()
            };

            this.setCache(cacheKey, result);
            return result;
        } catch (error) {
            // Fallback to mock data
            const mockStock = MOCK_STOCKS.find(s => s.symbol === symbol.toUpperCase());
            if (mockStock) {
                const result = this.generateMockStockData(mockStock);
                this.setCache(cacheKey, result);
                return result;
            }
            
            console.error(`Error fetching quote for ${symbol}:`, error);
            return null;
        }
    }

    async fetchIntradayData(symbol) {
        const cacheKey = `intraday_${symbol}`;
        
        if (this.isCacheValid(cacheKey)) {
            return this.cache.get(cacheKey).data;
        }

        try {
            const now = new Date();
            const from = Math.floor((now.getTime() - 24 * 60 * 60 * 1000) / 1000);
            const to = Math.floor(now.getTime() / 1000);

            const candles = await this.fetchFromFinnhub('/stock/candle', {
                symbol,
                resolution: '5',
                from: from.toString(),
                to: to.toString()
            });

            if (!candles.c || candles.s === 'no_data') {
                throw new Error('No data available');
            }

            const chartData = [];
            const dataLength = Math.min(candles.c.length, 78);
            const startIndex = Math.max(0, candles.c.length - dataLength);

            for (let i = startIndex; i < candles.c.length; i++) {
                const timestamp = candles.t[i] * 1000;
                const date = new Date(timestamp);
                
                chartData.push({
                    time: date.toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: false 
                    }),
                    price: parseFloat(candles.c[i].toFixed(2)),
                    timestamp
                });
            }

            this.setCache(cacheKey, chartData);
            return chartData;
        } catch (error) {
            // Fallback to mock data
            const mockData = this.generateMockIntradayData(symbol);
            this.setCache(cacheKey, mockData);
            return mockData;
        }
    }

    async searchStocks(query) {
        if (query.length < 1) return [];
        
        const cacheKey = `search_${query}`;
        
        if (this.isCacheValid(cacheKey)) {
            return this.cache.get(cacheKey).data;
        }

        try {
            const searchResults = await this.fetchFromFinnhub('/search', { q: query });
            
            if (!searchResults.result) return [];

            const results = searchResults.result
                .slice(0, 10)
                .map(item => ({
                    symbol: item.symbol,
                    name: item.description,
                    type: item.type,
                    region: 'US'
                }));

            this.setCache(cacheKey, results);
            return results;
        } catch (error) {
            // Fallback to mock search
            const lowerQuery = query.toLowerCase();
            const results = MOCK_STOCKS
                .filter(stock => 
                    stock.symbol.toLowerCase().includes(lowerQuery) ||
                    stock.name.toLowerCase().includes(lowerQuery)
                )
                .slice(0, 10)
                .map(stock => ({
                    symbol: stock.symbol,
                    name: stock.name,
                    type: 'Common Stock',
                    region: 'United States'
                }));

            this.setCache(cacheKey, results);
            return results;
        }
    }

    async fetchMarketIndices() {
        const cacheKey = 'market_indices';
        
        if (this.isCacheValid(cacheKey)) {
            return this.cache.get(cacheKey).data;
        }

        try {
            const indices = [
                { symbol: '^GSPC', name: 'S&P 500' },
                { symbol: '^DJI', name: 'Dow Jones' },
                { symbol: '^IXIC', name: 'NASDAQ' }
            ];

            const promises = indices.map(async (index) => {
                try {
                    const quote = await this.fetchFromFinnhub('/quote', { symbol: index.symbol });
                    
                    return {
                        name: index.name,
                        value: this.formatPrice(quote.c || 0),
                        change: quote.d >= 0 ? `+${quote.d.toFixed(2)}` : quote.d.toFixed(2),
                        changePercent: quote.dp >= 0 ? `+${quote.dp.toFixed(2)}%` : `${quote.dp.toFixed(2)}%`,
                        isPositive: quote.d >= 0
                    };
                } catch (error) {
                    // Return mock data for this specific index
                    const mockIndex = MOCK_MARKET_INDICES.find(m => m.name === index.name);
                    if (mockIndex) {
                        const volatility = (Math.random() - 0.5) * 0.02;
                        const newPrice = mockIndex.price * (1 + volatility);
                        const change = newPrice - mockIndex.price;
                        const changePercent = (change / mockIndex.price) * 100;
                        
                        return {
                            name: index.name,
                            value: this.formatPrice(newPrice),
                            change: change >= 0 ? `+${change.toFixed(2)}` : change.toFixed(2),
                            changePercent: changePercent >= 0 ? `+${changePercent.toFixed(2)}%` : `${changePercent.toFixed(2)}%`,
                            isPositive: change >= 0
                        };
                    }
                    
                    return {
                        name: index.name,
                        value: 'N/A',
                        change: 'N/A',
                        changePercent: 'N/A',
                        isPositive: true
                    };
                }
            });

            const results = await Promise.all(promises);
            this.setCache(cacheKey, results);
            return results;
        } catch (error) {
            // Fallback to mock indices data
            const results = MOCK_MARKET_INDICES.map(mockIndex => {
                const volatility = (Math.random() - 0.5) * 0.02;
                const newPrice = mockIndex.price * (1 + volatility);
                const change = newPrice - mockIndex.price;
                const changePercent = (change / mockIndex.price) * 100;
                
                return {
                    name: mockIndex.name,
                    value: this.formatPrice(newPrice),
                    change: change >= 0 ? `+${change.toFixed(2)}` : change.toFixed(2),
                    changePercent: changePercent >= 0 ? `+${changePercent.toFixed(2)}%` : `${changePercent.toFixed(2)}%`,
                    isPositive: change >= 0
                };
            });

            this.setCache(cacheKey, results);
            return results;
        }
    }

    async fetchMarketNews() {
        const cacheKey = 'market_news';
        
        if (this.isCacheValid(cacheKey)) {
            return this.cache.get(cacheKey).data;
        }

        try {
            const news = await this.fetchFromFinnhub('/news', { 
                category: 'general',
                minId: '0'
            });

            if (!news || !Array.isArray(news)) throw new Error('No news data');

            const results = news
                .slice(0, 10)
                .map(item => ({
                    title: item.headline,
                    summary: item.summary,
                    url: item.url,
                    time: this.formatNewsTime(item.datetime),
                    source: item.source,
                    image: item.image
                }));

            this.setCache(cacheKey, results);
            return results;
        } catch (error) {
            // Fallback to mock news
            const results = MOCK_NEWS.map(item => ({
                title: item.headline,
                summary: item.summary,
                url: item.url,
                time: this.formatNewsTime(item.datetime),
                source: item.source,
                image: item.image
            }));

            this.setCache(cacheKey, results);
            return results;
        }
    }

    async fetchMultipleQuotes(symbols) {
        const promises = symbols.map(symbol => this.fetchStockQuote(symbol));
        const results = await Promise.all(promises);
        return results.filter(result => result !== null);
    }

    getPopularStocks() {
        return ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX', 'AMD', 'CRM'];
    }

    isMarketOpen() {
        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        const easternTime = new Date(utc + (-5 * 3600000));
        
        const day = easternTime.getDay();
        const hour = easternTime.getHours();
        const minute = easternTime.getMinutes();
        
        if (day === 0 || day === 6) return false;
        
        const marketOpen = 9 * 60 + 30;
        const marketClose = 16 * 60;
        const currentTime = hour * 60 + minute;
        
        return currentTime >= marketOpen && currentTime < marketClose;
    }

    getMarketStatus() {
        const isOpen = this.isMarketOpen();
        
        if (isOpen) {
            return { isOpen: true, message: 'Market is Open' };
        } else {
            const now = new Date();
            const day = now.getDay();
            
            if (day === 0 || day === 6) {
                return { isOpen: false, message: 'Market Closed - Weekend' };
            } else {
                return { isOpen: false, message: 'Market Closed' };
            }
        }
    }

    // Utility functions
    formatVolume(volume) {
        if (volume >= 1e9) return `${(volume / 1e9).toFixed(1)}B`;
        if (volume >= 1e6) return `${(volume / 1e6).toFixed(1)}M`;
        if (volume >= 1e3) return `${(volume / 1e3).toFixed(1)}K`;
        return volume.toString();
    }

    formatMarketCap(marketCap) {
        if (marketCap >= 1e12) return `${(marketCap / 1e12).toFixed(2)}T`;
        if (marketCap >= 1e9) return `${(marketCap / 1e9).toFixed(2)}B`;
        if (marketCap >= 1e6) return `${(marketCap / 1e6).toFixed(2)}M`;
        return marketCap.toString();
    }

    formatPrice(price) {
        return price.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    formatNewsTime(datetime) {
        const date = new Date(datetime * 1000);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
        
        if (diffInHours < 1) {
            const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
            return `${diffInMinutes} minutes ago`;
        } else if (diffInHours < 24) {
            return `${diffInHours} hours ago`;
        } else {
            const diffInDays = Math.floor(diffInHours / 24);
            return `${diffInDays} days ago`;
        }
    }
}

// Initialize API service
const stockAPI = new StockAPIService();

// ========================================
// Homepage Functions
// ========================================

function initializeHomepage() {
    loadMarketPreview();
}

async function loadMarketPreview() {
    const container = document.getElementById('marketPreview');
    if (!container) return;

    try {
        const popularSymbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA'];
        const stockData = await stockAPI.fetchMultipleQuotes(popularSymbols);
        
        container.innerHTML = stockData.map(stock => `
            <div class="market-preview-card">
                <div class="market-preview-header">
                    <h3 class="market-preview-symbol">${stock.symbol}</h3>
                    <div class="market-preview-trend ${stock.change >= 0 ? 'positive' : 'negative'}">
                        <i data-lucide="trending-${stock.change >= 0 ? 'up' : 'down'}" class="trend-icon"></i>
                    </div>
                </div>
                <div class="market-preview-price">$${stock.price.toFixed(2)}</div>
                <div class="market-preview-change ${stock.change >= 0 ? 'positive' : 'negative'}">
                    ${stock.change >= 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%
                </div>
            </div>
        `).join('');
        
        lucide.createIcons();
    } catch (error) {
        console.error('Failed to load market preview:', error);
        container.innerHTML = '<div class="loading-text">Unable to load market data</div>';
    }
}

// ========================================
// Dashboard Functions
// ========================================

function initializeDashboard() {
    setupEventListeners();
    loadInitialData();
    loadMarketData();
}

function setupEventListeners() {
    // Auto-refresh toggle
    const autoRefreshBtn = document.getElementById('autoRefreshBtn');
    if (autoRefreshBtn) {
        autoRefreshBtn.addEventListener('click', toggleAutoRefresh);
    }

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
        searchInput.addEventListener('focus', () => {
            const results = document.getElementById('searchResults');
            if (results && results.children.length > 0) {
                results.style.display = 'block';
            }
        });
        searchInput.addEventListener('blur', () => {
            setTimeout(() => {
                const results = document.getElementById('searchResults');
                if (results) results.style.display = 'none';
            }, 200);
        });
    }

    // Tab switching
    document.querySelectorAll('.tab-trigger').forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Watchlist button
    const watchlistBtn = document.getElementById('watchlistBtn');
    if (watchlistBtn) {
        watchlistBtn.addEventListener('click', toggleWatchlist);
    }
}

async function loadInitialData() {
    const loadingElement = document.getElementById('stocksLoading');
    if (loadingElement) loadingElement.style.display = 'flex';

    try {
        const popularSymbols = stockAPI.getPopularStocks().slice(0, 6);
        const stockData = await stockAPI.fetchMultipleQuotes(popularSymbols);
        globalState.stocks = stockData;
        
        if (stockData.length > 0) {
            globalState.selectedStock = stockData[0];
            const intradayData = await stockAPI.fetchIntradayData(stockData[0].symbol);
            globalState.chartData = intradayData;
        }
        
        // Get market status
        const status = stockAPI.getMarketStatus();
        updateMarketStatus(status);
        
        // Update API status
        updateAPIStatus();
        
        globalState.lastUpdated = new Date();
        updateLastUpdatedTime();
        
        renderStockList();
        renderSelectedStock();
        updateChart();
    } catch (error) {
        console.error('Failed to load initial data:', error);
    } finally {
        if (loadingElement) loadingElement.style.display = 'none';
    }
}

async function loadMarketData() {
    try {
        // Load market indices
        const indices = await stockAPI.fetchMarketIndices();
        globalState.marketIndices = indices;
        renderMarketIndices();

        // Load market news
        const news = await stockAPI.fetchMarketNews();
        globalState.newsItems = news;
        renderNews();
        
        // Update API status after successful calls
        updateAPIStatus();
    } catch (error) {
        console.error('Failed to load market data:', error);
    }
}

function updateMarketStatus(status) {
    const statusElement = document.getElementById('marketStatus');
    if (!statusElement) return;

    const dot = statusElement.querySelector('.status-dot');
    const text = statusElement.querySelector('span');
    
    if (dot && text) {
        dot.className = `status-dot ${status.isOpen ? 'open' : 'closed'}`;
        text.textContent = status.message;
    }
}

function updateAPIStatus() {
    const statusElement = document.getElementById('apiStatus');
    const alertElement = document.getElementById('apiAlert');
    
    if (statusElement) {
        const icon = statusElement.querySelector('.status-icon');
        const text = statusElement.querySelector('span');
        
        if (icon && text) {
            icon.setAttribute('data-lucide', globalState.apiStatus.usingMockData ? 'alert-circle' : 'check-circle');
            text.textContent = globalState.apiStatus.usingMockData ? 'Demo Data' : 'Live Data';
            statusElement.className = `status-badge ${globalState.apiStatus.isConnected ? 'connected' : 'demo'}`;
        }
    }
    
    if (alertElement) {
        alertElement.style.display = globalState.apiStatus.needsSetup ? 'block' : 'none';
    }
    
    lucide.createIcons();
}

function updateLastUpdatedTime() {
    const timeElement = document.getElementById('updateTime');
    const containerElement = document.getElementById('lastUpdated');
    
    if (timeElement && containerElement && globalState.lastUpdated) {
        timeElement.textContent = globalState.lastUpdated.toLocaleTimeString();
        containerElement.style.display = 'flex';
    }
}

function toggleAutoRefresh() {
    globalState.isAutoRefresh = !globalState.isAutoRefresh;
    
    const btn = document.getElementById('autoRefreshBtn');
    const icon = document.getElementById('refreshIcon');
    
    if (btn) {
        btn.className = `btn btn-sm ${globalState.isAutoRefresh ? 'btn-primary' : 'btn-outline'}`;
    }
    
    if (icon) {
        icon.className = `btn-icon ${globalState.isAutoRefresh ? 'spinning' : ''}`;
    }
    
    if (globalState.isAutoRefresh) {
        startAutoRefresh();
    } else {
        stopAutoRefresh();
    }
}

function startAutoRefresh() {
    if (globalState.refreshInterval) return;
    
    globalState.refreshInterval = setInterval(() => {
        refreshData();
        refreshMarketData();
    }, 5000);
}

function stopAutoRefresh() {
    if (globalState.refreshInterval) {
        clearInterval(globalState.refreshInterval);
        globalState.refreshInterval = null;
    }
}

async function refreshData() {
    if (!globalState.selectedStock) return;
    
    try {
        // Refresh selected stock data
        const updatedStock = await stockAPI.fetchStockQuote(globalState.selectedStock.symbol);
        if (updatedStock) {
            globalState.selectedStock = updatedStock;
            globalState.stocks = globalState.stocks.map(stock => 
                stock.symbol === updatedStock.symbol ? updatedStock : stock
            );
        }

        // Refresh chart data
        const intradayData = await stockAPI.fetchIntradayData(globalState.selectedStock.symbol);
        globalState.chartData = intradayData;
        
        globalState.lastUpdated = new Date();
        updateLastUpdatedTime();
        
        renderStockList();
        renderSelectedStock();
        updateChart();
    } catch (error) {
        console.error('Failed to refresh data:', error);
    }
}

async function refreshMarketData() {
    try {
        // Refresh market indices
        const indices = await stockAPI.fetchMarketIndices();
        globalState.marketIndices = indices;
        renderMarketIndices();

        // Update market status
        const status = stockAPI.getMarketStatus();
        updateMarketStatus(status);
        
        // Update API status
        updateAPIStatus();
    } catch (error) {
        console.error('Failed to refresh market data:', error);
    }
}

async function handleSearch(event) {
    const query = event.target.value;
    const resultsContainer = document.getElementById('searchResults');
    
    if (!resultsContainer) return;
    
    if (query.length < 1) {
        resultsContainer.style.display = 'none';
        return;
    }

    try {
        const results = await stockAPI.searchStocks(query);
        
        if (results.length > 0) {
            resultsContainer.innerHTML = results.map(result => `
                <div class="search-result-item" onclick="selectSearchResult('${result.symbol}')">
                    <div class="search-result-symbol">${result.symbol}</div>
                    <div class="search-result-name">${result.name}</div>
                    <div class="search-result-region">${result.region}</div>
                </div>
            `).join('');
            resultsContainer.style.display = 'block';
        } else {
            resultsContainer.style.display = 'none';
        }
    } catch (error) {
        console.error('Search failed:', error);
    }
}

async function selectSearchResult(symbol) {
    const searchInput = document.getElementById('searchInput');
    const resultsContainer = document.getElementById('searchResults');
    
    if (searchInput) searchInput.value = '';
    if (resultsContainer) resultsContainer.style.display = 'none';
    
    await selectStock(symbol);
}

async function selectStock(symbol) {
    const loadingElement = document.getElementById('stocksLoading');
    if (loadingElement) loadingElement.style.display = 'flex';
    
    try {
        const stockData = await stockAPI.fetchStockQuote(symbol);
        if (stockData) {
            globalState.selectedStock = stockData;
            
            // Update stocks list if not already present
            const exists = globalState.stocks.find(s => s.symbol === symbol);
            if (!exists) {
                globalState.stocks = [stockData, ...globalState.stocks.slice(0, 5)];
            } else {
                globalState.stocks = globalState.stocks.map(s => s.symbol === symbol ? stockData : s);
            }

            // Fetch chart data
            const intradayData = await stockAPI.fetchIntradayData(symbol);
            globalState.chartData = intradayData;
            
            renderStockList();
            renderSelectedStock();
            updateChart();
        }
    } catch (error) {
        console.error('Failed to select stock:', error);
    } finally {
        if (loadingElement) loadingElement.style.display = 'none';
    }
}

function toggleWatchlist() {
    if (!globalState.selectedStock) return;
    
    const symbol = globalState.selectedStock.symbol;
    const isInWatchlist = globalState.watchlist.includes(symbol);
    
    if (isInWatchlist) {
        globalState.watchlist = globalState.watchlist.filter(s => s !== symbol);
    } else {
        globalState.watchlist.push(symbol);
    }
    
    updateWatchlistButton();
    renderWatchlist();
    renderStockList(); // Update star icons
}

function updateWatchlistButton() {
    if (!globalState.selectedStock) return;
    
    const btn = document.getElementById('watchlistBtn');
    const icon = document.getElementById('watchlistIcon');
    const text = document.getElementById('watchlistText');
    
    const isInWatchlist = globalState.watchlist.includes(globalState.selectedStock.symbol);
    
    if (icon) {
        icon.className = `btn-icon ${isInWatchlist ? 'starred' : ''}`;
    }
    
    if (text) {
        text.textContent = isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist';
    }
}

function switchTab(tabName) {
    // Update tab triggers
    document.querySelectorAll('.tab-trigger').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === tabName);
    });
    
    // Render content for specific tabs
    if (tabName === 'watchlist') {
        renderWatchlist();
    } else if (tabName === 'news') {
        renderNews();
    }
}

// ========================================
// Rendering Functions
// ========================================

function renderStockList() {
    const container = document.getElementById('stockList');
    if (!container) return;
    
    container.innerHTML = globalState.stocks.map(stock => `
        <div class="stock-card ${globalState.selectedStock?.symbol === stock.symbol ? 'selected' : ''}" 
             onclick="selectStock('${stock.symbol}')">
            <div class="stock-card-content">
                <div class="stock-card-left">
                    <button class="watchlist-star ${globalState.watchlist.includes(stock.symbol) ? 'starred' : ''}" 
                            onclick="event.stopPropagation(); toggleStockWatchlist('${stock.symbol}')">
                        <i data-lucide="star" class="star-icon"></i>
                    </button>
                    <div class="stock-info-mini">
                        <div class="stock-symbol-mini">${stock.symbol}</div>
                        <div class="stock-name-mini">${stock.name}</div>
                    </div>
                </div>
                <div class="stock-card-right">
                    <div class="stock-price-mini">$${stock.price.toFixed(2)}</div>
                    <div class="stock-change-mini ${stock.change >= 0 ? 'positive' : 'negative'}">
                        <i data-lucide="trending-${stock.change >= 0 ? 'up' : 'down'}" class="change-icon-mini"></i>
                        ${stock.change >= 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    lucide.createIcons();
}

function toggleStockWatchlist(symbol) {
    const isInWatchlist = globalState.watchlist.includes(symbol);
    
    if (isInWatchlist) {
        globalState.watchlist = globalState.watchlist.filter(s => s !== symbol);
    } else {
        globalState.watchlist.push(symbol);
    }
    
    renderStockList();
    if (globalState.selectedStock?.symbol === symbol) {
        updateWatchlistButton();
    }
    renderWatchlist();
}

function renderSelectedStock() {
    const container = document.getElementById('selectedStockContent');
    if (!container || !globalState.selectedStock) return;
    
    const stock = globalState.selectedStock;
    
    // Update basic info
    const elements = {
        stockSymbol: stock.symbol,
        stockName: stock.name,
        currentPrice: `$${stock.price.toFixed(2)}`,
        openPrice: `$${stock.open.toFixed(2)}`,
        highPrice: `$${stock.high.toFixed(2)}`,
        lowPrice: `$${stock.low.toFixed(2)}`,
        volume: stock.volume,
        marketCap: stock.marketCap,
        peRatio: stock.peRatio > 0 ? stock.peRatio.toFixed(2) : 'N/A'
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });
    
    // Update price change
    const priceChangeElement = document.getElementById('priceChange');
    if (priceChangeElement) {
        const isPositive = stock.change >= 0;
        const icon = priceChangeElement.querySelector('.change-icon');
        const span = priceChangeElement.querySelector('span');
        
        priceChangeElement.className = `price-change ${isPositive ? 'positive' : 'negative'}`;
        if (icon) icon.setAttribute('data-lucide', `trending-${isPositive ? 'up' : 'down'}`);
        if (span) span.textContent = `${isPositive ? '+' : ''}$${stock.change.toFixed(2)} (${isPositive ? '+' : ''}${stock.changePercent.toFixed(2)}%)`;
    }
    
    // Update live badge
    const liveBadge = document.getElementById('liveBadge');
    if (liveBadge) {
        const span = liveBadge.querySelector('span');
        if (span) span.textContent = globalState.apiStatus.usingMockData ? 'Demo' : 'Live';
    }
    
    // Update chart data type
    const chartDataType = document.getElementById('chartDataType');
    if (chartDataType) {
        chartDataType.textContent = globalState.apiStatus.usingMockData ? 'Demo data' : 'Real-time data';
    }
    
    updateWatchlistButton();
    renderPopularStocks();
    
    container.style.display = 'block';
    lucide.createIcons();
}

function renderPopularStocks() {
    const container = document.getElementById('popularStocks');
    if (!container) return;
    
    container.innerHTML = globalState.stocks.slice(0, 6).map(stock => `
        <div class="popular-stock-card" onclick="selectStock('${stock.symbol}')">
            <div class="popular-stock-header">
                <div class="popular-stock-info">
                    <div class="popular-stock-symbol">${stock.symbol}</div>
                    <div class="popular-stock-name">${stock.name}</div>
                </div>
                <div class="popular-stock-trend ${stock.change >= 0 ? 'positive' : 'negative'}">
                    <i data-lucide="trending-${stock.change >= 0 ? 'up' : 'down'}" class="trend-icon"></i>
                </div>
            </div>
            <div class="popular-stock-price">$${stock.price.toFixed(2)}</div>
            <div class="popular-stock-change ${stock.change >= 0 ? 'positive' : 'negative'}">
                ${stock.change >= 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%
            </div>
        </div>
    `).join('');
    
    lucide.createIcons();
}

function renderMarketIndices() {
    const container = document.getElementById('marketIndices');
    if (!container) return;
    
    if (globalState.marketIndices.length === 0) {
        container.innerHTML = '<div class="loading-text">Loading market data...</div>';
        return;
    }
    
    container.innerHTML = globalState.marketIndices.map(index => `
        <div class="market-index-card">
            <span class="index-name">${index.name}</span>
            <div class="index-data">
                <div class="index-value">${index.value}</div>
                <div class="index-change ${index.isPositive ? 'positive' : 'negative'}">
                    ${index.changePercent}
                </div>
            </div>
        </div>
    `).join('');
}

function renderWatchlist() {
    const container = document.getElementById('watchlistContent');
    if (!container) return;
    
    const watchlistStocks = globalState.stocks.filter(stock => 
        globalState.watchlist.includes(stock.symbol)
    );
    
    if (watchlistStocks.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>Your watchlist is empty. Add stocks by clicking the star icon.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="watchlist-items">
            ${watchlistStocks.map(stock => `
                <div class="watchlist-item" onclick="selectStock('${stock.symbol}')">
                    <div class="watchlist-item-left">
                        <button class="watchlist-star starred" 
                                onclick="event.stopPropagation(); toggleStockWatchlist('${stock.symbol}')">
                            <i data-lucide="star" class="star-icon"></i>
                        </button>
                        <div class="watchlist-stock-info">
                            <div class="watchlist-stock-symbol">${stock.symbol}</div>
                            <div class="watchlist-stock-name">${stock.name}</div>
                        </div>
                    </div>
                    <div class="watchlist-item-right">
                        <div class="watchlist-stock-price">$${stock.price.toFixed(2)}</div>
                        <div class="watchlist-stock-change ${stock.change >= 0 ? 'positive' : 'negative'}">
                            <i data-lucide="trending-${stock.change >= 0 ? 'up' : 'down'}" class="change-icon-small"></i>
                            ${stock.change >= 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    lucide.createIcons();
}

function renderNews() {
    const container = document.getElementById('newsContent');
    if (!container) return;
    
    if (globalState.newsItems.length === 0) {
        container.innerHTML = '<div class="loading-text">Loading market news...</div>';
        return;
    }
    
    container.innerHTML = `
        <div class="news-items">
            ${globalState.newsItems.map((item, index) => `
                <div class="news-item" onclick="window.open('${item.url}', '_blank')">
                    <div class="news-content">
                        ${item.image ? `
                            <img src="${item.image}" alt="" class="news-image" 
                                 onerror="this.style.display='none'">
                        ` : ''}
                        <div class="news-text">
                            <h4 class="news-title">${item.title}</h4>
                            <p class="news-summary">${item.summary}</p>
                            <div class="news-meta">
                                <span class="news-source">${item.source}</span>
                                <span class="news-time">${item.time}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// ========================================
// Chart Functions
// ========================================

function updateChart() {
    const canvas = document.getElementById('stockChart');
    const loadingElement = document.getElementById('chartLoading');
    
    if (!canvas || globalState.chartData.length === 0) {
        if (loadingElement) loadingElement.style.display = 'flex';
        return;
    }
    
    if (loadingElement) loadingElement.style.display = 'none';
    
    try {
        // Try Chart.js first
        if (window.Chart) {
            updateChartJS(canvas);
        } else {
            // Fallback to canvas drawing
            updateCanvasChart(canvas);
        }
    } catch (error) {
        console.error('Chart.js failed, using fallback chart:', error);
        updateCanvasChart(canvas);
        
        const fallbackBadge = document.getElementById('fallbackBadge');
        if (fallbackBadge) fallbackBadge.style.display = 'inline-block';
    }
}

function updateChartJS(canvas) {
    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart
    if (globalState.chartInstance) {
        globalState.chartInstance.destroy();
    }
    
    const isPositive = globalState.selectedStock ? globalState.selectedStock.change >= 0 : true;
    const color = isPositive ? '#16a34a' : '#dc2626';
    
    globalState.chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: globalState.chartData.map(d => d.time),
            datasets: [{
                label: globalState.selectedStock?.symbol || 'Price',
                data: globalState.chartData.map(d => d.price),
                borderColor: color,
                backgroundColor: color + '20',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: color,
                pointHoverBorderColor: '#ffffff',
                pointHoverBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: color,
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: false,
                    callbacks: {
                        title: function(context) {
                            return context[0].label;
                        },
                        label: function(context) {
                            return `$${context.parsed.y.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        maxTicksLimit: 8,
                        color: '#666'
                    }
                },
                y: {
                    display: true,
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toFixed(2);
                        },
                        color: '#666'
                    }
                }
            },
            animation: {
                duration: 750,
                easing: 'easeInOutQuart'
            }
        }
    });
}

function updateCanvasChart(canvas) {
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const height = rect.height;
    const padding = 40;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Find min and max values
    const prices = globalState.chartData.map(d => d.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;

    // Set colors
    const isPositive = globalState.selectedStock ? globalState.selectedStock.change >= 0 : true;
    const lineColor = isPositive ? '#16a34a' : '#dc2626';
    const gradientColor = isPositive ? '#16a34a20' : '#dc262620';

    // Draw grid lines
    ctx.strokeStyle = '#e5e5e5';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);

    // Horizontal grid lines
    for (let i = 0; i <= 4; i++) {
        const y = padding + (i * chartHeight) / 4;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
    }

    // Vertical grid lines
    for (let i = 0; i <= 4; i++) {
        const x = padding + (i * chartWidth) / 4;
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, height - padding);
        ctx.stroke();
    }

    ctx.setLineDash([]);

    // Create gradient
    const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
    gradient.addColorStop(0, gradientColor);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');

    // Draw filled area
    ctx.beginPath();
    globalState.chartData.forEach((point, index) => {
        const x = padding + (index * chartWidth) / (globalState.chartData.length - 1);
        const y = height - padding - ((point.price - minPrice) / priceRange) * chartHeight;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    // Complete the area
    const lastX = padding + chartWidth;
    const lastY = height - padding - ((globalState.chartData[globalState.chartData.length - 1].price - minPrice) / priceRange) * chartHeight;
    ctx.lineTo(lastX, height - padding);
    ctx.lineTo(padding, height - padding);
    ctx.closePath();
    
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw the line
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    ctx.beginPath();

    globalState.chartData.forEach((point, index) => {
        const x = padding + (index * chartWidth) / (globalState.chartData.length - 1);
        const y = height - padding - ((point.price - minPrice) / priceRange) * chartHeight;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });

    ctx.stroke();

    // Draw data points
    ctx.fillStyle = lineColor;
    globalState.chartData.forEach((point, index) => {
        const x = padding + (index * chartWidth) / (globalState.chartData.length - 1);
        const y = height - padding - ((point.price - minPrice) / priceRange) * chartHeight;
        
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, 2 * Math.PI);
        ctx.fill();
    });

    // Draw axes
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.stroke();

    // X-axis
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Add labels
    ctx.fillStyle = '#666';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';

    // X-axis labels (time)
    const labelStep = Math.ceil(globalState.chartData.length / 6);
    globalState.chartData.forEach((point, index) => {
        if (index % labelStep === 0) {
            const x = padding + (index * chartWidth) / (globalState.chartData.length - 1);
            ctx.fillText(point.time, x, height - padding + 20);
        }
    });

    // Y-axis labels (price)
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
        const y = padding + (i * chartHeight) / 4;
        const price = maxPrice - (i * priceRange) / 4;
        ctx.fillText(`$${price.toFixed(2)}`, padding - 10, y + 5);
    }
}

// ========================================
// Initialize Auto-refresh on Dashboard Load
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // Start auto-refresh if on dashboard page
    if (document.getElementById('autoRefreshBtn')) {
        setTimeout(() => {
            if (globalState.isAutoRefresh) {
                startAutoRefresh();
            }
        }, 1000);
    }
});
