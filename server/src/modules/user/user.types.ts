/**
 * User Module Types
 * Request/Response DTOs and related type definitions
 */

import { z } from "zod";
import { updateProfileSchema } from "./user.validation.js";

// Request Input Types
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// Response Types
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  avatarUrl: string | null;
  provider: "LOCAL" | "GOOGLE";
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateProfileResponse {
  user: UserProfile;
  message: string;
}
