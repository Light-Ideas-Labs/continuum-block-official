import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, BookOpen, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface InstructorCardProps {
  instructor: InstructorSummary;
  variant?: "grid" | "list";
}

const MAX_VISIBLE_CATEGORIES = 3;

const InstructorCard: React.FC<InstructorCardProps> = ({ instructor, variant = "grid" }) => {
  const isList = variant === "list";
  const visibleCategories = instructor.categories.slice(0, MAX_VISIBLE_CATEGORIES);
  const overflowCount = instructor.categories.length - visibleCategories.length;

  return (
    <Link
      href={`/instructors/${instructor.teacherId}`}
      className={cn(
        "group flex overflow-hidden rounded-lg border border-customgreys-darkerGrey bg-customgreys-secondarybg p-4 transition-colors hover:border-primary-700",
        isList ? "flex-row items-center gap-4" : "h-full flex-col items-center text-center gap-3"
      )}
    >
      <div className={cn("relative shrink-0 overflow-hidden rounded-full bg-customgreys-primarybg", isList ? "size-16" : "size-20")}>
        <Image
          src={instructor.imgUrl || "/placeholder.png"}
          alt={instructor.name}
          fill
          sizes="80px"
          className="object-cover"
        />
      </div>

      <div className={cn("flex flex-1 flex-col gap-2", isList ? "items-start" : "items-center")}>
        <h3 className="font-semibold text-white-100 group-hover:text-primary-400">
          {instructor.name}
        </h3>

        {visibleCategories.length > 0 && (
          <div className={cn("flex flex-wrap gap-1.5", isList ? "justify-start" : "justify-center")}>
            {visibleCategories.map((category) => (
              <Badge
                key={category}
                variant="outline"
                className="border-customgreys-darkerGrey text-xs font-normal text-customgreys-dirtyGrey"
              >
                {category}
              </Badge>
            ))}
            {overflowCount > 0 && (
              <Badge variant="outline" className="border-customgreys-darkerGrey text-xs font-normal text-customgreys-dirtyGrey">
                +{overflowCount}
              </Badge>
            )}
          </div>
        )}

        <div className="mt-auto flex items-center gap-3 text-xs text-customgreys-dirtyGrey">
          {instructor.avgRating > 0 ? (
            <span className="flex items-center gap-1">
              <Star className="size-3.5 fill-yellow-500 text-yellow-500" />
              {instructor.avgRating.toFixed(1)}
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Star className="size-3.5" />
              No ratings yet
            </span>
          )}
          <span className="flex items-center gap-1">
            <BookOpen className="size-3.5" />
            {instructor.courseCount}
          </span>
          <span className="flex items-center gap-1">
            <Users className="size-3.5" />
            {instructor.studentCount}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default InstructorCard;
