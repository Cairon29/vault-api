import { Router } from "express";
import { NotesController } from "../controllers/notes.js";

export const NotesRouter = Router();

NotesRouter.get("/test", (_, res) => res.send("ok"))
NotesRouter.get("/", NotesController.GetNotes)
NotesRouter.get("/:id", NotesController.GetNoteById)
NotesRouter.post("/", NotesController.CreateNote)
NotesRouter.delete("/", NotesController.DeleteNote)
NotesRouter.put("/", NotesController.UpdateNote)