import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { PriceTier } from "@/hooks/useBootcampFilters";

interface CountedOption {
  name: string;
  count: number;
}

interface BootcampFilterSidebarProps {
  categories: CountedOption[];
  types: CountedOption[];
  deliveryModes: CountedOption[];
  priceCounts: { all: number; free: number; paid: number };
  selectedCategories: string[];
  selectedTypes: string[];
  selectedDeliveryModes: string[];
  priceTier: PriceTier;
  onToggleCategory: (category: string) => void;
  onToggleType: (type: string) => void;
  onToggleDeliveryMode: (mode: string) => void;
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

const BootcampFilterSidebar: React.FC<BootcampFilterSidebarProps> = ({
  categories,
  types,
  deliveryModes,
  priceCounts,
  selectedCategories,
  selectedTypes,
  selectedDeliveryModes,
  priceTier,
  onToggleCategory,
  onToggleType,
  onToggleDeliveryMode,
  onSetPriceTier,
  onClear,
  className,
}) => {
  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedTypes.length > 0 ||
    selectedDeliveryModes.length > 0 ||
    priceTier !== "all";

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
        <h4 className="mb-2 text-sm font-medium text-white-50">Type</h4>
        <div>
          {types.map((type) => (
            <FilterRow
              key={type.name}
              label={type.name}
              count={type.count}
              checked={selectedTypes.includes(type.name)}
              onCheckedChange={() => onToggleType(type.name)}
            />
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-2 text-sm font-medium text-white-50">Delivery Mode</h4>
        <div>
          {deliveryModes.map((mode) => (
            <FilterRow
              key={mode.name}
              label={mode.name}
              count={mode.count}
              checked={selectedDeliveryModes.includes(mode.name)}
              onCheckedChange={() => onToggleDeliveryMode(mode.name)}
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

export default BootcampFilterSidebar;
