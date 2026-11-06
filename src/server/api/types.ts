import { z } from "zod";

export type ApiResponse<T> =
  | { success: true; data: T; meta?: Record<string, any> }
  | { success: false; error: { code: string; message: string; details?: any } };

export function jsonResponse<T>(data: T, status = 200, meta?: Record<string, any>): Response {
  return Response.json(
    { success: true, data, ...(meta ? { meta } : {}) },
    {
      status,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

export function errorResponse(message: string, code = "BAD_REQUEST", status = 400, details?: any): Response {
  return Response.json(
    {
      success: false,
      error: { code, message, ...(details ? { details } : {}) },
    },
    {
      status,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

// =========================================================
// ZOD VALIDATION SCHEMAS
// =========================================================
export const CreatePostSchema = z.object({
  authorId: z.string().min(1, "authorId is required"),
  category: z.enum(["Paddock Buzz", "Race Debrief", "Hot Take", "Tech Talk", "Meme"]),
  title: z.string().max(200).optional(),
  content: z.string().min(3, "Post content must be at least 3 characters").max(2000, "Post content too long"),
  mediaUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  tags: z.array(z.string()).default([]),
  teams: z.array(z.string()).default([]),
  drivers: z.array(z.string()).default([]),
  poll: z
    .object({
      question: z.string().min(3, "Poll question must be at least 3 characters").max(150),
      options: z.array(z.string().min(1).max(100)).min(2, "Poll must have at least 2 options").max(4, "Max 4 options"),
    })
    .optional(),
});

export const AddCommentSchema = z.object({
  authorId: z.string().min(1, "authorId is required"),
  content: z.string().min(1, "Comment content cannot be empty").max(1000, "Comment too long"),
});

export const LikePostSchema = z.object({
  userId: z.string().min(1, "userId is required"),
});

export const PollVoteSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  optionId: z.string().min(1, "optionId is required"),
});

export const UpdateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  handle: z.string().min(2).max(60).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  favTeam: z.string().max(50).optional(),
  favDriver: z.string().max(50).optional(),
  location: z.string().max(100).optional(),
});
