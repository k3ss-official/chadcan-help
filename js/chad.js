, /**
 * ChadCan.Help - Chad AI Chatbot
 * Contains all logic for the AI chatbot assistant
 */


// Global variables
let chatContext = 'general';
let freeTimeLeft = 600; // 10 minutes in seconds
let timerInterval;
let chatHistory = [];

// Initialize maps and dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeUKMap();
    initializeWorldMap();
    startLiveCounters();
    startActivityFeed();
});

// UK Map with threat levels
function initializeUKMap() {
    const ukMap = L.map('ukMap').setView([54.5, -3.5], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(ukMap);

    // Add threat markers for major cities
    const threats = [
        {name: 'London', coords: [51.5074, -0.1278], level: 'high', count: 892},
        {name: 'Manchester', coords: [53.4808, -2.2426], level: 'high', count: 467},
        {name: 'Birmingham', coords: [52.4862, -1.8904], level: 'medium', count: 334},
        {name: 'Leeds', coords: [53.8008, -1.5491], level: 'medium', count: 289},
        {name: 'Glasgow', coords: [55.8642, -4.2518], level: 'medium', count: 245},
        {name: 'Liverpool', coords: [53.4084, -2.9916], level: 'low', count: 156}
    ];

    threats.forEach(threat => {
        const color = threat.level === 'high' ? '#dc2626' : threat.level === 'medium' ? '#f59e0b' : '#16a34a';

        L.circleMarker(threat.coords, {
            radius: Math.sqrt(threat.count) / 3,
            fillColor: color,
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.6
        }).addTo(ukMap).bindPopup(`
            <strong>${threat.name}</strong><br>
            Threat Level: ${threat.level.toUpperCase()}<br>
            Reports: ${threat.count} this week
        `);
    });
}

// World Map showing scam origins
function initializeWorldMap() {
    const worldMap = L.map('worldMap').setView([20, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(worldMap);

    // Major scam source regions (anonymized)
    const sources = [
        {region: 'Southeast Asia', coords: [10, 105], count: 1234, description: 'Tech support & romance scams'},
        {region: 'Eastern Europe', coords: [50, 25], count: 892, description: 'Crypto investment fraud'},
        {region: 'West Africa', coords: [10, -5], count: 567, description: 'Advance fee & romance scams'},
        {region: 'North America', coords: [45, -100], count: 445, description: 'Fake marketplace listings'},
        {region: 'South America', coords: [-15, -60], count: 289, description: 'Social media impersonation'}
    ];

    sources.forEach(source => {
        L.circleMarker(source.coords, {
            radius: Math.sqrt(source.count) / 4,
            fillColor: '#dc2626',
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.5
        }).addTo(worldMap).bindPopup(`
            <strong>${source.region}</strong><br>
            Targeting UK: ${source.count} reports<br>
            Primary: ${source.description}
        `);
    });
}

// Live counter animations
function startLiveCounters() {
    setInterval(() => {
        const scamsToday = document.getElementById('scamsToday');
        const currentCount = parseInt(scamsToday.textContent.replace(',', ''));
        scamsToday.textContent = (currentCount + Math.floor(Math.random() * 3) + 1).toLocaleString();

        // Update money lost
        const moneyLost = document.getElementById('moneyLost');
        const currentMoney = parseInt(moneyLost.textContent.replace(/[£k,]/g, ''));
        moneyLost.textContent = '£' + (currentMoney + Math.floor(Math.random() * 5) + 1) + 'k';

        // Update users protected
        const usersProtected = document.getElementById('usersProtected');
        const currentUsers = parseInt(usersProtected.textContent.replace(',', ''));
        usersProtected.textContent = (currentUsers + Math.floor(Math.random() * 2) + 1).toLocaleString();
    }, 5000);
}

// Live activity feed
function startActivityFeed() {
    const activities = [
        '🚨 Romance scam reported in Leeds - £3,200 lost',
        '🔴 Fake tracking site blocked: delivery-track-uk.com',
        '⚠️ Celebrity crypto scam surge detected',
        '✅ 47 users protected via Chad intervention',
        '🚨 Facebook Marketplace fraud in Birmingham - £850 lost',
        '🔴 Tech support scam attempt blocked',
        '⚠️ Fake HMRC email campaign detected',
        '✅ Suspicious tracking number identified',
        '🚨 WhatsApp romance scam in Manchester',
        '🔴 Fake parcel delivery site taken down'
    ];

    const feed = document.getElementById('activityFeed');

    function addActivity() {
        const activity = activities[Math.floor(Math.random() * activities.length)];
        const timeAgo = Math.floor(Math.random() * 30) + 1;

        const activityDiv = document.createElement('div');
        activityDiv.className = 'flex items-center justify-between p-3 bg-white rounded border-l-4 border-blue-500';
        activityDiv.innerHTML = `
            <span class="text-sm">${activity}</span>
            <span class="text-xs text-gray-500">${timeAgo} mins ago</span>
        `;

        feed.insertBefore(activityDiv, feed.firstChild);

        // Keep only last 10 activities
        while (feed.children.length > 10) {
            feed.removeChild(feed.lastChild);
        }
    }

    // Add initial activities
    for (let i = 0; i < 5; i++) {
        setTimeout(addActivity, i * 1000);
    }

    // Continue adding every 10 seconds
    setInterval(addActivity, 10000);
}

// Agreement modal functions
function showAgreement() {
    document.getElementById('agreementModal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('agreementModal').classList.add('hidden');
}

// Chad session functions
function startChadSession() {
    closeModal();
    document.getElementById('chatModal').classList.remove('hidden');
    startFreeTimer();
    initializeChat();
}

function openChadWithContext(context) {
    chatContext = context;
    showAgreement();
}

function initializeChat() {
    const messages = document.getElementById('chatMessages');
    const contextMessages = {
        'romance': 'I notice you clicked on "Romance Scams" - do you think you might have been targeted by someone online who\'s asking for money or seems too good to be true?',
        'marketplace': 'I see you clicked on "Facebook Marketplace Scams" - are you concerned about a seller or buyer you\'ve been dealing with? Maybe someone asking for unusual payment methods?',
        'parcel': 'I notice you clicked on "Fake Parcel Tracking" - have you received a suspicious text or email about a delivery, maybe asking for customs fees?',
        'crypto': 'I see you clicked on "Fake Crypto Investment" - have you seen ads featuring celebrities promoting investment opportunities?',
        'tech_support': 'I notice you clicked on "Tech Support Scams" - have you received unexpected calls about computer problems or been asked to install remote access software?',
        'customs': 'I see you clicked on "Fake Customs/HMRC" - have you received messages asking for payment of customs fees or tax refunds?',
        'general': 'How can I help you today?'
    };

    // Initial greeting
    addMessage('chad', `Hi there! I'm Chad, your AI scam detection assistant.

I'm here to help you figure out if something suspicious might be a scam. Don't worry about being technical - just type and speak normally with me. Welcome to the AI age!

${contextMessages[chatContext]}`);
}

function addMessage(sender, text, typing = false) {
    const messages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');

    if (sender === 'chad') {
        messageDiv.className = 'flex items-start space-x-3';
        messageDiv.innerHTML = `
            <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <i class="fas fa-robot text-white text-sm"></i>
            </div>
            <div class="chat-bubble bg-white rounded-lg p-3 shadow border ${typing ? 'typing-indicator' : ''}">
                ${typing ? '<span>Chad is typing...</span>' : `<p class="text-gray-800 whitespace-pre-wrap">${text}</p>`}
            </div>
        `;
    } else {
        messageDiv.className = 'flex items-start space-x-3 justify-end';
        messageDiv.innerHTML = `
            <div class="chat-bubble bg-blue-600 text-white rounded-lg p-3">
                <p class="whitespace-pre-wrap">${text}</p>
            </div>
            <div class="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
                <i class="fas fa-user text-white text-sm"></i>
            </div>
        `;
    }

    messages.appendChild(messageDiv);
    messages.scrollTop = messages.scrollHeight;

    if (typing) {
        setTimeout(() => {
            messageDiv.remove();
        }, 2000);
    }

    return messageDiv;
}

async function sendMessage() {
    const input = document.getElementById('chatInput');
    const userMessage = input.value.trim();

    if (!userMessage) return;

    addMessage('user', userMessage);
    // Use {role: 'user', content: userMessage} for chatHistory
    chatHistory.push({ role: 'user', content: userMessage });

    input.value = '';
    const typingIndicator = addMessage('chad', '', true); // Add typing indicator

    try {
        // Prepare history for the API: map 'sender' to 'role' and 'message' to 'content'
        // The API expects history *before* the current user message.
        // However, our current chatHistory includes the latest user message.
        // The backend server.js expects `history` and then adds the latest `message` from the request body.
        // So, we should send the history *including* the latest user message if the backend is structured that way,
        // or exclude the last user message from history and send it as 'message'.
        // The server.js is: messages: [{ system }, ...history, { user, messageFromReqBody }]
        // So, history sent should NOT include the current userMessage.
        const historyForAPI = chatHistory.slice(0, -1).map(item => {
            return { role: item.role, content: item.content };
        });

        const requestBody = {
            message: userMessage, // Current user message
            history: historyForAPI, // History before current message
            options: {
                systemPrompt: 'You are Chad, a friendly AI scam detection expert. Your mission is to protect ordinary people from scammers while being supportive, never judgmental, and always liability-conscious. Remind users to dial 159 to connect safely with their bank if they suspect bank fraud.',
                maxTokens: 500,
                temperature: 0.7
            }
        };

        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (typingIndicator) typingIndicator.remove(); // Remove typing indicator

        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error:', errorData);
            throw new Error(errorData.error?.message || errorData.error || 'Failed to get response from Chad.');
        }

        const data = await response.json();
        const aiResponseText = data.choices[0].message.content;

        addMessage('chad', aiResponseText);
        // Use {role: 'assistant', content: aiResponseText} for chatHistory
        chatHistory.push({ role: 'assistant', content: aiResponseText });

    } catch (error) {
        console.error('Error sending message to API:', error);
        if (typingIndicator) typingIndicator.remove(); // Ensure removal on error
        addMessage('chad', `Sorry, I encountered an error: ${error.message}. Please check the console for details and try again.`);
        // Optionally, don't add the error message to chat history, or add it with a specific role like 'error'
    }
}

function generateChadResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();

    // Scam analysis responses
    if (lowerMessage.includes('tracking') || lowerMessage.includes('parcel') || lowerMessage.includes('delivery')) {
        return `I can help you check that tracking information. Could you share:

• The tracking number you received
• The website you're being directed to
• The company claiming to have your parcel

Based on my analysis, I'll give you a detailed report with red flags and next steps. Remember - if anyone's asking for customs fees via email or text, that's almost certainly a scam.

And if you're ever unsure about anything - dial 159 to speak safely to your bank.`;
    }

    if (lowerMessage.includes('romance') || lowerMessage.includes('dating') || lowerMessage.includes('relationship')) {
        return `I understand this might be difficult to talk about. Romance scams are incredibly sophisticated now.

Can you tell me:
• How did you meet this person?
• Have they asked for money or financial help?
• Do they avoid video calls or meeting in person?
• Are they claiming to be travelling/military/working abroad?

Based on what you share, I'll provide a thorough analysis. Remember, genuine people don't ask for money from someone they've never met face-to-face.

If you've sent money already, we need to act fast - contact your bank immediately or dial 159.`;
    }

    if (lowerMessage.includes('facebook') || lowerMessage.includes('marketplace') || lowerMessage.includes('buying') || lowerMessage.includes('selling')) {
        return `Facebook Marketplace has become a hotspot for scams - 73% of purchase fraud happens there.

Tell me about your situation:
• What are you trying to buy/sell?
• How does the other person want to pay?
• Are they asking you to pay through unusual methods?
• Do they refuse to meet in person?

I'll analyze everything and give you a detailed risk assessment.

If you've already paid and something feels wrong, contact your bank immediately or dial 159 for safe connection to your bank's fraud team.`;
    }

    // General supportive response
    return `I'm here to help you figure this out. Can you tell me more about what's happening?

For example:
• What kind of message or contact did you receive?
• Are they asking for money or personal information?
• Does something just feel "off" about the situation?

The more details you can share, the better I can analyze whether this shows signs of a scam. Don't worry - you're doing the right thing by checking.

Remember: When in doubt, dial 159 to speak safely to your bank.`;
}

function startFreeTimer() {
    timerInterval = setInterval(() => {
        freeTimeLeft--;
        const minutes = Math.floor(freeTimeLeft / 60);
        const seconds = freeTimeLeft % 60;
        document.getElementById('freeTimer').textContent =
            `${minutes}:${seconds.toString().padStart(2, '0')}`;

        if (freeTimeLeft === 120) { // 2 minutes left
            addMessage('chad', `Just to let you know - you're coming up to the end of your free 10 minutes.

But I think we can wrap this up soon, so if you're cool with it, the next 10 minutes are on me. No charge - just feels right.

If it looks like it'll go longer, I'll give you the option to continue - totally your call.`);
        }

        if (freeTimeLeft <= 0) {
            clearInterval(timerInterval);
            offerEmailSummary();
        }
    }, 1000);
}

function offerEmailSummary() {
    addMessage('chad', `That's your free time up!

Before we finish, I need to email you everything we've discussed. Once you close this window, our conversation will be completely deleted for your privacy.

Would you like me to email you:
• Complete conversation summary
• Any findings and recommendations
• Relevant contact numbers and next steps

Just click "Email Summary" below and I'll prepare everything for you.`);

    // Add email button (in real implementation, this would be a proper button)
    const messages = document.getElementById('chatMessages');
    const buttonDiv = document.createElement('div');
    buttonDiv.className = 'flex justify-center mt-4';
    buttonDiv.innerHTML = `
        <button onclick="requestEmail()" class="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
            <i class="fas fa-envelope mr-2"></i>Email Summary
        </button>
    `;
    messages.appendChild(buttonDiv);
}

function requestEmail() {
    const email = prompt('Please enter your email address:');
    if (email) {
        addMessage('chad', `Perfect! I've prepared a comprehensive report including:

🚨 SCAM ANALYSIS REPORT
• Complete conversation transcript
• Risk assessment and findings
• Specific red flags identified
• Immediate action recommendations

📞 EMERGENCY CONTACTS
• Your bank: Use 159 if unsure
• Action Fraud: 0300 123 2040
• HMRC Phishing: phishing@hmrc.gov.uk

✅ EMAIL SENT to ${email}

Your data will now be permanently deleted when you close this window. Stay safe!`);
    }
}

function closeChatModal() {
    if (confirm('Are you sure you want to close? All conversation data will be permanently deleted.')) {
        document.getElementById('chatModal').classList.add('hidden');
        if (timerInterval) clearInterval(timerInterval);

        // Reset for next session
        freeTimeLeft = 600;
        chatHistory = [];
        document.getElementById('chatMessages').innerHTML = '';
        chatContext = 'general';
    }
}

// Handle Enter key in chat input
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('chatInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});


