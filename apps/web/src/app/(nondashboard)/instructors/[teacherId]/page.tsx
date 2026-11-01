"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Star, BookOpen, Users } from "lucide-react";
import Loading from "@/components/Loading";
import Breadcrumbs from "@/components/Breadcrumbs";
import CourseCardGrid from "@/components/CourseCardGrid";
import { Badge } from "@/components/ui/badge";
import { useGetInstructorQuery } from "@/state/api";

const InstructorDetailPage = () => {
  const params = useParams();
  const teacherId = params.teacherId as string;
  const { data: instructor, isLoading, isError } = useGetInstructorQuery(teacherId);

  if (isLoading) return <Loading />;
  if (isError || !instructor) return <div className="p-8 text-center">Instructor not found</div>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mx-auto w-full max-w-6xl px-4 py-10 md:px-8"
    >
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Instructors", href: "/instructors" },
          { label: instructor.name },
        ]}
      />

      <div className="flex flex-col items-center gap-4 rounded-lg border border-customgreys-darkerGrey bg-customgreys-secondarybg p-6 text-center sm:flex-row sm:text-left">
        <div className="relative size-24 shrink-0 overflow-hidden rounded-full bg-customgreys-primarybg">
          <Image
            src={instructor.imgUrl || "/placeholder.png"}
            alt={instructor.name}
            fill
            sizes="96px"
            className="object-cover"
          />
        </div>

        <div className="flex flex-1 flex-col items-center gap-2 sm:items-start">
          <h1 className="text-2xl font-semibold text-white-100">{instructor.name}</h1>

          {instructor.categories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1.5 sm:justify-start">
              {instructor.categories.map((category) => (
                <Badge
                  key={category}
                  variant="outline"
                  className="border-customgreys-darkerGrey text-xs font-normal text-customgreys-dirtyGrey"
                >
                  {category}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 text-sm text-customgreys-dirtyGrey">
            {instructor.avgRating > 0 ? (
              <span className="flex items-center gap-1.5">
                <Star className="size-4 fill-yellow-500 text-yellow-500" />
                {instructor.avgRating.toFixed(1)} rating
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Star className="size-4" />
                No ratings yet
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <BookOpen className="size-4" />
              {instructor.courseCount} courses
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="size-4" />
              {instructor.studentCount} students
            </span>
          </div>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="mb-4 text-xl font-semibold text-white-100">
          Courses by {instructor.name}
        </h2>
        {instructor.courses.length === 0 ? (
          <p className="text-sm text-customgreys-dirtyGrey">No published courses yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {instructor.courses.map((course) => (
              <CourseCardGrid key={course._id} course={course} variant="grid" />
            ))}
          </div>
        )}
      </section>

      {instructor.bootcamps && instructor.bootcamps.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 text-xl font-semibold text-white-100">
            Bootcamps by {instructor.name}
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {instructor.bootcamps.map((bootcamp) => (
              <Link
                key={bootcamp._id}
                href={`/bootcamps/${bootcamp._id}`}
                className="group flex flex-col overflow-hidden rounded-lg border border-customgreys-darkerGrey bg-customgreys-secondarybg transition-colors hover:border-primary-700"
              >
                <div className="relative aspect-video w-full bg-customgreys-primarybg">
                  <Image
                    src={bootcamp.image || "/placeholder.png"}
                    alt={bootcamp.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <Badge variant="outline" className="mb-2 border-customgreys-darkerGrey text-xs font-normal text-customgreys-dirtyGrey">
                    Bootcamp
                  </Badge>
                  <h3 className="font-semibold text-white-100 group-hover:text-primary-400">
                    {bootcamp.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
};

export default InstructorDetailPage;
