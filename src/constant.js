const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

export const modelSelector = [
    {
        label: "Google Gemini",
        value: "gemini",
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?key=${GEMINI_API_KEY}`
    },
    {
        label: "Ollama",
        value: "ollama",
        url: "http://127.0.0.1:8000/generate"
    }
];
