const { io } = require('socket.io-client');
const socket = io('http://localhost:8000', {
  auth: { token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LXVzZXItMTIzIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwibmFtZSI6IlRlc3QgVXNlciIsImV4cCI6MTc1MjA0MDQ0M30.Dwdnr5va-XdkzodKPiNIPYxsrkqfED6y2PJPwKxMsBY' },
  transports: ['polling', 'websocket']
});
socket.on('connect', () => console.log('Connected!'));
socket.on('connect_error', (err) => console.error('Connect error:', err));

