import { eq } from "drizzle-orm";
import { NextFunction, Request, Response } from "express";
import { db } from "../db/db";
import { checklists } from "../db/schema"; // Assuming your schema file
import { AppError } from "../utils/appError";
import { catchAsync } from "../utils/catchAsync";
interface CustomReq extends Request {
  user?: any;
}
// CREATE a new checklist
export const createChecklist = catchAsync(
  async (req: CustomReq, res: Response, next: NextFunction) => {
    const authorId = req.user.id;
    const { content } = req.body;

    if (!authorId || !content) {
      return next(new AppError("Author ID and content are required", 400));
    }

    const newChecklist = await db
      .insert(checklists)
      .values({ authorId, content });
    if (!newChecklist) {
      return next(new AppError("Checklist could not be created", 400));
    }
    res.status(201).json({
      status: "success",
      data: {
        checklist: newChecklist,
      },
    });
  }
);

// GET all checklists
export const getAllChecklists = catchAsync(
  async (req: CustomReq, res: Response, next: NextFunction) => {
    console.log(req.user.getChecklistById);
    const authorId = req.user.id;
    const allChecklists = await db
      .select()
      .from(checklists)
      .where(eq(checklists.authorId, authorId));

    if (!allChecklists.length) {
      res.status(200).json({
        status: "success",
        results: 0,
        data: {
          checklists: [],
        },
      });
      return;
    }

    res.status(200).json({
      status: "success",
      results: allChecklists.length,
      data: {
        checklists: allChecklists,
      },
    });
  }
);

// GET a single checklist by ID
export const getChecklistById = catchAsync(
  async (req: CustomReq, res: Response, next: NextFunction) => {
    const authorId = req.user.id;

    const { id } = req.params;

    const checklist = await db
      .select()
      .from(checklists)
      .where(eq(checklists.id, id));
    // .where(eq(checklists.authorId, authorId)); // Check if the user owns the checklist

    if (!checklist) {
      return next(new AppError("Checklist not found", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        checklist,
      },
    });
  }
);

// UPDATE a checklist
export const updateChecklist = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return next(
        new AppError("Content is required to update the checklist", 400)
      );
    }

    const updatedChecklist = await db
      .update(checklists)
      .set({ content })
      .where(eq(checklists.id, id));

    if (!updatedChecklist) {
      return next(
        new AppError("Checklist not found or could not be updated", 404)
      );
    }

    res.status(200).json({
      status: "success",
      data: {
        checklist: updatedChecklist,
      },
    });
  }
);

export const deleteChecklist = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const deletedChecklist = await db
      .delete(checklists)
      .where(eq(checklists.id, id));

    if (!deletedChecklist) {
      return next(
        new AppError("Checklist not found or could not be deleted", 404)
      );
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  }
);
