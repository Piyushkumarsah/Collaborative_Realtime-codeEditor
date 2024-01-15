import React, { useEffect, useState } from 'react'
import logo from './logo.png'
import Client from './Client';
import TextArea from './TextArea';
import ACTIONS from '../Actions'
import { io } from 'socket.io-client'
import { useLocation, useNavigate, Navigate } from 'react-router';
import toast from 'react-hot-toast';

const socket = io('http://localhost:5000', {
    reconnectionAttempts: 'Infinity',
    transports: ['websocket']
})
socket.addEventListener('open', (event) => {
    console.log('WebSocket connection opened:', event);
  });
  
  socket.addEventListener('error', (event) => {
    console.error('WebSocket error:', event);
  });
  
  socket.addEventListener('close', (event) => {
    console.warn('WebSocket connection closed:', event);
  });
export default function Editor() {
    const navigateTo = useNavigate();
    const location = useLocation();
    const [code, setCode] = useState('');
    const roomId = location.state.roomId;
    const userName = location.state.userName;
    const [client, setClient] = useState([
        { socketid: socket.id, userName }
    ])
    const copyRoom = () => {
        navigator.clipboard.writeText(roomId);
        toast.success("RoomId copied to clipBoard");
    }
    const LeaveRoomNow = () => {
        socket.emit(ACTIONS.LEFT, { socketid: socket.id, userName, roomId });
        toast.error("You Left")
        navigateTo('/');
    }
    useEffect(() => {
        socket.emit(ACTIONS.JOINROOM, {
            roomId,
            userName
        })
        socket.on(ACTIONS.CLIENTS, (details) => {
            if (details.userName !== userName)
                toast.success(`${details.userName} Joined`);
            else {
                toast.success('You Joined')
            }
            console.log(" all clients ", details)
            setClient(details.clients);
        })
        socket.on(ACTIONS.DISCONNECTED, (details) => {
            console.log("user deleted is", details.userName);
            if(details.userName)
            toast.error(`${details.userName} left the room !`);
            const clientIdToRemove = details.key;
            setClient((prev) => {
                return prev.filter(
                    (client) => client.socketid !== clientIdToRemove
                );
            });
        })
        return () => {
            socket.disconnect();
            socket.off(ACTIONS.JOINED);
            socket.off(ACTIONS.DISCONNECTED);
        };
    }, [])
    if (!location.state) {
        return <Navigate to="/" />;
    }
    return (
        <div className='bg-slate-950'>
            <div className='h-screen flex flex-col text-white'>
                <div className='h-52 bg-slate-900 p-2'>
                    <div className='flex h-full'>
                        <div className='w-56'>
                            <div className='flex items-center'>
                                <img className='h-16 w-16' src={logo} alt="" />
                                <div>
                                    <span><h2 className='font-bold text-sm sm:text-base'>Live-CodeEditor</h2></span>
                                </div>
                            </div>
                            <div className=" flex justify-end w-full">
                                <div className='flex flex-col w-full justify-center items-center h-full'>
                                    <button className=' p-2 m-2 rounded-md text-center bg-white text-black font-bold hover:scale-110' onClick={copyRoom}>Copy Room</button>
                                    <button className=' p-2 m-2 rounded-md text-center font-bold bg-green-800 hover:scale-110' onClick={LeaveRoomNow}>Leave Room </button>
                                </div>
                            </div>
                        </div>
                        <div className='bg-slate-800 flex flex-col border-2  w-full text-slate-300'>
                            <div><span className='p-1'> {userName} ( Connected )</span></div>
                            <div className='mr-1 border flex flex-wrap overflow-auto max-h-40 h-full' >
                                {
                                    client.length>1 ? client.map((client) => (
                                        <Client key={client.id} userName={client.userName} ></Client>
                                    ))
                                        :
                                        <div className='w-full h-full border flex justify-center items-center font-bold text-slate-600'>
                                            <span>Share Room_ID with other friends to let them join and code collaboratively...</span>
                                        </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
                <TextArea roomId={roomId} userName={userName} socket={socket} ></TextArea>
                {/* <textarea onChange={(e)=>{console.log("changing",e.target.value)}}></textarea> */}

            </div>
        </div>
    )
}
