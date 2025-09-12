import axios from "axios";

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

const useGoogleLLM = async (prompt) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const body = {
        contents: [
            { parts: [{ text: prompt }] }
        ]
    }
    try {
        const response = await axios.post(url, body, { headers: { 'Content-Type': 'application/json' } })
        //console.log(response);
        return response.data;
    } catch (error) {
        console.error("Error on Calling API: ", error.response?.data || error.messaage);
    }
}

export default useGoogleLLM;