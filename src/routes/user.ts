import { Router } from "express";
import { UserController } from "../controllers/users.ts";


export const UserRouter = Router();

UserRouter.get("/test", (_, res) => res.send("ok"))

UserRouter.get("/", UserController.GetUsers)
UserRouter.delete("/", UserController.DeleteUser)