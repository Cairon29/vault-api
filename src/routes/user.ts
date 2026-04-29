import { Router } from "express";
import { UserController } from "../controllers/users.js";

export const UserRouter = Router();

UserRouter.get("/test", (_, res) => res.send("ok"))
UserRouter.get("/", UserController.GetUsers)
UserRouter.get("/:id", UserController.GetUserById)
UserRouter.delete("/:id", UserController.DeleteUser)
UserRouter.put("/:id", UserController.UpdateUser)
