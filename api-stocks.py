from alpha_vantage.timeseries import TimeSeries
from alpha_vantage.techindicators import TechIndicators
import pandas as pd

# Your Alpha Vantage API key
api_key = 'VEBKL1ITL7X4EGH7'

# Initialize TimeSeries instance for stock data
ts = TimeSeries(key=api_key, output_format='pandas')

# Retrieve daily time series data for a stock (e.g., Apple Inc., symbol: 'AAPL')
stock_symbol = 'AAPL'
data, meta_data = ts.get_daily(symbol=stock_symbol, outputsize='full')

# Initialize TechIndicators instance for technical indicators
ti = TechIndicators(key=api_key, output_format='pandas')

# Calculate Simple Moving Average (SMA) for the stock
sma_data, sma_meta_data = ti.get_sma(symbol=stock_symbol, interval='daily', time_period=20, series_type='close')

# Display the first few rows of the SMA and the stock data
print(sma_data.head())
print(data.head())
