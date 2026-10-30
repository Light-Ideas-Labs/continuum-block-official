import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

const deliveryModeColor = (mode?: string) =>
  mode === "Online" ? "bg-blue-500" : mode === "In-Person" ? "bg-green-500" : "bg-purple-500";

interface BootcampCardGridProps {
  bootcamp: Bootcamp;
  variant?: "grid" | "list";
}

const BootcampCardGrid: React.FC<BootcampCardGridProps> = ({
  bootcamp,
  variant = "grid",
}) => {
  const isList = variant === "list";

  return (
    <Link
      href={`/bootcamps/${bootcamp._id}`}
      className={cn(
        "group flex overflow-hidden rounded-lg border border-customgreys-darkerGrey bg-customgreys-secondarybg transition-colors hover:border-primary-700",
        isList ? "flex-row items-stretch" : "flex-col"
      )}
    >
      <div
        className={cn(
          "relative shrink-0 bg-customgreys-primarybg",
          isList ? "w-48" : "aspect-video w-full"
        )}
      >
        <Image
          src={bootcamp.image || "/placeholder.png"}
          alt={bootcamp.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
        <Badge
          className={cn(
            "absolute right-2 top-2 rounded-full px-2 py-0.5 text-xs font-medium text-white",
            deliveryModeColor(bootcamp.deliveryMode)
          )}
        >
          {bootcamp.deliveryMode || "Unknown"}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col justify-between gap-2 p-4">
        <div>
          <span className="text-xs text-customgreys-dirtyGrey">
            {bootcamp.categories?.[0] || bootcamp.type}
          </span>
          <h3 className="mt-1 line-clamp-2 font-semibold text-white-100 group-hover:text-primary-400">
            {bootcamp.title}
          </h3>
          {isList && bootcamp.description && (
            <p className="mt-1 line-clamp-2 text-sm text-customgreys-dirtyGrey">
              {bootcamp.description}
            </p>
          )}
          <p className="mt-2 text-sm text-customgreys-dirtyGrey">
            Hosted by {bootcamp.hostedBy?.name}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-semibold text-primary-400">
              {formatPrice(bootcamp.price?.amount)}
            </span>
            <span className="text-xs text-customgreys-darkerGrey">
              {bootcamp.members?.length || 0} members
            </span>
          </div>
          <Button size="sm" variant="outline" className="pointer-events-none">
            View Bootcamp
          </Button>
        </div>
      </div>
    </Link>
  );
};

export default BootcampCardGrid;
