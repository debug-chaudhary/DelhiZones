
// Chat system integration with backend (Socket.IO)
const socket = io('http://localhost:3001'); // Update if server runs elsewhere

// Join a group
function joinGroup(group) {
    socket.emit('joinGroup', group);
}

// Send a message to a group
function sendMessage(group, user, text) {
    socket.emit('sendMessage', { group, user, text });
}

// Listen for new messages in the group
function onNewMessage(callback) {
    socket.on('newMessage', callback);
}

// Fetch message history for a group
async function fetchMessageHistory(group) {
    const res = await fetch(`/api/messages/${group}`);
    return await res.json();
}

// Example UI integration (minimal)
document.addEventListener('DOMContentLoaded', () => {
    const group = 'general'; // Example group name
    const user = 'User1'; // Replace with actual user
    joinGroup(group);

    const chatBox = document.createElement('div');
    chatBox.id = 'chatBox';
    chatBox.style = 'border:1px solid #ccc;padding:10px;margin:10px;max-width:400px;';
    document.body.appendChild(chatBox);

    const messagesDiv = document.createElement('div');
    messagesDiv.id = 'messages';
    chatBox.appendChild(messagesDiv);

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Type a message...';
    chatBox.appendChild(input);

    const sendBtn = document.createElement('button');
    sendBtn.textContent = 'Send';
    chatBox.appendChild(sendBtn);

    sendBtn.onclick = () => {
        if (input.value.trim()) {
            sendMessage(group, user, input.value);
            input.value = '';
        }
    };

    // Load message history
    fetchMessageHistory(group).then(messages => {
        messages.forEach(msg => {
            const msgDiv = document.createElement('div');
            msgDiv.textContent = `[${msg.user}] ${msg.text}`;
            messagesDiv.appendChild(msgDiv);
        });
    });

    // Real-time new messages
    onNewMessage(msg => {
        const msgDiv = document.createElement('div');
        msgDiv.textContent = `[${msg.user}] ${msg.text}`;
        messagesDiv.appendChild(msgDiv);
    });
});
