"use client";

import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CalendarDays, Clock, Users } from "lucide-react";
import Loading from "@/components/Loading";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetBootcampQuery } from "@/state/api";
import { formatPrice } from "@/lib/utils";

const deliveryModeColor = (mode?: string) =>
  mode === "Online" ? "bg-blue-500" : mode === "In-Person" ? "bg-green-500" : "bg-purple-500";

const BootcampDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const bootcampId = params.bootcampId as string;
  const { data: bootcamp, isLoading, isError } = useGetBootcampQuery(bootcampId);

  if (isLoading) return <Loading />;
  if (isError || !bootcamp) return <div className="p-8 text-center">Bootcamp not found</div>;

  const handleEnrollNow = () => {
    router.push(`/checkout?step=1&id=${bootcamp._id}&type=bootcamp&showSignUp=false`, {
      scroll: false,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mx-auto w-full max-w-6xl px-4 py-10 md:px-8"
    >
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Bootcamps", href: "/bootcamps" },
          { label: bootcamp.title },
        ]}
      />

      <div className="mb-2 flex items-center gap-2">
        <Badge
          className={`rounded-full px-2 py-0.5 text-xs font-medium text-white ${deliveryModeColor(bootcamp.deliveryMode)}`}
        >
          {bootcamp.deliveryMode}
        </Badge>
        <Badge variant="outline" className="rounded-full border-customgreys-darkerGrey px-2 py-0.5 text-xs font-medium text-customgreys-dirtyGrey">
          {bootcamp.type}
        </Badge>
      </div>
      <h1 className="text-3xl font-semibold text-white-100">{bootcamp.title}</h1>

      <div className="mt-4 flex flex-wrap items-center gap-6 text-sm text-customgreys-dirtyGrey">
        <span className="flex items-center gap-1.5">
          <Clock className="size-4" /> {bootcamp.duration}
        </span>
        <span className="flex items-center gap-1.5">
          <Users className="size-4" /> {bootcamp.members?.length || 0} members
        </span>
        <span className="flex items-center gap-1.5">
          <CalendarDays className="size-4" />
          {new Date(bootcamp.startDate).toLocaleDateString()}
        </span>
        <span>
          Hosted by{" "}
          <Link
            href={`/instructors/${bootcamp.hostedBy.id}`}
            className="font-medium text-white-100 hover:text-primary-400"
          >
            {bootcamp.hostedBy.name}
          </Link>
        </span>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <section>
            <h2 className="mb-3 text-xl font-semibold text-white-100">Overview</h2>
            <p className="whitespace-pre-line text-customgreys-dirtyGrey">
              {bootcamp.description || "No description provided."}
            </p>
          </section>

          {bootcamp.courses.length > 0 && (
            <section>
              <h2 className="mb-3 text-xl font-semibold text-white-100">What&apos;s Included</h2>
              <ul className="list-disc space-y-1.5 pl-5 text-customgreys-dirtyGrey">
                {bootcamp.courses.map((course) => (
                  <li key={course.courseId}>{course.title}</li>
                ))}
              </ul>
            </section>
          )}

          {bootcamp.liveClasses?.schedule?.length > 0 && (
            <section>
              <h2 className="mb-3 text-xl font-semibold text-white-100">Schedule</h2>
              <div className="space-y-3 rounded-lg border border-customgreys-darkerGrey bg-customgreys-secondarybg p-4">
                {bootcamp.liveClasses.schedule.map((session, index) => (
                  <div key={index} className="flex items-start justify-between gap-4 text-sm">
                    <div>
                      <p className="font-medium text-white-100">{session.title}</p>
                      {session.description && (
                        <p className="text-customgreys-dirtyGrey">{session.description}</p>
                      )}
                    </div>
                    <span className="shrink-0 text-customgreys-dirtyGrey">
                      {new Date(session.date).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white-100">Details</h2>
            <div className="rounded-lg border border-customgreys-darkerGrey bg-customgreys-secondarybg p-4">
              <ul className="space-y-1.5 text-sm text-customgreys-dirtyGrey">
                <li>Duration: {bootcamp.duration}</li>
                <li>Mode: {bootcamp.deliveryMode}</li>
                <li>Type: {bootcamp.type}</li>
                <li>Certification: {bootcamp.certification}</li>
              </ul>
            </div>
          </section>
        </div>

        <aside className="h-fit space-y-4 rounded-lg border border-customgreys-darkerGrey bg-customgreys-secondarybg p-5">
          <span className="text-2xl font-semibold text-primary-400">
            {formatPrice(bootcamp.price?.amount)}
          </span>
          <Button className="w-full" size="lg" onClick={handleEnrollNow}>
            Enroll Now
          </Button>

          <div className="border-t border-customgreys-darkerGrey pt-4">
            <h3 className="mb-2 text-sm font-semibold text-white-100">Includes</h3>
            <ul className="space-y-1.5 text-sm text-customgreys-dirtyGrey">
              <li>{bootcamp.courses.length} included courses</li>
              <li>{bootcamp.liveClasses?.count || 0} live classes</li>
              <li>{bootcamp.certification}</li>
            </ul>
          </div>
        </aside>
      </div>
    </motion.div>
  );
};

export default BootcampDetailPage;
