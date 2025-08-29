import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import pino from "pino";

import donorsRouter from "./routes/donors.js";
import hospitalsRouter from "./routes/hospitals.js";
import requestsRouter from "./routes/requests.js";

export const logger = pino({ name: "lifelink-api" });

const app = express();
app.use(express.json());
app.use(cors());
app.use(rateLimit({ windowMs: 60_000, max: 100 }));

app.get("/v1/health", (_req, res) => res.json({ ok: true }));

app.use("/v1/donors", donorsRouter);
app.use("/v1/hospitals", hospitalsRouter);
app.use("/v1/requests", requestsRouter);

export default app;
