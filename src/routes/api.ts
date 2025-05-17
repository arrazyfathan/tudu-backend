import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { AuthController } from "../controllers/auth.controller";
import { UserController } from "../controllers/user.controller";

export const apiRouter = express.Router();
apiRouter.use(authMiddleware);

// Auth API
apiRouter.post("/api/auth/logout", AuthController.logout);

// User API
apiRouter.get("/api/user", UserController.getCurrentUser);
