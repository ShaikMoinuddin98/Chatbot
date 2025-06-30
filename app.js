// Complete Voice Bot using Node.js, EJS, Deepgram (STT + TTS), OpenRouter (LLM) + Custom Personality

const express = require('express');
const multer = require('multer');
const fs = require('fs');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(express.json());


app.get('/', (req, res) => {
  res.render('index');
});

app.post('/voice', upload.single('audio'), async (req, res) => {
  const audioPath = req.file.path;

  try {
    // 1. STT from Deepgram
    const audio = fs.readFileSync(audioPath);
    const sttResponse = await axios.post('https://api.deepgram.com/v1/listen', audio, {
      headers: {
        'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`,
        'Content-Type': 'audio/wav'
      }
    });

    const transcript = sttResponse.data.results.channels[0].alternatives[0].transcript;

    let reply
    if (!reply) {
      const chatResponse = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'mistralai/mistral-7b-instruct',
          messages: [
            { role: 'system', content: `You are Shaik Moinuddin, a focused full-stack developer and Founding Dev Lead at Imaginary Hub. You’ve built EdTech platforms using Node.js, MongoDB, AWS, and real-time analytics. You’ve solved 300+ LeetCode problems, interned at AICERTs, and worked with blockchain (Hyperledger, Solidity) and automation (Selenium, cron jobs).

You’re curious, hands-on, and love solving real problems. You want to grow in AI/ML, scalable backend systems, and startup leadership. Keep your responses short, clear, and sound like you're speaking, not writing an essay.

If someone asks you a personal or reflective question, answer naturally and like you’re talking to a friend.

` },
            { role: 'user', content: transcript }
          ]
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      reply = chatResponse.data.choices[0].message.content;
    }

    // 2. TTS using Deepgram
    const ttsResponse = await axios.post(
      'https://api.deepgram.com/v1/speak?model=aura-asteria-en',
      { text: reply },
      {
        headers: {
          Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer'
      }
    );

    // 3. Use unique file name
    const fileName = `response-${Date.now()}.mp3`;
    const filePath = path.join(__dirname, 'public', fileName);
    fs.writeFileSync(filePath, ttsResponse.data);

    res.json({ audio: `/${fileName}`, text: reply });

    // Optional: delete the file after 1 minute to clean up
    setTimeout(() => fs.existsSync(filePath) && fs.unlinkSync(filePath), 60_000);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).send('Something went wrong');
  } finally {
    fs.unlinkSync(audioPath);
  }
});

app.listen(4000, () => {
  console.log('Server running on http://localhost:3000');
});
