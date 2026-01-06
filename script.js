// DOM elements
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');

// Sample AI responses
const aiResponses = [
    "That's an interesting question! Let me help you with that.",
    "I understand what you're asking. Here's what I think...",
    "Great question! Based on what you've told me, I would suggest...",
    "I'm here to help! Let me break that down for you.",
    "That's a thoughtful query. Here's my perspective on this topic.",
    "I appreciate you asking that. Let me provide some insights.",
    "Excellent point! I can definitely assist you with that.",
    "I see what you mean. Let me elaborate on that for you.",
    "Thanks for sharing that. Here's what I would recommend.",
    "That's a common question. Here's a comprehensive answer..."
];

// Initialize
function init() {
    sendButton.addEventListener('click', handleSendMessage);
    messageInput.addEventListener('keydown', handleKeyDown);
    messageInput.addEventListener('input', autoResize);
}

// Auto-resize textarea
function autoResize() {
    messageInput.style.height = 'auto';
    messageInput.style.height = messageInput.scrollHeight + 'px';
}

// Handle Enter key (send on Enter, new line on Shift+Enter)
function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
    }
}

// Send message
function handleSendMessage() {
    const message = messageInput.value.trim();
    
    if (!message) return;
    
    // Add user message
    addMessage(message, 'user');
    
    // Clear input
    messageInput.value = '';
    messageInput.style.height = 'auto';
    
    // Disable send button temporarily
    sendButton.disabled = true;
    
    // Show typing indicator
    const typingId = showTypingIndicator();
    
    // Simulate AI response after delay
    setTimeout(() => {
        removeTypingIndicator(typingId);
        const response = getAIResponse(message);
        addMessage(response, 'assistant');
        sendButton.disabled = false;
        messageInput.focus();
    }, 1000 + Math.random() * 1500); // Random delay between 1-2.5 seconds
}

// Add message to chat
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = sender === 'user' ? '👤' : '🤖';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    
    content.appendChild(paragraph);
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

// Show typing indicator
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message assistant';
    typingDiv.id = 'typing-indicator';
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = '🤖';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.innerHTML = '<span></span><span></span><span></span>';
    
    content.appendChild(indicator);
    typingDiv.appendChild(avatar);
    typingDiv.appendChild(content);
    
    chatMessages.appendChild(typingDiv);
    scrollToBottom();
    
    return 'typing-indicator';
}

// Remove typing indicator
function removeTypingIndicator(id) {
    const element = document.getElementById(id);
    if (element) {
        element.remove();
    }
}

// Get AI response (simulated)
function getAIResponse(userMessage) {
    // Simple logic to generate contextual responses
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        return "Hello! It's great to chat with you. How can I assist you today?";
    }
    
    if (lowerMessage.includes('how are you')) {
        return "I'm doing great, thank you for asking! I'm here and ready to help you with any questions or tasks you have.";
    }
    
    if (lowerMessage.includes('thank')) {
        return "You're very welcome! I'm happy to help. Is there anything else you'd like to know?";
    }
    
    if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye')) {
        return "Goodbye! It was nice chatting with you. Feel free to come back anytime you need assistance!";
    }
    
    if (lowerMessage.includes('help')) {
        return "I'm here to help! You can ask me questions, have a conversation, or request assistance with various topics. What would you like to know more about?";
    }
    
    if (lowerMessage.includes('weather')) {
        return "I don't have access to real-time weather data, but I'd recommend checking a weather service like weather.com or your local weather app for the most accurate forecast!";
    }
    
    if (lowerMessage.includes('time')) {
        return `The current time is ${new Date().toLocaleTimeString()}. Is there anything else I can help you with?`;
    }
    
    if (lowerMessage.includes('date')) {
        return `Today's date is ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}. How can I assist you further?`;
    }
    
    // Default random response
    return aiResponses[Math.floor(Math.random() * aiResponses.length)];
}

// Scroll to bottom of chat
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Initialize app
init();
