import { useEffect, useMemo, useState } from "react";

export type CourseSort = "newest" | "price-asc" | "price-desc";
export type PriceTier = "all" | "free" | "paid";

const PAGE_SIZE = 9;

interface CountedOption {
  name: string;
  count: number;
}

export const useCourseFilters = (courses: Course[]) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [priceTier, setPriceTier] = useState<PriceTier>("all");
  const [sort, setSort] = useState<CourseSort>("newest");
  const [page, setPage] = useState(1);

  const categories: CountedOption[] = useMemo(() => {
    const counts = new Map<string, number>();
    courses.forEach((course) => {
      counts.set(course.category, (counts.get(course.category) || 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [courses]);

  const levels: CountedOption[] = useMemo(() => {
    const counts = new Map<string, number>();
    courses.forEach((course) => {
      counts.set(course.level, (counts.get(course.level) || 0) + 1);
    });
    return Array.from(counts.entries()).map(([name, count]) => ({
      name,
      count,
    }));
  }, [courses]);

  const priceCounts = useMemo(() => {
    const free = courses.filter((c) => !c.price).length;
    return { all: courses.length, free, paid: courses.length - free };
  }, [courses]);

  const filteredCourses = useMemo(() => {
    let result = courses;

    if (selectedCategories.length > 0) {
      result = result.filter((c) => selectedCategories.includes(c.category));
    }
    if (selectedLevels.length > 0) {
      result = result.filter((c) => selectedLevels.includes(c.level));
    }
    if (priceTier === "free") {
      result = result.filter((c) => !c.price);
    } else if (priceTier === "paid") {
      result = result.filter((c) => !!c.price);
    }

    if (sort === "price-asc") {
      result = [...result].sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sort === "price-desc") {
      result = [...result].sort((a, b) => (b.price || 0) - (a.price || 0));
    }

    return result;
  }, [courses, selectedCategories, selectedLevels, priceTier, sort]);

  useEffect(() => {
    setPage(1);
  }, [selectedCategories, selectedLevels, priceTier, sort, courses.length]);

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / PAGE_SIZE));

  const paginatedCourses = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredCourses.slice(start, start + PAGE_SIZE);
  }, [filteredCourses, page]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const toggleLevel = (level: string) => {
    setSelectedLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedLevels([]);
    setPriceTier("all");
  };

  return {
    categories,
    levels,
    priceCounts,
    selectedCategories,
    selectedLevels,
    priceTier,
    sort,
    page,
    totalPages,
    pageSize: PAGE_SIZE,
    filteredCourses,
    paginatedCourses,
    toggleCategory,
    toggleLevel,
    setPriceTier,
    setSort,
    setPage,
    clearFilters,
  };
};
