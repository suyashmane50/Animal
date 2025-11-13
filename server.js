import express from "express";
import path from "path";
import http from "http";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import session from "express-session";
import compression from "compression";
import dotenv from "dotenv";

import petOwnerRoute from "./routes/petOwnerRoute.js";
import loginrouter from "./routes/loginRoute.js";
import signuprouter from "./routes/signupRoute.js";
import logoutRoute from "./routes/logoutRoute.js";
import { __dirname } from "./utils/path.js";
import { initializeDatabase } from "./models/signup.js";
import petRoute from "./routes/petsRoute.js";
import { initializePetTable } from "./models/pets.js";
import talukaRouter from "./routes/talukaRouter.js";
import { initializeRegionTables } from "./models/talukas.js";
import doctorrouter from "./routes/doctorRoute.js";
import districtHeadRouter from "./routes/district_headRoute.js";
import { initializeDoctorTables } from "./models/doctor.js";
import collectorrouter from "./routes/collectorRoute.js";
import resetPasswordRouter from "./routes/forgotRoute.js";

dotenv.config();
const app = express();
const server = http.createServer(app);

// 🧩 Initialize database tables
initializeDatabase();
initializePetTable();
initializeRegionTables();
initializeDoctorTables();

// 🧩 Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(compression());

// ✅ FIXED: Serve static assets correctly
// - 'public' = CSS, JS, images
// - 'views' = HTML UI pages
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ✅ Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secretkey",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 }, // 1 hour
  })
);

// ✅ Serve the UI pages (from backend/views)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "home.html"));
});

// ✅ All backend routes (API endpoints)
app.use("/login", loginrouter);
app.use("/signup", signuprouter);
app.use("/pet-owner", petOwnerRoute);
app.use("/logout", logoutRoute);
app.use("/api/pets", petRoute);
app.use("/talukaroute", talukaRouter);
app.use("/doctor", doctorrouter);
app.use("/district-head", districtHeadRouter);
app.use("/collector", collectorrouter);
app.use("/reset-password", resetPasswordRouter);


// ✅ Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
