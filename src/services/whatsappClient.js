import pkg from 'whatsapp-web.js';
const { Client,LocalAuth } = pkg;

import qrcode from "qrcode-terminal";

const whatsappClient = new Client({
    authStrategy:new LocalAuth
})

whatsappClient.on("qr",(qr)=> qrcode.generate(qr, {small:true}));

whatsappClient.on("ready", ()=> console.log("client is ready"));

whatsappClient.on("message", async(message)=>{


    try {
        
        if(message.from !="status@broadcast"){


            const contact = await message.getContact()
            console.log("This is Contact:",contact,"This is message body :" ,message.body)

        }
    } catch (error) {

        console.log(error)
        
    }
})


export default whatsappClient