"use client";

import Loading from "@/components/Loading";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useGetTeacherStudentsQuery, useGetUserCourseProgressBatchQuery } from "@/state/api";
import { useUser } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import React, { useMemo } from "react";
import { ArrowLeft, BookOpen, Award, Clock, TrendingUp, CheckCircle2, Circle, BarChart3 } from "lucide-react";

// ── helpers ────────────────────────────────────────────────
function getInitials(first?: string | null, last?: string | null) {
  return ((first?.[0] ?? "") + (last?.[0] ?? "")).toUpperCase() || "?";
}

function formatPrice(amount?: number) {
  if (!amount) return "Free";
  return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(amount);
}

function statusVariant(status?: string): "default" | "secondary" | "destructive" {
  if (status === "Completed") return "default";
  if (status === "Pending" || status === "AwaitingVerification") return "secondary";
  return "destructive";
}

// ── stat card ──────────────────────────────────────────────
const StatCard = ({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  accent: string;
}) => (
  <div className="relative overflow-hidden rounded-xl bg-customgreys-secondaryBg border border-customgreys-darkGrey p-5">
    <div className={`absolute top-0 right-0 w-16 h-16 rounded-bl-full opacity-10 ${accent}`} />
    <div className={`inline-flex items-center justify-center w-9 h-9 rounded-lg mb-3 ${accent} bg-opacity-15`}>
      <Icon size={16} className={accent.replace("bg-", "text-")} />
    </div>
    <p className="text-2xl font-semibold text-white-100">{value}</p>
    <p className="text-xs text-customgreys-dirtyGrey mt-1 uppercase tracking-wide">{label}</p>
  </div>
);

// ── progress bar ───────────────────────────────────────────
const ProgressBar = ({ value, color = "bg-primary-700" }: { value: number; color?: string }) => (
  <div className="w-full h-1.5 rounded-full bg-customgreys-darkGrey overflow-hidden">
    <div
      className={`h-full rounded-full transition-all duration-500 ${color}`}
      style={{ width: `${Math.min(Math.round(value * 100), 100)}%` }}
    />
  </div>
);

// ── component ──────────────────────────────────────────────
const StudentDetail = () => {
  const router = useRouter();
  const params = useParams();
  const studentId = params?.studentId as string;

  const { user, isLoaded } = useUser();

  // Fetch all students for this teacher to find this one
  const { data: students = [], isLoading: studentsLoading } = useGetTeacherStudentsQuery(
    user?.id ?? "",
    { skip: !isLoaded || !user }
  );

  // All transactions for this student
  const studentTxs = useMemo(
    () => students.filter((s) => s.userId === studentId),
    [students, studentId]
  );

  // Unique course IDs this student bought
  const courseIds = useMemo(
    () => [...new Set(studentTxs.filter((s) => s.purchaseType === "Course").map((s) => s.transactionId))],
    [studentTxs]
  );

  // Fetch course progress for each course
  const { data: progressBatch = [] } = useGetUserCourseProgressBatchQuery(
    { userId: studentId, courseIds },
    { skip: !studentId || courseIds.length === 0 }
  );

  // Build a map of courseId → progress for quick lookup
  const progressMap = useMemo(
    () => Object.fromEntries(progressBatch.map((p) => [p.courseId, p])),
    [progressBatch]
  );

  const student = studentTxs[0]; // name/avatar come from first tx

  // Aggregate stats
  const totalEnrolled = studentTxs.length;
  const completedCount = progressBatch.filter((p) => p.completionStatus === "completed").length;
  const totalPoints = progressBatch.reduce((sum, p) => sum + (p.totalPoints ?? 0), 0);
  const avgProgress =
    progressBatch.length > 0
      ? progressBatch.reduce((sum, p) => sum + (p.overallProgress ?? 0), 0) / progressBatch.length
      : 0;

  if (!isLoaded || studentsLoading) return <Loading />;
  if (!student) {
    return (
      <div className="billing">
        <div className="billing__container">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-customgreys-dirtyGrey hover:text-white-100 transition-colors mb-6 text-sm">
            <ArrowLeft size={16} /> Back
          </button>
          <p className="text-customgreys-dirtyGrey">Student not found.</p>
        </div>
      </div>
    );
  }

  const fullName = `${student.firstName ?? ""} ${student.lastName ?? ""}`.trim() || "Unknown";

  return (
    <div className="billing">
      <div className="billing__container space-y-6">

        {/* BACK */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-customgreys-dirtyGrey hover:text-white-100 transition-colors text-sm"
        >
          <ArrowLeft size={15} /> Back to Students
        </button>

        {/* PROFILE HEADER */}
        <div className="flex items-center gap-5 p-5 rounded-xl bg-customgreys-secondaryBg border border-customgreys-darkGrey">
          <Avatar className="h-16 w-16 shrink-0">
            <AvatarImage src={student.imgUrl} alt={fullName} />
            <AvatarFallback className="bg-primary-900 text-primary-200 text-lg font-semibold">
              {getInitials(student.firstName, student.lastName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-semibold text-white-100">{fullName}</h2>
            <p className="text-sm text-customgreys-dirtyGrey">{student.email}</p>
            <p className="font-mono text-xs text-customgreys-dirtyGrey mt-1 opacity-60">{studentId}</p>
          </div>
          <div className="hidden sm:flex flex-col items-end gap-1">
            <span className="text-xs text-customgreys-dirtyGrey">Member since</span>
            <span className="text-sm text-white-100">
              {student.dateTime
                ? new Date(student.dateTime).toLocaleDateString("en-KE", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "—"}
            </span>
          </div>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Enrolled" value={totalEnrolled} icon={BookOpen} accent="bg-blue-500" />
          <StatCard label="Completed" value={completedCount} icon={CheckCircle2} accent="bg-green-500" />
          <StatCard label="Avg Progress" value={`${Math.round(avgProgress * 100)}%`} icon={TrendingUp} accent="bg-violet-500" />
          <StatCard label="Total Points" value={totalPoints} icon={Award} accent="bg-amber-500" />
        </div>

        {/* ENROLLED COURSES + PROGRESS */}
        <div>
          <h3 className="text-sm font-medium text-customgreys-dirtyGrey uppercase tracking-wide mb-3">
            Enrolled Courses & Bootcamps
          </h3>
          <div className="space-y-3">
            {studentTxs.map((tx) => {
              const progress = progressMap[tx.transactionId];
              const pct = Math.round((progress?.overallProgress ?? 0) * 100);
              const isBootcamp = tx.purchaseType === "Bootcamp";

              return (
                <div
                  key={tx.transactionId}
                  className="flex items-center gap-4 p-4 rounded-xl bg-customgreys-secondaryBg border border-customgreys-darkGrey hover:border-customgreys-dirtyGrey transition-colors"
                >
                  {/* THUMBNAIL */}
                  <div className="shrink-0">
                    {tx.purchaseImage ? (
                      <img
                        src={tx.purchaseImage}
                        alt={tx.purchaseTitle}
                        className="h-12 w-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className={`h-12 w-16 rounded-lg flex items-center justify-center ${isBootcamp ? "bg-violet-900" : "bg-blue-900"}`}>
                        {isBootcamp
                          ? <BarChart3 size={20} className="text-violet-300" />
                          : <BookOpen size={20} className="text-blue-300" />
                        }
                      </div>
                    )}
                  </div>

                  {/* INFO + PROGRESS */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-white-100 truncate">
                        {tx.purchaseTitle ?? "Untitled"}
                      </p>
                      <Badge
                        variant="outline"
                        className={`text-[10px] shrink-0 ${isBootcamp ? "border-violet-500 text-violet-400" : "border-blue-500 text-blue-400"}`}
                      >
                        {isBootcamp ? "◈ Bootcamp" : "▸ Course"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <ProgressBar
                          value={progress?.overallProgress ?? 0}
                          color={
                            pct === 100
                              ? "bg-green-500"
                              : pct > 50
                              ? "bg-primary-700"
                              : "bg-amber-500"
                          }
                        />
                      </div>
                      <span className="text-xs text-customgreys-dirtyGrey shrink-0 w-9 text-right">
                        {pct}%
                      </span>
                    </div>
                    {progress?.lastAccessedTimestamp && (
                      <p className="text-xs text-customgreys-dirtyGrey mt-1 flex items-center gap-1">
                        <Clock size={10} />
                        Last active{" "}
                        {new Date(progress.lastAccessedTimestamp).toLocaleDateString("en-KE", {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    )}
                  </div>

                  {/* PAYMENT INFO */}
                  <div className="hidden md:flex flex-col items-end gap-1 shrink-0">
                    <p className="text-sm font-medium text-white-100">
                      {tx.paymentProvider === "Free" ? "Free" : formatPrice(tx.amount)}
                    </p>
                    <Badge variant={statusVariant(tx.status)} className="text-xs">
                      {tx.status}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION BREAKDOWN (if any course has progress data) */}
        {progressBatch.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-customgreys-dirtyGrey uppercase tracking-wide mb-3">
              Section Breakdown
            </h3>
            <div className="space-y-4">
              {progressBatch.map((prog) => {
                const tx = studentTxs.find((t) => t.transactionId === prog.courseId);
                return (
                  <div
                    key={prog.courseId}
                    className="p-4 rounded-xl bg-customgreys-secondaryBg border border-customgreys-darkGrey"
                  >
                    <p className="text-sm font-medium text-white-100 mb-3">
                      {tx?.purchaseTitle ?? prog.courseId}
                    </p>
                    <div className="space-y-2">
                      {prog.sections?.map((section) => {
                        const completedChapters = section.chapters.filter((c) => c.completed).length;
                        const totalChapters = section.chapters.length;
                        const sectionPct = totalChapters > 0 ? completedChapters / totalChapters : 0;

                        return (
                          <div key={section.sectionId} className="flex items-center gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-customgreys-dirtyGrey truncate">
                                  Section {section.sectionId?.slice(-4)}
                                </span>
                                <span className="text-xs text-customgreys-dirtyGrey ml-2 shrink-0">
                                  {completedChapters}/{totalChapters}
                                </span>
                              </div>
                              <ProgressBar value={sectionPct} />
                            </div>
                            {sectionPct === 1 ? (
                              <CheckCircle2 size={14} className="text-green-400 shrink-0" />
                            ) : (
                              <Circle size={14} className="text-customgreys-darkGrey shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default StudentDetail;