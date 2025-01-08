import { Router } from "express";
import { checklistsRouter } from "./checklist.routes";
import { userRouter } from "./user.routes";
import exp from "constants";

const router = Router();
router.use("/checklists", checklistsRouter);
router.use("/users", userRouter);

export default router;
