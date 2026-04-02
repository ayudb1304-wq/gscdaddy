import { NextResponse } from "next/server"

export function successResponse<T>(data: T, meta?: { page: number; limit: number; total: number }) {
  return NextResponse.json({ success: true, data, ...(meta ? { meta } : {}) })
}

export function errorResponse(
  code: string,
  message: string,
  status: number = 400,
  details?: Record<string, unknown>
) {
  return NextResponse.json(
    { success: false, error: { code, message, ...(details ? { details } : {}) } },
    { status }
  )
}

export const errors = {
  unauthorized: () => errorResponse("UNAUTHORIZED", "You must be logged in", 401),
  forbidden: () => errorResponse("FORBIDDEN", "You don't have access to this resource", 403),
  notFound: (resource = "Resource") => errorResponse("NOT_FOUND", `${resource} not found`, 404),
  rateLimited: () => errorResponse("RATE_LIMITED", "Too many requests, try again later", 429),
  validation: (message: string) => errorResponse("VALIDATION_ERROR", message, 400),
  planLimit: (message: string) => errorResponse("PLAN_LIMIT_EXCEEDED", message, 403),
  trialExpired: () => errorResponse("TRIAL_EXPIRED", "Your trial has expired. Please upgrade.", 403),
  internal: (message = "Something went wrong") => errorResponse("INTERNAL_ERROR", message, 500),
}
