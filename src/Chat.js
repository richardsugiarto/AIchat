import { useState } from 'react';
import { Grid, TextField, Button, Box, Skeleton, Typography } from '@mui/material';
import Typewriter from './component/Typewriter';
import useGoogleLLM from './api/useGoogleLLM';
import { useMutation } from "@tanstack/react-query";
import streamGoogleLLM from './api/streamGoogleLLM';
import { useEffect } from 'react';

const Chat = () => {
    const [inputChat, setInputChat] = useState('');

    const [animText, setAnimText] = useState([]);

    const [isStreaming, setIsStreaming] = useState(false);

    const googleLLMMutation = useMutation({
        mutationFn: useGoogleLLM,
        onSuccess: (data) => {
            //console.log(data);
            setAnimText(prevAnimText => {
                if (prevAnimText.length === 0) return prevAnimText;

                const updated = [...prevAnimText];

                updated[updated.length - 1] = {
                    ...updated[updated.length - 1],
                    text: data?.candidates[0]?.content.parts[0].text
                };

                return updated;
            });
        }
    });

    const handleTextChange = (event) => {
        setInputChat(event.target.value);
    };

    const handleSend = async () => {
        setAnimText(prevAnimText => [...prevAnimText, { prompt: inputChat, text: "" }]);
        //googleLLMMutation.mutate(inputChat);
        try {
            setIsStreaming(true);
            setInputChat("");
            for await (const chunk of streamGoogleLLM(inputChat)) {
                //console.log("chunk:", chunk);
                //console.log(typeof(chunk));
                setAnimText(prevAnimText => {
                    if (prevAnimText.length === 0) return prevAnimText;

                    const updated = [...prevAnimText];

                    updated[updated.length - 1] = {
                        ...updated[updated.length - 1],
                        text: updated[updated.length - 1].text + chunk
                    };

                    return updated;
                });
            };
        } catch (error) {
            console.error("Error handling Gemini Streaming: ", error)
        }
        finally {
            setIsStreaming(false);
        }
    };

    return (
        <Grid container spacing={2}>
            <Grid size={{ xs: 0, md: 2 }}>

            </Grid>
            <Grid size={{ xs: 12, md: 8 }} sx={{ display: 'flex', flexDirection: 'column', position: 'relative', mx: "10px" }}>
                <Typography variant="h3" sx={{ display: "flex", justifyContent: "center" }}>AI Chat</Typography>
                <Box style={{ mb: '200px' }}>

                    {animText.map(({ prompt, text }) =>
                        <>
                            <Box sx={{ width: "fit-content", background: "rgba(0,0,0,0.06)", padding: "10px", borderRadius: "10px" }}>{prompt}</Box>
                            <br />
                            {text === "" ? <Skeleton variant='text' sx={{ fontSize: '20px' }} /> : <Typewriter text={text} delay={25}></Typewriter>}
                            <br />
                        </>)}
                    {/*animText.map(({ text }) => <Typewriter text={text} />)*/}
                    {/*<Skeleton variant='text' sx={{ fontSize: '20px' }} />*/}
                </Box>
                <Box style={{ background: "#fefefe", display: 'flex', flexDirection: 'column', position: 'fixed', left: '16%', right: '16%', bottom: '10px', zIndex: '0' }}>
                    <TextField placeholder="Ask something..." id="outlined-basic" label="" variant="filled" onChange={handleTextChange} multiline value={inputChat} />
                    <Button disabled={isStreaming} variant="outlined" onClick={handleSend}>Send</Button>
                </Box>
            </Grid>
            <Grid size={{ xs: 0, md: 2 }}>

            </Grid>
        </Grid>);
}

export default Chat;