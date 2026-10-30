import { useEffect, useMemo, useState } from "react";

export type InstructorSort = "rating" | "courses" | "name";

const PAGE_SIZE = 9;

interface CountedOption {
  name: string;
  count: number;
}

export const useInstructorFilters = (instructors: InstructorSummary[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sort, setSort] = useState<InstructorSort>("rating");
  const [page, setPage] = useState(1);

  const categories: CountedOption[] = useMemo(() => {
    const counts = new Map<string, number>();
    instructors.forEach((instructor) => {
      instructor.categories.forEach((category) => {
        counts.set(category, (counts.get(category) || 0) + 1);
      });
    });
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [instructors]);

  const filteredInstructors = useMemo(() => {
    let result = instructors;

    const query = searchTerm.trim().toLowerCase();
    if (query) {
      result = result.filter((instructor) => instructor.name.toLowerCase().includes(query));
    }

    if (selectedCategories.length > 0) {
      result = result.filter((instructor) =>
        instructor.categories.some((category) => selectedCategories.includes(category))
      );
    }

    if (sort === "rating") {
      result = [...result].sort((a, b) => b.avgRating - a.avgRating);
    } else if (sort === "courses") {
      result = [...result].sort((a, b) => b.courseCount - a.courseCount);
    } else {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [instructors, searchTerm, selectedCategories, sort]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedCategories, sort, instructors.length]);

  const totalPages = Math.max(1, Math.ceil(filteredInstructors.length / PAGE_SIZE));

  const paginatedInstructors = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredInstructors.slice(start, start + PAGE_SIZE);
  }, [filteredInstructors, page]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategories([]);
  };

  return {
    categories,
    selectedCategories,
    searchTerm,
    sort,
    page,
    totalPages,
    pageSize: PAGE_SIZE,
    filteredInstructors,
    paginatedInstructors,
    toggleCategory,
    setSearchTerm,
    setSort,
    setPage,
    clearFilters,
  };
};
