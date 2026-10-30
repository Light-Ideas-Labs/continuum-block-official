"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BookOpen, Layers, Users } from "lucide-react";
import Loading from "@/components/Loading";
import AccordionSections from "@/components/AccordionSections";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetCourseQuery } from "@/state/api";
import { formatPrice, cn } from "@/lib/utils";

const levelColor = (level?: string) =>
  level === "Beginner"
    ? "bg-green-500"
    : level === "Intermediate"
      ? "bg-blue-500"
      : "bg-red-500";

const CourseDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const { data: course, isLoading, isError } = useGetCourseQuery(courseId);

  if (isLoading) return <Loading />;
  if (isError || !course) return <div className="p-8 text-center">Course not found</div>;

  const lectureCount = (course.sections || []).reduce(
    (sum: number, section: Section) => sum + section.chapters.length,
    0
  );

  const handleEnrollNow = () => {
    router.push(`/checkout?step=1&id=${course._id}&showSignUp=false`, {
      scroll: false,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mx-auto w-full max-w-6xl px-4 py-10 md:px-8"
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="text-xs text-customgreys-dirtyGrey">{course.category}</span>
        <Badge
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-medium text-white",
            levelColor(course.level)
          )}
        >
          {course.level}
        </Badge>
      </div>
      <h1 className="text-3xl font-semibold text-white-100">{course.title}</h1>
      <p className="mt-2 max-w-3xl text-customgreys-dirtyGrey">{course.description}</p>

      <div className="mt-4 flex flex-wrap items-center gap-6 text-sm text-customgreys-dirtyGrey">
        <span className="flex items-center gap-1.5">
          <BookOpen className="size-4" /> {lectureCount} Lectures
        </span>
        <span className="flex items-center gap-1.5">
          <Layers className="size-4" /> {course.sections?.length || 0} Sections
        </span>
        <span className="flex items-center gap-1.5">
          <Users className="size-4" /> {course.enrollments?.length || 0} students enrolled
        </span>
        <span>By {course.teacherName}</span>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <section>
            <h2 className="mb-3 text-xl font-semibold text-white-100">Overview</h2>
            <p className="whitespace-pre-line text-customgreys-dirtyGrey">
              {course.description}
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white-100">Course Content</h2>
            <p className="mb-2 text-sm text-customgreys-dirtyGrey">
              {course.sections?.length || 0} sections • {lectureCount} lectures
            </p>
            <div className="rounded-lg border border-customgreys-darkerGrey bg-customgreys-secondarybg">
              <AccordionSections sections={course.sections || []} />
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white-100">About the instructor</h2>
            <div className="rounded-lg border border-customgreys-darkerGrey bg-customgreys-secondarybg p-4">
              <p className="font-medium text-white-100">{course.teacherName}</p>
            </div>
          </section>
        </div>

        <aside className="h-fit space-y-4 rounded-lg border border-customgreys-darkerGrey bg-customgreys-secondarybg p-5">
          <span className="text-2xl font-semibold text-primary-400">
            {formatPrice(course.price)}
          </span>
          <Button className="w-full" size="lg" onClick={handleEnrollNow}>
            Enroll Now
          </Button>

          <div className="border-t border-customgreys-darkerGrey pt-4">
            <h3 className="mb-2 text-sm font-semibold text-white-100">Includes</h3>
            <ul className="space-y-1.5 text-sm text-customgreys-dirtyGrey">
              <li>{lectureCount} lectures</li>
              <li>{course.sections?.length || 0} sections</li>
              <li>Level: {course.level}</li>
              <li>Full lifetime access</li>
            </ul>
          </div>
        </aside>
      </div>
    </motion.div>
  );
};

export default CourseDetailPage;
