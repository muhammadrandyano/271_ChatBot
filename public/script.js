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

async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    // Tampilkan pesan user
    addMessage('user', text);
    messages.push({ role: 'user', content: text });
    
    userInput.value = '';
    sendBtn.disabled = true;

    // Placeholder untuk pesan bot
    const botContent = addMessage('bot', '...');

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: messages })
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let botText = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6).trim();
                    if (data === '[DONE]') continue;
                    
                    try {
                        const parsed = JSON.parse(data);
                        botText += parsed;
                        botContent.textContent = botText;
                        chatWindow.scrollTop = chatWindow.scrollHeight;
                    } catch (e) {
                        console.error('Error parsing JSON:', e);
                    }
                }
            }
        }
    }
}