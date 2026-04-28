import type {Request, Response} from 'express'
import { req_field_validator, jwt_token_generator } from '../utils/utils.js'
// import { UserModel } from '../models/user.js'

export class AuthController {

    static Login = async (req: Request, res: Response) =>  {
    //     // Validate body and its requested fields
    //     const req_fields = ["email", "password"]
    //     const validation = req_field_validator(req.body, req_fields)

    //     if (validation.error) return res.status(validation.status).json({ error: validation.error })

    //     // Here we validate the credentials entered by the user
    //     const { email, password } = req.body
    //     const User = new UserModel()
        
    //     let existingUser = await UserModel.FindOne({ email, password }) // this returns the user credentials. Model will check whether this user matches the actual password
        
    //     if (!existingUser) return res.status(400).json({ error: "Invalid credentials" })
        
    //     const { error, access_token, refresh_token }= jwt_token_generator(existingUser)
    //     if(error) return res.status(500).json({ error: "Internal server error" })

    //     // Here we send back the tokens to the client
    //     return res.status(200).json({ 
    //         id: existingUser._id,
    //         name: existingUser.name, 
    //         email: existingUser.email,
    //         access_token,
    //         refresh_token
    //     })
    }

    static Register = async (req: Request, res: Response) =>  {
        // Validate body and its requested fields
        const req_fields = ["username", "email", "password"]
        const validation = req_field_validator(req.body, req_fields)

        if (validation.error) return res.status(validation.status).json({ error: validation.error })
        
        const { username, email, password } = req.body

        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/;
        
        if(!re.test(email)){
            return res.status(400).json({ error: "Please enter a valid email address" })
        }
        
        // // Validate if user exists already
        // const User = new UserModel()
        
        // let existingUser = await UserModel.validate_existing_user({ email })
        // if (existingUser) return res.status(400).json({ error: "User already exists with this email" })
    
        // // Validate password strength
        // let regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // if(!regex.test(password)){
        //     return res.status(400).json({ error: "Password must be 8-15 characters long and must contain at least one uppercase letter, one lowercase letter, one number and one special character" })
        // }

        // // If everything is validated, we register the user

        // const user = await UserModel.Create({ email, password, username })
        // if(!user) return res.status(500).json({ error: "Internal server error" })

        // // We create the access token
        // const { error, access_token, refresh_token}= jwt_token_generator(user)
        // if(error) return res.status(500).json({ error: "Internal server error" })

        // return res.status(200).json({
        //     id: user._id,
        //     name: user.name,
        //     email: user.email,
        //     access_token,
        //     refresh_token
        // })
    }

    static Logout = async () =>  {

    }
}