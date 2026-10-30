import { useGetCourseQuery, useGetBootcampQuery } from "@/state/api";
import { useSearchParams } from "next/navigation";

// Normalizes a Bootcamp into the Course shape so details/payment/CoursePreview
// can read price/title/etc. without branching on type everywhere.
const normalizeBootcampAsCourse = (bootcamp: Bootcamp): Course => ({
  _id: bootcamp._id,
  teacherId: bootcamp.hostedBy?.id,
  teacherName: bootcamp.hostedBy?.name,
  title: bootcamp.title,
  description: bootcamp.description,
  category: bootcamp.categories?.[0] ?? "",
  image: bootcamp.image,
  price: bootcamp.price?.amount ?? 0,
  level: "Beginner",
  status: "Published",
  sections: [],
  enrollments: (bootcamp.members || []).map((m) => ({ userId: m.memberId })),
});

export const useCurrentCourse = () => {
  const searchParams = useSearchParams();
  const courseId = searchParams.get("id") ?? "";
  const type = searchParams.get("type") ?? "course";
  const isBootcamp = type === "bootcamp";

  const { data: courseData, ...courseRest } = useGetCourseQuery(courseId, { skip: isBootcamp });
  const { data: bootcampData, ...bootcampRest } = useGetBootcampQuery(courseId, { skip: !isBootcamp });

  if (isBootcamp) {
    return {
      course: bootcampData ? normalizeBootcampAsCourse(bootcampData) : undefined,
      courseId,
      type,
      ...bootcampRest,
    };
  }

  return { course: courseData, courseId, type, ...courseRest };
};
