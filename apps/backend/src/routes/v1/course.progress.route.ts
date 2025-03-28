import express, { Router } from "express";
import { requireAuth } from "@clerk/express";

const router: Router = express.Router();

// controller
import { getUserEnrolledCourses, getUserCourseProgress, getLearningLeaderboard, getUserCourseProgressBatch, getCourseLeaderboard, updateUserCourseProgress } from "../../modules/course-progress/course.progress.controller"

router.get("/:userId/enrolled-courses", getUserEnrolledCourses)
router.get("/:userId/courses/:courseId", getUserCourseProgress)
router.post("/:userId/courses/batch", getUserCourseProgressBatch);
router.get("/leaderboard/:userId", requireAuth(), getLearningLeaderboard)
router.get("/leaderboard/course/:courseId", getCourseLeaderboard)
router.put("/:userId/courses/:courseId", requireAuth(), updateUserCourseProgress);

export default router

