import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import React from "react";

const BootcampCheckoutPreview = ({ course: bootcamp }: CoursePreviewProps) => {
  const price = formatPrice(bootcamp.price);
  return (
    <div className="course-preview">
      <div className="course-preview__container">
        <div className="course-preview__image-wrapper">
          <Image
            src={bootcamp.image || "/placeholder.png"}
            alt="Bootcamp Preview"
            width={640}
            height={360}
            className="w-full"
          />
        </div>
        <div>
          <h2 className="course-preview__title">{bootcamp.title}</h2>
          <p className="text-gray-400 text-md mb-4">Hosted by {bootcamp.teacherName}</p>
          <p className="text-sm text-customgreys-dirtyGrey">
            {bootcamp.description}
          </p>
        </div>
      </div>

      <div className="course-preview__container">
        <h3 className="text-xl mb-4">Price Details (1 item)</h3>
        <div className="flex justify-between mb-4 text-customgreys-dirtyGrey text-base">
          <span className="font-bold">1x {bootcamp.title}</span>
          <span className="font-bold">{price}</span>
        </div>
        <div className="flex justify-between border-t border-customgreys-dirtyGrey pt-4">
          <span className="font-bold text-lg">Total Amount</span>
          <span className="font-bold text-lg">{price}</span>
        </div>
      </div>
    </div>
  );
};

export default BootcampCheckoutPreview;
