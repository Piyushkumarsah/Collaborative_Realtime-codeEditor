import ACTIONS from '../Actions';
import CodeMirror from '@uiw/react-codemirror';
import React, { useState, useEffect } from 'react';
import { javascript } from '@codemirror/lang-javascript';
import { tokyoNight } from '@uiw/codemirror-theme-tokyo-night';
import axios from 'axios';
import toast from 'react-hot-toast';
 export default function CodeBox({ tabId,prevUser, prevContent, roomId, name, socket }){

    const [data, setData] = useState("");
    const handleDataChange = (e) => {
        const newdata = e;
        setData(newdata);
        socket.emit(ACTIONS.SEND_CODE_TO_CLIENT, { data: newdata, tabId, roomId ,name}, (resp) => {
            console.log(resp, "send -code -client");
        });
    };
    const fetchPrevContent=()=>{
        socket.emit(ACTIONS.SEND_CODE_TO_CLIENT, {data: prevContent, tabId, roomId ,name:prevUser}, (resp) => {
            console.log(resp, "send -code -client");
        });
        console.log(prevContent,"got preVcontetnt");
    }
    const updateContent = async (arg) =>{
          const  roomId = arg.roomId
          const  content = arg.data
          const  userName = arg.name
          try {
            const response = await axios.put(`http://localhost:5000/rooms/${roomId}/user/${userName}`, { content });
            toast.success('User content updated successfully');
            return response.data;
          } catch (error) {
            toast.error('Error updating user content');
            console.error('Error:', error);
            throw error;
          }
        
    }
    useEffect(() => {
        socket.on(ACTIONS.SEND_CODE_TO_SERVER, (arg) => {
            if (arg.tabId === tabId) {  
                updateContent(arg);
                setData(arg.data);
                console.log(arg.data, name, "validating data")
            }
        });
        fetchPrevContent();
    }, [socket, name]);

    return(
        <CodeMirror value={data} theme={tokyoNight} height="calc(100vh - 80px)" extensions={[javascript({ jsx: true })]} onChange={handleDataChange} />
    )
 }