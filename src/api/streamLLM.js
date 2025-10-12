import clarinet from "clarinet";
import { modelSelector } from "../constant";

const streamLLM = async function* (prompt, model) {
    const requestBody = {
        contents: [
            {
                parts: [{ text: prompt }],
            },
        ],
    };
    const url_params = modelSelector.find(item => item.value === model)?.url || "";
    try {
        const response = await fetch(url_params, { method: "POST", headers: { "Content-type": "application/json" }, body: JSON.stringify(requestBody) });
        if (!response.ok) {
            yield "Something went wrong with API request. Please try again.";
            return; // stop generator
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");

        const parser = clarinet.parser();
        let isClosed = false;

        let keyStack = [];
        //let valueStack = [];
        let currentObject = null;

        let textList = [];

        //when found object init
        parser.onopenobject = (key) => {
            //valueStack.push(currentObject);
            const obj = {};
            if (key !== undefined) {
                keyStack.push(key);
                obj[key] = undefined;
            }
            currentObject = obj;
        };
        //when found object key
        parser.onkey = (key) => {
            keyStack.push(key);
            //console.log(key);
        }
        //when found value of some key
        parser.onvalue = (value) => {
            if (currentObject && keyStack.length > 0) {
                const key = keyStack.pop();
                currentObject[key] = value;
            }
        }
        //when found object closing
        parser.oncloseobject = () => {
            const obj = currentObject;
            const text = obj?.text || "";
            if (text) textList.push(text);
            currentObject = null;
        }
        parser.onend = () => {
            isClosed = true;
        };
        //parser async job
        (async () => {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                //console.log("value", value);
                const chunk = decoder.decode(value, { stream: true });
                parser.write(chunk);
            }
            parser.close();
        })()

        //return text job
        while (true) {
            if (textList.length > 0) {
                yield textList.shift();
            }
            else {
                await new Promise((r) => setTimeout(r, 10));
                //console.log(parser.closed, textList.length);
                if (isClosed && textList.length === 0) break;
            }
        }
    }
    catch (err) {
        yield "Something went wrong with Streaming. Please try again";
        return;
    }
}

export default streamLLM;