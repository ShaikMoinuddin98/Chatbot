# 🧠 VoiceBot: AI-Powered Voice Assistant

Live Demo: [chatbot-t9vu.onrender.com](https://chatbot-t9vu.onrender.com)

## 🎙️ Overview

VoiceBot is a full-stack AI-powered voice assistant that allows users to speak with an AI bot and get dynamic audio + text responses. It uses:

* **Deepgram** for Speech-to-Text and Text-to-Speech.
* **OpenRouter LLM** for intelligent conversation.
* **Node.js + Express** backend.
* **EJS** frontend templating.

---

## ⚙️ Tech Stack

* **Frontend**: HTML, CSS, JavaScript, EJS
* **Backend**: Node.js, Express.js
* **AI/ML**:

  * Deepgram API for STT (Speech to Text) and TTS (Text to Speech)
  * OpenRouter (customizable LLM personality)
* **Hosting**: Render

---

## ✨ Features

* 🎤 Voice Recording via browser
* 📤 Uploads voice input to server
* 🤖 Gets LLM-generated response (text + audio)
* 🔊 Plays audio back to user
* 📄 Displays transcript on screen

---

## 🚀 How It Works

1. User clicks the mic button and speaks.
2. Audio is recorded and sent to the server.
3. Server uses Deepgram to transcribe.
4. Transcribed text is sent to OpenRouter for response.
5. Bot response is converted to audio via Deepgram TTS.
6. Audio + text is returned to frontend and played.

---

## 📂 Project Structure

```
├── public/
│   └── js, css files
├── views/
│   └── index.ejs
├── routes/
│   └── voice.js
├── .env
├── server.js
```

---

## 🛠️ Setup Instructions

1. Clone this repo
2. Add your `.env` file:

```env
DEEPGRAM_API_KEY=your_deepgram_key
OPENROUTER_API_KEY=your_openrouter_key
```

3. Run:

```bash
npm install
node server.js
```

---

## 🤝 Contributing

Pull requests and suggestions are welcome!

---

## 📜 License

MIT License
