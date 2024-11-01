from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from api_stocks import get_stock_data
from api_crypto import get_daily_crypto_data, get_exchange_rate
from chatbot import chatbot_response 

app = Flask(__name__)
CORS(app)  # Enable CORS if needed

@app.route('/')
def home():
    return render_template('index.html')  # Serve the HTML file

@app.route('/chatbot', methods=['POST'])
def chatbot():
    data = request.json
    question = data.get("question", "")
    response = chatbot_response(question)  # Call your function to get the response
    return jsonify({"response": response})

# Endpoint for stock data
@app.route('/api/stock/<string:symbol>', methods=['GET'])
def stock_data(symbol):
    try:
        data, sma_data = get_stock_data(symbol)
        if data is None or sma_data is None:
            return jsonify({'error': 'Failed to fetch stock data.'}), 500
        
        response_data = {
            'stock_data': data.reset_index().to_dict(orient='records'),
            'sma_data': sma_data.reset_index().to_dict(orient='records')
        }
        return jsonify(response_data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Endpoint for cryptocurrency data
@app.route('/api/crypto/<string:symbol>/<string:market>', methods=['GET'])
def crypto_data(symbol, market):
    try:
        daily_data = get_daily_crypto_data(symbol, market)
        if daily_data is None:
            return jsonify({'error': 'Failed to fetch cryptocurrency data.'}), 500
        
        exchange_rate = get_exchange_rate(symbol, market)
        response_data = {
            'daily_data': daily_data.reset_index().to_dict(orient='records'),
            'exchange_rate': exchange_rate
        }
        return jsonify(response_data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)  # This runs the server in debug mode
