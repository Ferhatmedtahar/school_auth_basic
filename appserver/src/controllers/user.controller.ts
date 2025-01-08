import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { NextFunction, Request, Response } from "express";
import { db } from "../db/db";
import { users } from "../db/schema"; // Assuming this is your user schema
import { AppError } from "../utils/appError";
import { catchAsync } from "../utils/catchAsync";

// GET all users
export const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const allUsers = await db.select().from(users);

    if (!allUsers.length) {
      return next(new AppError("No users found", 404));
    }

    res.status(200).json({
      status: "success",
      results: allUsers.length,
      data: {
        users: allUsers,
      },
    });
  }
);

// GET a single user by ID
export const getUserById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log("start");
    const { id } = req.params;

    const user = await db.select().from(users).where(eq(users.id, id)).get();

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  }
);

// UPDATE a user
export const updateUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { name, email, password } = req.body;

    const updates: any = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (password) updates.password = await bcrypt.hash(password, 12);

    const updatedUser = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id));

    if (!updatedUser) {
      return next(new AppError("User not found or could not be updated", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        user: updatedUser,
      },
    });
  }
);

// DELETE a user
export const deleteUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const deletedUser = await db.delete(users).where(eq(users.id, id));

    if (!deletedUser) {
      return next(new AppError("User not found or could not be deleted", 404));
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  }
);

// const JWT_SECRET = process.env.JWT_SECRET || "ididnt find a secret"; // Set this in your environment variables
// const JWT_EXPIRES_IN = "7d";

// // Utility: Generate a JWT
// const generateToken = (id: string) =>
//   jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

// // CREATE a new user (Signup)
// export const signup = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const { name, email, password } = req.body;

//     if (!name || !email || !password) {
//       return next(new AppError("All fields are required", 400));
//     }

//     // Hash the password
//     const hashedPassword = await bcrypt.hash(password, 12);

//     const [newUser] = await db
//       .insert(users)
//       .values({
//         name,
//         email,
//         password: hashedPassword,
//       })
//       .returning({ id: users.id });

//     if (!newUser) {
//       return next(new AppError("User could not be created", 500));
//     }
//     const token = generateToken(newUser.id);

//     res.status(201).json({
//       status: "success",
//       token,
//       data: {
//         user: {
//           name,
//           email,
//         },
//       },
//     });
//   }
// );

// // SIGNIN a user
// export const signin = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return next(new AppError("Email and password are required", 400));
//     }

//     const user = await db
//       .select()
//       .from(users)
//       .where(eq(users.email, email))
//       .get();

//     if (!user) {
//       return next(new AppError("Invalid email or password", 401));
//     }

//     const isPasswordCorrect = await bcrypt.compare(password, user.password);

//     if (!isPasswordCorrect) {
//       return next(new AppError("Invalid email or password", 401));
//     }

//     const token = generateToken(user.id);

//     res.status(200).json({
//       status: "success",
//       token,
//       data: {
//         user: {
//           id: user.id,
//           name: user.name,
//           email: user.email,
//         },
//       },
//     });
//   }
// );

// export const signout = (req: Request, res: Response) => {
//   res.status(200).json({
//     status: "success",
//     message: "You have been signed out",
//   });
// };
