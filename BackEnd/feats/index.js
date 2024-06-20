const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cookieParser = require('cookie-parser');
const { userFromToken } = require('./tokenDecoder');
const mongoose = require('mongoose');
const { getZoomAccessToken, createZoomMeeting } = require('./zoom/script');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // Replace with your frontend URL
    credentials: true,
  }
});

const port = process.env.PORT || 8004;

app.use(cors({
  origin: 'http://localhost:3000', // Replace with your frontend URL
  credentials: true
}));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(userFromToken);

require('./ai/script')(app);
require('./chat/script')({ io, app });
require('./todolist/script')({ app });

app.get('/callback', async (req, res) => {
  const code = req.query.code;
  console.log('OAuth callback received with code:', code);
  try {
    const accessToken = await getZoomAccessToken(code);
    console.log('Received access token:', accessToken);
    console.log('Setting Zoom access token in cookie');
    res.cookie('zoomAccessToken', accessToken, { httpOnly: true });
    res.redirect('/'); // Redirect to your frontend
  } catch (error) {
    console.error('Error during OAuth callback:', error.message);
    res.status(500).send('Error during OAuth callback');
  }
});

app.post('/create-meeting', async (req, res) => {
  const accessToken = req.cookies.zoomAccessToken;
  console.log('Cookies received in create-meeting request:', req.cookies);
  if (!accessToken) {
    console.log('Unauthorized request to create meeting');
    return res.status(401).json({ message: 'Unauthorized' });
  }

  console.log('Creating meeting with Zoom access token:', accessToken);
  try {
    const meetingData = await createZoomMeeting(accessToken);
    console.log('Meeting created successfully:', meetingData);
    res.json(meetingData);
  } catch (error) {
    console.error('Error creating meeting:', error.message);
    res.status(500).json({ message: 'Error creating meeting. Please try again later.' });
  }
});


mongoose.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    server.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
  });
