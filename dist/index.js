"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
//import healthRouter from "./routes/healthRoute";
//import dialogflowRouter from "./routes/dialogflowRoute";
const app = (0, express_1.default)();
// Settings
app.use(express_1.default.json());
app.use(express_1.default.urlencoded());
app.use((req, res, next) => {
    console.log(`Path: ${req.path} with the method ${req.method}.`);
    next();
});
const PORT = process.env.PORT || "5000";
//app.use('/', healthRouter);
//app.use('/dialogflow', dialogflowRouter);
app.listen(PORT, () => {
    console.log(`Server is running at http://127.0.0.1:${PORT}.`);
});
