// Chat System for Engineering Platform

class ChatSystem {
    constructor() {
        this.currentUser = null;
        this.currentGroup = null;
        this.messages = [];
        this.isOpen = false;
        this.unreadCount = 0;
        this.typingUsers = new Set();
        this.isTyping = false;
        this.typingTimeout = null;
        this.init();
    }

    init() {
        // Get current user session
        const session = JSON.parse(localStorage.getItem('userSession') || '{}');
        if (session.userId) {
            this.currentUser = session;
            this.currentGroup = session.groupId;
            this.loadMessages();
            this.createChatInterface();
            this.startMessagePolling();
            this.addWelcomeMessage();
        }
    }

    createChatInterface() {
        // Create chat toggle button
        const chatToggle = document.createElement('div');
        chatToggle.className = 'chat-toggle';
        chatToggle.innerHTML = `
            <div class="chat-icon">💬</div>
            <div class="chat-badge" id="chatBadge" style="display: none;">0</div>
        `;
        chatToggle.onclick = () => this.toggleChat();
        
        // Create chat container
        const chatContainer = document.createElement('div');
        chatContainer.className = 'chat-container';
        chatContainer.id = 'chatContainer';
        chatContainer.innerHTML = `
            <div class="chat-header">
                <div class="chat-title">
                    <h4>Team Chat</h4>
                    <small>${this.currentUser.groupName}</small>
                </div>
                <div class="chat-controls">
                    <div class="online-indicator"></div>
                    <span class="online-text">Online</span>
                    <button class="chat-minimize" onclick="chatSystem.toggleChat()">−</button>
                </div>
            </div>
            <div class="chat-messages" id="chatMessages">
                <div class="chat-welcome">
                    <div class="welcome-icon">👋</div>
                    <p>Welcome to the team chat!</p>
                    <small>Start collaborating with your engineering team</small>
                </div>
            </div>
            <div class="chat-input-area">
                <div class="chat-input-group">
                    <input type="text" id="chatInput" class="chat-input" placeholder="Type your message..." 
                           onkeypress="chatSystem.handleKeyPress(event)" 
                           oninput="chatSystem.handleTyping()"
                           onblur="chatSystem.stopTyping()">
                    <button class="chat-send" onclick="chatSystem.sendMessage()">
                        <span class="send-icon">📤</span>
                    </button>
                </div>
                <div class="chat-typing" id="chatTyping" style="display: none;">
                    <div class="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    <small id="typingText">Someone is typing...</small>
                </div>
            </div>
        `;

        // Add chat styles
        this.addChatStyles();
        
        // Append to body
        document.body.appendChild(chatToggle);
        document.body.appendChild(chatContainer);
        
        // Load existing messages
        this.renderMessages();
        
        // Auto-scroll to bottom
        setTimeout(() => this.scrollToBottom(), 100);
    }

    addChatStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .chat-toggle {
                position: fixed;
                bottom: 30px;
                right: 30px;
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, #667eea, #764ba2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
                transition: all 0.3s ease;
                z-index: 1000;
                user-select: none;
            }

            .chat-toggle:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 30px rgba(102, 126, 234, 0.6);
            }

            .chat-icon {
                font-size: 24px;
                position: relative;
            }

            .chat-badge {
                position: absolute;
                top: -5px;
                right: -5px;
                background: #f56565;
                color: white;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                font-size: 12px;
                font-weight: bold;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: pulse 2s infinite;
            }

            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }

            .chat-container {
                position: fixed;
                bottom: 30px;
                right: 100px;
                width: 380px;
                height: 550px;
                background: white;
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
                border: 1px solid rgba(102, 126, 234, 0.2);
                display: none;
                flex-direction: column;
                z-index: 1001;
                overflow: hidden;
            }

            .chat-container.open {
                display: flex;
                animation: chatSlideIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            }

            @keyframes chatSlideIn {
                from {
                    opacity: 0;
                    transform: translateY(30px) scale(0.9);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }

            .chat-header {
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                padding: 18px 25px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-radius: 20px 20px 0 0;
            }

            .chat-title h4 {
                margin: 0;
                font-size: 1.1rem;
                font-weight: 600;
            }

            .chat-title small {
                opacity: 0.9;
                font-size: 0.8rem;
            }

            .chat-controls {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .online-indicator {
                width: 8px;
                height: 8px;
                background: #48bb78;
                border-radius: 50%;
                animation: blink 2s infinite;
            }

            .online-text {
                font-size: 0.75rem;
                opacity: 0.9;
            }

            @keyframes blink {
                0%, 50% { opacity: 1; }
                51%, 100% { opacity: 0.5; }
            }

            .chat-minimize {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                width: 25px;
                height: 25px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 16px;
                font-weight: bold;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.3s ease;
                margin-left: 10px;
            }

            .chat-minimize:hover {
                background: rgba(255, 255, 255, 0.3);
            }

            .chat-messages {
                flex: 1;
                padding: 20px;
                overflow-y: auto;
                background: #f8fafc;
                display: flex;
                flex-direction: column;
                gap: 15px;
            }

            .chat-messages::-webkit-scrollbar {
                width: 4px;
            }

            .chat-messages::-webkit-scrollbar-track {
                background: #e2e8f0;
            }

            .chat-messages::-webkit-scrollbar-thumb {
                background: #cbd5e0;
                border-radius: 2px;
            }

            .chat-welcome {
                text-align: center;
                padding: 40px 20px;
                color: #718096;
            }

            .welcome-icon {
                font-size: 2.5rem;
                margin-bottom: 15px;
            }

            .welcome-icon + p {
                font-weight: 600;
                color: #4a5568;
                margin-bottom: 8px;
                font-size: 1.1rem;
            }

            .message {
                max-width: 85%;
                margin-bottom: 12px;
                animation: messageSlideIn 0.3s ease;
                position: relative;
            }

            @keyframes messageSlideIn {
                from {
                    opacity: 0;
                    transform: translateX(-15px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }

            .message.own {
                align-self: flex-end;
                animation-name: messageSlideInRight;
            }

            @keyframes messageSlideInRight {
                from {
                    opacity: 0;
                    transform: translateX(15px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }

            .message.own .message-bubble {
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                border-radius: 18px 18px 4px 18px;
                box-shadow: 0 3px 12px rgba(102, 126, 234, 0.3);
            }

            .message:not(.own) .message-bubble {
                background: white;
                color: #2d3748;
                border-radius: 18px 18px 18px 4px;
                border: 1px solid #e2e8f0;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            }

            .message-bubble {
                padding: 12px 18px;
                word-wrap: break-word;
                line-height: 1.4;
                position: relative;
            }

            .message-info {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
                font-size: 0.75rem;
            }

            .message.own .message-info {
                flex-direction: row-reverse;
            }

            .message-author {
                font-weight: 600;
                color: #4a5568;
                display: flex;
                align-items: center;
                gap: 5px;
            }

            .message.own .message-author {
                color: #667eea;
            }

            .message-time {
                color: #a0aec0;
                font-size: 0.7rem;
            }

            .message.own .message-time {
                color: rgba(102, 126, 234, 0.7);
            }

            .chat-input-area {
                padding: 20px;
                background: white;
                border-top: 1px solid #e2e8f0;
                border-radius: 0 0 20px 20px;
            }

            .chat-input-group {
                display: flex;
                gap: 12px;
                align-items: center;
            }

            .chat-input {
                flex: 1;
                padding: 12px 16px;
                border: 2px solid #e2e8f0;
                border-radius: 25px;
                font-size: 0.95rem;
                outline: none;
                transition: border-color 0.3s ease;
                background: #f8fafc;
            }

            .chat-input:focus {
                border-color: #667eea;
                background: white;
            }

            .chat-send {
                background: linear-gradient(135deg, #667eea, #764ba2);
                border: none;
                width: 45px;
                height: 45px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
            }

            .chat-send:hover {
                transform: scale(1.05);
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
            }

            .chat-send:active {
                transform: scale(0.95);
            }

            .send-icon {
                font-size: 16px;
            }

            .chat-typing {
                margin-top: 12px;
                display: flex;
                align-items: center;
                gap: 8px;
                color: #718096;
                font-style: italic;
            }

            .typing-dots {
                display: flex;
                gap: 3px;
            }

            .typing-dots span {
                width: 6px;
                height: 6px;
                background: #667eea;
                border-radius: 50%;
                animation: typing 1.4s ease-in-out infinite;
            }

            .typing-dots span:nth-child(1) { animation-delay: 0s; }
            .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
            .typing-dots span:nth-child(3) { animation-delay: 0.4s; }

            @keyframes typing {
                0%, 60%, 100% {
                    transform: translateY(0);
                    opacity: 0.4;
                }
                30% {
                    transform: translateY(-10px);
                    opacity: 1;
                }
            }

            .system-message {
                text-align: center;
                color: #718096;
                font-size: 0.8rem;
                font-style: italic;
                margin: 15px 0;
                padding: 8px 15px;
                background: rgba(113, 128, 150, 0.1);
                border-radius: 15px;
                border: 1px dashed rgba(113, 128, 150, 0.3);
            }

            .user-avatar {
                width: 18px;
                height: 18px;
                background: linear-gradient(135deg, #667eea, #764ba2);
                border-radius: 50%;
                color: white;
                font-size: 10px;
                font-weight: bold;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 5px;
            }

            .message-reactions {
                margin-top: 8px;
                display: flex;
                gap: 5px;
            }

            .reaction {
                background: rgba(102, 126, 234, 0.1);
                border: 1px solid rgba(102, 126, 234, 0.2);
                border-radius: 12px;
                padding: 2px 8px;
                font-size: 0.75rem;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .reaction:hover {
                background: rgba(102, 126, 234, 0.2);
            }

            @media (max-width: 768px) {
                .chat-container {
                    bottom: 20px;
                    right: 20px;
                    left: 20px;
                    width: auto;
                    height: 70vh;
                    max-height: 500px;
                }

                .chat-toggle {
                    bottom: 20px;
                    right: 20px;
                }

                .chat-messages {
                    padding: 15px;
                }

                .chat-input-area {
                    padding: 15px;
                }
            }

            .fade-in {
                animation: fadeIn 0.3s ease;
            }

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        const container = document.getElementById('chatContainer');
        if (this.isOpen) {
            container.classList.add('open');
            this.scrollToBottom();
            this.markMessagesAsRead();
            document.getElementById('chatInput').focus();
        } else {
            container.classList.remove('open');
            this.stopTyping();
        }
    }

    handleKeyPress(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.sendMessage();
        }
    }

    handleTyping() {
        if (!this.isTyping) {
            this.isTyping = true;
            this.broadcastTyping(true);
        }
        
        clearTimeout(this.typingTimeout);
        this.typingTimeout = setTimeout(() => {
            this.stopTyping();
        }, 2000);
    }

    stopTyping() {
        if (this.isTyping) {
            this.isTyping = false;
            this.broadcastTyping(false);
        }
        clearTimeout(this.typingTimeout);
    }

    broadcastTyping(isTyping) {
        // In a real implementation, this would send typing status to other users
        const typingData = {
            userId: this.currentUser.userId,
            userName: this.currentUser.name,
            groupId: this.currentGroup,
            isTyping: isTyping,
            timestamp: Date.now()
        };
        localStorage.setItem(`typing_${this.currentGroup}`, JSON.stringify(typingData));
    }

    sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (!message) return;

        this.stopTyping();

        const newMessage = {
            id: Date.now(),
            text: message,
            author: this.currentUser.name,
            authorId: this.currentUser.userId,
            groupId: this.currentGroup,
            timestamp: new Date().toISOString(),
            isOwn: true
        };

        this.messages.push(newMessage);
        this.saveMessages();
        this.renderMessage(newMessage);
        this.scrollToBottom();
        
        input.value = '';
        
        // Add random reactions occasionally
        if (Math.random() > 0.7) {
            setTimeout(() => {
                this.addRandomReaction(newMessage.id);
            }, 500 + Math.random() * 1500);
        }
        
        // Simulate responses from team members
        if (Math.random() > 0.6) {
            setTimeout(() => this.simulateResponse(message), 1000 + Math.random() * 3000);
        }
    }

    simulateResponse(originalMessage) {
        const responses = [
            "Got it, thanks for the update! 👍",
            "I'll check on that site right away.",
            "Can you share the coordinates when you have them?",
            "Great work! The signal looks much better now.",
            "I'm heading to that location in 30 minutes.",
            "Let me know if you need any assistance.",
            "Site maintenance completed successfully! ✅",
            "All systems are operational on my end.",
            "Thanks for the heads up, updating my logs.",
            "Perfect timing! I was just about to ask about that.",
            "Site visit confirmed for tomorrow morning.",
            "The equipment upgrade is scheduled for next week."
        ];

        const teamMembers = [
            { name: 'Rohit Rajput', id: 'ENG001' },
            { name: 'Sanjay Kumar', id: 'ENG002' },
            { name: 'Network Admin', id: 'ADMIN' },
            { name: 'Field Engineer', id: 'FIELD01' },
            { name: 'Site Coordinator', id: 'COORD01' }
        ];

        // Smart response selection based on message content
        let selectedResponse = responses[Math.floor(Math.random() * responses.length)];
        
        if (originalMessage.toLowerCase().includes('site') || originalMessage.toLowerCase().includes('location')) {
            selectedResponse = responses[Math.floor(Math.random() * 6) + 1]; // Site-related responses
        } else if (originalMessage.toLowerCase().includes('completed') || originalMessage.toLowerCase().includes('finished')) {
            selectedResponse = "Excellent work! 🎉";
        }

        const randomMember = teamMembers[Math.floor(Math.random() * teamMembers.length)];

        if (randomMember.id !== this.currentUser.userId) {
            // Show typing indicator first
            this.showTypingIndicator(randomMember.name);
            
            setTimeout(() => {
                this.hideTypingIndicator();
                
                const responseMessage = {
                    id: Date.now(),
                    text: selectedResponse,
                    author: randomMember.name,
                    authorId: randomMember.id,
                    groupId: this.currentGroup,
                    timestamp: new Date().toISOString(),
                    isOwn: false
                };

                this.messages.push(responseMessage);
                this.saveMessages();
                this.renderMessage(responseMessage);
                this.scrollToBottom();
                
                if (!this.isOpen) {
                    this.showNewMessageNotification();
                }
            }, 1500 + Math.random() * 2000);
        }
    }

    showTypingIndicator(userName) {
        const typingDiv = document.getElementById('chatTyping');
        const typingText = document.getElementById('typingText');
        typingText.textContent = `${userName} is typing...`;
        typingDiv.style.display = 'flex';
    }

    hideTypingIndicator() {
        const typingDiv = document.getElementById('chatTyping');
        typingDiv.style.display = 'none';
    }

    renderMessages() {
        const container = document.getElementById('chatMessages');
        const welcome = container.querySelector('.chat-welcome');
        
        if (this.messages.length > 0 && welcome) {
            welcome.remove();
        }

        this.messages.forEach(message => {
            this.renderMessage(message, false);
        });
        
        this.scrollToBottom();
    }

    renderMessage(message, animate = true) {
        const container = document.getElementById('chatMessages');
        const welcome = container.querySelector('.chat-welcome');
        
        if (welcome) {
            welcome.remove();
        }

        const messageEl = document.createElement('div');
        messageEl.className = `message ${message.authorId === this.currentUser.userId ? 'own' : ''}`;
        messageEl.setAttribute('data-message-id', message.id);
        
        const time = new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });

        const avatar = message.authorId === this.currentUser.userId 
            ? this.currentUser.name.charAt(0).toUpperCase()
            : message.author.charAt(0).toUpperCase();

        messageEl.innerHTML = `
            <div class="message-info">
                <span class="message-author">
                    <div class="user-avatar">${avatar}</div>
                    ${message.author}
                </span>
                <span class="message-time">${time}</span>
            </div>
            <div class="message-bubble">
                ${message.text}
            </div>
            <div class="message-reactions" id="reactions-${message.id}">
                <!-- Reactions will be added here -->
            </div>
        `;

        container.appendChild(messageEl);
        
        if (animate) {
            messageEl.classList.add('fade-in');
        }
    }

    addRandomReaction(messageId) {
        const reactions = ['👍', '❤️', '😊', '🚀', '✅'];
        const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
        
        const reactionsContainer = document.getElementById(`reactions-${messageId}`);
        if (reactionsContainer) {
            const reactionEl = document.createElement('span');
            reactionEl.className = 'reaction';
            reactionEl.textContent = randomReaction;
            reactionEl.onclick = () => reactionEl.remove();
            reactionsContainer.appendChild(reactionEl);
        }
    }

    scrollToBottom() {
        setTimeout(() => {
            const container = document.getElementById('chatMessages');
            if (container) {
                container.scrollTop = container.scrollHeight;
            }
        }, 100);
    }

    showNewMessageNotification() {
        this.unreadCount++;
        const badge = document.getElementById('chatBadge');
        if (badge) {
            badge.textContent = this.unreadCount;
            badge.style.display = 'flex';
        }

        // Show browser notification if supported
        if (Notification.permission === 'granted') {
            new Notification('New Team Message', {
                body: 'You have a new message in the team chat',
                icon: '💬',
                tag: 'team-chat'
            });
        }
    }

    markMessagesAsRead() {
        this.unreadCount = 0;
        const badge = document.getElementById('chatBadge');
        if (badge) {
            badge.style.display = 'none';
        }
    }

    loadMessages() {
        const stored = localStorage.getItem(`chat_messages_${this.currentGroup}`);
        if (stored) {
            this.messages = JSON.parse(stored);
        }
    }

    saveMessages() {
        localStorage.setItem(`chat_messages_${this.currentGroup}`, JSON.stringify(this.messages));
    }

    addWelcomeMessage() {
        // Add a welcome message when user first joins
        const welcomeMessages = [
            `${this.currentUser.name} joined the team chat! 👋`,
            `Welcome to the ${this.currentUser.groupName} chat room!`
        ];
        
        // Check if user has been welcomed before
        const welcomed = localStorage.getItem(`welcomed_${this.currentUser.userId}_${this.currentGroup}`);
        
        if (!welcomed && this.messages.length === 0) {
            setTimeout(() => {
                this.addSystemMessage(welcomeMessages[0]);
                localStorage.setItem(`welcomed_${this.currentUser.userId}_${this.currentGroup}`, 'true');
            }, 2000);
        }
    }

    startMessagePolling() {
        // In a real application, this would poll the server for new messages
        // For demo purposes, we'll check for typing indicators
        setInterval(() => {
            this.checkTypingStatus();
            this.checkForNewMessages();
        }, 2000);
        
        // Request notification permission
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    checkTypingStatus() {
        const typingData = localStorage.getItem(`typing_${this.currentGroup}`);
        if (typingData) {
            const typing = JSON.parse(typingData);
            const timeDiff = Date.now() - typing.timestamp;
            
            if (typing.isTyping && typing.userId !== this.currentUser.userId && timeDiff < 3000) {
                this.showTypingIndicator(typing.userName);
            } else {
                this.hideTypingIndicator();
            }
        }
    }

    checkForNewMessages() {
        const stored = localStorage.getItem(`chat_messages_${this.currentGroup}`);
        if (stored) {
            const storedMessages = JSON.parse(stored);
            if (storedMessages.length > this.messages.length) {
                const newMessages = storedMessages.slice(this.messages.length);
                newMessages.forEach(message => {
                    this.messages.push(message);
                    this.renderMessage(message);
                    if (!this.isOpen && message.authorId !== this.currentUser.userId) {
                        this.showNewMessageNotification();
                    }
                });
                this.scrollToBottom();
            }
        }
    }

    addSystemMessage(text) {
        const container = document.getElementById('chatMessages');
        if (container) {
            const systemEl = document.createElement('div');
            systemEl.className = 'system-message';
            systemEl.textContent = text;
            container.appendChild(systemEl);
            this.scrollToBottom();
        }
    }

    // Public methods for integration
    static getInstance() {
        if (!window.chatSystemInstance) {
            window.chatSystemInstance = new ChatSystem();
        }
        return window.chatSystemInstance;
    }

    destroy() {
        // Cleanup method
        this.stopTyping();
        const toggle = document.querySelector('.chat-toggle');
        const container = document.querySelector('.chat-container');
        if (toggle) toggle.remove();
        if (container) container.remove();
    }
}

// Initialize chat system
let chatSystem;

// Auto-initialize when DOM is ready and user is logged in
document.addEventListener('DOMContentLoaded', function() {
    const session = localStorage.getItem('userSession');
    if (session) {
        setTimeout(() => {
            chatSystem = ChatSystem.getInstance();
        }, 1000); // Delay to ensure page is fully loaded
    }
});

// Initialize chat when user logs in
function initializeChat() {
    if (typeof chatSystem === 'undefined' || !chatSystem) {
        chatSystem = ChatSystem.getInstance();
        setTimeout(() => {
            if (chatSystem && chatSystem.addSystemMessage) {
                chatSystem.addSystemMessage(`${chatSystem.currentUser.name} is now online`);
            }
        }, 500);
    }
}

// Global function to toggle chat (can be called from anywhere)
function toggleTeamChat() {
    if (chatSystem) {
        chatSystem.toggleChat();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatSystem;
}
