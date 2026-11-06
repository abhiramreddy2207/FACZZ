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

export const UpdatePostSchema = z.object({
  title: z.string().max(200).optional(),
  content: z.string().min(3, "Post content must be at least 3 characters").max(2000, "Post content too long").optional(),
  category: z.enum(["Paddock Buzz", "Race Debrief", "Hot Take", "Tech Talk", "Meme"]).optional(),
  mediaUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  tags: z.array(z.string()).optional(),
  teams: z.array(z.string()).optional(),
  drivers: z.array(z.string()).optional(),
});

export const AddCommentSchema = z.object({
  authorId: z.string().min(1, "authorId is required"),
  content: z.string().min(1, "Comment content cannot be empty").max(1000, "Comment too long"),
});

export const DeleteCommentSchema = z.object({
  commentId: z.string().min(1, "commentId is required"),
  userId: z.string().min(1, "userId is required").optional(),
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

// =========================================================
// AUTH SCHEMAS
// =========================================================
export const EmailSchema = z
  .string()
  .trim()
  .min(3, "Email is too short")
  .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email address")
  .toLowerCase();

export const RegisterSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
  handle: z
    .string()
    .trim()
    .min(3, "Handle must be at least 3 characters")
    .max(30, "Handle too long")
    .regex(/^@?[a-zA-Z0-9_]+$/, "Handle may only contain letters, numbers, and underscores"),
  email: EmailSchema,
  password: z.string().min(8, "Password must be at least 8 characters"),
  favTeam: z.string().max(50).optional(),
  favDriver: z.string().max(50).optional(),
});

export const LoginSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, "Password is required"),
});

export const PasswordRecoveryRequestSchema = z.object({
  email: EmailSchema,
});

export const PasswordResetSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const PasswordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});
