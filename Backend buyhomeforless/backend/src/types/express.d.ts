import type { AdminRole } from "../db/types";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        fullName: string;
        role: AdminRole;
        status: "ACTIVE" | "DISABLED";
      };
    }
  }
}

export {};
