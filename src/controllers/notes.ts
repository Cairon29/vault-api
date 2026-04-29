import type { Request, Response } from 'express'
import { NotesModel } from '../models/notes.js'
import { req_field_validator } from '../utils/utils.js'

export class NotesController {

    static GetNotes = async (req: Request, res: Response) => {
        const { data, status, error, message } = await NotesModel.getAll()
        res.status(status).json({ data, message, error })
    }

    static GetNoteById = async (req: Request, res: Response) => {
        const { id } = req.params

        if (!id) return res.status(400).json({ error: 'Missing id parameter' })
        if (isNaN(Number(id))) return res.status(400).json({ error: 'Id must be a number' })

        const { data, status, error, message } = await NotesModel.getById(Number(id))
        res.status(status).json({ data, message, error })
    }

    static CreateNote = async (req: Request, res: Response) => {
        const req_fields = ['user_id', 'title', 'description']
        const validation = req_field_validator(req.body, req_fields)

        if (validation.error) return res.status(validation.status).json({ error: validation.error })

        const { data, status, error, message } = await NotesModel.create(req.body)
        res.status(status).json({ data, message, error })
    }

    static DeleteNote = async (req: Request, res: Response) => {
        const { id } = req.params

        if (!id) return res.status(400).json({ error: 'Missing id parameter' })
        if (isNaN(Number(id))) return res.status(400).json({ error: 'Id must be a number' })
        if (req.user_id !== Number(id)) return res.status(403).json({ error: 'You can only delete your own notes' })


        const { data, status, error, message } = await NotesModel.delete(Number(id))
        res.status(status).json({ data, message, error })
    }

    static UpdateNote = async (req: Request, res: Response) => {
        const { id } = req.params

        if (!id) return res.status(400).json({ error: 'Missing id parameter' })
        if (isNaN(Number(id))) return res.status(400).json({ error: 'Id must be a number' })
        if (req.user_id !== Number(id)) return res.status(403).json({ error: 'You can only update your own notes' })
        
        const { data, status, error, message } = await NotesModel.update({ ...req.body, id: Number(id) })
        res.status(status).json({ data, message, error })
    }
}
