import React from "react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { useListCoursesQuery } from "@/state/api";
import { useRouter } from "next/navigation";
import CourseCardSearch from "@/components/CourseCardSearch";
import { Badge } from "@/components/ui/badge";

const LoadingSkeleton = () => {
  return (
    <section className="container py-24 sm:py-32 space-y-8">
        <Skeleton className="h-10 w-3/4 max-w-2xl mx-auto md:text-center" />
        <Skeleton className="h-6 w-full max-w-3xl mx-auto md:w-3/4 mt-4 mb-8" />

        <div className="flex flex-wrap md:justify-center gap-4">
          {[1, 2, 3, 4, 5].map((num) => (
            <Skeleton key={`skeleton-tag-${num}`} className="h-8 w-32 px-3 py-1 rounded-full bg-customgreys-secondarybg" />
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <Skeleton key={`skeleton-card-${num}`} className="h-[340px] xl:h-[380px] rounded-lg bg-customgreys-secondarybg border-2 border-transparent animate-pulse" />
          ))}
        </div>
    </section>
  );
};

const courseList: string[] = [
  "web development",
  "enterprise IT",
  "react nextjs",
  "javascript",
  "backend development",
]

const FeaturedCourses = () => {
  const router = useRouter();
  const { data: courses, isLoading, isError } = useListCoursesQuery({});

  const handleCourseClick = (courseId: string) => {
    router.push(`/search?id=${courseId}`, {
      scroll: false,
    });
  };

  if (isLoading) return <LoadingSkeleton />;

  // Filter courses to show only published ones
  const publishedCourses = courses?.filter((course) => course.status === "Published");

  return (
    <motion.section
      className="container py-24 sm:py-32 space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-3xl lg:text-4xl font-bold md:text-center">
        Start Your{" "}
        <span className="bg-gradient-to-b from-[#F596D3] to-[#D247BF] text-transparent bg-clip-text">
          Learning Journey with Our Expert Courses
        </span>
      </h2>

      <p className="md:w-3/4 mx-auto mt-4 mb-8 text-xl text-muted-foreground text-center">
        From beginner to advanced, in all industries, we have the right courses
        just for you and preparing your entire journey for learning and making
        the most.
      </p>

      <div className="flex flex-wrap md:justify-center gap-4">
        {courseList.map((tag: string) => (
          <div key={tag}>
            <Badge variant="secondary" className="text-sm">
             {tag}
            </Badge>
          </div>
        ))}
      </div>

      <motion.div
        className="landing__featured"
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ amount: 0.3, once: true }}
      >
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {publishedCourses?.slice(0, 6).map((course, index) => (
            <motion.div
              key={course._id}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              viewport={{ amount: 0.4 }}
            >
              <CourseCardSearch
                course={course}
                onClick={() => handleCourseClick(course._id)}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.section>
  );
};

export default FeaturedCourses;
