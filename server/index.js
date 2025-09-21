const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/engworkchat', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const messageSchema = new mongoose.Schema({
  group: String,
  user: String,
  text: String,
  timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

// REST API: Get message history for a group
app.get('/api/messages/:group', async (req, res) => {
  const messages = await Message.find({ group: req.params.group }).sort({ timestamp: 1 });
  res.json(messages);
});

// REST API: Post a new message
app.post('/api/messages', async (req, res) => {
  const { group, user, text } = req.body;
  const message = new Message({ group, user, text });
  await message.save();
  io.to(group).emit('newMessage', message);
  res.status(201).json(message);
});

// Socket.IO: Real-time group messaging
io.on('connection', (socket) => {
  socket.on('joinGroup', (group) => {
    socket.join(group);
  });

  socket.on('sendMessage', async (data) => {
    const { group, user, text } = data;
    const message = new Message({ group, user, text });
    await message.save();
    io.to(group).emit('newMessage', message);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Chat server running on port ${PORT}`);
});
