module.exports = ({ io, app }) => {
  const users = {}; 
  const messages = {}; 
  const offlineMessages = {}; 

  const printConnectedUsers = () => {
    console.log('Connected users:', Object.values(users).map(user => ({
      userId: user._id,
      username: user.username,
      socketId: user.socketId
    })));
  };

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('new-user', (user) => {
      if (!user || !user._id) {
        console.error('Invalid user data received:', user);
        return;
      }

      console.log('New user data received:', user);
      users[user._id] = { ...user, socketId: socket.id };

      
      if (offlineMessages[user._id]) {
        console.log(`Sending ${offlineMessages[user._id].length} offline messages to user ${user._id}`);
        offlineMessages[user._id].forEach(message => {
          io.to(users[user._id].socketId).emit('chat-message', message);
        });
        delete offlineMessages[user._id]; 
      }

      console.log('Users after new user connection:', users);
      socket.broadcast.emit('user-connected', user);
      printConnectedUsers(); 
    });

    
    socket.on('send-chat-message', (message) => {
      const { friendId, userId } = message;
      console.log('Sending message from:', userId, 'to:', friendId);
      console.log('Current Users:', users);

      
      if (!messages[friendId]) messages[friendId] = [];
      if (!messages[userId]) messages[userId] = [];

      messages[friendId].push(message);
      messages[userId].push(message);

      console.log('Messages stored:', messages);

      
      if (users[friendId]) {
        io.to(users[friendId].socketId).emit('chat-message', message);
      } else {
        console.error('User not connected:', friendId);
        // Store the message for the offline user
        if (!offlineMessages[friendId]) offlineMessages[friendId] = [];
        offlineMessages[friendId].push(message);
        console.log(`Stored message for offline user ${friendId}. Total messages stored: ${offlineMessages[friendId].length}`);
      }
    });

    
    socket.on('disconnect', () => {
      let disconnectedUserId = null;
      for (const userId in users) {
        if (users[userId].socketId === socket.id) {
          disconnectedUserId = userId;
          socket.broadcast.emit('user-disconnected', users[userId]);
          delete users[userId];
          break;
        }
      }
      console.log('Client disconnected:', socket.id);
      console.log('Users after disconnection:', users);
      if (disconnectedUserId) {
        console.log('Disconnected user ID:', disconnectedUserId);
      }
      printConnectedUsers(); 
    });

    
    socket.on('print-connected-users', () => {
      printConnectedUsers();
    });
  });

  
  app.get('/messages/:userId/:friendId', (req, res) => {
    const { userId, friendId } = req.params;
    console.log('Fetching messages for userId:', userId, 'friendId:', friendId);
    const userMessages = messages[userId] || [];
    const friendMessages = messages[friendId] || [];
    const allMessages = [...userMessages, ...friendMessages];
    res.json(allMessages);
  });

  
  app.post('/send-message', (req, res) => {
    const { message, name, image, friendId, userId } = req.body;
    const newMessage = { message, name, image, friendId, userId };

    if (!messages[friendId]) messages[friendId] = [];
    if (!messages[userId]) messages[userId] = [];

    messages[friendId].push(newMessage);
    messages[userId].push(newMessage);

    res.status(200).send('Message sent');

    
    if (users[friendId] && users[userId]) {
      io.to(users[friendId].socketId).emit('chat-message', newMessage);
    } else {
      console.error('User not connected:', friendId, userId);
      if (!offlineMessages[friendId]) offlineMessages[friendId] = [];
      offlineMessages[friendId].push(newMessage);
      console.log(`Stored message for offline user ${friendId}. Total messages stored: ${offlineMessages[friendId].length}`);
    }
  });
};
