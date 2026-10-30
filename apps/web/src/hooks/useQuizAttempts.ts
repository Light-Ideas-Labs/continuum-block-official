import { useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import {
  useGetUserEnrolledCoursesQuery,
  useGetUserCourseProgressBatchQuery,
} from "@/state/api";

const PASSING_SCORE = 80;

export interface QuizAttempt {
  courseId: string;
  courseTitle: string;
  chapterId: string;
  chapterTitle: string;
  score: number;
  passed: boolean;
}

export const useQuizAttempts = () => {
  const { user, isLoaded } = useUser();

  const {
    data: enrolledCourses,
    isLoading: isLoadingCourses,
    isError: isErrorCourses,
  } = useGetUserEnrolledCoursesQuery(user?.id ?? "", {
    skip: !isLoaded || !user,
  });

  const courseIds = useMemo(
    () => (enrolledCourses || []).map((course: Course) => course._id.toString()),
    [enrolledCourses]
  );

  const {
    data: progressList,
    isLoading: isLoadingProgress,
    isError: isErrorProgress,
  } = useGetUserCourseProgressBatchQuery(
    { userId: user?.id ?? "", courseIds },
    { skip: !isLoaded || !user || courseIds.length === 0 }
  );

  const attempts: QuizAttempt[] = useMemo(() => {
    if (!enrolledCourses || !progressList) return [];

    const progressByCourseId = new Map(
      progressList.map((progress) => [progress.courseId.toString(), progress])
    );

    const result: QuizAttempt[] = [];

    enrolledCourses.forEach((course: Course) => {
      const progress = progressByCourseId.get(course._id.toString());
      if (!progress) return;

      const chapterProgressById = new Map<string, any>();
      progress.sections.forEach((section) => {
        section.chapters.forEach((chapter: any) => {
          chapterProgressById.set(chapter.chapterId, chapter);
        });
      });

      (course.sections || []).forEach((section) => {
        section.chapters.forEach((chapter) => {
          if (chapter.type !== "Quiz") return;
          const chapterProgress = chapterProgressById.get(chapter.chapterId);
          const score = chapterProgress?.score;
          if (typeof score !== "number") return;

          result.push({
            courseId: course._id,
            courseTitle: course.title,
            chapterId: chapter.chapterId,
            chapterTitle: chapter.title,
            score,
            passed: score >= PASSING_SCORE,
          });
        });
      });
    });

    return result;
  }, [enrolledCourses, progressList]);

  return {
    attempts,
    isLoading: isLoadingCourses || isLoadingProgress,
    isError: isErrorCourses || isErrorProgress,
  };
};
