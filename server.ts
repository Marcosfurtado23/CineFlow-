import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { createServer as createViteServer } from 'vite';
import path from 'path';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());

  // API routes FIRST
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/api/stream', async (req, res) => {
    try {
      const { url } = req.query;
      if (!url || typeof url !== 'string') {
        res.status(400).send('URL is required');
        return;
      }

      let directUrl = url;

      // Convert Google Drive link to direct download link
      if (url.includes('drive.google.com')) {
        const match = url.match(/\/d\/(.+?)\//) || url.match(/id=(.+?)(&|$)/);
        if (match && match[1]) {
          directUrl = `https://drive.google.com/uc?export=download&confirm=t&id=${match[1]}`;
        }
      }

      // Convert Dropbox link to direct download link
      if (url.includes('dropbox.com')) {
        directUrl = url.replace('?dl=0', '');
        if (!directUrl.includes('raw=1')) {
          directUrl += directUrl.includes('?') ? '&raw=1' : '?raw=1';
        }
      }

      // Redirect the client directly to the video file
      // This allows the browser to handle Range requests and buffering natively
      res.redirect(302, directUrl);

    } catch (error: any) {
      console.error('Proxy error:', error.message);
      res.status(500).send('Error processing video URL');
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
