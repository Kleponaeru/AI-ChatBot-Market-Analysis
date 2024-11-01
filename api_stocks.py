from alpha_vantage.timeseries import TimeSeries
from alpha_vantage.techindicators import TechIndicators
import pandas as pd

# Your Alpha Vantage API key
api_key = 'VEBKL1ITL7X4EGH7'

# Initialize TimeSeries instance for stock data
ts = TimeSeries(key=api_key, output_format='pandas')

# Initialize TechIndicators instance for technical indicators
ti = TechIndicators(key=api_key, output_format='pandas')

def get_stock_data(stock_symbol):
    """Retrieve daily stock data and its SMA."""
    try:
        # Retrieve daily time series data for a stock
        data, meta_data = ts.get_daily(symbol=stock_symbol, outputsize='full')

        # Calculate Simple Moving Average (SMA) for the stock
        sma_data, sma_meta_data = ti.get_sma(symbol=stock_symbol, interval='daily', time_period=20, series_type='close')

        return data, sma_data  # Return both data and SMA
    except Exception as e:
        print(f"Error fetching stock data: {str(e)}")
        return None, None  # Return None if there's an error
