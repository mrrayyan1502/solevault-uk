import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_PRODUCTS } from './src/data/initialProducts';

const app = express();
const PORT = 3000;

// Body parser with 50MB limit to handle image batches and high-res photos
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const DATA_DIR = path.join(process.cwd(), 'data');
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Ensure uploaded files are served statically
app.use('/uploads', express.static(UPLOADS_DIR));
app.use('/images', express.static(path.join(process.cwd(), 'public', 'images')));

const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const SALES_FILE = path.join(DATA_DIR, 'sales.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

// Initialize products file if it does not exist yet
if (!fs.existsSync(PRODUCTS_FILE)) {
  try {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(INITIAL_PRODUCTS, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to initialize products file:', err);
  }
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Products API
app.get('/api/products', (req, res) => {
  try {
    if (fs.existsSync(PRODUCTS_FILE)) {
      const data = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
      return res.json(JSON.parse(data));
    }
    // Return empty array if not initialized yet; frontend will fallback to INITIAL_PRODUCTS
    return res.json([]);
  } catch (error) {
    console.error('Error reading products file:', error);
    res.status(500).json({ error: 'Failed to read products' });
  }
});

app.post('/api/products', (req, res) => {
  try {
    const products = req.body;
    if (!Array.isArray(products)) {
      return res.status(400).json({ error: 'Products payload must be an array' });
    }
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf-8');
    res.json({ success: true, count: products.length });
  } catch (error) {
    console.error('Error saving products:', error);
    res.status(500).json({ error: 'Failed to save products' });
  }
});

// Image Upload API (Accepts base64 encoded data)
app.post('/api/upload', (req, res) => {
  try {
    const { filename, data } = req.body;
    if (!data) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    // Extract mime type and base64 data
    const matches = data.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    let buffer: Buffer;
    let ext = '.jpg';

    if (matches && matches.length === 3) {
      const mime = matches[1];
      if (mime.includes('png')) ext = '.png';
      else if (mime.includes('webp')) ext = '.webp';
      else if (mime.includes('jpeg') || mime.includes('jpg')) ext = '.jpg';
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(data, 'base64');
    }

    const safeName = (filename || `shoe-${Date.now()}`)
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/\.[^/.]+$/, '');
    const finalFilename = `${safeName}-${Date.now()}${ext}`;
    const filePath = path.join(UPLOADS_DIR, finalFilename);

    fs.writeFileSync(filePath, buffer);

    // Also copy to dist/uploads if dist exists in production
    const distUploads = path.join(process.cwd(), 'dist', 'uploads');
    if (fs.existsSync(path.join(process.cwd(), 'dist'))) {
      if (!fs.existsSync(distUploads)) {
        fs.mkdirSync(distUploads, { recursive: true });
      }
      fs.writeFileSync(path.join(distUploads, finalFilename), buffer);
    }

    const publicUrl = `/uploads/${finalFilename}`;
    res.json({ success: true, url: publicUrl, filename: finalFilename });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Dynamic AI Shoe & Colourway Identification API
app.post('/api/identify-shoe', async (req, res) => {
  try {
    const { image, base64 } = req.body;
    let base64Data = base64;
    let mimeType = 'image/jpeg';

    if (!base64Data && image) {
      const sanitized = image.replace(/^\//, '');
      const localPath = path.join(process.cwd(), 'public', sanitized);
      if (fs.existsSync(localPath)) {
        base64Data = fs.readFileSync(localPath).toString('base64');
        const ext = path.extname(localPath).toLowerCase();
        if (ext === '.png') mimeType = 'image/png';
        else if (ext === '.webp') mimeType = 'image/webp';
      }
    }

    if (!base64Data) {
      return res.status(400).json({ error: 'Valid image path or base64 data required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.json({ name: 'Performance Runner', colour: 'Standard Colourway' });
    }

    const ai = new GoogleGenAI();
    const prompt = `Analyze this athletic sneaker / running shoe image.
Identify:
1. Brand and exact model name (e.g. On Running Cloudsurfer, On Cloudmonster, On Cloud 5, On Cloudtilt, On Cloudswift, Adidas Adizero, etc.).
2. The specific colourway (e.g. All Black, Ivory / Mineral, Frost / Surf, Sand / Fawn, Undyed White, etc.).

Return strictly JSON:
{
  "name": "Exact Brand and Model Name",
  "colour": "Specific Colourway"
}`;

    // Try candidate models
    const models = ['gemini-3.1-flash-lite', 'gemini-3.6-flash', 'gemini-3.8-flash'];
    for (const m of models) {
      try {
        const response = await ai.models.generateContent({
          model: m,
          contents: [
            {
              role: 'user',
              parts: [
                { inlineData: { mimeType, data: base64Data } },
                { text: prompt },
              ],
            },
          ],
          config: { responseMimeType: 'application/json' },
        });

        const parsed = JSON.parse(response.text || '{}');
        if (parsed.name) {
          return res.json({
            name: parsed.name.trim(),
            colour: (parsed.colour || 'Standard Colourway').trim(),
          });
        }
      } catch (err) {
        // try next model if rate limited
      }
    }

    return res.json({ name: 'Performance Runner', colour: 'Standard Colourway' });
  } catch (err) {
    console.error('Shoe identification error:', err);
    return res.status(500).json({ error: 'Failed to identify shoe' });
  }
});

// Sales API
app.get('/api/sales', (req, res) => {
  try {
    if (fs.existsSync(SALES_FILE)) {
      const data = fs.readFileSync(SALES_FILE, 'utf-8');
      return res.json(JSON.parse(data));
    }
    return res.json([]);
  } catch (error) {
    console.error('Error reading sales:', error);
    res.status(500).json({ error: 'Failed to read sales' });
  }
});

app.post('/api/sales', (req, res) => {
  try {
    const sales = req.body;
    if (!Array.isArray(sales)) {
      return res.status(400).json({ error: 'Sales payload must be an array' });
    }
    fs.writeFileSync(SALES_FILE, JSON.stringify(sales, null, 2), 'utf-8');
    res.json({ success: true, count: sales.length });
  } catch (error) {
    console.error('Error saving sales:', error);
    res.status(500).json({ error: 'Failed to save sales' });
  }
});

// Settings API
app.get('/api/settings', (req, res) => {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      return res.json(JSON.parse(data));
    }
    return res.json(null);
  } catch (error) {
    console.error('Error reading settings:', error);
    res.status(500).json({ error: 'Failed to read settings' });
  }
});

app.post('/api/settings', (req, res) => {
  try {
    const settings = req.body;
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving settings:', error);
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

async function startServer() {
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
