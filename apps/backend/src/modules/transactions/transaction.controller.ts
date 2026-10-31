import Stripe from "stripe";
import { Request, Response } from "express";
import { clerkClient, getAuth } from "@clerk/express";

import Course from "../courses/model";
import Bootcamp from "../bootcamp/model";
import Transaction from "./model";
import CourseProgress from "../course-progress/model";
import { initiateFlutterwavePayment } from "../../services/flutterwave.service";

// if (!process.env.STRIPE_SECRET_KEY) {
//   throw new Error(
//     "STRIPE_SECRET_KEY os required but was not found in env variables"
//   );
// }

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const listTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.query;
    const transactions = userId
      ? await Transaction.find({ userId }).lean()
      : await Transaction.find().lean();
 
    // Populate course + bootcamp info
    const courseIds = [...new Set(
      transactions.map((t) => t.courseId?.toString()).filter(Boolean)
    )];
    const bootcampIds = [...new Set(
      transactions.map((t) => t.bootcampId?.toString()).filter(Boolean)
    )];
 
    const [courses, bootcamps] = await Promise.all([
      courseIds.length > 0
        ? Course.find({ _id: { $in: courseIds } }).select("_id title image").lean()
        : Promise.resolve([]),
      bootcampIds.length > 0
        ? Bootcamp.find({ _id: { $in: bootcampIds } }).select("_id title image").lean()
        : Promise.resolve([]),
    ]);
 
    const courseMap: Record<string, any> = Object.fromEntries(
      courses.map((c: any) => [c._id.toString(), { ...c, type: "Course" }])
    );
    const bootcampMap: Record<string, any> = Object.fromEntries(
      bootcamps.map((b: any) => [b._id.toString(), { ...b, type: "Bootcamp" }])
    );
 
    // Fetch Clerk user info for each unique userId in transactions
    const uniqueUserIds = [...new Set(transactions.map((t) => t.userId as string))];
    const clerkUsers = await Promise.all(
      uniqueUserIds.map((id) =>
        clerkClient.users.getUser(id).catch(() => null)
      )
    );
    const userMap: Record<string, any> = Object.fromEntries(
      clerkUsers.filter(Boolean).map((u) => [
        u!.id,
        {
          firstName: u!.firstName,
          lastName: u!.lastName,
          email: u!.emailAddresses[0]?.emailAddress,
          imgUrl: u!.imageUrl,
        },
      ])
    );
 
    const enriched = transactions.map((tx) => {
      const courseKey = tx.courseId ? tx.courseId.toString() : "";
      const bootcampKey = tx.bootcampId ? tx.bootcampId.toString() : "";
      const purchase = courseMap[courseKey] ?? bootcampMap[bootcampKey];
      const txUserId = tx.userId as string;
      const userInfo = userMap[txUserId] ?? {};
 
      return {
        ...tx,
        user: userInfo,
        purchaseTitle: purchase?.title,
        purchaseImage: purchase?.image,
        purchaseType: purchase?.type,
      };
    });
 
    res.json({
      message: "Transactions retrieved successfully",
      data: enriched,
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving transactions", error });
  }
};


const listTransactionsByUserId = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.query;
        const transactions = await Transaction.find({ userId });

        res.json({
            message: "Transactions retrieved successfully",
            data: transactions,
        });
    } catch (error){
        res.status(500).json({ 
            message: "Error retrieving transactions", 
            error 
        });
    }
}

const getTransactionById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { transactionId } = req.params;
        const transaction = await Transaction.findById(transactionId).lean();

        res.json({
            message: "Transaction retrieved successfully",
            data: transaction,
        });
    } catch (error){
        res.status(500).json({ 
            message: "Error retrieving transaction", 
            error 
        });
    }
}

// const createStripePaymentIntent = async (req: Request, res: Response ): Promise<void> => {
//   try {
//     let { amount } = req.body;

//     if (!amount || amount <= 0) {
//         amount = 50;
//     }

//     const paymentIntent = await stripe.paymentIntents.create({
//       amount,
//       currency: "usd",
//       automatic_payment_methods: {
//         enabled: true,
//         allow_redirects: "never",
//       },
//     });

//     res.json({
//       message: "",
//       data: {
//         clientSecret: paymentIntent.client_secret,
//       },
//     });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Error creating stripe payment intent", error });
//   }
// };

const createTransaction = async (req: Request, res: Response): Promise<void> => {
  const { courseId, transactionId, amount, paymentProvider } = req.body;
  // Identity comes from the authenticated session, never the request body —
  // otherwise any caller could enroll/complete a free course as any userId.
  const { userId } = getAuth(req);

  try {
    if (!userId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    // 1. get course info
    const course = await Course.findById(courseId);

    if (!course) {
      res.status(404).json({
        message: "Course not found"
      });
      return;
    }

    // 2. Check if the course is free
    const isFreeCourse = course.price === 0;

    // 3. create transaction record
    const newTransaction = new Transaction({
      dateTime: new Date().toISOString(),
      userId,
      courseId,
      transactionId: isFreeCourse ? `free_${Date.now()}` : transactionId,
      amount: isFreeCourse ? 0 : amount,
      paymentProvider: isFreeCourse ? "Free" : paymentProvider,
      status: isFreeCourse ? 'Completed' : 'Pending',  // Automatically mark as Completed if it's a free course
    });
    await newTransaction.save();

    // 4. create initial course progress
    const initialProgress = new CourseProgress({
      userId,
      courseId,
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

    // 5. add enrollment to relevant course
    if (isFreeCourse) {
      await Course.findByIdAndUpdate(courseId, { $push: { enrollments: userId } });
    }

    res.json({
      message: "Purchased Course successfully",
      data: {
        transaction: newTransaction,
        courseProgress: initialProgress,
      },
    });
  } catch (error) {
    console.log("Error creating transaction and enrollment:", error);
    res.status(500).json({
      message: "Error creating transaction and enrollment",
      error,
    });
  }
};

// Flutterwave Integration
const initiateFlutterwave = async (req: Request, res: Response): Promise<void> => {
  try {
    const { amount, email, name, userId, courseId } = req.body;

    const tx_ref = `flw_${Date.now()}_${userId}`;

    // 1. Save pending transaction
    const transaction = await Transaction.create({
      userId,
      courseId,
      amount,
      paymentProvider: "Flutterwave",
      status: "Pending",
      dateTime: new Date().toISOString(),
      paymentReference: tx_ref,
    });

    // 2. Call Flutterwave
    const payment = await initiateFlutterwavePayment({
      amount,
      email,
      name,
      tx_ref,
    });

    res.json({
      success: true,
      link: payment.data.link,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Flutterwave init failed" });
  }
};

export {
    listTransactions,
    listTransactionsByUserId,
    // createStripePaymentIntent,
    createTransaction,
    getTransactionById,
    initiateFlutterwave
}