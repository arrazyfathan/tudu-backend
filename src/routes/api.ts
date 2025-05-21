import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { AuthController } from "../controllers/auth.controller";
import { UserController } from "../controllers/user.controller";
import { CategoryController } from "../controllers/category.controllerr";

export const apiRouter = express.Router();
apiRouter.use(authMiddleware);

// Auth API
apiRouter.post("/api/auth/logout", AuthController.logout);

// User API
apiRouter.get("/api/user", UserController.getCurrentUser);
apiRouter.patch("/api/user", UserController.update);
apiRouter.delete("/api/user", UserController.delete);

// Categories API
apiRouter.get("/api/categories", CategoryController.getCategories);
apiRouter.post("/api/categories", CategoryController.createCategory);
