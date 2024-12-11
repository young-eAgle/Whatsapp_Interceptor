import express from "express";
import cors from "cors";
import messageRouter from "../src/routes/messageRouter.js";
import WhatsAppClientPromise from "../src/services/whatsappClient.js";

const app = express();

app.use(express.json());

// Here express.json is built in middle ware that parses the incoming json making the body available in the req.body.

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, etc.)
      if (!origin) return callback(null, true);

      // Define allowed origins dynamically
      const allowedOrigins = [
        "http://95.217.67.77:7003",
        "http://bimserver:7003",
        "http://192.168.43.145:8080",
        "http://localhost:8080",
      ];

      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true); // Origin is allowed
      } else {
        callback(new Error("Not allowed by CORS")); // Reject other origins
      }
    },
    methods: ["GET", "POST"], // Allow only required HTTP methods
    allowedHeaders: ["Content-Type"], // Restrict headers
  })
);

app.use(messageRouter);

function waitForClientReady(client) {
  return new Promise((resolve, reject) => {
    client.on("ready", () => {
      console.log("Whatsapp client is ready");
      resolve();
    });

    client.on("auth_failure", (msg) => {
      console.error("Authentication failed:", msg);
      reject(new Error("Whatsapp client authentication failed"));
    });

    client.on("disconnected", () => {
      console.log("Whatsapp client disconnected");
      reject(new Error("Whatsapp client disconnected"));
    });
  });
}

async function startServer() {
  try {
    // Intialize the Whatsapp Client

    const whatsappClient = await WhatsAppClientPromise;

    whatsappClient.initialize();

    // Wait for the client to be ready

    await waitForClientReady(whatsappClient);

    app.listen(process.env.PORT, "0.0.0.0", () => {
      console.log(`Server is ready at http://localhost:${process.env.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1); // Exit if initialization fails
  }
}

startServer();
