import requests
import pandas as pd
import time

# Your Alpha Vantage API key
api_key = 'VEBKL1ITL7X4EGH7'

# Function to get daily historical data for a cryptocurrency
def get_daily_crypto_data(crypto_symbol, market):
    url = f'https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_DAILY&symbol={crypto_symbol}&market={market}&apikey={api_key}'
    response = requests.get(url)
    data = response.json()

    # Check for errors in the response
    if "Error Message" in data:
        print("Error fetching daily cryptocurrency data:", data["Error Message"])
        return None
    
    # Convert the time series data into a DataFrame
    daily_data = pd.DataFrame.from_dict(data['Time Series (Digital Currency Daily)'], orient='index')
    daily_data.columns = [col.split(' ')[1] for col in daily_data.columns]  # Rename columns
    daily_data = daily_data.astype(float)  # Convert to float
    return daily_data

# Function to get real-time exchange rate between two currencies
def get_exchange_rate(from_currency, to_currency):
    url = f'https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency={from_currency}&to_currency={to_currency}&apikey={api_key}'
    response = requests.get(url)
    data = response.json()

    # Print the full response for debugging
    print("Full exchange rate response:", data)

    # Check for errors in the response
    if "Error Message" in data:
        print(f"Error fetching exchange rate for {from_currency} to {to_currency}:", data["Error Message"])
        return None

    # Check if expected keys exist in the response
    if 'Realtime Currency Exchange Rate' in data:
        exchange_rate = data['Realtime Currency Exchange Rate']
        return {
            'from_currency': exchange_rate.get('1. From_Currency Code', 'N/A'),
            'to_currency': exchange_rate.get('3. To_Currency Code', 'N/A'),
            'exchange_rate': exchange_rate.get('5. Exchange Rate', 'N/A')
        }
    else:
        print("Unexpected response structure:", data)
        return None


# Example usage for exchange rate
if __name__ == "__main__":
    # Define the currencies
    from_currency = 'ETH'
    to_currency = 'USD'
    
    # Get real-time exchange rate for Ethereum to USD
    exchange_rate = get_exchange_rate(from_currency, to_currency)

    if exchange_rate is not None:
        print("\nReal-Time Exchange Rate:")
        print(exchange_rate)

    # Get daily cryptocurrency data for BTC
    crypto_symbol_btc = 'BTC'
    market_btc = 'EUR'
    daily_data_btc = get_daily_crypto_data(crypto_symbol_btc, market_btc)

    if daily_data_btc is not None:
        print("\nDaily Cryptocurrency Data for BTC:")
        print(daily_data_btc.head())

    # Get daily cryptocurrency data for ETH
    crypto_symbol_eth = 'ETH'
    market_eth = 'USD'  # Change this to a suitable market for ETH
    daily_data_eth = get_daily_crypto_data(crypto_symbol_eth, market_eth)

    if daily_data_eth is not None:
        print("\nDaily Cryptocurrency Data for ETH:")
        print(daily_data_eth.head())

    # Pause to avoid hitting the API rate limit
    time.sleep(12)
