import { Request, Response, NextFunction } from "express";
import { getAuth, clerkClient } from "@clerk/express";

// Checks the caller's *current* Clerk publicMetadata.userType — always fetched
// fresh so a demoted/promoted user can't ride on a stale session token.
const requireRole = (...allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = getAuth(req);

      if (!userId) {
        res.status(401).json({ message: "Authentication required" });
        return;
      }

      const user = await clerkClient.users.getUser(userId);
      const userType = (user.publicMetadata?.userType as string) || "student";

      if (!allowedRoles.includes(userType)) {
        res.status(403).json({ message: "You do not have permission to perform this action" });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({
        message: "Error verifying permissions",
        error: error instanceof Error ? error.message : error,
      });
    }
  };
};

export default requireRole;
