const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Simple in-memory database
const broadcasts = {};

// 1. Create broadcast
app.post('/api/broadcast/create', (req, res) => {
  const { broadcastName } = req.body;
  broadcasts[broadcastName] = {
    name: broadcastName,
    isActive: true,
    currentSong: null,
    position: 0,
    isPlaying: false,
    lastUpdate: Date.now()
  };
  console.log(`Created broadcast: ${broadcastName}`);
  res.json({ success: true });
});

// 2. Send song data
app.post('/api/broadcast/song', (req, res) => {
  const { broadcastName, songName, artist, lyrics, waveform } = req.body;
  if (broadcasts[broadcastName]) {
    broadcasts[broadcastName].currentSong = {
      songName,
      artist,
      lyrics,
      waveform,
      timestamp: Date.now()
    };
    broadcasts[broadcastName].position = 0;
    console.log(`Song set: ${songName} by ${artist}`);
  }
  res.json({ success: true });
});

// 3. Send position
app.post('/api/broadcast/position', (req, res) => {
  const { broadcastName, position, isPlaying } = req.body;
  if (broadcasts[broadcastName]) {
    broadcasts[broadcastName].position = position;
    broadcasts[broadcastName].isPlaying = isPlaying;
    broadcasts[broadcastName].lastUpdate = Date.now();
  }
  res.json({ success: true });
});

// 4. Get broadcast data (for viewer)
app.get('/api/broadcast/:name', (req, res) => {
  const broadcast = broadcasts[req.params.name];
  if (broadcast) {
    res.json(broadcast);
  } else {
    res.status(404).json({ error: 'Broadcast not found' });
  }
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'Simple Broadcast Server', 
    status: 'running',
    broadcasts: Object.keys(broadcasts),
    version: '2.0'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});