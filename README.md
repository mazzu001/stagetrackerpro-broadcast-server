# BandMaestro Broadcast Server

Simple broadcasting server for the BandMaestro performance app.

## Features

- Create and manage broadcast sessions
- Real-time song synchronization
- Position updates for viewers
- Simple REST API

## API Endpoints

- `GET /` - Health check
- `POST /api/broadcast/create` - Start a broadcast
- `GET /api/broadcast/:id` - Get broadcast info
- `GET /api/broadcast/:id/state` - Get current state
- `PUT /api/broadcast/:id/state` - Update position
- `PUT /api/broadcast/:id/song` - Update current song
- `DELETE /api/broadcast/:id` - Stop broadcast

## Deployment

This server is designed to be deployed on platforms like Render.com, Railway, or Heroku.

### Environment Variables

- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (production/development)

### Local Development

```bash
npm install
npm start
```

Server will run on http://localhost:3001