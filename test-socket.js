const { io } = require('socket.io-client');
const socket = io('http://localhost:8000', {
  auth: { token: 'REPLACE_WITH_A_VALID_TOKEN' },
  transports: ['websocket']
});
socket.on('connect', () => console.log('Connected!'));
socket.on('connect_error', (err) => console.error('Connect error:', err));

