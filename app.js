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

// Custom personality answers
const predefinedAnswers = {
  "what should we know about your life story in a few sentences":
    "I’m Shaik Moinuddin, a self-driven full-stack developer from India. I’m the Founding Development Lead at Imaginary Hub, building scalable EdTech products, solving 300+ LeetCode problems, and working on real-world AI and blockchain tech.",

  "what's your number one superpower":
    "Relentless curiosity. I go deep into problems until I fully understand and solve them — whether it’s deploying infrastructure, cracking DSA, or debugging at 3 AM.",

  "what are the top 3 areas you'd like to grow in":
    "1. AI/ML research and real-world application\n2. Startup leadership and fundraising\n3. Scaling backend systems for millions of users",

  "what misconception do your coworkers have about you":
    "That I don’t rest. I’m deeply focused and deliver consistently — but I also take breaks, reflect, and recharge often to keep my mind sharp.",

  "how do you push your boundaries and limits":
    "I challenge myself constantly — like building newsletter automation with cron jobs, learning Hyperledger, leading QA automation with Selenium in my internship — and I never settle for surface-level knowledge."
};

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/voice', upload.single('audio'), async (req, res) => {
  const audioPath = req.file.path;

  try {
    // 1. Send to Deepgram STT
    const audio = fs.readFileSync(audioPath);
    const sttResponse = await axios.post('https://api.deepgram.com/v1/listen', audio, {
      headers: {
        'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`,
        'Content-Type': 'audio/wav'
      }
    });

    const transcript = sttResponse.data.results.channels[0].alternatives[0].transcript;
    console.log('Transcript:', transcript);

    // 2. Match against predefined answers
    const userQuestion = transcript.toLowerCase().trim();
    let reply = predefinedAnswers[userQuestion];

    if (!reply) {
      // fallback to OpenRouter if needed
      const chatResponse = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'mistralai/mistral-7b-instruct',
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
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

    // 3. TTS via Deepgram
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

    fs.writeFileSync('public/response.mp3', ttsResponse.data);

    res.json({ audio: '/response.mp3', text: reply });
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
