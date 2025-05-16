import express from "express";
import {authMiddleware} from "../middlewares/auth.middleware";

export const apiRouter = express.Router();
apiRouter.use(authMiddleware)

// Auth API
