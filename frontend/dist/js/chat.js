"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ChatInterface = /** @class */ (function () {
    function ChatInterface() {
        this.messages = [];
        this.sessionStartTime = null;
        this.sessionDuration = 15 * 60 * 1000; // 15 minutes in milliseconds
        this.timerInterval = null;
        this.socket = null;
        // Initialize DOM elements
        this.chatContainer = document.getElementById('chat-container');
        this.chatMessages = document.getElementById('chat-messages');
        this.messageInput = document.getElementById('message-input');
        this.chatForm = document.getElementById('chat-form');
        this.typingIndicator = document.getElementById('typing-indicator');
        this.closeButton = document.getElementById('close-chat');
        this.timerElement = document.getElementById('timer');
        // Initialize event listeners
        this.initEventListeners();
    }
    ChatInterface.prototype.initEventListeners = function () {
        var _this = this;
        // Try It buttons
        var tryItButton = document.getElementById('try-it-button');
        var mainTryButton = document.getElementById('main-try-button');
        if (tryItButton) {
            tryItButton.addEventListener('click', function () { return _this.openChat(); });
        }
        if (mainTryButton) {
            mainTryButton.addEventListener('click', function () { return _this.openChat(); });
        }
        // Close button
        this.closeButton.addEventListener('click', function () { return _this.closeChat(); });
        // Form submission
        this.chatForm.addEventListener('submit', function (e) {
            e.preventDefault();
            _this.sendMessage();
        });
    };
    ChatInterface.prototype.openChat = function () {
        // Show chat container with animation
        this.chatContainer.classList.remove('hidden');
        this.chatContainer.classList.add('chat-enter-active');
        // Start session timer
        this.startSessionTimer();
        // Connect to WebSocket
        this.connectWebSocket();
    };
    ChatInterface.prototype.closeChat = function () {
        var _this = this;
        // Hide chat container with animation
        this.chatContainer.classList.add('chat-exit-active');
        setTimeout(function () {
            _this.chatContainer.classList.add('hidden');
            _this.chatContainer.classList.remove('chat-exit-active');
        }, 300);
        // Clear timer
        this.clearSessionTimer();
        // Disconnect WebSocket
        this.disconnectWebSocket();
    };
    ChatInterface.prototype.startSessionTimer = function () {
        var _this = this;
        this.sessionStartTime = new Date();
        // Update timer every second
        this.timerInterval = window.setInterval(function () {
            if (!_this.sessionStartTime)
                return;
            var elapsedTime = Date.now() - _this.sessionStartTime.getTime();
            var remainingTime = Math.max(0, _this.sessionDuration - elapsedTime);
            // Format remaining time as MM:SS
            var minutes = Math.floor(remainingTime / 60000);
            var seconds = Math.floor((remainingTime % 60000) / 1000);
            _this.timerElement.textContent = "".concat(minutes, ":").concat(seconds.toString().padStart(2, '0'));
            // End session if time is up
            if (remainingTime <= 0) {
                _this.endSession();
            }
        }, 1000);
    };
    ChatInterface.prototype.clearSessionTimer = function () {
        if (this.timerInterval !== null) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        this.sessionStartTime = null;
    };
    ChatInterface.prototype.endSession = function () {
        // Add system message
        this.addMessage({
            type: 'bot',
            text: 'Your free session has ended. Thank you for chatting with ChadCan.Help!',
            timestamp: new Date()
        });
        // Disable input
        this.messageInput.disabled = true;
        // Clear timer
        this.clearSessionTimer();
        // Disconnect WebSocket
        this.disconnectWebSocket();
    };
    ChatInterface.prototype.connectWebSocket = function () {
        var _this = this;
        // In a real implementation, this would connect to the backend WebSocket server
        // For now, we'll simulate the connection
        console.log('Connecting to WebSocket server...');
        // Simulate connection delay
        setTimeout(function () {
            console.log('WebSocket connected');
            // Add welcome message
            _this.addMessage({
                type: 'bot',
                text: 'Hi there! How can I help you today?',
                timestamp: new Date()
            });
        }, 500);
    };
    ChatInterface.prototype.disconnectWebSocket = function () {
        // In a real implementation, this would disconnect from the backend WebSocket server
        console.log('Disconnecting from WebSocket server...');
        this.socket = null;
    };
    ChatInterface.prototype.sendMessage = function () {
        var messageText = this.messageInput.value.trim();
        if (!messageText)
            return;
        // Add user message to chat
        var message = {
            type: 'user',
            text: messageText,
            timestamp: new Date()
        };
        this.addMessage(message);
        // Clear input
        this.messageInput.value = '';
        // Show typing indicator
        this.showTypingIndicator();
        // Simulate bot response (in real implementation, this would come from the WebSocket)
        this.simulateBotResponse(messageText);
    };
    ChatInterface.prototype.addMessage = function (message) {
        // Add to messages array
        this.messages.push(message);
        // Create message element
        var messageElement = document.createElement('div');
        messageElement.className = "chat-message ".concat(message.type);
        if (message.type === 'user') {
            messageElement.innerHTML = "\n                <div class=\"flex items-end justify-end\">\n                    <div class=\"flex flex-col space-y-2 text-sm max-w-xs mx-2 order-1 items-end\">\n                        <div>\n                            <span class=\"px-4 py-2 rounded-lg inline-block rounded-br-none bg-blue-100 text-gray-800\">\n                                ".concat(this.escapeHtml(message.text), "\n                            </span>\n                        </div>\n                    </div>\n                    <img src=\"https://ui-avatars.com/api/?name=User&background=3B82F6&color=fff\" alt=\"User avatar\" class=\"w-8 h-8 rounded-full order-2\">\n                </div>\n            ");
        }
        else {
            messageElement.innerHTML = "\n                <div class=\"flex items-end\">\n                    <div class=\"flex flex-col space-y-2 text-sm max-w-xs mx-2 order-2 items-start\">\n                        <div>\n                            <span class=\"px-4 py-2 rounded-lg inline-block rounded-bl-none bg-blue-600 text-white\">\n                                ".concat(this.escapeHtml(message.text), "\n                            </span>\n                        </div>\n                    </div>\n                    <img src=\"https://ui-avatars.com/api/?name=Chad&background=4F46E5&color=fff\" alt=\"Bot avatar\" class=\"w-8 h-8 rounded-full order-1\">\n                </div>\n            ");
        }
        // Add to DOM
        this.chatMessages.appendChild(messageElement);
        // Scroll to bottom
        this.scrollToBottom();
    };
    ChatInterface.prototype.escapeHtml = function (text) {
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };
    ChatInterface.prototype.showTypingIndicator = function () {
        this.typingIndicator.classList.remove('hidden');
        this.scrollToBottom();
    };
    ChatInterface.prototype.hideTypingIndicator = function () {
        this.typingIndicator.classList.add('hidden');
    };
    ChatInterface.prototype.scrollToBottom = function () {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    };
    ChatInterface.prototype.simulateBotResponse = function (userMessage) {
        var _this = this;
        // In a real implementation, this would be replaced with actual API calls
        // Simulate thinking time
        var thinkingTime = 1000 + Math.random() * 2000;
        setTimeout(function () {
            // Hide typing indicator
            _this.hideTypingIndicator();
            // Generate a response based on user message
            var response = '';
            if (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hi')) {
                response = 'Hello! How can I assist you today?';
            }
            else if (userMessage.toLowerCase().includes('help')) {
                response = 'I\'m here to help! What do you need assistance with?';
            }
            else if (userMessage.toLowerCase().includes('bye') || userMessage.toLowerCase().includes('goodbye')) {
                response = 'Goodbye! Feel free to come back if you have more questions.';
            }
            else if (userMessage.toLowerCase().includes('thank')) {
                response = 'You\'re welcome! Is there anything else I can help with?';
            }
            else {
                // Default responses
                var defaultResponses = [
                    'I understand your question. Let me help you with that.',
                    'That\'s an interesting question. Here\'s what I know:',
                    'I\'d be happy to assist with that. Here\'s some information:',
                    'Great question! Here\'s what I can tell you:',
                    'I can help with that. Here\'s my response:'
                ];
                response = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
                response += ' This is a simulated response. In the actual implementation, this would be powered by the OpenAI API.';
            }
            // Add bot message
            _this.addMessage({
                type: 'bot',
                text: response,
                timestamp: new Date()
            });
        }, thinkingTime);
    };
    return ChatInterface;
}());
// Initialize chat interface when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    var chat = new ChatInterface();
});
