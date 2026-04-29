import type { Request, Response } from 'express'
import { UserModel } from '../models/user.js'

export class UserController {

    static GetUsers = async (_req: Request, res: Response) => {
        const { data, status, error, message } = await UserModel.getAll()
        res.status(status).json({ data, message, error })
    }

    static GetUserById = async (req: Request, res: Response) => {
        const { id } = req.params

        if (!id) return res.status(400).json({ error: 'Missing id parameter' })
        if (isNaN(Number(id))) return res.status(400).json({ error: 'Id must be a number' })

        const { data, status, error, message } = await UserModel.getById(Number(id))
        res.status(status).json({ data, message, error })
    }

    static DeleteUser = async (req: Request, res: Response) => {
        const { id } = req.params

        if (!id) return res.status(400).json({ error: 'Missing id parameter' })
        if (isNaN(Number(id))) return res.status(400).json({ error: 'Id must be a number' })

        const { data, status, error, message } = await UserModel.delete(Number(id))
        res.status(status).json({ data, message, error })
    }

    static UpdateUser = async (req: Request, res: Response) => {
        const { id } = req.params

        if (!id) return res.status(400).json({ error: 'Missing id parameter' })
        if (isNaN(Number(id))) return res.status(400).json({ error: 'Id must be a number' })

        const { data, status, error, message } = await UserModel.update({ ...req.body, id: Number(id) })
        res.status(status).json({ data, message, error })
    }
}
