import requests
import json
import pandas as pd
from dotenv import load_dotenv
import os
from api_stocks import get_stock_data  # Make sure to import your stock data function
from api_crypto import get_daily_crypto_data, get_exchange_rate  # Import your crypto functions

load_dotenv()
api_key = os.getenv('GEMINI_API_KEY')
if not api_key:
    raise ValueError("API key not found")

print(api_key)  # Optional: just to verify it's working
ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent"

# Maintain a conversation history
conversation_history = []

# Define your keywords
market_keywords = ["crypto", "cryptocurrency", "bitcoin", "ethereum", "stock", "market", "price", "exchange"]

def extract_symbol(user_input):
    """Extract stock symbol from user input."""
    words = user_input.split()
    for word in words:
        if word.isupper():  # Assuming stock symbols are uppercase
            return word
    return None

def extract_crypto_symbol(user_input):
    """Extract cryptocurrency symbol from user input."""
    words = user_input.split()
    for word in words:
        if word.upper() in ["BTC", "ETH", "LTC"]:  # Adjust this list to include more symbols if needed
            return word.upper()
    return None

def is_market_related(question):
    """Check if the question contains keywords related to market data."""
    return any(keyword in question.lower() for keyword in market_keywords)

def format_stock_data(data):
    """Format stock data for better readability."""
    return "\n".join([
        f"Date: {row['date']} | Open: {row['open']} | High: {row['high']} | Low: {row['low']} | Close: {row['close']} | Volume: {row['volume']}"
        for index, row in data.iterrows()
    ])

def format_crypto_data(daily_data, exchange_rate_info):
    """Format cryptocurrency data and exchange rate for a readable output."""
    
    # Start with a header
    formatted_daily_data = (
        "Date        | Open       | High       | Low        | Close      | Volume\n"
        + "-" * 66 + "\n"
    )
    
    # Loop through the daily data and format each row with line breaks
    for date, row in daily_data.iterrows():
        formatted_daily_data += (
            f"{date} | {row['open']:11.2f} | {row['high']:11.2f} | "
            f"{row['low']:11.2f} | {row['close']:11.2f} | {row['volume']:11.2f}\n"
        )
    
    # Add exchange rate details with a clear separation
    exchange_rate_message = (
        "\nExchange Rate Information:\n"
        f"From: {exchange_rate_info.get('1. From_Currency Code', 'N/A')} "
        f"({exchange_rate_info.get('2. From_Currency Name', 'N/A')})\n"
        f"To: {exchange_rate_info.get('4. To_Currency Name', 'N/A')} "
        f"({exchange_rate_info.get('3. To_Currency Code', 'N/A')})\n"
        f"Rate: {exchange_rate_info.get('5. Exchange Rate', 'N/A')}\n"
        f"Last Refreshed: {exchange_rate_info.get('6. Last Refreshed', 'N/A')}\n"
    )
    
    # Return the final formatted response with separated sections
    return formatted_daily_data + exchange_rate_message

def generate_crypto_outlook(daily_data):
    """Analyze recent trends in crypto data to provide a detailed outlook and suggest a position."""
    if len(daily_data) < 5:
        return "Not enough data for detailed analysis."

    # Get the close prices of recent days to identify a trend
    recent_closes = daily_data['close'].head(5).values
    avg_recent_close = sum(recent_closes) / len(recent_closes)
    
    # Check for basic upward/downward trend
    if all(recent_closes[i] < recent_closes[i + 1] for i in range(len(recent_closes) - 1)):
        trend = "upward"
    elif all(recent_closes[i] > recent_closes[i + 1] for i in range(len(recent_closes) - 1)):
        trend = "downward"
    else:
        trend = "neutral"

    # Calculate volatility: Standard deviation of recent close prices
    volatility = daily_data['close'].head(5).std()
    volatility_threshold = avg_recent_close * 0.02  # Set a volatility threshold (e.g., 2% of average close price)
    is_volatile = volatility > volatility_threshold

    # Suggest a position based on trend and volatility
    if trend == "upward" and not is_volatile:
        recommendation = "Long position recommended. The market shows stable upward momentum with low volatility."
    elif trend == "downward" and not is_volatile:
        recommendation = "Short position recommended. The market shows a stable downward trend with low volatility."
    elif trend == "upward" and is_volatile:
        recommendation = "Consider a cautious long position. The market is trending upward but has high volatility."
    elif trend == "downward" and is_volatile:
        recommendation = "Consider a cautious short position. The market is trending downward with high volatility."
    else:
        recommendation = "No clear trend detected. It may be best to wait for a more stable market signal."

    # Include additional info on recent volatility and trend
    outlook_message = (
        f"Market Analysis:\n"
        f"Trend: {trend.capitalize()} trend over the last 5 days\n"
        f"Average Closing Price: ${avg_recent_close:.2f}\n"
        f"Volatility: {'High' if is_volatile else 'Low'} (Std. Dev: {volatility:.2f})\n\n"
        f"Recommendation: {recommendation}"
    )
    
    return outlook_message
    
def chatbot_response(user_input):
    global conversation_history
    try:
        conversation_history.append({"role": "user", "content": user_input})

        # Handle market-related queries
        if is_market_related(user_input):
            if "crypto" in user_input or "price" in user_input:
                symbol = extract_crypto_symbol(user_input)
                if symbol:
                    market = "usd"
                    print(f"Accessing crypto API for symbol: {symbol}")
                    daily_data = get_daily_crypto_data(symbol, market)
                    exchange_rate = get_exchange_rate(symbol, market)

                    # Get the latest price
                    latest_data = daily_data.iloc[0]  # Assuming the data is sorted with the latest date first
                    latest_price_info = (
                        f"Latest {symbol} Price (in {market.upper()}):\n"
                        f"Date: {latest_data.name} | Open: {latest_data['open']} | High: {latest_data['high']} | "
                        f"Low: {latest_data['low']} | Close: {latest_data['close']} | Volume: {latest_data['volume']}\n"
                    )
                    
                    # Get the outlook
                    outlook = generate_crypto_outlook(daily_data)
                    
                    # Format the full response
                    formatted_crypto_data = format_crypto_data(daily_data, exchange_rate.get('Realtime Currency Exchange Rate', {}))
                    return f"{latest_price_info}\nOutlook: {outlook}\n\n{formatted_crypto_data}"
                
            # Handle other cases or stock data if needed
            return "Please specify if you want stock or crypto data."
        
        # Handle non-market queries
        headers = {"Content-Type": "application/json"}
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": "\n".join([f"{msg['role']}: {msg['content']}" for msg in conversation_history])}
                    ]
                }
            ]
        }
        response = requests.post(
            f"{ENDPOINT}?key={api_key}", headers=headers, data=json.dumps(payload)
        )

        if response.status_code == 200:
            response_data = response.json()
            try:
                generated_text = response_data['candidates'][0]['content']['parts'][0]['text']
                conversation_history.append({"role": "bot", "content": generated_text})
                return generated_text
            except KeyError:
                return "Sorry, I couldn't process that response correctly."
        else:
            return f"Error: {response.status_code}"

    except Exception as e:
        return f"An error occurred: {str(e)}"