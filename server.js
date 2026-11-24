import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { GoogleGenAI } from '@google/genai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT) || 3000;

app.disable('x-powered-by');

const ttsCache = new Map();
const ttsInflight = new Map();
const MAX_TTS_CACHE = 120;

function rememberTts(key, entry) {
  if (ttsCache.has(key)) ttsCache.delete(key);
  ttsCache.set(key, entry);
  if (ttsCache.size > MAX_TTS_CACHE) {
    ttsCache.delete(ttsCache.keys().next().value);
  }
}

function splitTtsChunks(text, maxLen = 180) {
  if (text.length <= maxLen) return [text];
  const chunks = [];
  let rest = text;
  while (rest.length > maxLen) {
    let splitAt = -1;
    for (const sep of ['. ', '! ', '? ', '; ', ', ', ' ']) {
      const idx = rest.lastIndexOf(sep, maxLen);
      if (idx > 24) {
        splitAt = idx + sep.length;
        break;
      }
    }
    if (splitAt <= 0) splitAt = maxLen;
    chunks.push(rest.slice(0, splitAt).trim());
    rest = rest.slice(splitAt).trim();
  }
  if (rest) chunks.push(rest);
  return chunks.filter(Boolean);
}

async function synthesizeWithGemini(text, apiKey) {
  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash-lite-tts',
    contents: [
      {
        role: 'user',
        parts: [
          {
            text,
            speechMetadata: {
              style:
                'Warm, lively Vietnamese sidewalk cafe host speaking naturally and clearly in Vietnamese',
            },
          },
        ],
      },
    ],
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Puck' },
        },
      },
    },
  });

  const base64Audio =
    response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) {
    throw new Error('Empty audio response from Gemini TTS');
  }

  return {
    buffer: Buffer.from(base64Audio, 'base64'),
    contentType: 'audio/wav',
  };
}

async function synthesizeWithGoogleTranslateTts(text) {
  const chunks = splitTtsChunks(text, 180);
  const buffers = [];
  for (const chunk of chunks) {
    const url =
      'https://translate.google.com/translate_tts?' +
      new URLSearchParams({
        ie: 'UTF-8',
        q: chunk,
        tl: 'vi',
        client: 'tw-ob',
      });
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        Referer: 'https://translate.google.com/',
      },
    });
    if (!res.ok) {
      const err = new Error(`Vietnamese TTS upstream HTTP ${res.status}`);
      err.statusCode = 502;
      throw err;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > 0) buffers.push(buf);
  }
  if (!buffers.length) {
    const err = new Error('Empty Vietnamese TTS audio');
    err.statusCode = 502;
    throw err;
  }
  return {
    buffer: Buffer.concat(buffers),
    contentType: 'audio/mpeg',
  };
}

async function synthesizeVietnameseHostVoice(text) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (apiKey) {
    try {
      return await synthesizeWithGemini(text, apiKey);
    } catch (err) {
      console.warn('Gemini TTS fallback:', err?.message || err);
    }
  }
  return synthesizeWithGoogleTranslateTts(text);
}

app.get(['/', '/index.html'], (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/styles.css', (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.sendFile(path.join(__dirname, 'styles.css'));
});

app.get('/api/host-voice', async (req, res) => {
  const rawText = typeof req.query.text === 'string' ? req.query.text : '';
  const text = rawText.trim().replace(/\s+/g, ' ').slice(0, 280);
  if (!text) {
    res.status(400).json({ error: 'Missing text parameter' });
    return;
  }

  const cached = ttsCache.get(text);
  if (cached) {
    rememberTts(text, cached);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.type(cached.contentType).send(cached.buffer);
    return;
  }

  try {
    let pending = ttsInflight.get(text);
    if (!pending) {
      pending = synthesizeVietnameseHostVoice(text).finally(() => {
        ttsInflight.delete(text);
      });
      ttsInflight.set(text, pending);
    }
    const entry = await pending;
    rememberTts(text, entry);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.type(entry.contentType).send(entry.buffer);
  } catch (err) {
    const status = Number(err?.statusCode) || 502;
    res.status(status).json({
      error: err?.message || 'Unable to synthesize Vietnamese host voice.',
    });
  }
});

app.use((_req, res) => {
  res.status(404).send('Not found');
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Quán Nước Vỉa Hè listening on http://0.0.0.0:${port}`);
});
