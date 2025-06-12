document.addEventListener('DOMContentLoaded', () => {
    const askChadBtn = document.getElementById('askChadBtn');
    const chatModalOverlay = document.getElementById('chatModalOverlay');
    const chatModal = document.getElementById('chatModal');
    const messageInput = document.getElementById('messageInput');
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    const messagesArea = document.getElementById('messagesArea');
    const timeLeftDisplay = document.getElementById('timeLeft');
    const pricingOptionsDiv = document.getElementById('pricingOptions');
    const timeAdjustSlider = document.getElementById('timeAdjustSlider');
    const sliderValueDisplay = document.getElementById('sliderValueDisplay');

    let timerInterval;
    let freeTimeLeft = 600; // 10 minutes in seconds, as per original chad.js

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }

    function startTimer() {
        timeLeftDisplay.textContent = formatTime(freeTimeLeft);
        pricingOptionsDiv.style.display = 'none'; // Ensure pricing is hidden when timer starts

        timerInterval = setInterval(() => {
            freeTimeLeft--;
            timeLeftDisplay.textContent = formatTime(freeTimeLeft);

            if (freeTimeLeft <= 0) {
                clearInterval(timerInterval);
                timeLeftDisplay.textContent = "0:00";
                showPricingOptions(); 
            }
            // Add logic here for Chad's randomized free extension offer later
            // e.g., if (freeTimeLeft === 60 && shouldOfferExtension()) { offerFreeExtension(); }

        }, 1000);
    }

    function resetTimer() {
        clearInterval(timerInterval);
        freeTimeLeft = 600; // Reset to initial time
        timeLeftDisplay.textContent = formatTime(freeTimeLeft);
    }

    function openChatModal() {
        chatModalOverlay.classList.remove('hidden');
        chatModal.style.display = 'flex'; // Use flex for the modal's internal layout
        document.body.style.overflow = 'hidden'; // Prevent scrolling of background page tab content
        resetTimer(); // Reset and start timer when modal opens
        startTimer();
        messageInput.focus();
    }

    function initializeSlider() {
        if (timeAdjustSlider && sliderValueDisplay) {
            timeAdjustSlider.max = freeTimeLeft; // Initial freeTimeLeft is 600
            timeAdjustSlider.value = freeTimeLeft;
            sliderValueDisplay.textContent = freeTimeLeft;
        }
    }

    function closeChatModal() {
        chatModalOverlay.classList.add('hidden');
        chatModal.style.display = 'none';
        document.body.style.overflow = ''; // Restore scrolling
        clearInterval(timerInterval);
        // Potentially clear chat history or handle session persistence here
    }

    function showPricingOptions() {
        // This function will be expanded with Chad's specific messaging
        messagesArea.innerHTML += `
            <div class="flex">
                <div class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-3 rounded-lg max-w-xs shadow">
                    <p class="text-sm font-bold">Time's up!</p>
                    <p class="text-sm">Just a heads-up, your initial free 10 minutes are over. If you'd like to continue, you can choose one of the options below. Otherwise, no worries, I'll send you a summary of our chat so far!</p>
                </div>
            </div>`;
        messagesArea.scrollTop = messagesArea.scrollHeight; // Scroll to bottom
        pricingOptionsDiv.style.display = 'block';
        messageInput.disabled = true;
        sendMessageBtn.disabled = true;
    }

    function addUserMessage(message) {
        if (message.trim() === '') return;
        const messageElement = `
            <div class="flex justify-end">
                <div class="bg-blue-600 text-white p-3 rounded-lg max-w-xs shadow">
                    <p class="text-sm">${message}</p>
                </div>
            </div>`;
        messagesArea.innerHTML += messageElement;
        messagesArea.scrollTop = messagesArea.scrollHeight; // Scroll to bottom
        messageInput.value = '';

        // TODO: Send message to Chad (OpenAI API) and display response
        // For now, simulate Chad's response after a delay
        // displayTypingIndicator(true);
        // setTimeout(() => {
        //     addChadMessage("I'm processing that. One moment...");
        //     displayTypingIndicator(false);
        // }, 1000);
    }

    function addChadMessage(message) {
        const messageElement = `
            <div class="flex">
                <div class="bg-gray-200 text-gray-800 p-3 rounded-lg max-w-xs shadow">
                    <p class="text-sm">${message}</p>
                </div>
            </div>`;
        messagesArea.innerHTML += messageElement;
        messagesArea.scrollTop = messagesArea.scrollHeight; // Scroll to bottom
    }

    // function displayTypingIndicator(isTyping) {
    //     const typingIndicator = document.getElementById('typingIndicator');
    //     typingIndicator.style.display = isTyping ? 'block' : 'none';
    // }

    if (askChadBtn) {
        askChadBtn.addEventListener('click', () => {
            initializeSlider(); // Initialize/reset slider when chat opens
            openChatModal();
        });
    }

    // Close modal if user clicks outside of it on the overlay
    if (chatModalOverlay) {
        chatModalOverlay.addEventListener('click', function(event) {
            if (event.target === chatModalOverlay) {
                // Before closing, consider if a payment flow is active or if user should be prompted.
                // For now, simple close. Later, this might need confirmation or to be disabled during certain states.
                // closeChatModal(); 
                // Decided against closing on overlay click for now, to prevent accidental closure,
                // especially when payment options are shown. Flow should be through buttons.
            }
        });
    }

    if (timeAdjustSlider && sliderValueDisplay) {
        timeAdjustSlider.addEventListener('input', () => {
            clearInterval(timerInterval);
            freeTimeLeft = parseInt(timeAdjustSlider.value);
            
            if (timeLeftDisplay && chatModal.style.display === 'flex') {
                 timeLeftDisplay.textContent = formatTime(freeTimeLeft);
            }
            sliderValueDisplay.textContent = freeTimeLeft;

            if (freeTimeLeft <= 0) {
                if (timeLeftDisplay && chatModal.style.display === 'flex') {
                    timeLeftDisplay.textContent = "0:00";
                }
                if (chatModal.style.display === 'flex') { 
                    showPricingOptions();
                }
            } else {
                if (chatModal.style.display === 'flex') { 
                    pricingOptionsDiv.style.display = 'none';
                    if (messageInput) messageInput.disabled = false;
                    if (sendMessageBtn) sendMessageBtn.disabled = false;
                    startTimer(); 
                }
            }
        });
    }

    if (sendMessageBtn && messageInput) {
        sendMessageBtn.addEventListener('click', () => {
            addUserMessage(messageInput.value);
        });

        messageInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                addUserMessage(messageInput.value);
            }
        });
    }
    
    document.querySelectorAll('.pricing-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const tier = event.target.dataset.tier;
            // alert(`Selected tier: ${tier} mins. Payment integration TBD.`);
            addChadMessage(`Great! Let's continue our chat. Your session has been extended.`);
            pricingOptionsDiv.style.display = 'none';
            messageInput.disabled = false;
            sendMessageBtn.disabled = false;
            freeTimeLeft += parseInt(tier) * 60; 
            if (timeAdjustSlider) { // Update slider if it exists
                timeAdjustSlider.max = freeTimeLeft;
                timeAdjustSlider.value = freeTimeLeft;
                if (sliderValueDisplay) sliderValueDisplay.textContent = freeTimeLeft;
            }
            startTimer(); 
            messageInput.focus();
        });
    });

    const noThanksBtn = document.getElementById('noThanksBtn');
    if (noThanksBtn) {
        noThanksBtn.addEventListener('click', () => {
            addChadMessage("No problem at all. I'll prepare a summary of our conversation and what we've discussed. You should receive it shortly. Stay safe!");
            messageInput.disabled = true;
            sendMessageBtn.disabled = true;
            pricingOptionsDiv.style.display = 'none';
            setTimeout(closeChatModal, 5000); 
        });
    }

    initializeSlider(); // Initialize slider on page load
});
