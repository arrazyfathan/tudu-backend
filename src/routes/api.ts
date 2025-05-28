import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { AuthController } from "../controllers/auth.controller";
import { UserController } from "../controllers/user.controller";
import { CategoryController } from "../controllers/category.controllerr";
import { TagController } from "../controllers/tag.controller";
import { JournalController } from "../controllers/journal.controller";

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
apiRouter.patch("/api/categories/:categoryId", CategoryController.updateCategory);
apiRouter.delete("/api/categories/:categoryId", CategoryController.deleteCategory);

// Tag API
apiRouter.get("/api/tags", TagController.getTags);
apiRouter.post("/api/tags", TagController.createTag);
apiRouter.patch("/api/tags/:tagId", TagController.updateTag);
apiRouter.delete("/api/tags/:tagId", TagController.deleteTag);

// Journal API
apiRouter.post("/api/journals", JournalController.createJournal);
apiRouter.get("/api/journals", JournalController.getJournals);
apiRouter.put("/api/journals/:journalId", JournalController.updateJournal);
apiRouter.delete("/api/journals/:journalId", JournalController.deleteJournal);
apiRouter.delete("/api/journals", JournalController.multipleDelete);
