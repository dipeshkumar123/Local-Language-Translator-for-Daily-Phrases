// Speech Recognition API initialization
const recognition = new (window.SpeechRecognition ||
  window.webkitSpeechRecognition)();
recognition.continuous = false; // Stop listening once the user finishes speaking
recognition.lang = 'en-US'; // Set to English for speech recognition
recognition.interimResults = false; // Don't show results while user is still speaking

document.getElementById('micBtn').addEventListener('click', function () {
  recognition.start(); // Start speech recognition when the mic button is clicked
  console.log('Listening...');
  document.getElementById('micBtn').classList.add('mic-button-listening'); // Animate microphone icon when listening
  playSound('start'); // Play sound to indicate listening started
});

// Function to handle the speech recognition result
recognition.onresult = function (event) {
  const transcript = event.results[0][0].transcript;
  document.getElementById('phraseInput').value = transcript; // Display speech result in the input box
  console.log('Recognized Speech:', transcript);
  document.getElementById('micBtn').classList.remove('mic-button-listening'); // Stop animation after recognition ends
  playSound('success'); // Play sound to indicate success
};

// Error handling for speech recognition
recognition.onerror = function (event) {
  console.error('Speech recognition error:', event.error);
  playSound('error'); // Play error sound on failure
  document.getElementById('micBtn').classList.remove('mic-button-listening'); // Stop animation on error
};

// Function to detect the language of the phrase
function detectLanguage(phrase) {
  return fetch('https://api.detectlanguage.com/0.2/detect', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer 7249d43b6f7c10772fee1b667ce22ce5',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      q: phrase,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.data.detections.length > 0) {
        return data.data.detections[0].language;
      } else {
        throw new Error('Could not detect language');
      }
    })
    .catch((error) => {
      console.error('Language detection error:', error);
      return 'en'; // Default to English if detection fails
    });
}

// Function to send the translation request to the API
document.getElementById('translateBtn').addEventListener('click', function () {
  const phrase = document
    .getElementById('phraseInput')
    .value.trim()
    .toLowerCase();

  if (!phrase) {
    alert('Please enter a phrase to translate!');
    return;
  }

  // First, detect the language of the phrase
  detectLanguage(phrase).then((detectedLanguage) => {
    console.log('Detected language:', detectedLanguage);

    const targetLanguage = document.getElementById('language').value; // Selected target language for translation

    // Construct the API request for the translation
    const myHeaders = new Headers();
    myHeaders.append(
      'x-apihub-key',
      'nEOakcTu9XxW01I7r8PnKVTMvCE8a54ATMnZ0S8EAEpwRXrIeu'
    );
    myHeaders.append('x-apihub-host', 'Translate.allthingsdev.co');
    myHeaders.append(
      'x-apihub-endpoint',
      '3f4ee5f4-f67c-4c5a-9375-635d8b514026'
    );
    myHeaders.append('Content-Type', 'application/json');

    const raw = JSON.stringify({
      input: phrase,
    });

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow',
    };

    // Fetch translation, dynamically setting the source language and target language
    fetch(
      `https://Translate.proxy-production.allthingsdev.co/translate?translated_from=${detectedLanguage}&translated_to=${targetLanguage}`,
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        const translatedText = result.translation[0];
        document.getElementById('translatedPhrase').textContent =
          translatedText;
        document.getElementById('result').style.display = 'block'; // Show the result section
        playSound('translation'); // Play sound once translation is ready
      })
      .catch((error) => {
        console.error('Translation error:', error);
        alert('Failed to translate. Please try again.');
      });
  });
});

// Function to play different sounds based on context
function playSound(type) {
  const audio = new Audio();
  switch (type) {
    case 'start':
      audio.src = 'https://www.soundjay.com/button/beep-07.wav'; // Start sound
      break;
    case 'success':
      audio.src = 'https://www.soundjay.com/button/beep-09.wav'; // Success sound
      break;
    case 'error':
      audio.src = 'https://www.soundjay.com/button/beep-10.wav'; // Error sound
      break;
    case 'translation':
      audio.src = 'https://www.soundjay.com/button/beep-08b.wav'; // Translation ready sound
      break;
    default:
      break;
  }
  audio.play();
}

// Play the translated text as audio
document.getElementById('playAudio').addEventListener('click', function () {
  const text = document.getElementById('translatedPhrase').textContent.trim();
  const targetLanguage = document.getElementById('language').value;

  const speech = new SpeechSynthesisUtterance(text);

  // Set the language based on the target language
  switch (targetLanguage) {
    case 'hi': // Hindi
      speech.lang = 'hi-IN'; // Hindi locale
      break;
    case 'es': // Spanish
      speech.lang = 'es-ES'; // Spanish locale
      break;
    case 'fr': // French
      speech.lang = 'fr-FR'; // French locale
      break;
    case 'de': // German
      speech.lang = 'de-DE'; // German locale
      break;
    default: // Fallback to English
      speech.lang = 'en-US'; // English locale
      break;
  }

  speech.pitch = 1; // Normal pitch
  speech.rate = 1; // Normal rate
  speech.volume = 1; // Max volume

  window.speechSynthesis.speak(speech);
});
