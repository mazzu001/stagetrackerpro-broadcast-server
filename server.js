const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// In-memory storage for broadcasts (for simplicity)
const broadcasts = new Map();
const broadcastStates = new Map();
const songs = new Map();

console.log('🚀 BandMaestro Broadcast Server starting...');

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'BandMaestro Broadcast Server', 
    status: 'running',
    time: new Date().toISOString(),
    activeBroadcasts: broadcasts.size
  });
});

// Start a broadcast
app.post('/api/broadcast/create', (req, res) => {
  const { id, name, hostName } = req.body;
  
  broadcasts.set(id, {
    id,
    name: name || `${hostName}'s Broadcast`,
    hostName: hostName || 'Host',
    isActive: true,
    lastActivity: Date.now()
  });
  
  console.log(`📻 Started broadcast: ${id} by ${hostName}`);
  res.json({ success: true, broadcast: broadcasts.get(id) });
});

// Get broadcast info
app.get('/api/broadcast/:id', (req, res) => {
  const broadcast = broadcasts.get(req.params.id);
  if (broadcast) {
    console.log(`📊 Fetched broadcast info: ${req.params.id}`);
    res.json(broadcast);
  } else {
    console.log(`❌ Broadcast not found: ${req.params.id}`);
    res.status(404).json({ error: 'Broadcast not found' });
  }
});

// Get broadcast state (position, playing status)
app.get('/api/broadcast/:id/state', (req, res) => {
  const state = broadcastStates.get(req.params.id);
  if (state) {
    console.log(`📊 Fetched broadcast state: ${req.params.id}`);
    res.json(state);
  } else {
    console.log(`❌ Broadcast state not found: ${req.params.id}`);
    res.status(404).json({ error: 'Broadcast state not found' });
  }
});

// Update broadcast state (song and position)
app.put('/api/broadcast/:id/state', (req, res) => {
  const broadcastId = req.params.id;
  const { position, isPlaying, lastUpdated } = req.body;
  
  // Update broadcast state
  const currentState = broadcastStates.get(broadcastId) || {};
  broadcastStates.set(broadcastId, {
    ...currentState,
    position: position || 0,
    isPlaying: isPlaying !== undefined ? isPlaying : false,
    lastUpdated: lastUpdated || Date.now(),
    isActive: true
  });
  
  console.log(`📻 Updated broadcast state ${broadcastId}: position=${position}s, playing=${isPlaying}`);
  res.json({ success: true });
});

// Send song data
app.put('/api/broadcast/:id/song', (req, res) => {
  const broadcastId = req.params.id;
  const { song } = req.body;
  
  if (!song || !song.id) {
    return res.status(400).json({ error: 'Song data required' });
  }
  
  // Store song data
  songs.set(song.id, song);
  
  // Update broadcast state with current song
  const currentState = broadcastStates.get(broadcastId) || {};
  broadcastStates.set(broadcastId, {
    ...currentState,
    currentSong: song.id,
    position: 0,
    isPlaying: true,
    duration: song.duration || 0,
    lastUpdated: Date.now(),
    isActive: true
  });
  
  console.log(`📻 Updated broadcast ${broadcastId} with song: ${song.title}`);
  res.json({ success: true });
});

// Get song data
app.get('/api/broadcast/song/:songId', (req, res) => {
  const song = songs.get(req.params.songId);
  if (song) {
    console.log(`🎵 Fetched song: ${song.title}`);
    res.json({ song });
  } else {
    console.log(`❌ Song not found: ${req.params.songId}`);
    res.status(404).json({ error: 'Song not found' });
  }
});

// Stop broadcast
app.delete('/api/broadcast/:id', (req, res) => {
  const broadcastId = req.params.id;
  broadcasts.delete(broadcastId);
  broadcastStates.delete(broadcastId);
  console.log(`📻 Stopped broadcast: ${broadcastId}`);
  res.json({ success: true });
});

// List all active broadcasts (for debugging)
app.get('/api/broadcasts', (req, res) => {
  const activeBroadcasts = Array.from(broadcasts.values());
  res.json({ broadcasts: activeBroadcasts });
});

// Clean up inactive broadcasts every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [id, broadcast] of broadcasts) {
    if (now - broadcast.lastActivity > 5 * 60 * 1000) { // 5 minutes
      console.log(`🧹 Cleaning up inactive broadcast: ${id}`);
      broadcasts.delete(id);
      broadcastStates.delete(id);
    }
  }
}, 5 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`🚀 BandMaestro Broadcast Server running on port ${PORT}`);
  console.log(`🌐 Server URL: http://localhost:${PORT}`);
});