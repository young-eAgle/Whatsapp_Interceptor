import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;
import qrcode from "qrcode-terminal";
import path from "path";
import chromium from "chrome-aws-lambda";
import puppeteer from  'puppeteer';


const getLaunchOptions = async () => {
  if (process.env.IS_SERVERLESS) {
    // for vercel

    return {
      args: [...chromium.args],
      executablePath:
        (await chromium.executablePath) || "/usr/bin/chromium-browser",
      headless: chromium.headless,
    };
  } else {
    return {
      args: [],
      headless: true,
    };
  }
};

const createWhatsAppClient = async () => {
  const launchOptions = await getLaunchOptions();

  const whatsappClient = new Client({
    authStrategy: new LocalAuth({
      clientId: "session",
      // dataPath: path.join('/tmp', '.wwebjs_auth')
      dataPath: path.join(
        process.env.IS_SERVERLESS ? "/tmp" : ".",
        ".wwebjs_auth"
      ),
    }),
    puppeteer: launchOptions,
  });

  whatsappClient.on("qr", (qr) => {
    console.log("QR Code received,scan to log in");
    qrcode.generate(qr,{small:true});
    // console.log(qr);
  });

  whatsappClient.on("ready", () => {
    console.log("Whatsapp client is ready");
  });

  whatsappClient.on("disconneted", () => {
    console.log("Whatsapp client disconnected");
  });

  whatsappClient.on("auth_failure", (msg) => {
    console.error("Whatsapp client authentication failed:", msg);
  });

  whatsappClient.on("message", async (message) => {
    if (message.from !== "status@brodcast") {
      const contact = await message.getContact();

      console.log(
        "Message received from",
        contact.name || contact.number,
        ":",
        message.body
      );
    }
  });

  return whatsappClient;

  // whatsappClient.on("qr",(qr)=> qrcode.generate(qr, {small:true}));

  // whatsappClient.on("ready", ()=> console.log("client is ready"));

  // whatsappClient.on("message", async(message)=>{

  //     try {

  //         if(message.from !="status@broadcast"){

  //             const contact = await message.getContact()
  //             console.log("This is Contact:",contact,"This is message body :" ,message.body)

  //         }
  //     } catch (error) {

  //         console.log(error)

  //     }
  // });
};

const WhatsAppClientPromise = createWhatsAppClient();
export default WhatsAppClientPromise;
