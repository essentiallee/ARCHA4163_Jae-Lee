# Gallery Map Chatbot — Beginner Version

This project follows the class **02 Chat Bot** tutorial as closely as possible while keeping the OpenAI API key out of browser code.

The chatbot only answers from the simple gallery list. It does **not** crawl websites, check live hours, save conversations, or use advanced agent features.

## How this compares with the tutorial

The tutorial teaches this flow:

1. The user enters a message in HTML.
2. JavaScript sends the message to OpenAI.
3. The reply appears in the chat window.

This project uses the same flow. The only security change is that a small Firebase Function sends the OpenAI request. The tutorial itself recommends a server or Firebase Function for protecting a real API key.

## Chatbot files

```text
public/
  index.html                    The visible webpage and chat form
  javascript/
    gallery-chat.js             Sends a question and displays the answer

functions/
  index.js                      Privately sends the question to OpenAI
  data/
    gallery-list.csv            Simple gallery information for the chatbot
  package.json                  Firebase Function setup

firebase.json                   Connects /api/chat to the private function
```

The other files inside `public/` belong to the map and timeline portions of the project, not the chatbot tutorial.

## What each chatbot file teaches

### 1. `public/index.html`

Contains the chat messages, text box, Send button, and example questions.

### 2. `public/javascript/gallery-chat.js`

Reads the question, sends it to `/api/chat`, and places the answer on the page. This is the closest equivalent to the tutorial's `chat-bot.js`.

### 3. `functions/index.js`

Reads `gallery-list.csv`, adds that list to the chatbot instructions, and sends the request to OpenAI. Keeping this request here prevents the API key from appearing in the browser.

### 4. `functions/data/gallery-list.csv`

Contains only the basic route information used by the chatbot: gallery name, area, priority, and description. It is a small copy of the gallery rows in `public/data/gallery-nodes.csv`.

## Install once

Install Node.js and the Firebase command-line tool. Then run:

```sh
cd functions
npm install
cd ..
firebase login
```

## Test locally

The local API key is stored in `functions/.secret.local`, which Git ignores.

Start both the webpage and the private function:

```sh
firebase emulators:start --only hosting,functions
```

Open the Firebase Hosting address printed in the terminal, normally `http://localhost:5000`.

Do not use VS Code Live Server for chatbot testing. Live Server can display static files, but it cannot run `/api/chat`.

## Publish later

Firebase requires the Blaze plan to use Cloud Functions and Secret Manager. After upgrading:

```sh
firebase functions:secrets:set OPENAI_API_KEY
firebase deploy --only functions,hosting
```

OpenAI API billing is separate from Firebase billing.

## Beginner-version limits

- Answers only from `gallery-list.csv`
- No live website search or web crawler
- No saved chat history
- No Firebase Realtime Database
- No authentication
- No advanced agent tools

These can be studied later as separate extensions after the basic tutorial version works.
