require('dotenv').config();

const form = document.getElementById('chat-form');
const mytextInput = document.getElementById('mytext');
const responseTextarea = document.getElementById('response');

const API_KEY = process.env.API_KEY;

let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // Minimum interval between requests in milliseconds

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const currentTime = Date.now();
    const timeSinceLastRequest = currentTime - lastRequestTime;

    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
        // If not enough time has passed, wait before making another request
        setTimeout(() => {
            makeRequest();
        }, MIN_REQUEST_INTERVAL - timeSinceLastRequest);
    } else {
        makeRequest();
    }
});

async function makeRequest() {
    const role = "Translate this message into ";
    const languageSelect = document.getElementById('language-select');
    const language = languageSelect.options[languageSelect.selectedIndex].text;
    const mytext = role + language + ': ' + mytextInput.value.trim();

    if (mytext) {
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`,
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [{ role: 'user', content: `'${mytext}'` }],
                    temperature: 1.0,
                    top_p: 0.9,
                    n: 1,
                    stream: false,
                    presence_penalty: 0,
                    frequency_penalty: 0,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                responseTextarea.value = data.choices[0].message.content;
            } else {
                responseTextarea.value = 'Error: Unable to process your request.';
            }
        } catch (error) {
            console.error(error);
            responseTextarea.value = 'Error: Unable to process your request.';
        } finally {
            lastRequestTime = Date.now();
        }
    }
}
