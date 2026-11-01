import { rateLimit } from "express-rate-limit";

// General API traffic.
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

// Tighter budget for sensitive/expensive actions: payment initiation, quiz
// submission, role changes — endpoints where abuse is costly (money moved,
// external API calls billed, privilege changes) rather than just read load.
export const sensitiveActionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});
