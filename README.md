# ChatGPT-Style Chat Application

A modern, responsive chat application inspired by ChatGPT, built with vanilla HTML, CSS, and JavaScript.

## Features

- 🎨 Modern and clean user interface
- 💬 Real-time chat simulation with AI responses
- ⌨️ Support for Enter to send and Shift+Enter for new line
- 📱 Responsive design for mobile and desktop
- ✨ Smooth animations and typing indicators
- 🤖 Context-aware responses based on user input

## Usage

### Running Locally

Simply open the `index.html` file in your web browser:

1. Clone or download this repository
2. Open `index.html` in your preferred web browser
3. Start chatting!

Alternatively, you can serve it with a local web server:

```bash
# Using Python 3
python -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js (if you have http-server installed)
npx http-server
```

Then navigate to `http://localhost:8000` in your browser.

## How It Works

The application consists of three main files:

- **index.html** - The main HTML structure of the chat interface
- **style.css** - All styling and animations for the chat UI
- **script.js** - JavaScript logic for message handling and simulated AI responses

The chat interface includes:
- A header with the application title
- A scrollable message area displaying conversation history
- An input area with auto-resizing textarea
- A send button with hover effects

## Features in Detail

### Message Types
- User messages appear on the right with a purple gradient background
- AI responses appear on the left with a white background
- Each message includes an avatar (👤 for user, 🤖 for AI)

### Smart Responses
The AI provides contextual responses based on keywords in your message:
- Greetings (hello, hi)
- Farewells (bye, goodbye)
- Time and date queries
- Help requests
- And more!

### UI/UX Features
- Auto-scrolling to latest message
- Typing indicator while AI is "thinking"
- Auto-resizing input field
- Keyboard shortcuts (Enter to send, Shift+Enter for new line)
- Smooth animations for new messages

## Browser Compatibility

Works in all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Opera (latest)

## License

MIT License - Feel free to use this project for learning or personal use.