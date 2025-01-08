import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/user.controller";
import {
  protect,
  signin,
  signout,
  signup,
} from "../controllers/auth.controller";

export const userRouter = Router();
userRouter.post("/signup", signup);
userRouter.post("/signin", signin);
userRouter.post("/signout", signout);

userRouter.route("/").get(getAllUsers);
userRouter.use(protect);

userRouter.route("/:id").get(getUserById).patch(updateUser).delete(deleteUser);
