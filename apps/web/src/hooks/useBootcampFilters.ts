import { useEffect, useMemo, useState } from "react";

export type BootcampSort = "newest" | "price-asc" | "price-desc";
export type PriceTier = "all" | "free" | "paid";

const PAGE_SIZE = 9;

interface CountedOption {
  name: string;
  count: number;
}

export const useBootcampFilters = (bootcamps: Bootcamp[]) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedDeliveryModes, setSelectedDeliveryModes] = useState<string[]>([]);
  const [priceTier, setPriceTier] = useState<PriceTier>("all");
  const [sort, setSort] = useState<BootcampSort>("newest");
  const [page, setPage] = useState(1);

  const categories: CountedOption[] = useMemo(() => {
    const counts = new Map<string, number>();
    bootcamps.forEach((bootcamp) => {
      (bootcamp.categories || []).forEach((category) => {
        counts.set(category, (counts.get(category) || 0) + 1);
      });
    });
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [bootcamps]);

  const types: CountedOption[] = useMemo(() => {
    const counts = new Map<string, number>();
    bootcamps.forEach((bootcamp) => {
      counts.set(bootcamp.type, (counts.get(bootcamp.type) || 0) + 1);
    });
    return Array.from(counts.entries()).map(([name, count]) => ({ name, count }));
  }, [bootcamps]);

  const deliveryModes: CountedOption[] = useMemo(() => {
    const counts = new Map<string, number>();
    bootcamps.forEach((bootcamp) => {
      counts.set(bootcamp.deliveryMode, (counts.get(bootcamp.deliveryMode) || 0) + 1);
    });
    return Array.from(counts.entries()).map(([name, count]) => ({ name, count }));
  }, [bootcamps]);

  const priceCounts = useMemo(() => {
    const free = bootcamps.filter((b) => !b.price?.amount).length;
    return { all: bootcamps.length, free, paid: bootcamps.length - free };
  }, [bootcamps]);

  const filteredBootcamps = useMemo(() => {
    let result = bootcamps;

    if (selectedCategories.length > 0) {
      result = result.filter((b) =>
        (b.categories || []).some((category) => selectedCategories.includes(category))
      );
    }
    if (selectedTypes.length > 0) {
      result = result.filter((b) => selectedTypes.includes(b.type));
    }
    if (selectedDeliveryModes.length > 0) {
      result = result.filter((b) => selectedDeliveryModes.includes(b.deliveryMode));
    }
    if (priceTier === "free") {
      result = result.filter((b) => !b.price?.amount);
    } else if (priceTier === "paid") {
      result = result.filter((b) => !!b.price?.amount);
    }

    if (sort === "price-asc") {
      result = [...result].sort((a, b) => (a.price?.amount || 0) - (b.price?.amount || 0));
    } else if (sort === "price-desc") {
      result = [...result].sort((a, b) => (b.price?.amount || 0) - (a.price?.amount || 0));
    }

    return result;
  }, [bootcamps, selectedCategories, selectedTypes, selectedDeliveryModes, priceTier, sort]);

  useEffect(() => {
    setPage(1);
  }, [selectedCategories, selectedTypes, selectedDeliveryModes, priceTier, sort, bootcamps.length]);

  const totalPages = Math.max(1, Math.ceil(filteredBootcamps.length / PAGE_SIZE));

  const paginatedBootcamps = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredBootcamps.slice(start, start + PAGE_SIZE);
  }, [filteredBootcamps, page]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleDeliveryMode = (mode: string) => {
    setSelectedDeliveryModes((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedTypes([]);
    setSelectedDeliveryModes([]);
    setPriceTier("all");
  };

  return {
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
    pageSize: PAGE_SIZE,
    filteredBootcamps,
    paginatedBootcamps,
    toggleCategory,
    toggleType,
    toggleDeliveryMode,
    setPriceTier,
    setSort,
    setPage,
    clearFilters,
  };
};
