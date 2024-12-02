import express, {Router} from "express";

const router = Router();



router.get('/', (req ,res)=>{

    res.send("Welcome to the Server");
})




router.post('/message', (req, res) =>{

    whatsappClient.sendMessage(req.body.phoneNumber, req.body.message)
    res.send()
     
})


export default router;  