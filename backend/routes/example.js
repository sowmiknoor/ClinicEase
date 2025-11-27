const express = require('express');
const router = express.Router();
const csv = require('csvtojson');

// GET /api/example/ping
router.get('/ping', (req, res) => {
  res.json({ ok: true, message: 'pong' });
});

// POST /api/example/parse-csv (accepts a URL to a CSV as JSON body: { url: 'https://...' })
router.post('/parse-csv', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'url required' });
  try {
    // Fetch CSV as text and convert to JSON. Using fromString avoids
    // incompatibilities between WHATWG streams (Node fetch) and Node streams
    // that csvtojson expects.
    const response = await fetch(url);
    const text = await response.text();
    const json = await csv().fromString(text);
    res.json({ ok: true, data: json });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
