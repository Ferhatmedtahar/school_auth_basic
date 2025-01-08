import { NextFunction, Request, Response } from "express";

import jwt from "jsonwebtoken";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../db/db";
import { users } from "../db/schema";
import { AppError } from "../utils/appError";
import { catchAsync } from "../utils/catchAsync";
interface CustomReq extends Request {
  user?: any;
}

const signToken = (id: any): string | undefined => {
  console.log(id + "id");
  console.log(process.env.JWT_SECRET);
  if (!process.env.JWT_SECRET) return undefined;
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  return token;
};

//  REVIEW send a token alogn with a response
const sendToken = (res: Response, statusCode: number, user: any) => {
  const token = signToken(user.id);
  const cookieExpiresIn = parseInt(
    process.env.JWT_COOKIE_EXPIRES_IN || "7",
    10
  );
  const cookieExpirationDate = new Date(
    Date.now() + cookieExpiresIn * 24 * 60 * 60 * 1000
  );

  const cookieOptions = {
    expires: cookieExpirationDate,
    httpOnly: true,
    // secure: process.env.NODE_ENV === "production",
  };

  res.cookie("jwt", token, cookieOptions);
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

// CREATE a new user (Signup)
export const signup = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body);
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return next(new AppError("All fields are required", 400));
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
      })
      .returning({ id: users.id, name: users.name, email: users.email });

    if (!newUser) {
      return next(new AppError("User could not be created", 500));
    }

    sendToken(res, 201, newUser);
  }
);

// SIGNIN a user
export const signin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError("Email and password are required", 400));
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .get();

    if (!user) {
      return next(new AppError("Invalid email or password", 401));
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return next(new AppError("Invalid email or password", 401));
    }

    sendToken(res, 200, user);
  }
);

export const signout = (req: Request, res: Response) => {
  res.clearCookie("jwt");
  res.status(200).json({
    status: "success",
    message: "You have been signed out",
  });
};

export const protect = catchAsync(
  async (req: CustomReq, res: Response, next: NextFunction) => {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization?.startsWith("Bearer")
    )
      token = req.headers.authorization.split(" ")[1];
    if (!token) return next(new AppError("invalid token", 401));

    if (!process.env.JWT_SECRET)
      return next(new AppError("secret could not be found", 404));

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded, "decoded");
    const user = await db.query.users.findFirst({
      where: eq(users.id, decoded.id),
    });

    if (!user)
      return next(
        new AppError(
          "The user belonging to this token does no longer exist.",
          401
        )
      );

    // $GRANT ACCESS TO PROTECTED ROUTES & REGISTER THE USER IN THE REQ

    req.user = user;
    next();
  }
);

// REVIEW signup and the steps

// export const signUp = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const { name, email, password, passwordConfirm } = req.body;

//     const newUser = await User.create({
//       name,
//       email,
//       password,
//       passwordConfirm,
//     });
//     const url = `${req.protocol}://${req.get("host")}/me`;
//     await new Email(newUser, url).sendWelcome();
//     if (!newUser) return next(new AppError("user could not be created", 400));

//     sendToken(res, 201, newUser);
//   }
// );

// // REVIEW login and the steps

// export const login = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const { email, password } = req.body;
//     // check the email and password
//     if (!email || !password)
//       return next(new AppError("email or password are missing ", 400));

//     const user = await User.findOne({ email }).select(
//       "password name email role"
//     );
//     // check if user exist

//     if (!user || !(await user.correctPassword(password, user.password)))
//       return next(new AppError("Incorrect email or  password!", 401));

//     // generate token and check if it exist
//     sendToken(res, 200, user);
//   }
// );

// // REVIEW protect routes and validate in each step

// export const protect = catchAsync(
//   async (req: CustomReq, res: Response, next: NextFunction) => {
//     let token;
//     if (
//       req.headers.authorization &&
//       req.headers.authorization?.startsWith("Bearer")
//     )
//       token = req.headers.authorization.split(" ")[1];
//     if (!token) return next(new AppError("invalid token", 401));

//     if (!process.env.JWT_SECRET)
//       return next(new AppError("secret could not be found", 404));

//     const decoded: any = jwt.verify(token, process.env.JWT_SECRET);

//     const user = await User.findById(decoded.id);

//     if (!user)
//       return next(
//         new AppError(
//           "The user belonging to this token does no longer exist.",
//           401
//         )
//       );

//     // !for security we check this important.
//     if (user.changedPasswordAfter(decoded.iat)) {
//       return next(
//         new AppError("user recently changed password, please log in again", 401)
//       );
//     }
//     // $GRANT ACCESS TO PROTECTED ROUTES & REGISTER THE USER IN THE REQ

//     req.user = user;
//     next();
//   }
// );

// // REVIEW restrictTO , to allow only certain user to do some stuff

// export const restrictTO = (...roles: any[]) => {
//   return (req: CustomReq, res: Response, next: NextFunction) => {
//     if (!roles.includes(req.user.role))
//       return next(
//         new AppError(
//           "You do not have the permission to perform this action",
//           403
//         )
//       );
//     next();
//   };
// };

// // REVIEW step1 for reset password functionallity :forgot password which send a email .

// export const forgotPassword = catchAsync(
//   async (req: CustomReq, res: Response, next: NextFunction) => {
//     const { email } = req.body;
//     if (!email)
//       return next(
//         new AppError("no email was found , please provide an email", 400)
//       );

//     const user = await User.findOne({ email });
//     if (!user) return next(new AppError("no user found with this email", 404));

//     //
//     const resetToken = user.createPasswordResetToken();

//     await user.save({ validateBeforeSave: false });

//     // $ 3 /send this reset token on url in email

//     // const message = `Forgot your password?Sumbit a Patch REQUEST with your new password and the confirm password to :${resetURL}.\nIf you didnt forget your password , please ignore this email!  `;

//     // £ IF ERRROR HAPPEND WE WANT TO RESET THE RESETTOKEN AND EXPIRES 'UNDEFINED' AND SAVE.

//     try {
//       const resetURL = `${req.protocol}://${req.get(
//         "host"
//       )}/api/v1/users/resetPassword/${resetToken}`;
//       await new Email(user, resetURL).sendResetPassword();
//       // await sendEmail({
//       //   email: user.email,
//       //   subject: "your password reset Token (valid for 10 min)",
//       //   message,
//       // });

//       // !RESPONSE

//       res.status(200).json({
//         status: "success",
//         message: "token send to email",
//       });
//     } catch (err) {
//       user.passwordResetToken = undefined;
//       user.passwordResetTokenExpires = undefined;
//       await user.save({ validateBeforeSave: false });

//       return next(
//         new AppError(
//           "there was an error sending the email , try again later",
//           500
//         )
//       );
//     }
//   }
// );

// // REVIEW step2 for reset password functionallity :reset password .

// export const resetPassword = catchAsync(
//   async (req: CustomReq, res: Response, next: NextFunction) => {
//     const { resetToken } = req.params;

//     const hashedToken = crypto
//       .createHash("sha256")
//       .update(resetToken)
//       .digest("hex");
//     const user = await User.findOne({
//       passwordResetToken: hashedToken,
//       passwordResetTokenExpires: { $gt: Date.now() },
//     });
//     if (!user) return next(new AppError("Invalid token or has expired ", 400));
//     // 2 fill the user password and stuff
//     user.password = req.body.password;
//     user.passwordConfirm = req.body.passwordConfirm;
//     user.passwordResetToken = undefined;
//     user.passwordResetTokenExpires = undefined;
//     await user.save();

//     // 3 log the user in
//     sendToken(res, 200, user);
//   }
// );

// // REVIEW update the current user password

// export const updatePassword = catchAsync(
//   async (req: CustomReq, res: Response, next: NextFunction) => {
//     const { currentPassword, password, passwordConfirm } = req.body;

//     if (!currentPassword || !password || !passwordConfirm)
//       return next(
//         new AppError(
//           "please provide all the nesssecary information to update your password",
//           400
//         )
//       );

//     const user = await User.findById(req.user._id).select("password");

//     if (!user) {
//       return next(new AppError("User not found.", 404));
//     }

//     if (!(await user.correctPassword(currentPassword, user.password)))
//       return next(new AppError("incorrect password, please try again!", 401));

//     user.password = password;
//     user.passwordConfirm = passwordConfirm;

//     await user.save();

//     sendToken(res, 200, user);
//   }
// );
