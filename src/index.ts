import express, { Express, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cafeRoute from "./routes/cafeRoute";
import dialogflowRoute from "./routes/dialogflowRoute";
import path from "path";

dotenv.config();

const app: Express = express();

// Settings
app.use(express.json());
app.use(express.urlencoded());
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`Path: ${req.path} with the method ${req.method}.`);
    next();
});

const PORT: string = process.env.PORT || "5000";
// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "../public")));

app.use('/',cafeRoute);
app.use('/dialogflow',dialogflowRoute);
app.get("/home", (req: Request, res: Response) => {
    res.sendFile("C:/Users/LENOVO/Desktop/NLC_PROJECT/public/chatbot.html");
});

app.listen(PORT, () => {
    console.log(`Server is running at http://127.0.0.1:${PORT}.`);
});