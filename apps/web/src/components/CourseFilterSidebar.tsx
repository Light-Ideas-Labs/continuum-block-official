import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { CourseSort, PriceTier } from "@/hooks/useCourseFilters";

interface CountedOption {
  name: string;
  count: number;
}

interface CourseFilterSidebarProps {
  categories: CountedOption[];
  levels: CountedOption[];
  priceCounts: { all: number; free: number; paid: number };
  selectedCategories: string[];
  selectedLevels: string[];
  priceTier: PriceTier;
  onToggleCategory: (category: string) => void;
  onToggleLevel: (level: string) => void;
  onSetPriceTier: (tier: PriceTier) => void;
  onClear: () => void;
  className?: string;
}

const FilterRow = ({
  label,
  count,
  checked,
  onCheckedChange,
}: {
  label: string;
  count: number;
  checked: boolean;
  onCheckedChange: () => void;
}) => (
  <label className="flex cursor-pointer items-center justify-between gap-2 py-1.5 text-sm">
    <span className="flex items-center gap-2">
      <Checkbox checked={checked} onCheckedChange={onCheckedChange} />
      <span className="text-customgreys-dirtyGrey">{label}</span>
    </span>
    <span className="text-xs text-customgreys-darkerGrey">({count})</span>
  </label>
);

const CourseFilterSidebar: React.FC<CourseFilterSidebarProps> = ({
  categories,
  levels,
  priceCounts,
  selectedCategories,
  selectedLevels,
  priceTier,
  onToggleCategory,
  onToggleLevel,
  onSetPriceTier,
  onClear,
  className,
}) => {
  const hasActiveFilters =
    selectedCategories.length > 0 || selectedLevels.length > 0 || priceTier !== "all";

  return (
    <aside className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white-100">Filters</h3>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-primary-400 hover:text-primary-300"
          >
            Clear
          </button>
        )}
      </div>

      <div>
        <h4 className="mb-2 text-sm font-medium text-white-50">Categories</h4>
        <div>
          {categories.map((category) => (
            <FilterRow
              key={category.name}
              label={category.name}
              count={category.count}
              checked={selectedCategories.includes(category.name)}
              onCheckedChange={() => onToggleCategory(category.name)}
            />
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-2 text-sm font-medium text-white-50">Level</h4>
        <div>
          {levels.map((level) => (
            <FilterRow
              key={level.name}
              label={level.name}
              count={level.count}
              checked={selectedLevels.includes(level.name)}
              onCheckedChange={() => onToggleLevel(level.name)}
            />
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-2 text-sm font-medium text-white-50">Price</h4>
        <div>
          {(["all", "free", "paid"] as PriceTier[]).map((tier) => (
            <FilterRow
              key={tier}
              label={tier === "all" ? "All" : tier === "free" ? "Free" : "Paid"}
              count={priceCounts[tier]}
              checked={priceTier === tier}
              onCheckedChange={() => onSetPriceTier(tier)}
            />
          ))}
        </div>
      </div>
    </aside>
  );
};

export default CourseFilterSidebar;
export type { CourseSort };
