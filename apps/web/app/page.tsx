'use client';
import classes from "./page.module.css";
import { useSocket } from "../context/SocketProvider";
import { useState } from "react";
export default function Page(){
  const {sendMessage,messages} = useSocket();
  const [message,setMessage] = useState("");
  return (
    <div>

      <div>
        <input className={classes["chat-input"]} type="text" onChange={(e)=> setMessage(e.target.value)} placeholder="type you message...." />
        <button onClick={e=> sendMessage(message)} className={classes["button"]}>Send </button>
      </div>
      <div>
        <h1>All messagages are here</h1>
        <div>
          {messages.map((e)=>(
            <li>{e}</li>
          ))}
        </div>
      </div>
    </div>
  )
}