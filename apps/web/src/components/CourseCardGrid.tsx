import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

const levelColor = (level?: string) =>
  level === "Beginner"
    ? "bg-green-500"
    : level === "Intermediate"
      ? "bg-blue-500"
      : "bg-red-500";

interface CourseCardGridProps {
  course: Course;
  variant?: "grid" | "list";
}

const CourseCardGrid: React.FC<CourseCardGridProps> = ({
  course,
  variant = "grid",
}) => {
  const isList = variant === "list";

  return (
    <Link
      href={`/courses/${course._id}`}
      className={cn(
        "group flex overflow-hidden rounded-lg border border-customgreys-darkerGrey bg-customgreys-secondarybg transition-colors hover:border-primary-700",
        isList ? "flex-row items-stretch" : "flex-col"
      )}
    >
      <div
        className={cn(
          "relative shrink-0 bg-customgreys-primarybg",
          isList ? "w-48" : "aspect-video w-full"
        )}
      >
        <Image
          src={course.image || "/placeholder.png"}
          alt={course.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
        <Badge
          className={cn(
            "absolute right-2 top-2 rounded-full px-2 py-0.5 text-xs font-medium text-white",
            levelColor(course.level)
          )}
        >
          {course.level || "Unknown"}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col justify-between gap-2 p-4">
        <div>
          <span className="text-xs text-customgreys-dirtyGrey">
            {course.category}
          </span>
          <h3 className="mt-1 line-clamp-2 font-semibold text-white-100 group-hover:text-primary-400">
            {course.title}
          </h3>
          {isList && course.description && (
            <p className="mt-1 line-clamp-2 text-sm text-customgreys-dirtyGrey">
              {course.description}
            </p>
          )}
          <p className="mt-2 text-sm text-customgreys-dirtyGrey">
            By {course.teacherName}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-semibold text-primary-400">
              {formatPrice(course.price)}
            </span>
            <span className="text-xs text-customgreys-darkerGrey">
              {course.enrollments?.length || 0} enrolled
            </span>
          </div>
          <Button size="sm" variant="outline" className="pointer-events-none">
            View Course
          </Button>
        </div>
      </div>
    </Link>
  );
};

export default CourseCardGrid;
