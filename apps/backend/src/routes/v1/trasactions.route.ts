import express, { Router } from "express";
import { requireAuth } from "@clerk/express" 

// controller createStripePaymentIntent, createTransaction
import { listTransactions, createTransaction, getTransactionById } from "../../modules/transactions/transaction.controller";
import { getTeacherStudents } from "../../modules/transactions/teachers-tudents.controller";

import generateAccessToken from "../../middlewares/generateToken"
import { initiateSTKPush  } from "../../services/handleSTKPush"
import stkPushCallback from "../../services/callback"
import { sensitiveActionLimiter } from "../../middlewares/rateLimiters";

const router: Router = express.Router();



// M-PESA routes
// NOTE: no requireAuth() before generateAccessToken/initiateSTKPush — this was
// previously reachable unauthenticated, letting anyone trigger STK pushes to
// arbitrary phone numbers. Locked down here.
router.post('/mpesa/stkpush', sensitiveActionLimiter, requireAuth(), generateAccessToken, initiateSTKPush);
router.post('/callback/:hash', stkPushCallback);

// router.post("/stripe/payment-intent", createStripePaymentIntent);

// Teacher Students - transactions related to a teacher's courses and bootcamps
router.get("/:teacherId/students", requireAuth(), getTeacherStudents);

router.post("/", requireAuth(), createTransaction);
router.get("/", requireAuth(), listTransactions);
router.get("/:transactionId", requireAuth(), getTransactionById);
 

export default router;