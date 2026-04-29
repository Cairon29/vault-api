import { Router } from "express";
import { AuthController } from "../controllers/auth.js";

export const AuthRouter = Router()

AuthRouter.post("/login", AuthController.Login)
AuthRouter.post("/register", AuthController.Register)
AuthRouter.get("/logout", AuthController.Logout)
AuthRouter.get("/refresh", AuthController.Refresh)