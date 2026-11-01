"use client";

import Loading from "@/components/Loading";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useListBootcampsQuery } from "@/state/api";
import { useSearchParams } from "next/navigation";
import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { LayoutGrid, List } from "lucide-react";
import BootcampFilterSidebar from "@/components/BootcampFilterSidebar";
import BootcampCardGrid from "@/components/BootcampCardGrid";
import { useBootcampFilters } from "@/hooks/useBootcampFilters";
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

const BootcampSearch = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get("query")?.toLowerCase() || "";
  const { data: allBootcamps, isLoading, isError } = useListBootcampsQuery({});
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const bootcamps = useMemo(() => {
    if (!allBootcamps) return [];
    let published = allBootcamps.filter((bootcamp: Bootcamp) => bootcamp.status !== "Draft");

    if (query) {
      published = published.filter((bootcamp: Bootcamp) =>
        bootcamp.title.toLowerCase().includes(query)
      );
    }

    return published;
  }, [allBootcamps, query]);

  const {
    categories,
    types,
    deliveryModes,
    priceCounts,
    selectedCategories,
    selectedTypes,
    selectedDeliveryModes,
    priceTier,
    sort,
    page,
    totalPages,
    filteredBootcamps,
    paginatedBootcamps,
    toggleCategory,
    toggleType,
    toggleDeliveryMode,
    setPriceTier,
    setSort,
    setPage,
    clearFilters,
  } = useBootcampFilters(bootcamps);

  if (isLoading) return <Loading />;
  if (isError || !bootcamps) return <div>Failed to fetch bootcamps</div>;

  const rangeStart = filteredBootcamps.length === 0 ? 0 : (page - 1) * 9 + 1;
  const rangeEnd = Math.min(page * 9, filteredBootcamps.length);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="search"
    >
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Bootcamps" }]} />
      <h1 className="search__title">List of available bootcamps</h1>
      <h2 className="search__subtitle">{filteredBootcamps.length} bootcamps available</h2>

      <div className="grid grid-cols-1 gap-8 pb-8 pt-2 md:grid-cols-[240px_1fr]">
        <BootcampFilterSidebar
          categories={categories}
          types={types}
          deliveryModes={deliveryModes}
          priceCounts={priceCounts}
          selectedCategories={selectedCategories}
          selectedTypes={selectedTypes}
          selectedDeliveryModes={selectedDeliveryModes}
          priceTier={priceTier}
          onToggleCategory={toggleCategory}
          onToggleType={toggleType}
          onToggleDeliveryMode={toggleDeliveryMode}
          onSetPriceTier={setPriceTier}
          onClear={clearFilters}
        />

        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm text-customgreys-dirtyGrey">
              {filteredBootcamps.length === 0
                ? "No results"
                : `Showing ${rangeStart}-${rangeEnd} of ${filteredBootcamps.length} results`}
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

          {paginatedBootcamps.length === 0 ? (
            <div className="rounded-lg border border-customgreys-darkerGrey p-8 text-center text-customgreys-dirtyGrey">
              No bootcamps match your filters.
            </div>
          ) : (
            <div
              className={cn(
                viewMode === "grid"
                  ? "grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 xl:grid-cols-3"
                  : "flex flex-col gap-4"
              )}
            >
              {paginatedBootcamps.map((bootcamp) => (
                <BootcampCardGrid key={bootcamp._id} bootcamp={bootcamp} variant={viewMode} />
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

export default BootcampSearch;
