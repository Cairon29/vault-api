import type { Request, Response } from 'express'
import { NotesModel } from '../models/notes.js'
import { req_field_validator } from '../utils/utils.js'

export class NotesController {

    static GetNotes = (req: Request, res: Response) => {
        const data = NotesModel.getAll()
        res.status(200).json({ data })
        
    }
    static GetNoteById = (req: Request, res: Response) => {
        const { id } =  req.params

        if (!id) res.status(400).json({ error: 'Missing id parameter' })
        if (isNaN(Number(id))) res.status(400).json({ error: 'Id must be a number' })
        
        const { data, status } = NotesController.model.getById(id)
        res.status(status).json({ data })
    }


    // TODO: add protection to notes (only owner can edit/delete)
    static CreateNote = (req: Request, res: Response) => {

        const req_fields = ['user_id', 'title', 'description'];
        const validation = req_field_validator(req.body, req_fields)

        if (validation.error) return res.status(validation.status).json({ error: validation.error })

        
        const { error, access_token, refresh_token }= jwt_token_generator(existingUser)
        
        const { data, status } = NotesController.model.create(req.body)

    }
    
    static DeleteNote = (req: Request, res: Response) => {

    }

    static UpdateNote = (req: Request, res: Response) => {

    }
}