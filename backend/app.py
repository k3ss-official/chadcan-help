import os
import time
import json
import uuid
import hashlib
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, render_template, session
from flask_socketio import SocketIO, emit, disconnect
from dotenv import load_dotenv
import openai

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__, static_folder='../frontend/dist', static_url_path='')
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev_secret_key')
app.config['SESSION_COOKIE_SECURE'] = True
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(minutes=15)

# Initialize SocketIO
socketio = SocketIO(app, cors_allowed_origins="*")

# Initialize OpenAI client
openai_api_key = os.getenv('OPENAI_API_KEY', '')
client = openai.OpenAI(api_key=openai_api_key)

# Session storage
active_sessions = {}

# Helper functions
def generate_session_id(request):
    """Generate a unique session ID based on IP and user agent"""
    ip = request.remote_addr
    user_agent = request.headers.get('User-Agent', '')
    unique_string = f"{ip}:{user_agent}:{time.time()}"
    return hashlib.md5(unique_string.encode()).hexdigest()

def is_session_valid(session_id):
    """Check if a session is valid and not expired"""
    if session_id not in active_sessions:
        return False
    
    session_data = active_sessions[session_id]
    start_time = session_data.get('start_time', 0)
    current_time = time.time()
    
    # Check if session has exceeded 15 minutes
    if current_time - start_time > 15 * 60:
        return False
    
    return True

def get_remaining_time(session_id):
    """Get remaining time in seconds for a session"""
    if session_id not in active_sessions:
        return 0
    
    session_data = active_sessions[session_id]
    start_time = session_data.get('start_time', 0)
    current_time = time.time()
    elapsed_time = current_time - start_time
    remaining_time = max(0, 15 * 60 - elapsed_time)
    
    return int(remaining_time)

def create_chat_completion(messages):
    """Create a chat completion using OpenAI API"""
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages,
            max_tokens=500
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"OpenAI API error: {e}")
        return "I'm sorry, I'm having trouble connecting to my brain right now. Please try again in a moment."

# Routes
@app.route('/')
def index():
    """Serve the landing page"""
    return app.send_static_file('index.html')

@app.route('/api/session', methods=['POST'])
def create_session():
    """Create a new chat session"""
    session_id = generate_session_id(request)
    
    # Check if user already has an active session
    if session_id in active_sessions:
        remaining_time = get_remaining_time(session_id)
        if remaining_time > 0:
            return jsonify({
                'session_id': session_id,
                'remaining_time': remaining_time,
                'message': 'Existing session resumed'
            })
    
    # Create new session
    active_sessions[session_id] = {
        'start_time': time.time(),
        'messages': [
            {"role": "system", "content": "You are a helpful assistant for ChadCan.Help. Be friendly, concise, and helpful."}
        ]
    }
    
    # Set session cookie
    session['chat_session_id'] = session_id
    
    return jsonify({
        'session_id': session_id,
        'remaining_time': 15 * 60,
        'message': 'New session created'
    })

# Socket.IO events
@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    session_id = session.get('chat_session_id')
    
    if not session_id or not is_session_valid(session_id):
        # Create a new session if none exists or if expired
        session_id = generate_session_id(request)
        active_sessions[session_id] = {
            'start_time': time.time(),
            'messages': [
                {"role": "system", "content": "You are a helpful assistant for ChadCan.Help. Be friendly, concise, and helpful."}
            ]
        }
        session['chat_session_id'] = session_id
    
    emit('session_update', {
        'session_id': session_id,
        'remaining_time': get_remaining_time(session_id)
    })

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    pass

@socketio.on('message')
def handle_message(data):
    """Handle incoming messages"""
    session_id = session.get('chat_session_id')
    
    if not session_id or not is_session_valid(session_id):
        emit('error', {'message': 'Invalid or expired session'})
        disconnect()
        return
    
    # Get user message
    user_message = data.get('message', '').strip()
    if not user_message:
        return
    
    # Add user message to session history
    session_data = active_sessions[session_id]
    session_data['messages'].append({"role": "user", "content": user_message})
    
    # Send typing indicator
    emit('typing', {'status': True})
    
    # Generate response using OpenAI
    ai_response = create_chat_completion(session_data['messages'])
    
    # Add AI response to session history
    session_data['messages'].append({"role": "assistant", "content": ai_response})
    
    # Send response to client
    emit('message', {
        'text': ai_response,
        'type': 'bot',
        'timestamp': datetime.now().isoformat()
    })
    
    # Stop typing indicator
    emit('typing', {'status': False})
    
    # Send updated remaining time
    emit('session_update', {
        'remaining_time': get_remaining_time(session_id)
    })

@socketio.on('check_session')
def handle_check_session():
    """Check session validity and remaining time"""
    session_id = session.get('chat_session_id')
    
    if not session_id or not is_session_valid(session_id):
        emit('session_expired')
        return
    
    emit('session_update', {
        'remaining_time': get_remaining_time(session_id)
    })

# Error handlers
@app.errorhandler(404)
def not_found(e):
    """Handle 404 errors"""
    return app.send_static_file('index.html')

# Main entry point
if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
