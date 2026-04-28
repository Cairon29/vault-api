import { Router } from "express";
import { AuthController }  from "../controllers/auth.ts";

export const AuthRouter = Router()

AuthRouter.post("/login", AuthController.Login)
AuthRouter.post("/register", AuthController.Register)
AuthRouter.get("/logout", AuthController.Logout) // ← idk whether this should be get but ok for now