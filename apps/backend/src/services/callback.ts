import { Request, Response, NextFunction} from "express";
import { clerkClient } from "@clerk/express";
import Transaction from "../modules/transactions/model";
import Course from "../modules/courses/model";
import Bootcamp from "../modules/bootcamp/model";
import CourseProgress from "../modules/course-progress/model";
import { enrollMemberInBootcampCore } from "../modules/bootcamp/bootcamp.utils";

interface PaymentResult {
  status: string;
  resultInfo: {
    resultStatus?: string;
    resultCode?: string;
    resultMsg?: string;
    mpesaReceiptNumber?: string;
    CheckoutRequestID?: string;
    merchantRequestID?: string;
  };
  save: () => Promise<PaymentResult>;
}

interface TransactionResponse {
  message: string;
  success: boolean;
}

const stkPushCallback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { Body } = req.body;

    const { stkCallback } = Body || {};
    if (!stkCallback) {
      return next(new Error("Invalid callback payload"));
    }

    // The hash was embedded in the unique CallBackURL we gave Safaricom for
    // this specific transaction (see handleSTKPush.ts) — looking the
    // transaction up by it is how we authenticate the callback.
    const { hash } = req.params;
    const transaction = hash ? await Transaction.findOne({ callbackHash: hash }) : null;
    if (!transaction) {
      return next(new Error("Unauthorized callback request"));
    }

    // Idempotency: Safaricom may redeliver the same callback more than once.
    if (transaction.status !== "Pending") {
      res.status(200).json({ message: "Transaction already processed", success: true });
      return;
    }

    const {
      ResultCode,
      ResultDesc,
      CallbackMetadata,
    } = stkCallback;

    if (ResultCode !== 0) {
      console.error("Transaction failed with ResultCode:", ResultCode);
      await handleTransactionResult(ResultCode, undefined, transaction, ResultDesc, res);
      return;
    }

    const MpesaReceiptNumber = CallbackMetadata?.Item?.find((item: any) => item.Name === "MpesaReceiptNumber")?.Value;
    if (!MpesaReceiptNumber) {
      return next(new Error("MpesaReceiptNumber is missing in the callback metadata" ));
    }

    // Update transaction and handle course enrollment
    await handleTransactionResult(ResultCode, MpesaReceiptNumber, transaction, ResultDesc, res);

    // Handle enrollment and progress now that payment has succeeded
    if (transaction.courseId) {
      const course = await Course.findById(transaction.courseId);
      if (course) {
        // Add user to course enrollments
        await Course.findByIdAndUpdate(transaction.courseId, { $push: { enrollments: transaction.userId } });

        // Create initial course progress
        const initialProgress = new CourseProgress({
          userId: transaction.userId,
          courseId: transaction.courseId,
          enrollmentDate: new Date().toISOString(),
          overallProgress: 0,
          sections: course.sections.map((section: any) => ({
            sectionId: section.sectionId,
            chapters: section.chapters.map((chapter: any) => ({
              chapterId: chapter.chapterId,
              completed: false,
            })),
          })),
          lastAccessedTimestamp: new Date().toISOString(),
        });
        await initialProgress.save();
      }
    } else if (transaction.bootcampId) {
      try {
        const clerkUser = await clerkClient.users.getUser(transaction.userId).catch(() => null);
        const fullName =
          [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") ||
          clerkUser?.username ||
          "Member";
        await enrollMemberInBootcampCore(transaction.bootcampId.toString(), transaction.userId, fullName);
      } catch (enrollError) {
        console.error("Error enrolling member in bootcamp after payment:", enrollError);
      }
    }

  } catch (error) {
    console.error("Error handling stkPushCallback:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

async function handleTransactionResult(ResultCode: number, mpesaReceiptNumber: string | undefined, transaction: any, ResultDesc: string, res: Response): Promise<Response<TransactionResponse> | void> {
  try {
    if (ResultCode === 0) {
      transaction.status = "Completed";
      transaction.resultInfo.mpesaReceiptNumber = mpesaReceiptNumber;
      transaction.resultInfo.resultMsg = ResultDesc;
      await transaction.save();

      return res.status(200).json({
        message: "Transaction successful",
        success: true,
      });
    } else {
      const status = ResultCode === 1 ? "failed (Insufficient funds)" : ResultCode === 1032 ? "failed (Canceled by user)" : "failed (Unknown error)";

      transaction.status = "Failed";
      transaction.resultInfo.resultStatus = status;
      transaction.resultInfo.resultMsg = ResultDesc;
      await transaction.save();

      const statusCode = ResultCode === 1 ? 400 : 200;

      return res.status(statusCode).json({
        message: status,
        success: false,
      });
    }
  } catch (error) {
    console.error("Error processing transaction:", error);

    return res.status(500).json({
      message: "Internal Server Error!",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export default stkPushCallback;
