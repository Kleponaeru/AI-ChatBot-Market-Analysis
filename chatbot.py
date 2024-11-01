import requests
import json

API_KEY = "AIzaSyC55XEtpoK5KvHgoL6p4o0GuZYGubpWVW0"
ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent"

# Maintain a conversation history
conversation_history = []

def chatbot_response(user_input):
    global conversation_history
    try:
        # Append user input to the conversation history
        conversation_history.append({"role": "user", "content": user_input})

        # Prepare the request to Gemini API
        headers = {
            "Content-Type": "application/json"
        }
        
        # Build the payload with conversation history
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": "\n".join([f"{msg['role']}: {msg['content']}" for msg in conversation_history])}
                    ]
                }
            ]
        }
        
        # Make the request to Gemini
        response = requests.post(
            f"{ENDPOINT}?key={API_KEY}",
            headers=headers,
            data=json.dumps(payload)
        )
        
        # Log the response status code and data for debugging
        print(f"Response Status Code: {response.status_code}")
        print(f"Response Data: {response.text}")
        
        if response.status_code == 200:
            response_data = response.json()
            try:
                generated_text = response_data['candidates'][0]['content']['parts'][0]['text']
                
                # Append bot's response to the conversation history
                conversation_history.append({"role": "bot", "content": generated_text})
                return generated_text
            except KeyError:
                return "Sorry, I couldn't process that response correctly."
        else:
            return f"Error: {response.status_code}"
            
    except Exception as e:
        return f"An error occurred: {str(e)}"
