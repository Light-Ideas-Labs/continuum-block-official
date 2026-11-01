"use client";

import Loading from "@/components/Loading";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useListInstructorsQuery } from "@/state/api";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { LayoutGrid, List } from "lucide-react";
import InstructorFilterSidebar from "@/components/InstructorFilterSidebar";
import InstructorCard from "@/components/InstructorCard";
import { useInstructorFilters } from "@/hooks/useInstructorFilters";
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

const Instructors = () => {
  const { data: instructors, isLoading, isError } = useListInstructorsQuery();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const {
    categories,
    selectedCategories,
    searchTerm,
    sort,
    page,
    totalPages,
    filteredInstructors,
    paginatedInstructors,
    toggleCategory,
    setSearchTerm,
    setSort,
    setPage,
    clearFilters,
  } = useInstructorFilters(instructors || []);

  if (isLoading) return <Loading />;
  if (isError || !instructors) return <div>Failed to fetch instructors</div>;

  const rangeStart = filteredInstructors.length === 0 ? 0 : (page - 1) * 9 + 1;
  const rangeEnd = Math.min(page * 9, filteredInstructors.length);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="search"
    >
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Instructors" }]} />
      <h1 className="search__title">Meet our instructors</h1>
      <h2 className="search__subtitle">{filteredInstructors.length} instructors available</h2>

      <div className="grid grid-cols-1 gap-8 pb-8 pt-2 md:grid-cols-[240px_1fr]">
        <InstructorFilterSidebar
          categories={categories}
          selectedCategories={selectedCategories}
          searchTerm={searchTerm}
          onToggleCategory={toggleCategory}
          onSearchChange={setSearchTerm}
          onClear={clearFilters}
        />

        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm text-customgreys-dirtyGrey">
              {filteredInstructors.length === 0
                ? "No results"
                : `Showing ${rangeStart}-${rangeEnd} of ${filteredInstructors.length} results`}
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
                  <SelectItem value="rating">Top Rated</SelectItem>
                  <SelectItem value="courses">Most Courses</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {paginatedInstructors.length === 0 ? (
            <div className="rounded-lg border border-customgreys-darkerGrey p-8 text-center text-customgreys-dirtyGrey">
              No instructors match your filters.
            </div>
          ) : (
            <div
              className={cn(
                viewMode === "grid"
                  ? "grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 xl:grid-cols-3"
                  : "flex flex-col gap-4"
              )}
            >
              {paginatedInstructors.map((instructor) => (
                <InstructorCard key={instructor.teacherId} instructor={instructor} variant={viewMode} />
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

export default Instructors;
