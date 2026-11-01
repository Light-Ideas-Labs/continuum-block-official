"use client";

import { Button } from "@/components/ui/button";
import { useCheckoutNavigation } from "@/hooks/useCheckoutNavigation";
import { Check } from "lucide-react";
import Link from "next/link";
import React from "react";

const CompletionPage = () => {
  const { type } = useCheckoutNavigation();
  const isBootcamp = type === "bootcamp";

  return (
    <div className="completion">
      <div className="completion__content">
        <div className="completion__icon">
          <Check className="w-16 h-16" />
        </div>
        <h1 className="completion__title">COMPLETED</h1>
        <p className="completion__message">
          {isBootcamp
            ? "🎉 You have enrolled in the bootcamp successfully! 🎉"
            : "🎉 You have made a course purchase successfully! 🎉"}
        </p>
      </div>
      <div className="completion__support">
        <p>
          Need help? Contact our{" "}
          <Button variant="link" asChild className="p-0 m-0 text-primary-700">
            <a href="mailto:support@continuumblock.org">customer support</a>
          </Button>
          .
        </p>
      </div>
      <div className="completion__action">
        <Link href={isBootcamp ? "/user/bootcamps" : "user/courses"} scroll={false}>
          {isBootcamp ? "Go to Bootcamps" : "Go to Courses"}
        </Link>
      </div>
    </div>
  );
};

export default CompletionPage;
