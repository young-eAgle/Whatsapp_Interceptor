import express, {Router} from "express";
import WhatsAppClientPromise from "../services/whatsappClient.js";


const router = Router();



router.get('/', (req ,res)=>{

    res.send("Welcome to the Server");
})

function formattedNumber(phoneNumber){

    let cleanedNumber=phoneNumber.replace(/\D/g,'');

    if(cleanedNumber.startsWith('0')){
        cleanedNumber='92'+cleanedNumber.slice(1);
    }else if(cleanedNumber.startsWith('92') && phoneNumber.startsWith('+')){
        cleanedNumber=cleanedNumber;
    }

    return cleanedNumber;
}





router.post('/message', async(req, res) =>{


    const {phoneNumber, message}=req.body;

    const formatedNumber=formattedNumber(phoneNumber);

    const formattedPhoneNumber = `${formatedNumber}@c.us`

    try {

          const whatsappClient=await WhatsAppClientPromise;
        await whatsappClient.sendMessage(formattedPhoneNumber, message);
         res.status(200).send({status:'success',message:'Message sent successfully.'});

        //  res.status(200).send({ status: 'success', message: 'Message sent successfully.' });
        // whatsappClient.sendMessage(req.body.phoneNumber, req.body.message)
        // res.send()
        
    } catch (error) {


        console.error('Error:', error);
    res.status(500).send({ status: 'error', message: 'Failed to send message.' });
     
        
    };

    
     
});


export default router;  