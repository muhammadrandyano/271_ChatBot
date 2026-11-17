const chatWindow = document.getElementById('chatWindow');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

let messages = [];

function addMessage(role, text) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', ${role}-message);
    
    const avatar = document.createElement('div');
    avatar.classList.add('avatar');
    avatar.textContent = role === 'user' ? 'U' : 'AI';
    
    const content = document.createElement('div');
    content.classList.add('msg-content');
    content.textContent = text;
    
    msgDiv.appendChild(avatar);
    msgDiv.appendChild(content);
    chatWindow.appendChild(msgDiv);
    
    // Auto scroll ke bawah
    chatWindow.scrollTop = chatWindow.scrollHeight;
    return content;
}