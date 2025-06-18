const recordBtn = document.getElementById('record');
const responseAudio = document.getElementById('responseAudio');
const transcriptText = document.getElementById('transcript');

let mediaRecorder;
let audioChunks = [];

recordBtn.onclick = async () => {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
    recordBtn.textContent = '🎙️ Start Recording';
    return;
  }

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);
  audioChunks = [];

  mediaRecorder.ondataavailable = e => audioChunks.push(e.data);

  mediaRecorder.onstop = async () => {
    const blob = new Blob(audioChunks, { type: 'audio/wav' });
    const formData = new FormData();
    formData.append('audio', blob, 'voice.wav');

    const res = await fetch('/voice', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    transcriptText.textContent = `🤖 Bot says: ${data.text}`;
    responseAudio.src = data.audio;
    responseAudio.play();
  };

  mediaRecorder.start();
  recordBtn.textContent = '⏹️ Stop Recording';
};
