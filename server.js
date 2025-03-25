const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');


const app = express();
const server = http.createServer(app);
const io = socketio(server);
//const WelcomingMsg = 'StudentLab Bot';
//Static folder (Access to our frontend)
app.use(express.static(path.join(__dirname, 'public')));
const WelcomingMsg = 'StudentLab Bot';
//Run when client connects
io.on('connection', socket => {
socket.on('joinRoom', ({ username, room }) => {
const user = userJoin(socket.id, username, room);
    socket.join(user.room);
 // console.log('New web socket connection...');
    //Welcome current user
    socket.emit('message', formatMessage(WelcomingMsg, 'Welcome to StudentLab!'));

    //brodcast when user connects
socket.broadcast.to(user.room).emit('message', formatMessage(WelcomingMsg, `${user.username} has joined the chat`));


// send users and room info
io.to(user.room).emit('roomUsers', {
    room: user.room,
    users: getRoomUsers(user.room)
});

});


   

// listen for chatMessage
socket.on('chatMessage', msg => {
    //console.log(msg);
const user = getCurrentUser(socket.id);

    io.to(user.room).emit('message', formatMessage(user.username, msg));
});
// Runs when client disconnects
socket.on('disconnect', () => {
const user = userLeave(socket.id);
if(user){
    
io.to(user.room).emit('message', formatMessage(WelcomingMsg, `${user.username} has left the chat`));
// send users and room info
io.to(user.room).emit('roomUsers', {
    room: user.room,
    users: getRoomUsers(user.room)
});
}
});


   
});



const PORT = 6500 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));