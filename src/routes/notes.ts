import { Router } from "express";
import { NotesController } from "../controllers/notes.js";
import { authMiddleware } from "../middleware/auth.js";

export const NotesRouter = Router();


NotesRouter.get("/test", (_, res) => res.send("ok"))

// Protected routes
NotesRouter.get("/", authMiddleware, NotesController.GetNotes)
NotesRouter.get("/:id", authMiddleware, NotesController.GetNoteById)
NotesRouter.post("/", authMiddleware, NotesController.CreateNote)
NotesRouter.delete("/:id", authMiddleware, NotesController.DeleteNote)
NotesRouter.put("/:id", authMiddleware, NotesController.UpdateNote)