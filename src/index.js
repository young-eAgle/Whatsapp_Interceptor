import express from "express";
import cors from 'cors';
import messageRouter from '../src/routes/messageRouter.js'
import whatsappClient from "./services/whatsappClient.js";


whatsappClient.initialize()
const app = express();

app.use(cors());
app.use(express.json());
// Here express.json is built in middle ware that parses the incoming json making the body available in the req.body.


app.use(messageRouter);

app.listen(process.env.PORT,'0.0.0.0',()=>{
    console.log(`Server is Ready on the http://localhost:${process.env.PORT}`);
}) 