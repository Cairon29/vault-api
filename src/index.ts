import express from "express";
import dotenv from "dotenv";

import { AuthRouter } from "./routes/auth.js";
import { NotesRouter } from "./routes/notes.js";

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use('/api/v1/auth', AuthRouter);
app.use('/api/v1/notes', NotesRouter);

app.get("/", (_req, res) => res.send("Hello World!"));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
