import http from "http";
import SocketService from "./services/socket";
import {consumeMessages} from "./services/kafka"
async function init(){
    consumeMessages();
    const server = http.createServer();
    const socketService = new SocketService();
    socketService.io.attach(server);
    const PORT = process.env.PORT || 8080;
    server.listen(PORT,()=>{
        console.log(`Http server started at port 8080`);
    })
    socketService.initListners();

}
init();