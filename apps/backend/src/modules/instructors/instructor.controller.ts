import { Request, Response } from "express";
import { clerkClient } from "@clerk/express";
import Course from "../courses/model";
import Bootcamp from "../bootcamp/model";
import { aggregateTeacherStats } from "./instructor.utils";

type TeacherGroup = { courses: any[]; bootcamps: any[]; fallbackName: string };

const resolveClerkIdentity = async (teacherIds: string[]) => {
  const clerkUsers = await Promise.all(
    teacherIds.map((id) => clerkClient.users.getUser(id).catch(() => null))
  );

  const identityMap: Record<string, { name: string; imgUrl?: string }> = {};
  clerkUsers.forEach((user, index) => {
    if (!user) return;
    const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
    identityMap[teacherIds[index]] = { name: name || teacherIds[index], imgUrl: user.imageUrl };
  });

  return identityMap;
};

const listInstructors = async (req: Request, res: Response): Promise<void> => {
  try {
    const [courses, bootcamps] = await Promise.all([
      Course.find({ status: "Published" })
        .select("teacherId teacherName category ratings reviews enrollments")
        .lean(),
      Bootcamp.find({ status: "Published" })
        .select("hostedBy categories testimonials averageRating reviewCount members")
        .lean(),
    ]);

    const groups = new Map<string, TeacherGroup>();

    for (const course of courses as any[]) {
      const teacherId = course.teacherId;
      if (!groups.has(teacherId)) {
        groups.set(teacherId, { courses: [], bootcamps: [], fallbackName: course.teacherName });
      }
      groups.get(teacherId)!.courses.push(course);
    }

    for (const bootcamp of bootcamps as any[]) {
      const teacherId = bootcamp.hostedBy?.id;
      if (!teacherId) continue;
      if (!groups.has(teacherId)) {
        groups.set(teacherId, { courses: [], bootcamps: [], fallbackName: bootcamp.hostedBy.name });
      }
      groups.get(teacherId)!.bootcamps.push(bootcamp);
    }

    const teacherIds = [...groups.keys()];
    const identityMap = await resolveClerkIdentity(teacherIds);

    const data = teacherIds.map((teacherId) => {
      const group = groups.get(teacherId)!;
      const identity = identityMap[teacherId];
      const stats = aggregateTeacherStats(group.courses, group.bootcamps);

      return {
        teacherId,
        name: identity?.name || group.fallbackName,
        imgUrl: identity?.imgUrl,
        courseCount: group.courses.length,
        bootcampCount: group.bootcamps.length,
        ...stats,
      };
    });

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getInstructorDetail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { teacherId } = req.params;

    const [courses, bootcamps, clerkUser] = await Promise.all([
      Course.find({ teacherId, status: "Published" }),
      Bootcamp.find({ "hostedBy.id": teacherId, status: "Published" }).lean(),
      clerkClient.users.getUser(teacherId).catch(() => null),
    ]);

    if (courses.length === 0 && bootcamps.length === 0) {
      res.status(404).json({ success: false, message: "Instructor not found" });
      return;
    }

    const fallbackName = courses[0]?.teacherName || (bootcamps[0] as any)?.hostedBy?.name || teacherId;
    const clerkName = clerkUser ? [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") : "";
    const stats = aggregateTeacherStats(courses, bootcamps);

    const data = {
      teacherId,
      name: clerkName || fallbackName,
      imgUrl: clerkUser?.imageUrl,
      courseCount: courses.length,
      bootcampCount: bootcamps.length,
      ...stats,
      courses,
      bootcamps: (bootcamps as any[]).map((b) => ({ _id: b._id, title: b.title, image: b.image })),
    };

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export { listInstructors, getInstructorDetail };
