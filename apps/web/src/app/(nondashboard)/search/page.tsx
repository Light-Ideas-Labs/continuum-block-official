"use client";

import Loading from "@/components/Loading";
import { useListCoursesQuery } from "@/state/api";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { LayoutGrid, List } from "lucide-react";
import CourseFilterSidebar from "@/components/CourseFilterSidebar";
import CourseCardGrid from "@/components/CourseCardGrid";
import { useCourseFilters } from "@/hooks/useCourseFilters";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

const Search = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get("query")?.toLowerCase() || "";
  const { data: allCourses, isLoading, isError } = useListCoursesQuery({});
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const courses = useMemo(() => {
    if (!allCourses) return [];
    let published = allCourses.filter((course: Course) => course.status !== "Draft");

    if (query) {
      published = published.filter(
        (course: Course) =>
          course.title.toLowerCase().includes(query) ||
          (course.description && course.description.toLowerCase().includes(query))
      );
    }

    return published;
  }, [allCourses, query]);

  const {
    categories,
    levels,
    priceCounts,
    selectedCategories,
    selectedLevels,
    priceTier,
    sort,
    page,
    totalPages,
    filteredCourses,
    paginatedCourses,
    toggleCategory,
    toggleLevel,
    setPriceTier,
    setSort,
    setPage,
    clearFilters,
  } = useCourseFilters(courses);

  if (isLoading) return <Loading />;
  if (isError || !courses) return <div>Failed to fetch courses</div>;

  const rangeStart = filteredCourses.length === 0 ? 0 : (page - 1) * 9 + 1;
  const rangeEnd = Math.min(page * 9, filteredCourses.length);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="search"
    >
      <h1 className="search__title">List of available courses</h1>
      <h2 className="search__subtitle">{filteredCourses.length} courses available</h2>

      <div className="grid grid-cols-1 gap-8 pb-8 pt-2 md:grid-cols-[240px_1fr]">
        <CourseFilterSidebar
          categories={categories}
          levels={levels}
          priceCounts={priceCounts}
          selectedCategories={selectedCategories}
          selectedLevels={selectedLevels}
          priceTier={priceTier}
          onToggleCategory={toggleCategory}
          onToggleLevel={toggleLevel}
          onSetPriceTier={setPriceTier}
          onClear={clearFilters}
        />

        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm text-customgreys-dirtyGrey">
              {filteredCourses.length === 0
                ? "No results"
                : `Showing ${rangeStart}-${rangeEnd} of ${filteredCourses.length} results`}
            </span>

            <div className="flex items-center gap-2">
              <div className="flex overflow-hidden rounded-md border border-customgreys-darkerGrey">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "p-2",
                    viewMode === "grid"
                      ? "bg-primary-700 text-white-100"
                      : "text-customgreys-dirtyGrey hover:text-white-50"
                  )}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "p-2",
                    viewMode === "list"
                      ? "bg-primary-700 text-white-100"
                      : "text-customgreys-dirtyGrey hover:text-white-50"
                  )}
                  aria-label="List view"
                >
                  <List className="size-4" />
                </button>
              </div>

              <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newly Published</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {paginatedCourses.length === 0 ? (
            <div className="rounded-lg border border-customgreys-darkerGrey p-8 text-center text-customgreys-dirtyGrey">
              No courses match your filters.
            </div>
          ) : (
            <div
              className={cn(
                viewMode === "grid"
                  ? "grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3"
                  : "flex flex-col gap-4"
              )}
            >
              {paginatedCourses.map((course) => (
                <CourseCardGrid key={course._id} course={course} variant={viewMode} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page > 1) setPage(page - 1);
                    }}
                    className={page === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <PaginationItem key={p}>
                    <PaginationLink
                      href="#"
                      isActive={p === page}
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(p);
                      }}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page < totalPages) setPage(page + 1);
                    }}
                    className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Search;
