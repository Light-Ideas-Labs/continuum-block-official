import { Request, Response } from "express";
import { clerkClient } from "@clerk/express";
import Course from "../courses/model";
import Bootcamp from "../bootcamp/model";
import Transaction from "../transactions/model";

const getTeacherStudents = async (req: Request, res: Response): Promise<void> => {
  try {
    const { teacherId } = req.params;

    // Bootcamp uses hostedBy.id — NOT teacherId
    const [courses, bootcamps] = await Promise.all([
      Course.find({ teacherId }).select("_id title image"),
      Bootcamp.find({ "hostedBy.id": teacherId }).select("_id title image"),
    ]);

    const courseIds = courses.map((c) => c._id);
    const bootcampIds = bootcamps.map((b) => b._id);

    // Use $or only with the IDs we actually have — avoids empty $in arrays
    const orConditions: any[] = [];
    if (courseIds.length > 0) orConditions.push({ courseId: { $in: courseIds } });
    if (bootcampIds.length > 0) orConditions.push({ bootcampId: { $in: bootcampIds } });

    if (orConditions.length === 0) {
      res.json({ success: true, data: [] });
      return;
    }

    const transactions = await Transaction.find({ $or: orConditions }).lean();

    const uniqueUserIds = [...new Set(transactions.map((t) => t.userId as string))];

    const clerkUsers = await Promise.all(
      uniqueUserIds.map((id) =>
        clerkClient.users.getUser(id).catch(() => null)
      )
    );

    const userMap: Record<string, {
      firstName: string | null;
      lastName: string | null;
      email: string | undefined;
      imgUrl: string;
    }> = Object.fromEntries(
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

    const courseMap: Record<string, any> = Object.fromEntries(
      courses.map((c) => [c._id.toString(), { ...c.toObject(), type: "Course" }])
    );

    const bootcampMap: Record<string, any> = Object.fromEntries(
      bootcamps.map((b) => [b._id.toString(), { ...b.toObject(), type: "Bootcamp" }])
    );

    const students = transactions.map((tx) => {
      const courseKey = tx.courseId ? tx.courseId.toString() : "";
      const bootcampKey = tx.bootcampId ? tx.bootcampId.toString() : "";
      const purchase = courseMap[courseKey] ?? bootcampMap[bootcampKey];

      const userId = tx.userId as string;
      const userInfo = userMap[userId] ?? {};

      return {
        transactionId: tx._id,
        userId,
        ...userInfo,
        purchaseTitle: purchase?.title,
        purchaseImage: purchase?.image,
        purchaseType: purchase?.type,
        status: tx.status,
        amount: tx.amount,
        currency: tx.currency,
        paymentProvider: tx.paymentProvider,
        dateTime: tx.dateTime,
        createdAt: (tx as any).createdAt,
        updatedAt: (tx as any).updatedAt,
      };
    });

    res.json({ success: true, data: students });
  } catch (error: any) {
    console.log("", error)
    res.status(500).json({ success: false, message: error.message });
  }
};

export { getTeacherStudents };