import ACTIONS from '../Actions';
import CodeMirror from '@uiw/react-codemirror';
import React, { useState, useEffect } from 'react';
import { javascript } from '@codemirror/lang-javascript';
import { tokyoNight } from '@uiw/codemirror-theme-tokyo-night';
 export default function CodeBox({ tabId, roomId, name, socket }){

    const [data, setData] = useState("");
    const handleDataChange = (e) => {
        const newdata = e;
        setData(newdata);
        socket.emit(ACTIONS.SEND_CODE_TO_CLIENT, { data: newdata, tabId, roomId }, (resp) => {
            console.log(resp, "send -code -client");
        });
    };

    useEffect(() => {
        socket.on(ACTIONS.SEND_CODE_TO_SERVER, (arg) => {
            if (arg.tabId === tabId) {  
                setData(arg.data);
            }
            console.log(arg, name, "validating")
        });
    }, [socket, name]);

    return(
        <CodeMirror value={data} theme={tokyoNight} height="calc(100vh - 80px)" extensions={[javascript({ jsx: true })]} onChange={handleDataChange} />
    )
 }