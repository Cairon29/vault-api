import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { dbConfig } from "../db/config.js"
// @ts-ignore
import oracledb from "oracledb"

declare global {
    namespace Express {
        interface Request {
            user_id: number
        }
    }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    // 1. Check if token was sent in the header
    const authHeader = req.headers.authorization
    if (!authHeader) {
        return res.status(401).json({ message: "No token provided" })
    }

    // 2. Extract the token from the header
    const headerParts = authHeader.split(" ")
    if (headerParts.length !== 2 || headerParts[0] !== "Bearer") {
        return res.status(401).json({ message: "Invalid token format" })
    }

    const token = headerParts[1]
    if (
        !token || 
        token === "null" || 
        token.trim() === "" || 
        typeof token !== "string"
    ) {
        return res.status(401).json({ message: "No token provided" })
    }
    // Here we would also check if the token is blacklisted (e.g., if the user logged out) before verifying it, but for simplicity we'll skip that step in this implementation. 


    // 3. Verify the token key
    
    // 3.1. We will check on a redis db the current keys for the access tokens keys (key rotation strategy).

    const jwt_access_key = process.env.JWT_ACCESS_KEY
    if (!jwt_access_key) {
        return res.status(500).json({ message: "Internal server error" })
    }

    try {
        const decoded = jwt.verify(token, jwt_access_key) as { user_id: number }
        if (!decoded || !decoded.user_id) {
            return res.status(401).json({ message: "Invalid token payload" })
        }
        const connection = await oracledb.getConnection(dbConfig)
        const result = await connection.execute(
            'SELECT id FROM token_blacklist WHERE token = :token',
            [token],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        )
        await connection.close()

        if (result.rows.length > 0) {
            return res.status(401).json({ error: 'Token has been invalidated. Please log in again.' })
        }
        
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" })
    }

    try {
        // 4. Decode the token and attach user info to the request object
        const decoded = jwt.verify(token, jwt_access_key) as { user_id: number }
        if (!decoded || !decoded.user_id) {
            return res.status(401).json({ message: "Invalid token payload" })
        }
        req.user_id = decoded.user_id
        next()
    } catch (error) {
        // Si el token expiró, jwt.verify lanza un TokenExpiredError
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({
                error: 'Token expirado. Usa tu refresh token para obtener uno nuevo.'
            })
        }
        // Cualquier otro error (token manipulado, firma inválida, etc.)
        return res.status(401).json({
            error: 'Token inválido'
        })
    }
}