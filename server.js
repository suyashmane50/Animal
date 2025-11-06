import express from 'express';
import path from 'path';
import http from 'http';
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from 'cookie-parser';
import session from 'express-session';
import compression from 'compression';;
import dotenv from "dotenv";


import petOwnerRoute from './routes/petOwnerRoute.js';
import loginrouter from './routes/loginRoute.js';
import signuprouter from './routes/signupRoute.js';
import logoutRoute from "./routes/logoutRoute.js";
import { __dirname } from './utils/path.js';
import { initializeDatabase } from './models/signup.js';
import petRoute from './routes/petsRoute.js';
import { initializePetTable } from "./models/pets.js";
import talukaRouter from "./routes/talukaRouter.js"
import {initializeRegionTables} from  "./models/talukas.js"

dotenv.config();
const app = express();
const server = http.createServer(app);

initializeDatabase();
initializePetTable();
initializeRegionTables();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(compression());

app.use(session({
    secret: process.env.SESSION_SECRET || 'secretkey',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 } // 1 hour
}));

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'home.html'));
});
    
app.use('/login', loginrouter);
app.use('/signup', signuprouter);
app.use('/pet-owner', petOwnerRoute);
app.use('/logout', logoutRoute);
app.use('/api/pets', petRoute);
app.use('/talukaroute',talukaRouter)


const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
