import {Server} from "socket.io"
import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const pub = new Redis({
    host:process.env.AIVEN_HOST,
    username:process.env.AIVEN_USERNAME,
    password:process.env.AIVEN_PASSWORD,
    port:Number(process.env.AIVEN_PORT)
});
const sub = new Redis({
    host:process.env.AIVEN_HOST,
    username:process.env.AIVEN_USERNAME,
    password:process.env.AIVEN_PASSWORD,
    port:Number(process.env.AIVEN_PORT)
});

class SocketService{
    private _io:Server;

    constructor(){
        console.log("Init socket Server");
        this._io = new Server({
            cors:{
                allowedHeaders:["*"],
                origin:"*"
            }
        });
        sub.subscribe("MESSAGES");
    }

    public initListners(){
        const io = this.io;
        console.log("Initializing socket.....");
        
        io.on("connect",(socket)=>{
        console.log(`New Socket connected ${socket.id}`);
        socket.on("event:message",async ({message}:{message:string})=>{
            console.log(`New message recived \n ${message}`);
            await pub.publish("MESSAGES",JSON.stringify({message}))
            
        })
        
        })

        sub.on("message",(channel,message)=>{
            if(channel === "MESSAGES") {
                io.emit("message",message);
            }
        })
    }
    get io(){
        return this._io;
    }
}

export default SocketService;