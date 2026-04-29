import type {Request, Response} from 'express'
import { req_field_validator, jwt_token_generator, validate_email } from '../utils/utils.js'
import { UserModel } from '../models/user.js'
import jwt from 'jsonwebtoken'
import type { User } from '../types/users.js'

export class AuthController {

    static Refresh = async (req: Request, res: Response) =>  {
        // 1. validate we are receiving the refresh token in the body
        const { refresh_token } = req.body
        if (!refresh_token) {
            return res.status(400).json({ error: "Missing refresh token" })
        }
        if (typeof refresh_token !== "string" || refresh_token.trim() === "") {
            return res.status(400).json({ error: "Invalid refresh token" })
        }

        // 2 (in the future). check if the refresh token is blacklisted (e.g., if the user logged out). For simplicity, we'll skip this step in this implementation.

        // 3. verify we have the necessary credentials
        // 3.1. We will check on a redis db the current keys for refresh and access tokens (key rotation strategy).
        const jwt_refresh_key = process.env.JWT_REFRESH_KEY
        const jwt_access_key = process.env.JWT_ACCESS_KEY
        const jwt_access_token_time = process.env.JWT_ACCESS_TOKEN_EXPIRE_TIME   

        if (!jwt_refresh_key || !jwt_access_key || !jwt_access_token_time) {
            return res.status(500).json({ error: "Internal server error" })
        }

        // 4. verify the refresh token and generate a new access token
        try {
            const decoded = jwt.verify(refresh_token, jwt_refresh_key) as { user_id: number }
            if (!decoded || !decoded.user_id) {
                return res.status(401).json({ error: "Invalid refresh token" })
            }

            const payload = { user_id: decoded.user_id }
            const new_access_token = jwt.sign(payload, jwt_access_key, { expiresIn: jwt_access_token_time as any })

            return res.status(200).json({ access_token: new_access_token })
        } catch (error) {
            // 5. if the refresh token is invalid or expired, we return an error
            return res.status(401).json({ error: "Invalid refresh token. Please log in again." })
        }
    }

    static Login = async (req: Request, res: Response) =>  {
        // Validate body and its requested fields
        const req_fields = ["email", "password"]
        const validation = req_field_validator(req.body, req_fields)

        if (validation.error) return res.status(validation.status).json({ error: validation.error })

        // Here we validate the credentials entered by the user
        const { email, password } = req.body
        
        if (!validate_email(email)) {
            return res.status(400).json({ error: "Please enter a valid email address" })
        }

        if (typeof password !== "string" || password.trim() === "") {
            return res.status(400).json({ error: "Please enter a valid password" })
        }

        const userResponse = await UserModel.getByEmail(email)
        const userData = userResponse?.data?.user
        const existingUser: User | null = Array.isArray(userData) ? null : userData || null

        if (!existingUser) return res.status(400).json({ error: "Invalid credentials" })
        
        const jwt_result = jwt_token_generator(existingUser)
        if(jwt_result.error) {
            console.error("[AUTH]: JWT token generation error:", jwt_result.error)
            return res.status(500).json({ error: "Failed to generate authentication tokens" })
        }

        const { access_token, refresh_token } = jwt_result

        return res.status(200).json({ 
            id: existingUser.id,
            full_name: existingUser.full_name, 
            email: existingUser.email,
            access_token,
            refresh_token
        })
    }

    static Register = async (req: Request, res: Response) =>  {
        // Validate body and its requested fields
        const req_fields = ["full_name", "email", "password"]
        const validation = req_field_validator(req.body, req_fields)

        if (validation.error) return res.status(validation.status).json({ error: validation.error })
        
        const { full_name, email, password } = req.body

        if (!validate_email(email)) {
            return res.status(400).json({ error: "Please enter a valid email address" })
        }

        let existingUser = await UserModel.getByEmail(email)
        if (existingUser) return res.status(400).json({ error: "User already exists with this email" })
    
        // Validate password strength
        let regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!regex.test(password)){
            return res.status(400).json({ error: "Password must be 8-15 characters long and must contain at least one uppercase letter, one lowercase letter, one number and one special character" })
        }

        // If everything is validated, we register the user
        const { data, status, error } = await UserModel.create({ email, password, full_name })
        
        const user: User | null = Array.isArray(data.user) ? null : data.user
        
        if (error || !user) {
            return res.status(status || 500).json({ error: error || "Failed to create user" })
        }

        // We create the access token
        const jwt_result = jwt_token_generator(user)
        if(jwt_result.error) {
            console.error("[AUTH]: JWT token generation error:", jwt_result.error)
            return res.status(500).json({ error: "Failed to generate authentication tokens" })
        }
        if(jwt_result.error) return res.status(500).json({ error: "Internal server error" })
        const { access_token, refresh_token } = jwt_result

        return res.status(201).json({
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            access_token,
            refresh_token
        })
    }

    static Logout = async (req: Request, res: Response) =>  {
        const { refresh_token } = req.body
        if (!refresh_token) {
            return res.status(400).json({ error: "Missing refresh token" })
        }

        const authHeader = req.headers.authorization
        if (!authHeader) {
            return res.status(401).json({ message: "No token provided" })
        }

        // 2. Extract the token from the header
        const headerParts = authHeader.split(" ")
        if (headerParts.length !== 2 || headerParts[0] !== "Bearer") {
            return res.status(401).json({ message: "Invalid token format" })
        }

        const access_token = headerParts[1]
        if (
            !access_token || 
            access_token === "null" || 
            access_token.trim() === "" || 
            typeof access_token !== "string"
        ) {
            return res.status(401).json({ message: "No token provided" })
        }
        
        const jwt_refresh_key = process.env.JWT_REFRESH_KEY
        const jwt_access_key = process.env.JWT_ACCESS_KEY

        if (!jwt_refresh_key || !jwt_access_key) {
            return res.status(500).json({ error: "Internal server error" })
        }

        let decodedAccess: any
        let decodedRefresh: any

        try {
            decodedAccess = jwt.verify(access_token, jwt_access_key) as { user_id: number }
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                decodedAccess = jwt.decode(access_token)
            } else {
                return res.status(401).json({ error: "Invalid access token" })
            }
        }

        try {
        decodedRefresh = jwt.verify(refresh_token, jwt_refresh_key)
        } catch (error) {
            return res.status(401).json({ error: 'Invalid refresh token' })
        }

        if (decodedAccess.user_id !== decodedRefresh.user_id) {
            return res.status(401).json({ error: "Token user mismatch. You are not the owner of one or both of these tokens." })
        }


    }
}