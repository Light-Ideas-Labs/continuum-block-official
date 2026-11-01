import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CountedOption {
  name: string;
  count: number;
}

interface InstructorFilterSidebarProps {
  categories: CountedOption[];
  selectedCategories: string[];
  searchTerm: string;
  onToggleCategory: (category: string) => void;
  onSearchChange: (value: string) => void;
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

const InstructorFilterSidebar: React.FC<InstructorFilterSidebarProps> = ({
  categories,
  selectedCategories,
  searchTerm,
  onToggleCategory,
  onSearchChange,
  onClear,
  className,
}) => {
  const hasActiveFilters = selectedCategories.length > 0 || searchTerm.trim().length > 0;

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
        <h4 className="mb-2 text-sm font-medium text-white-50">Search</h4>
        <Input
          type="search"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="bg-customgreys-primarybg text-sm"
        />
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
    </aside>
  );
};

export default InstructorFilterSidebar;
