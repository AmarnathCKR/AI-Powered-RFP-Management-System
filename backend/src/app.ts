import express from "express";
import cors from "cors";
import routes from "./routes";
import { errorMiddleware } from "./middleware/errorMiddleware";
import { notFound } from "./middleware/notFound";

export const app = express();

app.use(cors({
    origin: "*",
}));

app.use(express.json());

app.use("/api", (req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
}, routes);

app.use(notFound);
app.use(errorMiddleware);
