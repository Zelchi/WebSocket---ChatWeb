var socket = io();

localStorage.removeItem('nickname');
const nickname = localStorage.getItem('nickname');

if (!nickname) {
    document.getElementById('nickname__menu').classList.remove('hidden');
} else {
    document.getElementById('chat__container').classList.remove('hidden');
}

const inputNickname = document.getElementById('nickname__input');
const buttonNickname = document.getElementById('nickname__button');

const nicknameRegex = /^[a-zA-Z]{3,15}$/;

buttonNickname.addEventListener('click', () => {
    const nicknameValue = inputNickname.value.trim();
    if (nicknameRegex.test(nicknameValue)) {
        localStorage.setItem('nickname', nicknameValue);
        socket.emit('nickname', nicknameValue);
        document.getElementById('nickname__menu').classList.add('hidden');
        document.getElementById('chat__container').classList.remove('hidden');
    }
});

const input = document.getElementById('message__input');
const button = document.getElementById('send__button');
const chat = document.getElementById('messages');

const messageRegex = /^.{1,200}$/;

button.addEventListener('click', () => {
    const data = input.value.trim();
    if (messageRegex.test(data)) {
        socket.emit('message', data);
        input.value = '';
    }
});

input.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        const data = input.value.trim();
        if (messageRegex.test(data)) {
            socket.emit('message', data);
            input.value = '';
        }
    }
});

function scrollToBottom() {
    chat.scrollTop = chat.scrollHeight;
}

socket.on('history', (messages) => {
    messages.forEach((message) => {
        const msgElement = document.createElement('p');
        msgElement.textContent = message;
        chat.appendChild(msgElement);
    });
    scrollToBottom();
});

socket.on('message', (data) => {
    const message = document.createElement('p');
    message.textContent = data;
    chat.appendChild(message);
    const audio = new Audio();
    audio.src = 'notification.mp3';
    audio.volume = 0.1;
    audio.onerror = () => {
        audio.src = 'notification.ogg';
        audio.volume = 0.1;
        audio.play().catch(error => console.error('Error playing fallback sound:', error));
    };
    audio.play().catch(error => console.error('Error playing sound:', error));
    scrollToBottom();
});

socket.on('userCount', (count) => {
    document.getElementById('user__count').textContent = `Online: ${count}`;
});

socket.on('userList', (nicknames) => {
    const userList = document.getElementById('user__list');
    userList.innerHTML = Object.values(nicknames).join('<br>');
});