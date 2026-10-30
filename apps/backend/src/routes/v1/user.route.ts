import express, { Router } from "express";
import { requireAuth } from "@clerk/express";

// controller
import { createUser, getUser, listUsers, syncUser, deleteUser, updateUser, promoteUserRole } from "../../modules/users/user.controller"
import { listInstructors, getInstructorDetail } from "../../modules/instructors/instructor.controller"
import requireRole from "../../middlewares/requireRole";
import { sensitiveActionLimiter } from "../../middlewares/rateLimiters";

const router: Router = express.Router();

router.post("/create", createUser)
router.get("/all-users",  requireAuth(), listUsers)

// Public instructor directory — must stay above the /:userId param route
// below, otherwise Express matches "/instructors" as a userId.
router.get("/instructors", listInstructors)
router.get("/instructors/:teacherId", getInstructorDetail)

router.get("/:userId",  requireAuth(), getUser)
router.put("/:userId", requireAuth(), syncUser)
router.put("/update/:userId", requireAuth(), updateUser);
router.put("/promote-role/:userId", sensitiveActionLimiter, requireAuth(), requireRole("admin"), promoteUserRole)
router.delete("/delete/:userId", requireAuth(), deleteUser)

export default router;