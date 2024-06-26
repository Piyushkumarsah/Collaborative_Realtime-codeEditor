import React, { useEffect, useState } from 'react'
import logo from '../assets/logo.png'
import Client from './Client';
import Split from 'react-split'
import { getAIResponse } from '../AiModel';
import toast from 'react-hot-toast';
import ACTIONS from '../Actions'
import { io } from 'socket.io-client'
import { useLocation, useNavigate, Navigate } from 'react-router';
import { useParams } from 'react-router';
import JoyTab from './JoyTab';
const socket = io('http://localhost:5000', {
    reconnectionAttempts: 'Infinity',
    transports: ['websocket']
})
export default function Editor() {
    const { roomId, userName } = useParams();
    const navigateTo = useNavigate();
    const [ai, setAi] = useState(false);
    const location = useLocation();

    const [client, setClient] = useState([
        { socketid: socket.id, userName }
    ])
    const ActivateAi = () => {
        setAi(!ai);
    }
    const [promptt, setPrompt] = useState("");
    const [promptRes, setPromptRes] = useState("");
    const [tabs, setTabs] = useState([{ label: client[0].userName,id:client[0].userName }]);

    useEffect(() => {
        const newTabs = client.map((client,idx) => ({
            userName:client.userName,
            id:idx
        }));
        setTabs(newTabs);
    }, [client]);

    const copyRoom = () => {
        navigator.clipboard.writeText(roomId);
        toast.success("RoomId copied to clipBoard");
    }
    const LeaveRoomNow = () => {
        socket.emit(ACTIONS.LEFT, { socketid: socket.id, userName, roomId });
        toast.error("You Left")
        navigateTo('/');
    }
    const generateResponse = async () => {
        console.log("mypromt", promptt)
        let res = await getAIResponse(promptt);
        if (res === 500) {
            setPromptRes("Caught an Error, Try Again !");
            return;
        }
        setPromptRes(res);
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
            if (details.userName)
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
        <>
            {/* <Toaster></Toaster> */}
            <div className='bg-slate-950 h-screen'>
                <Split
                    sizes={[100, 0]}  // Split the screen into 50% each
                    minSize={0}   // Minimum size of each pane
                    expandToMin={false}
                    gutterSize={10}   // Size of the gutter
                    direction="horizontal" // Horizontal split
                    cursor="col-resize"
                    className="flex border text-white h-full -full"
                >
                    <div className='flex border flex-col h-full text-white'>
                        <div className='h-52 bg-slate-900 p-2'>
                            <div className='flex'>
                                <div className='w-56'>
                                    <div className='flex items-center'>
                                        <img className='h-16 w-16' src={logo} alt="" />
                                        <div>
                                            <span><h2 className='font-bold text-sm sm:text-base'>Live-CodeEditor</h2></span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <div className='flex flex-col w-full justify-center items-center'>
                                            <button className='p-1  rounded-md text-center bg-white text-black font-bold hover:scale-110' onClick={copyRoom}>Copy Room</button>
                                            {
                                                ai ?
                                                    <button className='p-1 m-1 rounded-md text-center bg-white text-black font-bold hover:scale-110' onClick={ActivateAi}>Deactivate AI</button>
                                                    :
                                                    <button className='p-1 m-1 rounded-md text-center bg-white text-black font-bold hover:scale-110' onClick={ActivateAi}>ActivateAi</button>
                                            }
                                            <button className='p-2  rounded-md text-center font-bold bg-red-700 hover:scale-110' onClick={LeaveRoomNow}>Leave Room</button>
                                        </div>
                                    </div>
                                </div>
                                <div className='bg-slate-800 flex flex-col border-2 w-full text-slate-300'>
                                    <div><span className='p-1'>{userName} (Connected)</span></div>
                                    <div className='mr-1 border flex flex-wrap overflow-auto max-h-40 h-full'>
                                        {
                                            client.map(client => (
                                                <Client key={client.socketid} userName={client.userName} />
                                            ))
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className=''>
            
                                   <JoyTab tabs={tabs} last={tabs.length-1} roomId={roomId} name={userName} socket={socket} />
                     
                        </div>
                    </div>

                    <div className='bg-slate-950 border border-red-600'>
                        {
                            ai &&
                            <>
                                <span>Ask Google Gemini Anything!</span>
                                <div className=''>
                                    <input className='text-black w-full h-10' onChange={(e) => { setPrompt(e.target.value) }} type="text" placeholder='type here' />
                                    <button onClick={generateResponse} className='w-full bg-blue-600 rounded-md'>Ask</button>
                                </div>
                                {
                                    promptRes && <div className='text-white'><br />{promptRes}</div>
                                }
                            </>
                        }
                    </div>

                </Split>
            </div>
        </>
    )
}
