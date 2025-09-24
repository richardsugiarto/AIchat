import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

const Typewriter = ({ text, delay = 100 }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [animText, setAnimText] = useState(text);
    const [currentText, setCurrentText] = useState("");

    useEffect(() => {
        if (currentIndex < animText.length) {
            const timeout = setTimeout(() => {
                setCurrentText(prevText => prevText + animText[currentIndex]);
                setCurrentIndex(prevIndex => prevIndex + 1);
            }, delay)

            return () => clearTimeout(timeout);
        }
        else if (animText !== text) {
            setAnimText(text);
            //setCurrentIndex(0);
            //setCurrentText('');
        }
    }, [currentIndex, text, delay, animText]);
    return (<ReactMarkdown>{currentText}</ReactMarkdown>);
}

export default Typewriter;