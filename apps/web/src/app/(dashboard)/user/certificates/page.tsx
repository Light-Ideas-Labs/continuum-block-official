"use client";

import React, { useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  useGetUserEnrolledCoursesQuery,
  useGetUserCourseProgressBatchQuery,
} from "@/state/api";

const UserCertificates = () => {
  const { user, isLoaded } = useUser();

  const { data: enrolledCourses, isLoading: isLoadingCourses } =
    useGetUserEnrolledCoursesQuery(user?.id ?? "", { skip: !isLoaded || !user });

  const courseIds = useMemo(
    () => (enrolledCourses || []).map((course: Course) => course._id.toString()),
    [enrolledCourses]
  );

  const { data: progressList, isLoading: isLoadingProgress } = useGetUserCourseProgressBatchQuery(
    { userId: user?.id ?? "", courseIds },
    { skip: !isLoaded || !user || courseIds.length === 0 }
  );

  const completedCourses = useMemo(() => {
    if (!enrolledCourses || !progressList) return [];
    const courseTitleById = new Map(
      enrolledCourses.map((course: Course) => [course._id, course.title])
    );
    return progressList
      .filter((progress) => progress.overallProgress >= 100)
      .map((progress) => ({
        courseId: progress.courseId,
        title: courseTitleById.get(progress.courseId) || "Unknown Course",
        completedOn: progress.lastAccessedTimestamp,
      }))
      .sort((a, b) => new Date(b.completedOn).getTime() - new Date(a.completedOn).getTime());
  }, [enrolledCourses, progressList]);

  if (!isLoaded || isLoadingCourses || isLoadingProgress) return <Loading />;
  if (!user) return <div>Please sign in to view your certificates.</div>;

  return (
    <div className="user-certificates">
      <Header title="My Certificates" subtitle="Courses you've completed" />

      {completedCourses.length === 0 ? (
        <p className="mt-4 text-sm text-customgreys-dirtyGrey">
          No completed courses yet. Finish a course to see it here.
        </p>
      ) : (
        <Table className="mt-4">
          <TableHeader>
            <TableRow>
              <TableHead>Course Name</TableHead>
              <TableHead>Completed On</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {completedCourses.map((entry) => (
              <TableRow key={entry.courseId}>
                <TableCell className="font-medium text-white-100">{entry.title}</TableCell>
                <TableCell className="text-customgreys-dirtyGrey">
                  {new Date(entry.completedOn).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default UserCertificates;
