import { Router } from "express";
import {
  createChecklist,
  deleteChecklist,
  getAllChecklists,
  getChecklistById,
  updateChecklist,
} from "../controllers/checklist.controller";
import { protect } from "../controllers/auth.controller";

export const checklistsRouter = Router();
checklistsRouter.use(protect);
checklistsRouter.route("/").get(getAllChecklists).post(createChecklist);
checklistsRouter
  .route("/:id")
  .get(getChecklistById)
  .patch(updateChecklist)
  .delete(deleteChecklist);
