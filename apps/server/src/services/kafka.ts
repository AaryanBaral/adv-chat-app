import { Kafka, Producer } from "kafkajs";
import fs from "fs";
import path from "path"
import prismaClient from "./prisma";
import dotenv from "dotenv"
dotenv.config();
const kafka = new Kafka({
    brokers:[process.env.KAFKA_URL|| ""],
    ssl:{
        ca:[fs.readFileSync(path.resolve("./ca.pem"),"utf-8")]
    },
    sasl:{
        username:process.env.KAFKA_USERNAME||"",
        password:process.env.KAFKA_PASSWORD||"",
        mechanism:"plain"
    }
});

let producer:null | Producer = null


export async function createProducer(){
    if(producer) return producer;
    const _producer = kafka.producer();
    await _producer.connect();
    producer = _producer;
    return producer;
}

export async function createMesssages(messages:string){
    const producer = await createProducer();
    await producer.send({
        messages:[{key: `messages-${Date.now()}` , value:messages}],
        topic:"MESSAGES"
    })
}

export async function consumeMessages(){
    console.log("consuming Messages");
    
    const consumer = kafka.consumer({groupId:"default"});
    await consumer.connect();
    await consumer.subscribe({topic:"MESSAGES",fromBeginning:true});
    await consumer.run({
        autoCommit:true,
        eachMessage:async ({message,pause})=>{
            if(!message.value) return;
            console.log("Consuming Messages")
            try{
                await prismaClient.message.create({
                    data:{
                        text:message.value?.toString()
                    }
                })
                console.log("inserted ");
                
            }catch(err){
                console.log(err);
                
                pause();
                setTimeout(()=>{consumer.resume([{topic:"MESSAGES"}])},60*1000);
            }
        }
    })
}

export default kafka;