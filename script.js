// Indian Stock Tracker - Enhanced Version
// Replace with your actual Finnhub API key
const API_KEY = 'd25p1l1r01qhge4dmi7gd25p1l1r01qhge4dmi80'; // Get from https://finnhub.io

// Global state
let selectedStock = { symbol: 'TCS.NS', name: 'Tata Consultancy Services' };
let watchlist = ['TCS.NS', 'RELIANCE.NS', 'HDFCBANK.NS', 'INFY.NS'];
let chart = null;
let chartData = [];
let searchTimeout = null;
let priceUpdateInterval = null;

// Navigation functions - FIXED: Added missing function
function goToDashboard() {
    window.location.href = 'dashboard.html';
}

function goToHomepage() {
    window.location.href = 'index.html';
}

// Load watchlist from memory (since localStorage is not available)
function loadWatchlist() {
    // Default watchlist - in a real environment, this would come from localStorage
    return ['TCS.NS', 'RELIANCE.NS', 'HDFCBANK.NS', 'INFY.NS'];
}

// Save watchlist to memory (placeholder for localStorage functionality)
function saveWatchlistToMemory() {
    // In a real environment, this would save to localStorage
    console.log('Watchlist saved:', watchlist);
}

// Indian Stock symbols database
const INDIAN_STOCKS = {
    'TCS.NS': 'Tata Consultancy Services',
    'RELIANCE.NS': 'Reliance Industries',
    'HDFCBANK.NS': 'HDFC Bank',
    'INFY.NS': 'Infosys',
    'ICICIBANK.NS': 'ICICI Bank',
    'SBIN.NS': 'State Bank of India',
    'ITC.NS': 'ITC Limited',
    'BHARTIARTL.NS': 'Bharti Airtel',
    'KOTAKBANK.NS': 'Kotak Mahindra Bank',
    'LT.NS': 'Larsen & Toubro',
    'AXISBANK.NS': 'Axis Bank',
    'MARUTI.NS': 'Maruti Suzuki',
    'ASIANPAINT.NS': 'Asian Paints',
    'NESTLEIND.NS': 'Nestle India',
    'ULTRACEMCO.NS': 'UltraTech Cement',
    'WIPRO.NS': 'Wipro',
    'POWERGRID.NS': 'Power Grid Corporation',
    'NTPC.NS': 'NTPC Limited',
    'ONGC.NS': 'Oil & Natural Gas Corporation',
    'TITAN.NS': 'Titan Company',
    'HCLTECH.NS': 'HCL Technologies',
    'TECHM.NS': 'Tech Mahindra',
    'SUNPHARMA.NS': 'Sun Pharmaceutical',
    'BAJFINANCE.NS': 'Bajaj Finance',
    'HINDUNILVR.NS': 'Hindustan Unilever'
};

// Trending stocks (popular Indian stocks)
const TRENDING_STOCKS = ['TCS.NS', 'RELIANCE.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS', 'ITC.NS', 'BHARTIARTL.NS', 'SBIN.NS'];

// Market indices
const INDICES = {
    'nifty': '^NSEI',
    'sensex': '^BSESN', 
    'banknifty': '^NSEBANK',
    'niftyit': '^CNXIT'
};

// Utility functions
function formatPrice(price, currency = '₹') {
    if (price === null || price === undefined || price === 0) return '--';
    return `${currency}${price.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
}

function formatChange(change, percent, currency = '₹') {
    if (change === null || change === undefined) return '--';
    const sign = change >= 0 ? '+' : '';
    return `${sign}${currency}${Math.abs(change).toFixed(2)} (${sign}${percent.toFixed(2)}%)`;
}

function formatVolume(volume) {
    if (volume === null || volume === undefined || volume === 0) return '--';
    if (volume > 10000000) {
        return `${(volume / 10000000).toFixed(1)}Cr`;
    } else if (volume > 100000) {
        return `${(volume / 100000).toFixed(1)}L`;
    } else if (volume > 1000) {
        return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toString();
}

function formatMarketCap(marketCap) {
    if (marketCap === null || marketCap === undefined || marketCap === 0) return '--';
    if (marketCap > 10000) {
        return `₹${(marketCap / 10000).toFixed(2)}L Cr`;
    } else if (marketCap > 100) {
        return `₹${(marketCap / 100).toFixed(2)}K Cr`;
    }
    return `₹${marketCap.toFixed(2)} Cr`;
}

function isPositive(change) {
    return change >= 0;
}

function createTrendIcon(isUp, size = '1rem') {
    const rotate = isUp ? '' : 'transform: rotate(180deg);';
    return `<svg style="width:${size};height:${size};${rotate}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m7 14 5-5 5 5"/></svg>`;
}

function createStar(filled = false) {
    const fill = filled ? '#fbbf24' : 'none';
    const stroke = filled ? '#fbbf24' : 'currentColor';
    return `<svg viewBox="0 0 24 24" fill="${fill}" stroke="${stroke}" stroke-width="2"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>`;
}

function getCompanyInitials(symbol) {
    const cleanSymbol = symbol.replace('.NS', '').replace('.BSE', '');
    if (cleanSymbol.length <= 3) return cleanSymbol;
    return cleanSymbol.substring(0, 3);
}

// API functions
async function fetchQuote(symbol) {
    try {
        const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        
        if (data.c === 0 && data.d === 0 && data.dp === 0) {
            console.warn(`No data found for symbol: ${symbol}`);
            return null;
        }
        
        return data;
    } catch (error) {
        console.error('Error fetching quote:', error);
        return null;
    }
}

async function fetchCompanyProfile(symbol) {
    try {
        const response = await fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${API_KEY}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching company profile:', error);
        return null;
    }
}

async function searchStocks(query) {
    try {
        const response = await fetch(`https://finnhub.io/api/v1/search?q=${query}&token=${API_KEY}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data.result || [];
    } catch (error) {
        console.error('Error searching stocks:', error);
        return [];
    }
}

async function fetchNews() {
    try {
        const response = await fetch(`https://finnhub.io/api/v1/news?category=general&token=${API_KEY}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data.slice(0, 10);
    } catch (error) {
        console.error('Error fetching news:', error);
        return [];
    }
}

// Search functionality
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    const searchResults = document.createElement('div');
    searchResults.className = 'search-results';
    searchInput.parentElement.appendChild(searchResults);
    searchInput.parentElement.style.position = 'relative';

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        
        if (searchTimeout) clearTimeout(searchTimeout);
        
        if (query.length < 1) {
            searchResults.style.display = 'none';
            return;
        }

        searchTimeout = setTimeout(async () => {
            await performSearch(query, searchResults);
        }, 300);
    });

    searchInput.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            const query = e.target.value.trim();
            if (query) {
                await handleSearchEnter(query);
                searchResults.style.display = 'none';
                e.target.value = '';
            }
        }
    });

    document.addEventListener('click', (e) => {
        if (!searchInput.parentElement.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });
}

async function performSearch(query, resultsContainer) {
    const upperQuery = query.toUpperCase();
    
    // Search in Indian stocks first
    const indianMatches = Object.entries(INDIAN_STOCKS)
        .filter(([symbol, name]) => 
            symbol.includes(upperQuery) || 
            name.toUpperCase().includes(upperQuery) ||
            symbol.replace('.NS', '').includes(upperQuery)
        )
        .slice(0, 6);

    if (indianMatches.length > 0) {
        displaySearchResults(indianMatches, resultsContainer);
    }

    // Also search via API for more results
    try {
        const apiResults = await searchStocks(query);
        const apiMatches = apiResults
            .filter(result => result.type === 'Common Stock' && (result.symbol.includes('.NS') || result.symbol.includes('.BSE')))
            .slice(0, 4)
            .map(result => [result.symbol, result.description]);

        const allMatches = [...indianMatches];
        apiMatches.forEach(([symbol, name]) => {
            if (!allMatches.some(([s]) => s === symbol)) {
                allMatches.push([symbol, name]);
            }
        });

        displaySearchResults(allMatches.slice(0, 8), resultsContainer);
    } catch (error) {
        console.error('Search error:', error);
        displaySearchResults(indianMatches, resultsContainer);
    }
}

function displaySearchResults(results, container) {
    if (results.length === 0) {
        container.innerHTML = '<div style="padding: 1rem; text-align: center; color: var(--muted-foreground);">No Indian stocks found</div>';
        container.style.display = 'block';
        return;
    }

    container.innerHTML = results.map(([symbol, name]) => `
        <div class="search-result-item" onclick="selectStockFromSearch('${symbol}', '${name.replace(/'/g, "\\'")}')">
            <div style="font-weight: 500;">${symbol}</div>
            <div style="font-size: 0.875rem; color: var(--muted-foreground); margin-top: 0.25rem;">
                ${name.length > 50 ? name.substring(0, 50) + '...' : name}
            </div>
        </div>
    `).join('');

    container.style.display = 'block';
}

async function handleSearchEnter(query) {
    const upperQuery = query.toUpperCase();
    let symbol = null;
    let name = null;

    // Check if it's a direct symbol match
    if (INDIAN_STOCKS[upperQuery + '.NS']) {
        symbol = upperQuery + '.NS';
        name = INDIAN_STOCKS[symbol];
    } else {
        // Search by company name
        const found = Object.entries(INDIAN_STOCKS).find(([sym, companyName]) => 
            companyName.toUpperCase().includes(upperQuery) ||
            sym.replace('.NS', '').includes(upperQuery)
        );
        
        if (found) {
            [symbol, name] = found;
        } else {
            // Try API search as fallback
            try {
                const apiResults = await searchStocks(query);
                const indianResult = apiResults.find(result => 
                    result.symbol.includes('.NS') || result.symbol.includes('.BSE')
                );
                
                if (indianResult) {
                    symbol = indianResult.symbol;
                    name = indianResult.description;
                }
            } catch (error) {
                console.error('API search failed:', error);
            }
        }
    }

    if (symbol && name) {
        await selectStock(symbol, name);
    } else {
        alert('Stock not found. Please try searching for Indian stocks like TCS, RELIANCE, HDFCBANK, etc.');
    }
}

async function selectStockFromSearch(symbol, name) {
    document.querySelector('.search-results').style.display = 'none';
    document.getElementById('searchInput').value = '';
    await selectStock(symbol, name);
}

// Stock selection with enhanced display
async function selectStock(symbol, name = null) {
    try {
        const quote = await fetchQuote(symbol);
        if (!quote || quote.c === 0) {
            console.warn(`Invalid data for ${symbol}`);
            return false;
        }

        if (!name) {
            name = INDIAN_STOCKS[symbol];
            if (!name) {
                const profile = await fetchCompanyProfile(symbol);
                name = profile?.name || symbol;
            }
        }

        selectedStock = {
            symbol: symbol,
            name: name,
            price: quote.c,
            change: quote.d,
            changePercent: quote.dp,
            volume: quote.v,
            high: quote.h,
            low: quote.l,
            open: quote.o,
            previousClose: quote.pc
        };

        await renderSelectedStock();
        await loadCompanyInfo(symbol);
        renderTrendingList();
        initializeChart();
        
        return true;
    } catch (error) {
        console.error('Error selecting stock:', error);
        return false;
    }
}

// Enhanced stock rendering with logo
async function renderSelectedStock() {
    const elements = {
        symbol: document.getElementById('selectedSymbol'),
        name: document.getElementById('selectedName'),
        price: document.getElementById('selectedPrice'),
        change: document.getElementById('selectedChange'),
        volume: document.getElementById('selectedVolume'),
        marketCap: document.getElementById('selectedMarketCap'),
        high: document.getElementById('selectedHigh'),
        low: document.getElementById('selectedLow'),
        open: document.getElementById('selectedOpen'),
        prevClose: document.getElementById('selectedPrevClose')
    };

    if (!elements.symbol) return;

    const isUp = isPositive(selectedStock.change);

    elements.symbol.textContent = selectedStock.symbol;
    elements.name.textContent = selectedStock.name;
    elements.price.textContent = formatPrice(selectedStock.price);
    elements.volume.textContent = formatVolume(selectedStock.volume);
    elements.high.textContent = formatPrice(selectedStock.high);
    elements.low.textContent = formatPrice(selectedStock.low);
    elements.open.textContent = formatPrice(selectedStock.open);
    elements.prevClose.textContent = formatPrice(selectedStock.previousClose);
    
    elements.change.className = `stock-change ${isUp ? 'positive' : 'negative'}`;
    elements.change.innerHTML = `
        ${createTrendIcon(isUp, '1.25rem')} 
        <span>${formatChange(selectedStock.change, selectedStock.changePercent)}</span>
    `;

    // Load company logo
    await loadCompanyLogo(selectedStock.symbol);
    
    // Calculate market cap (approximation - you may want to get this from API)
    const marketCap = selectedStock.price * 1000;
    elements.marketCap.textContent = formatMarketCap(marketCap);

    updateWatchlistButton();
}

async function loadCompanyLogo(symbol) {
    const logoPlaceholder = document.getElementById('logoPlaceholder');
    const logoImage = document.getElementById('logoImage');
    
    if (!logoPlaceholder || !logoImage) return;
    
    // Set placeholder first
    logoPlaceholder.textContent = getCompanyInitials(symbol);
    logoPlaceholder.style.display = 'flex';
    logoImage.style.display = 'none';
    
    try {
        const profile = await fetchCompanyProfile(symbol);
        if (profile && profile.logo) {
            logoImage.src = profile.logo;
            logoImage.onload = () => {
                logoImage.style.display = 'block';
                logoPlaceholder.style.display = 'none';
            };
            logoImage.onerror = () => {
                logoImage.style.display = 'none';
                logoPlaceholder.style.display = 'flex';
            };
        }
    } catch (error) {
        console.error('Error loading logo:', error);
    }
}

async function loadCompanyInfo(symbol) {
    const descriptionEl = document.getElementById('companyDescription');
    const statsEl = document.getElementById('companyStats');
    
    if (!descriptionEl) return;
    
    descriptionEl.innerHTML = '<p>Loading company information...</p>';
    if (statsEl) statsEl.innerHTML = '';
    
    try {
        const profile = await fetchCompanyProfile(symbol);
        if (profile) {
            descriptionEl.innerHTML = `
                <p><strong>Industry:</strong> ${profile.finnhubIndustry || 'N/A'}</p>
                <p><strong>Country:</strong> ${profile.country || 'India'}</p>
                <p><strong>Exchange:</strong> ${profile.exchange || 'NSE'}</p>
                <p><strong>Currency:</strong> ${profile.currency || 'INR'}</p>
                ${profile.weburl ? `<p><strong>Website:</strong> <a href="${profile.weburl}" target="_blank" style="color: var(--primary);">${profile.weburl}</a></p>` : ''}
            `;
            
            if (statsEl && (profile.marketCapitalization || profile.shareOutstanding)) {
                statsEl.innerHTML = `
                    <div class="company-stats">
                        ${profile.marketCapitalization ? `
                            <div class="stat-item">
                                <div class="stat-label">Market Cap</div>
                                <div class="stat-value">${formatMarketCap(profile.marketCapitalization)}</div>
                            </div>
                        ` : ''}
                        ${profile.shareOutstanding ? `
                            <div class="stat-item">
                                <div class="stat-label">Shares Outstanding</div>
                                <div class="stat-value">${profile.shareOutstanding.toFixed(2)}M</div>
                            </div>
                        ` : ''}
                    </div>
                `;
            }
        } else {
            descriptionEl.innerHTML = '<p>Company information not available.</p>';
        }
    } catch (error) {
        console.error('Error loading company info:', error);
        descriptionEl.innerHTML = '<p>Error loading company information.</p>';
    }
}

function updateWatchlistButton() {
    const btn = document.getElementById('watchlistBtn');
    const btnText = document.getElementById('watchlistBtnText');
    
    if (!btn || !btnText) return;

    const inWatchlist = watchlist.includes(selectedStock.symbol);
    const icon = btn.querySelector('.watchlist-icon');
    
    if (icon) {
        icon.innerHTML = createStar(inWatchlist);
    }
    
    btnText.textContent = inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist';
}

// Trending stocks rendering
function renderTrendingList() {
    const trendingList = document.getElementById('trendingList');
    if (!trendingList) return;

    trendingList.innerHTML = TRENDING_STOCKS.map(symbol => `
        <div class="trending-item ${selectedStock.symbol === symbol ? 'active' : ''}" onclick="selectStock('${symbol}')">
            <div class="trending-content">
                <div class="trending-left">
                    <div class="trending-info">
                        <div class="trending-symbol">${symbol.replace('.NS', '')}</div>
                        <div class="trending-name">${INDIAN_STOCKS[symbol] || symbol}</div>
                    </div>
                </div>
                <div class="trending-right">
                    <div class="trending-price" id="trending-price-${symbol}">Loading...</div>
                    <div class="trending-change" id="trending-change-${symbol}">--</div>
                </div>
            </div>
        </div>
    `).join('');

    // Load prices for trending stocks
    loadTrendingPrices();
}

async function loadTrendingPrices() {
    for (const symbol of TRENDING_STOCKS) {
        try {
            const quote = await fetchQuote(symbol);
            if (quote && quote.c !== 0) {
                const priceEl = document.getElementById(`trending-price-${symbol}`);
                const changeEl = document.getElementById(`trending-change-${symbol}`);
                
                if (priceEl) priceEl.textContent = formatPrice(quote.c);
                if (changeEl) {
                    const isUp = isPositive(quote.d);
                    changeEl.className = `trending-change ${isUp ? 'positive' : 'negative'}`;
                    changeEl.innerHTML = `
                        ${createTrendIcon(isUp, '0.75rem')}
                        <span>${quote.dp.toFixed(2)}%</span>
                    `;
                }
            }
        } catch (error) {
            console.error(`Error loading trending price for ${symbol}:`, error);
        }
    }
}

// Market overview rendering
async function loadMarketOverview() {
    const indices = [
        { id: 'nifty', symbol: '^NSEI' },
        { id: 'sensex', symbol: '^BSESN' },
        { id: 'banknifty', symbol: '^NSEBANK' },
        { id: 'niftyit', symbol: '^CNXIT' }
    ];

    for (const index of indices) {
        try {
            const quote = await fetchQuote(index.symbol);
            if (quote && quote.c !== 0) {
                const priceEl = document.getElementById(`${index.id}-price`);
                const changeEl = document.getElementById(`${index.id}-change`);
                
                if (priceEl) priceEl.textContent = formatPrice(quote.c, '');
                if (changeEl) {
                    const isUp = isPositive(quote.d);
                    changeEl.className = `overview-change ${isUp ? 'positive' : 'negative'}`;
                    changeEl.textContent = `${isUp ? '+' : ''}${quote.dp.toFixed(2)}%`;
                }
            }
        } catch (error) {
            console.error(`Error loading ${index.id} data:`, error);
        }
    }
}

// Watchlist management
function toggleSelectedWatchlist() {
    const symbol = selectedStock.symbol;
    if (watchlist.includes(symbol)) {
        removeFromWatchlist(symbol);
    } else {
        addToWatchlist(symbol);
    }
}

function addToWatchlist(symbol) {
    if (!watchlist.includes(symbol)) {
        watchlist.push(symbol);
        saveWatchlistToMemory();
        renderWatchlist();
        updateWatchlistButton();
    }
}

function removeFromWatchlist(symbol) {
    watchlist = watchlist.filter(s => s !== symbol);
    saveWatchlistToMemory();
    renderWatchlist();
    updateWatchlistButton();
}

function renderWatchlist() {
    const watchlistContent = document.getElementById('watchlistContent');
    if (!watchlistContent) return;

    if (watchlist.length === 0) {
        watchlistContent.innerHTML = `
            <div class="watchlist-empty">
                <p>Your watchlist is empty.</p>
                <p style="font-size: 0.875rem; margin-top: 0.5rem;">Search for Indian stocks to add them to your watchlist.</p>
            </div>
        `;
        return;
    }

    watchlistContent.innerHTML = watchlist.map(symbol => `
        <div class="watchlist-item" onclick="selectStock('${symbol}')">
            <div class="watchlist-left">
                <button class="watchlist-star" onclick="event.stopPropagation(); removeFromWatchlist('${symbol}')">
                    ${createStar(true)}
                </button>
                <div class="watchlist-info">
                    <div class="watchlist-symbol">${symbol.replace('.NS', '')}</div>
                    <div class="watchlist-name">${INDIAN_STOCKS[symbol] || symbol}</div>
                </div>
            </div>
            <div class="watchlist-right">
                <div class="watchlist-price" id="watch-price-${symbol}">Loading...</div>
                <div class="watchlist-change" id="watch-change-${symbol}">--</div>
            </div>
        </div>
    `).join('');

    // Load prices for watchlist
    loadWatchlistPrices();
}

async function loadWatchlistPrices() {
    for (const symbol of watchlist) {
        try {
            const quote = await fetchQuote(symbol);
            if (quote && quote.c !== 0) {
                const priceEl = document.getElementById(`watch-price-${symbol}`);
                const changeEl = document.getElementById(`watch-change-${symbol}`);
                
                if (priceEl) priceEl.textContent = formatPrice(quote.c);
                if (changeEl) {
                    const isUp = isPositive(quote.d);
                    changeEl.className = `watchlist-change ${isUp ? 'positive' : 'negative'}`;
                    changeEl.innerHTML = `
                        ${createTrendIcon(isUp, '0.75rem')}
                        <span>${formatChange(quote.d, quote.dp)}</span>
                    `;
                }
            }
        } catch (error) {
            console.error(`Error loading watchlist price for ${symbol}:`, error);
        }
    }
}

// Chart functionality
function initializeChart() {
    const canvas = document.getElementById('stockChart');
    if (!canvas) return;

    // Check if Chart.js is available
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js library not found. Please include Chart.js library.');
        return;
    }

    const ctx = canvas.getContext('2d');

    // Destroy existing chart
    if (chart) {
        chart.destroy();
    }

    // Generate sample historical data for demo
    chartData = generateSampleData(selectedStock.price);

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.map(d => d.time),
            datasets: [{
                label: `${selectedStock.symbol} Price`,
                data: chartData.map(d => d.price),
                borderColor: isPositive(selectedStock.change) ? '#16a34a' : '#dc2626',
                backgroundColor: isPositive(selectedStock.change) ? 'rgba(22, 163, 74, 0.1)' : 'rgba(220, 38, 38, 0.1)',
                tension: 0.4,
                pointRadius: 2,
                pointHoverRadius: 4,
                fill: true,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 750,
                easing: 'easeInOutQuart'
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return `Price: ${formatPrice(context.parsed.y)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Time',
                        color: '#666'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: '#666',
                        maxTicksLimit: 10
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Price (₹)',
                        color: '#666'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: '#666',
                        callback: function(value) {
                            return formatPrice(value);
                        }
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}

function generateSampleData(currentPrice) {
    const data = [];
    const now = new Date();
    const changeRange = currentPrice * 0.03; // 3% variation for more realistic Indian stock movement
    
    for (let i = 29; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 5 * 60 * 1000); // 5-minute intervals
        const variation = (Math.random() - 0.5) * changeRange;
        const trend = (30 - i) * (selectedStock.change / 30); // Add trend based on actual change
        const price = currentPrice - selectedStock.change + variation + trend;
        
        data.push({
            time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            price: Math.max(0.01, price)
        });
    }
    
    return data;
}

function updateChart() {
    if (!chart || !selectedStock) return;

    const newTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newPrice = selectedStock.price + (Math.random() - 0.5) * (selectedStock.price * 0.005); // Small random variation

    chartData.push({ time: newTime, price: newPrice });

    // Keep only last 30 data points
    if (chartData.length > 30) {
        chartData.shift();
    }

    chart.data.labels = chartData.map(d => d.time);
    chart.data.datasets[0].data = chartData.map(d => d.price);
    chart.update('none'); // No animation for real-time updates
}

// Tab functionality
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;
            
            // Remove active class from all tabs and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            button.classList.add('active');
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
                
                // Load content for specific tabs
                if (targetTab === 'news') {
                    loadNews();
                } else if (targetTab === 'watchlist') {
                    renderWatchlist();
                }
            }
        });
    });
}

// News functionality
async function loadNews() {
    const newsList = document.getElementById('newsList');
    if (!newsList) return;

    try {
        newsList.innerHTML = '<div style="text-align: center; padding: 2rem;">Loading Indian market news...</div>';
        
        const news = await fetchNews();
        
        if (news.length === 0) {
            newsList.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--muted-foreground);">No news available at the moment.</div>';
            return;
        }

        newsList.innerHTML = news.map(article => {
            const date = new Date(article.datetime * 1000);
            const timeAgo = getTimeAgo(date);
            
            return `
                <div class="news-item" onclick="window.open('${article.url}', '_blank')">
                    <h4 class="news-title">${article.headline}</h4>
                    <p class="news-summary" style="font-size: 0.875rem; color: var(--muted-foreground); margin: 0.5rem 0;">
                        ${article.summary && article.summary.length > 150 ? article.summary.substring(0, 150) + '...' : article.summary || 'Click to read more...'}
                    </p>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem;">
                        <span class="news-source" style="font-size: 0.75rem; color: var(--muted-foreground);">${article.source}</span>
                        <span class="news-time">${timeAgo}</span>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading news:', error);
        newsList.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--red);">Error loading news. Please try again later.</div>';
    }
}

function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        return `${Math.max(1, diffMinutes)} minute${diffMinutes > 1 ? 's' : ''} ago`;
    }
}

// Auto-refresh functionality (Problem Statement Requirement 5)
function startPriceUpdates() {
    if (priceUpdateInterval) {
        clearInterval(priceUpdateInterval);
    }

    // Auto-refresh every 5 seconds as per requirement
    priceUpdateInterval = setInterval(async () => {
        if (selectedStock?.symbol) {
            const quote = await fetchQuote(selectedStock.symbol);
            if (quote && quote.c !== 0) {
                selectedStock.price = quote.c;
                selectedStock.change = quote.d;
                selectedStock.changePercent = quote.dp;
                selectedStock.volume = quote.v;
                selectedStock.high = quote.h;
                selectedStock.low = quote.l;

                renderSelectedStock();
                updateChart();
            }
        }

        // Update market overview
        if (Math.random() < 0.3) { // 30% chance each interval to reduce API calls
            loadMarketOverview();
        }

        // Update trending and watchlist prices less frequently
        if (Math.random() < 0.2) { // 20% chance each interval
            loadTrendingPrices();
            loadWatchlistPrices();
        }
    }, 5000); // 5 seconds interval as per requirement
}

function stopPriceUpdates() {
    if (priceUpdateInterval) {
        clearInterval(priceUpdateInterval);
        priceUpdateInterval = null;
    }
}

// API Key validation and initialization
function validateApiKey() {
    if (!API_KEY || API_KEY === '') {
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="card" style="text-align: center; padding: 3rem;">
                    <h2>🔑 API Key Required</h2>
                    <p style="margin: 1rem 0; color: var(--muted-foreground);">
                        To use this Indian stock tracker, you need to:
                    </p>
                    <ol style="text-align: left; max-width: 400px; margin: 0 auto; line-height: 1.8;">
                        <li>Get a free API key from <a href="https://finnhub.io" target="_blank" style="color: var(--primary); text-decoration: underline;">Finnhub.io</a></li>
                        <li>Open <code>script.js</code> file</li>
                        <li>Replace the empty <code>API_KEY</code> variable with your actual API key</li>
                        <li>Refresh the page</li>
                    </ol>
                    <p style="margin-top: 1.5rem; font-size: 0.875rem; color: var(--muted-foreground);">
                        This app is designed for Indian stock market with NSE symbols like TCS.NS, RELIANCE.NS, etc.
                    </p>
                </div>
            `;
        }
        return false;
    }
    return true;
}

// Initialize application
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Initializing Indian Stock Tracker...');
    
    // Check if we're on the dashboard page
    const isDashboard = window.location.pathname.includes('dashboard') || document.getElementById('selectedSymbol');
    
    if (isDashboard) {
        // Validate API key first
        if (!validateApiKey()) {
            return;
        }

        try {
            // Load watchlist from memory
            watchlist = loadWatchlist();
            
            // Setup components
            setupTabs();
            setupSearch();
            
            // Load market overview
            await loadMarketOverview();
            
            // Render initial content
            renderTrendingList();
            renderWatchlist();
            
            // Select default stock (TCS)
            await selectStock(selectedStock.symbol, selectedStock.name);
            
            // Start auto-refresh (Problem Statement Requirement 5)
            startPriceUpdates();
            
            console.log('Indian Stock Tracker initialized successfully');
        } catch (error) {
            console.error('Error initializing dashboard:', error);
            const mainContent = document.querySelector('.main-content');
            if (mainContent) {
                mainContent.innerHTML = `
                    <div class="card" style="text-align: center; padding: 3rem;">
                        <h2>⚠️ Initialization Error</h2>
                        <p style="margin: 1rem 0; color: var(--muted-foreground);">
                            There was an error loading the stock tracker. Please check:
                        </p>
                        <ul style="text-align: left; max-width: 400px; margin: 0 auto;">
                            <li>Your internet connection</li>
                            <li>API key is valid</li>
                            <li>Console for detailed error messages</li>
                        </ul>
                        <button class="btn btn-primary" onclick="location.reload()" style="margin-top: 1rem;">
                            Retry
                        </button>
                    </div>
                `;
            }
        }
    } else {
        // We're on the homepage - just log that we're ready
        console.log('Homepage loaded - navigation ready');
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    stopPriceUpdates();
});

// Error handling for API failures
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
});

// Make functions globally available for HTML onclick handlers
window.selectStock = selectStock;
window.toggleSelectedWatchlist = toggleSelectedWatchlist;
window.addToWatchlist = addToWatchlist;
window.removeFromWatchlist = removeFromWatchlist;
window.goToHomepage = goToHomepage;
window.goToDashboard = goToDashboard; // FIXED: Added missing function to global scope
window.selectStockFromSearch = selectStockFromSearch;
