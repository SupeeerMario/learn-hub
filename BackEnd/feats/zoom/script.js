const axios = require('axios');
require('dotenv').config();

const ZOOM_CLIENT_ID = process.env.ZOOM_CLIENT_ID;
const ZOOM_CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET;
const ZOOM_REDIRECT_URL = process.env.ZOOM_REDIRECT_URL;

async function getZoomAccessToken(code) {

    console.log('Getting Zoom access token with code:', code);
    console.log('Zoom Client ID:', ZOOM_CLIENT_ID);
    console.log('Zoom Client Secret:', ZOOM_CLIENT_SECRET);
    console.log('Zoom Redirect URL:', ZOOM_REDIRECT_URL);
  
  try {
    const response = await axios.post('https://zoom.us/oauth/token', null, {
      params: {
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: ZOOM_REDIRECT_URL
      },
      auth: {
        username: ZOOM_CLIENT_ID,
        password: ZOOM_CLIENT_SECRET
      }
    });
    console.log('Received Zoom access token:', response.data.access_token);
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting Zoom access token:', error.response ? error.response.data : error.message);
    throw new Error('Failed to get Zoom access token');
  }
}

async function createZoomMeeting(accessToken) {
  console.log('Creating Zoom meeting with access token:', accessToken);
  try {
    const response = await axios.post(
      'https://api.zoom.us/v2/users/me/meetings',
      {
        topic: 'Meeting with Instructor',
        type: 1
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );
    console.log('Zoom meeting created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating Zoom meeting:', error.response ? error.response.data : error.message);
    throw new Error('Failed to create Zoom meeting');
  }
}

module.exports = {
  getZoomAccessToken,
  createZoomMeeting
};
