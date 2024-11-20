import React, { useState } from 'react'
import { v4 as uuidv4 } from 'uuid';
import logo from '../assets/logo.png'
import toast from 'react-hot-toast';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// import { Link } from 'react-router-dom'

export default function Home() {
    const [userName, setuserName] = useState("");
    const [roomId, setroomId] = useState('');
    const [prevContent,setPrevContent] = useState("");
    const navigate = useNavigate();
    const generateRoomId = (e) => {
        e.preventDefault();
        const id = uuidv4();
        setroomId(id);
        toast.success('Room Id Created');
    }
    const enterRoom = async () => {
        
        if (!userName || !roomId) {
            toast.error("Room Id and Username is required");
            return;
        }
    
        const userId = uuidv4();
    
        try {
            const response = await axios.post('http://localhost:5000/rooms', {
                roomId,
                userName,
                content: "",
                userId,
            });
            
            console.log(response.data.userContent, "usr contennte is thsi");
            setPrevContent(response.data.userContent);
    
            // Navigate after setting prevContent
            console.log("endter room")
            navigate(`/work/${roomId}/${userName}`, {
                state: {
                    prevContent:response.data.userContent,
                    roomId,
                    userName
                }
            });
        } catch (error) {
            console.log("endter room")
            console.error('Error:', error);
        }
    }
    return (
        <div className='bg-slate-950 h-screen'>
            <div className='flex justify-center items-center h-screen'>
                <div className='flex items-center justify-center bg-slate-900 rounded-2xl h-72 w-80 text-white box-border shadow-sm shadow-slate-500'>
                    <div className='' style={{ width: "90%", height: "90%" }}>
                        <div className='h-auto' >
                            <div className='flex items-center font-bold font-sans'>

                                <img className='h-16 w-auto' src={logo} alt="logo" />
                                <h2>Live-CodeEditor</h2>
                            </div>
                            <div>
                                <h2>Paste Invitation Room Id</h2>
                            </div>
                        </div>
                        <div className='flex flex-col items-center justify-center h-auto '>
                            <input className='m-1 text-center rounded-md w-full p-1 text-black' value={roomId} type="text" placeholder='Room Id' onChange={(e) => setroomId(e.target.value)} onKeyUp={(e) => e.code === 'Enter' ? enterRoom() : null} />
                            <input className='m-1 text-center rounded-md w-full p-1 text-black' value={userName} type="text" placeholder='Name' onChange={(e) => setuserName(e.target.value)} onKeyUp={(e) => e.code === 'Enter' ? enterRoom() : null} />
                        </div>
                        <div className='h-auto flex flex-col items-end'>
                            <button className='w-24 p-1 mt-2 border-2 rounded-md bg-green-800  hover:scale-105 border-green-900' onClick={enterRoom}>JOIN</button>
                            <div className='w-full flex justify-center'>
                                <div className='mt-3 flex '>
                                    <h1>Create new room now:- &nbsp; </h1>
                                    <a href='/' onClick={generateRoomId} className='underline hover:text-green-800 hover:scale-105'>New Room</a>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    )
}