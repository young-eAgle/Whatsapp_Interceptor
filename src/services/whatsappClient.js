import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;
import qrcode from "qrcode-terminal";
import path from "path";
import chromium from "@sparticuz/chromium";
import fs from "fs";

const getLaunchOptions = async () => {
  if (process.env.IS_SERVERLESS == "true") {
  
    const executablePath =  await chromium.executablePath;
       console.log("Chromium executable path for serverless:",executablePath);
    if (typeof executablePath !== "string" || !executablePath) {
      throw new Error(
        "Chromium executablePath is invalid for serverless environment"
      );
    }
    
    // for vercel

    return {
      args: [
        ...chromium.args,
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--single-process",
        "--no-zygote",
      ],
      executablePath,
      headless: chromium.headless,
    };
  } else {
    // For local development
    const localExecutablePath = puppeteer.executablePath();
    console.log("Chromium executablePath for local:", localExecutablePath);

    if(!fs.existsSync(localExecutablePath)){
      throw new Error(
        `Invalid Chromium path:${localExecutablePath}.Please verify your CHROMIUM_PATH.`
      );
    }
    return {
      args: [
        "--no-sandbox",                
        "--disable-setuid-sandbox",    
        "--disable-gpu",              
        "--disable-dev-shm-usage",
      ],
      executablePath: localExecutablePath, // Ensure it’s a string
      headless: true,
      dumpio: true,
    };
  }
};

const ensureAuthDirectory = (authPath) => {
  console.log(`Attempting to create directory at :${authPath}`);
  if (!fs.existsSync(authPath)) {
    try {
      fs.mkdirSync(authPath, { recursive: true });
      console.log(`Created directory at : ${authPath}`);
    } catch (error) {
      console.error(`Failed to create directory at : ${authPath}`, error);
      throw error;
    }
  } else {
    console.log(`Directory already exists at : ${authPath}`);
  }
};

const createWhatsAppClient = async () => {
  const launchOptions = await getLaunchOptions();

  console.log("Using launch options:", launchOptions);
  // define authentication path

  const authPath = path.join("/tmp",".wwebjs_auth");

  ensureAuthDirectory(authPath);

  const whatsappClient = new Client({
    authStrategy: new LocalAuth({
      clientId: "session",
      dataPath: authPath,
    }),
    puppeteer: launchOptions,
  });

  whatsappClient.on("qr", (qr) => {
    console.log("QR Code received,scan to log in");
    qrcode.generate(qr, { small: true });
    // console.log(qr);
  });

  whatsappClient.on("ready", () => {
    console.log("Whatsapp client is ready");
  });

  whatsappClient.on("disconneted", (reason) => {
    console.log("Whatsapp client disconnected:",reason);
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
};

const WhatsAppClientPromise = createWhatsAppClient();
export default WhatsAppClientPromise;
