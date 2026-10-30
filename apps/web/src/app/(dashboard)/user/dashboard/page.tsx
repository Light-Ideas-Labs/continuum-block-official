"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { GraduationCap, BookOpen, CheckCircle2 } from "lucide-react";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import CourseCardGrid from "@/components/CourseCardGrid";
import {
  useGetUserEnrolledCoursesQuery,
  useGetUserCourseProgressBatchQuery,
  useGetTransactionsQuery,
} from "@/state/api";
import { useQuizAttempts } from "@/hooks/useQuizAttempts";
import { formatPrice } from "@/lib/utils";

const UserDashboard = () => {
  const { user, isLoaded } = useUser();

  const { data: enrolledCourses, isLoading: isLoadingCourses } =
    useGetUserEnrolledCoursesQuery(user?.id ?? "", { skip: !isLoaded || !user });

  const courseIds = useMemo(
    () => (enrolledCourses || []).map((course: Course) => course._id.toString()),
    [enrolledCourses]
  );

  const { data: progressList } = useGetUserCourseProgressBatchQuery(
    { userId: user?.id ?? "", courseIds },
    { skip: !isLoaded || !user || courseIds.length === 0 }
  );

  const { data: transactions } = useGetTransactionsQuery(user?.id ?? "", {
    skip: !isLoaded || !user,
  });

  const { attempts: quizAttempts } = useQuizAttempts();

  const courseTitleById = useMemo(() => {
    const map = new Map<string, string>();
    (enrolledCourses || []).forEach((course: Course) => map.set(course._id, course.title));
    return map;
  }, [enrolledCourses]);

  const stats = useMemo(() => {
    const enrolled = enrolledCourses?.length || 0;
    let completed = 0;
    let active = 0;
    (progressList || []).forEach((progress) => {
      if (progress.overallProgress >= 100) completed++;
      else if (progress.overallProgress > 0) active++;
    });
    return { enrolled, active, completed };
  }, [enrolledCourses, progressList]);

  const recentCourses = (enrolledCourses || []).slice(0, 3);
  const recentInvoices = [...(transactions || [])]
    .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
    .slice(0, 5);
  const recentQuizzes = quizAttempts.slice(0, 5);

  if (!isLoaded || isLoadingCourses) return <Loading />;
  if (!user) return <div>Please sign in to view your dashboard.</div>;

  return (
    <div className="user-dashboard">
      <Header title="Dashboard" subtitle="Your learning at a glance" />

      <div className="mb-6 flex items-center gap-4 rounded-lg bg-gradient-to-br from-primary-950 via-primary-800 to-primary-700 p-6">
        <Image
          src={user.imageUrl}
          alt={user.fullName || "Profile"}
          width={64}
          height={64}
          className="rounded-full border-2 border-white-100/20"
        />
        <div>
          <h2 className="text-lg font-semibold text-white-100">{user.fullName}</h2>
          <p className="text-sm text-white-50/80">Student</p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-customgreys-darkGrey bg-customgreys-secondarybg p-4">
          <div className="mb-1 flex items-center gap-2 text-customgreys-dirtyGrey">
            <GraduationCap className="size-4" />
            <p className="text-xs uppercase tracking-wide">Enrolled Courses</p>
          </div>
          <p className="text-xl font-semibold text-white-100">{stats.enrolled}</p>
        </div>
        <div className="rounded-lg border border-customgreys-darkGrey bg-customgreys-secondarybg p-4">
          <div className="mb-1 flex items-center gap-2 text-customgreys-dirtyGrey">
            <BookOpen className="size-4" />
            <p className="text-xs uppercase tracking-wide">Active Courses</p>
          </div>
          <p className="text-xl font-semibold text-white-100">{stats.active}</p>
        </div>
        <div className="rounded-lg border border-customgreys-darkGrey bg-customgreys-secondarybg p-4">
          <div className="mb-1 flex items-center gap-2 text-customgreys-dirtyGrey">
            <CheckCircle2 className="size-4" />
            <p className="text-xs uppercase tracking-wide">Completed Courses</p>
          </div>
          <p className="text-xl font-semibold text-white-100">{stats.completed}</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white-100">Recently Enrolled Courses</h3>
          <Link href="/user/courses" className="text-sm text-primary-400 hover:text-primary-300">
            View all
          </Link>
        </div>
        {recentCourses.length === 0 ? (
          <p className="text-sm text-customgreys-dirtyGrey">No enrolled courses yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentCourses.map((course: Course) => (
              <CourseCardGrid key={course._id} course={course} variant="grid" />
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-customgreys-darkGrey bg-customgreys-secondarybg p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-white-100">Recent Invoices</h3>
            <Link href="/user/billing" className="text-sm text-primary-400 hover:text-primary-300">
              View all
            </Link>
          </div>
          {recentInvoices.length === 0 ? (
            <p className="text-sm text-customgreys-dirtyGrey">No invoices yet.</p>
          ) : (
            <ul className="space-y-3">
              {recentInvoices.map((transaction) => (
                <li
                  key={transaction._id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-white-50">
                    {courseTitleById.get(transaction.courseId) || "Unknown Course"}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-customgreys-dirtyGrey">
                      {formatPrice(transaction.amount)}
                    </span>
                    <span
                      className={`rounded px-2 py-0.5 text-xs ${
                        transaction.status === "Completed"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border border-customgreys-darkGrey bg-customgreys-secondarybg p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-white-100">Latest Quizzes</h3>
            <Link
              href="/user/quiz-attempts"
              className="text-sm text-primary-400 hover:text-primary-300"
            >
              View all
            </Link>
          </div>
          {recentQuizzes.length === 0 ? (
            <p className="text-sm text-customgreys-dirtyGrey">No quiz attempts yet.</p>
          ) : (
            <ul className="space-y-3">
              {recentQuizzes.map((attempt) => (
                <li
                  key={`${attempt.courseId}-${attempt.chapterId}`}
                  className="flex items-center justify-between text-sm"
                >
                  <div>
                    <p className="text-white-50">{attempt.chapterTitle}</p>
                    <p className="text-xs text-customgreys-dirtyGrey">{attempt.courseTitle}</p>
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      attempt.passed ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {Math.round(attempt.score)}%
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
