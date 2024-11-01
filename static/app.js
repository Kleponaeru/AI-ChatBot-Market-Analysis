let priceChart = null;
let volumeChart = null;

// Show/hide crypto-specific controls
document.getElementById("dataType").addEventListener("change", function (e) {
  const cryptoElements = document.querySelectorAll(".crypto-only");
  cryptoElements.forEach((el) => {
    el.style.display = e.target.value === "crypto" ? "block" : "none";
  });
});

async function fetchData() {
  const dataType = document.getElementById("dataType").value;
  const symbol = document.getElementById("symbol").value.toUpperCase();
  const market = document.getElementById("market").value;
  const cacheKey = `${dataType}_${symbol}_${market}`;

  // Check local storage for cached data
  const cachedData = localStorage.getItem(cacheKey);
  if (cachedData) {
    updateDashboard(JSON.parse(cachedData));
    showError("");
    document.getElementById("dataContainer").classList.remove("hidden");
    return;
  }

  if (!symbol) {
    showError("Please enter a symbol");
    return;
  }

  showLoading(true);
  try {
    const endpoint =
      dataType === "crypto"
        ? `/api/crypto/${symbol}/${market}`
        : `/api/stock/${symbol}`;

    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }

    const data = await response.json();
    console.log("Fetched data:", data); // Log the fetched data for debugging

    // Cache the data in local storage
    localStorage.setItem(cacheKey, JSON.stringify(data));

    updateDashboard(data);
    showError("");
    document.getElementById("dataContainer").classList.remove("hidden");
  } catch (error) {
    showError("Error fetching data: " + error.message);
    document.getElementById("dataContainer").classList.add("hidden");
  } finally {
    showLoading(false);
  }
}

function updateDashboard(data) {
  // Ensure data has necessary properties
  if (
    !data ||
    !data.daily_data ||
    !Array.isArray(data.daily_data) ||
    data.daily_data.length === 0
  ) {
    showError("Invalid data format received from API.");
    return;
  }

  // Handle the exchange rate data
  const exchangeRateData = data.exchange_rate;

  // Check if exchange_rate is null
  if (exchangeRateData === null || !exchangeRateData.exchange_rate) {
    showError("Exchange rate data is currently unavailable.");
    console.log("Exchange Rate Data is null or missing");
    document.getElementById("currentPrice").textContent = "-";
    document.getElementById("volume").textContent = "-";
    document.getElementById("highPrice").textContent = "-";
    document.getElementById("lowPrice").textContent = "-";
    return; // Exit the function early
  }

  // Extract current price from the exchange rate data
  const currentPriceRaw = exchangeRateData.exchange_rate; // Accessing the correct property
  const currentPrice = parseFloat(currentPriceRaw) || "-"; // Use parseFloat to convert to number

  // Extract the latest entry for volume, high, and low prices
  const latestData = data.daily_data[data.daily_data.length - 1]; // Most recent data point
  const volume = latestData.volume || "-"; // Default to "-" if undefined
  const highPrice = latestData.high || "-"; // Default to "-" if undefined
  const lowPrice = latestData.low || "-"; // Default to "-" if undefined

  // Log extracted values for debugging
  console.log("Current Price:", currentPrice);
  console.log("High Price:", highPrice);
  console.log("Low Price:", lowPrice);
  console.log("Volume:", volume);

  // Update stats text
  document.getElementById("currentPrice").textContent =
    currentPrice === "-" ? "-" : formatPrice(currentPrice);
  document.getElementById("volume").textContent =
    volume === "-" ? "-" : formatVolume(volume);
  document.getElementById("highPrice").textContent =
    highPrice === "-" ? "-" : formatPrice(highPrice);
  document.getElementById("lowPrice").textContent =
    lowPrice === "-" ? "-" : formatPrice(lowPrice);

  // Calculate and update price change only if current price is valid
  const priceChange = currentPrice !== "-" ? calculatePriceChange(data) : 0;
  const priceChangeElement = document.getElementById("priceChange");
  priceChangeElement.textContent =
    currentPrice === "-" ? "-" : formatPriceChange(priceChange);
  priceChangeElement.className =
    currentPrice === "-"
      ? "stat-change"
      : `stat-change ${priceChange >= 0 ? "positive" : "negative"}`;
}

function calculatePriceChange(data) {
  const currentPrice = parseFloat(data.exchange_rate?.exchange_rate) || 0; // Updated to handle case where exchange_rate is null
  const previousPrice = 0; // You may want to implement fetching historical data for comparison
  if (previousPrice === 0) {
    return 0; // Avoid division by zero
  }
  return ((currentPrice - previousPrice) / previousPrice) * 100;
}

// Utility functions
function formatPrice(price) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

function formatPriceChange(change) {
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(2)}%`;
}

function formatVolume(volume) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
  }).format(volume);
}

function showError(message) {
  const errorElement = document.getElementById("errorMessage");
  errorElement.textContent = message;
  errorElement.style.display = message ? "block" : "none";
}

function showLoading(show) {
  document.getElementById("loading").style.display = show ? "flex" : "none";
}

// Initialize timeframe buttons
document.querySelectorAll(".timeframe-button").forEach((button) => {
  button.addEventListener("click", () => {
    document
      .querySelectorAll(".timeframe-button")
      .forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    fetchData(); // Refetch data with new timeframe
  });
});

const mockData = {
  daily_data: [
    { volume: 3500, high: 73835.57, low: 35633 },
    // More data points if needed...
  ],
  exchange_rate: {
    exchange_rate: "69329.19",
    from_currency: "BTC",
    to_currency: "USD",
  },
};
updateDashboard(mockData);
