import UserList from './UserList'
import React, { useEffect, useState } from 'react'
import Client from './Client';
import Split from 'react-split'
import toast from 'react-hot-toast';
import ACTIONS from '../Actions'
import { io } from 'socket.io-client'
import { useLocation, useNavigate, Navigate } from 'react-router';
import { useParams } from 'react-router';
import JoyTab from './JoyTab';
import logo from '../assets/logo.png'

const socket = io('http://localhost:5000', {
    reconnectionAttempts: 'Infinity',
    transports: ['websocket']
})

export default function () {
    const { roomId, userName } = useParams();
    const navigateTo = useNavigate();
    const location = useLocation();

    const [client, setClient] = useState([
        { socketid: socket.id, userName }
    ])
 
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
        <main className='flex h-[100vh] w-full'>
            <Split
                sizes={[18, 82]}  // Split the screen into 50% each
                minSize={0}   // Minimum size of each pane
                expandToMin={false}
                gutterSize={5}   // Size of the gutter
                direction="horizontal" // Horizontal split
                cursor="col-resize"
                className="flex border h-full w-full"
            >
                <section className='flex flex-col bg-black'>
                    <div className='flex-none border-2'>
                        <div className="flex items-center">
                            <img className='h-16 w-16' src={logo} alt="" />
                            <div>
                                <span><h2 className='font-bold text-white text-sm sm:text-base'>Live-CodeEditor</h2></span>
                            </div>
                        </div>
                        <div className='P-2 flex'>
                            <span className='text-white px-2'>{userName}</span>
                            <span className='text-slate-500'> (Active now)</span>
                        </div>
                    </div>
                    <div className='flex-1 bg-slate-700'>
                        <UserList tabs={tabs}></UserList>
                    </div>
                    <div className='flex-none'>
                        <div className="flex flex-col">
                            <button className='p-2 mx-2 mb-1 rounded-md text-center font-bold bg-gray-200 hover:scale-110' onClick={copyRoom} >Copy Room</button>
                            <button className='p-2 mx-2 mb-3 rounded-md text-center font-bold bg-red-700 hover:scale-110' onClick={LeaveRoomNow} >Leave Room</button>
                        </div>
                    </div>
                </section>
                <section>
                    <JoyTab tabs={tabs} last={tabs.length-1} roomId={roomId} name={userName} socket={socket} />
                </section>
            </Split>
        </main>
    )
}
