'use client'
import { Preahvihear } from "next/font/google";
import React, { useCallback, useContext, useEffect, useState } from "react";
import {io, Socket} from "socket.io-client"


interface SocketProviderProps{
    children?:React.ReactNode
}

interface ISocketContext{
    sendMessage: (msg:string)=>any;
    messages:string[]
}
const SocketContext = React.createContext<ISocketContext | null>(null);


export const useSocket = ()=>{
    const state = useContext(SocketContext);
    if(!state) throw new Error("state is not defined");
    return state;
}



export const SocketProvider:React.FC<SocketProviderProps> = ({children})=>{

    const [socket,setSocket] = useState<Socket>();
    const [messages,setMessages] = useState<string[]>([]);

    const onMesasgeRecieve = useCallback((msg:string)=>{
        console.log("Message recieved from server",msg);
        const {message} = JSON.parse(msg) as {message:string}
        setMessages(prev=> [...prev,message])
    },[])
    const sendMessage:ISocketContext["sendMessage"] = useCallback((msg)=>{
        console.log(msg);
        if (socket){
            socket?.emit("event:message",{message:msg})
        }
    },[socket])

    useEffect(()=>{
        const _socket = io("http://localhost:8080");
        setSocket(_socket);
        _socket.on("message",onMesasgeRecieve)


        return()=> { 
            _socket.off("message",onMesasgeRecieve)
            _socket.disconnect();
            setSocket(undefined)
        }
    },[])
    return (
        <SocketContext.Provider value={{sendMessage, messages}}>
            {children}
        </SocketContext.Provider>
    )
}