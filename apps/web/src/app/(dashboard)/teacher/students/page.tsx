"use client";

import Loading from "@/components/Loading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { useGetTeacherStudentsQuery } from "@/state/api";
import { useUser } from "@clerk/nextjs";
import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation"; 

// ── helpers ────────────────────────────────────────────────
function getInitials(first?: string | null, last?: string | null) {
  return ((first?.[0] ?? "") + (last?.[0] ?? "")).toUpperCase() || "?";
}

const AVATAR_COLORS = [
  "bg-blue-900 text-blue-200",
  "bg-purple-900 text-purple-200",
  "bg-teal-900 text-teal-200",
  "bg-amber-900 text-amber-200",
  "bg-pink-900 text-pink-200",
  "bg-green-900 text-green-200",
];

function avatarColor(seed: string) {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function statusVariant(
  status?: string
): "default" | "secondary" | "destructive" {
  if (status === "Completed") return "default";
  if (status === "Pending" || status === "AwaitingVerification")
    return "secondary";
  return "destructive";
}

// ── component ──────────────────────────────────────────────
const TeacherUsers = () => {
  const router = useRouter(); 
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [providerFilter, setProviderFilter] = useState("all");

  const { user, isLoaded } = useUser();

  const { data: students = [], isLoading } = useGetTeacherStudentsQuery(
    user?.id ?? "",
    { skip: !isLoaded || !user }
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return students.filter((s) => {
      const matchType =
        typeFilter === "all" || s.purchaseType === typeFilter;
      const matchStatus =
        statusFilter === "all" || s.status === statusFilter;
      const matchProvider =
        providerFilter === "all" || s.paymentProvider === providerFilter;
      const matchSearch =
        !q ||
        `${s.firstName ?? ""} ${s.lastName ?? ""}`.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.userId?.toLowerCase().includes(q) ||
        s.purchaseTitle?.toLowerCase().includes(q);
      return matchType && matchStatus && matchProvider && matchSearch;
    });
  }, [students, search, typeFilter, statusFilter, providerFilter]);

  // summary stats
  const totalRevenue = filtered
    .filter((s) => s.status === "Completed" && s.paymentProvider !== "Free")
    .reduce((sum, s) => sum + (s.amount ?? 0), 0);

  const completedCount = filtered.filter(
    (s) => s.status === "Completed"
  ).length;

  const pendingCount = filtered.filter(
    (s) => s.status === "Pending" || s.status === "AwaitingVerification"
  ).length;

  if (!isLoaded) return <Loading />;
  if (!user) return <div>Please sign in.</div>;

  return (
    <div className="billing">
      <div className="billing__container">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h2 className="billing__title">Students & Transactions</h2>
          <span className="text-sm text-customgreys-dirtyGrey">
            {filtered.length} student{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* SUMMARY STATS */}
        <div className="grid grid-cols-3 gap-4 my-4">
          <div className="billing__stat-card rounded-lg p-4 bg-customgreys-secondaryBg border border-customgreys-darkGrey">
            <p className="text-xs text-customgreys-dirtyGrey uppercase tracking-wide mb-1">
              Total Revenue
            </p>
            <p className="text-xl font-semibold text-white-100">
              {formatPrice(totalRevenue)}
            </p>
          </div>
          <div className="billing__stat-card rounded-lg p-4 bg-customgreys-secondaryBg border border-customgreys-darkGrey">
            <p className="text-xs text-customgreys-dirtyGrey uppercase tracking-wide mb-1">
              Completed
            </p>
            <p className="text-xl font-semibold text-green-400">
              {completedCount}
            </p>
          </div>
          <div className="billing__stat-card rounded-lg p-4 bg-customgreys-secondaryBg border border-customgreys-darkGrey">
            <p className="text-xs text-customgreys-dirtyGrey uppercase tracking-wide mb-1">
              Pending
            </p>
            <p className="text-xl font-semibold text-yellow-400">
              {pendingCount}
            </p>
          </div>
        </div>

        {/* FILTERS */}
        <div className="billing__filters flex flex-wrap gap-3 items-center">

          {/* SEARCH */}
          <Input
            placeholder="Search by name, ID, or course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="billing__select max-w-xs"
          />

          {/* TYPE */}
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="billing__select w-36">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="billing__select-content">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Course">Course</SelectItem>
              <SelectItem value="Bootcamp">Bootcamp</SelectItem>
            </SelectContent>
          </Select>

          {/* PAYMENT PROVIDER */}
          <Select value={providerFilter} onValueChange={setProviderFilter}>
            <SelectTrigger className="billing__select w-44">
              <SelectValue placeholder="Payment Method" />
            </SelectTrigger>
            <SelectContent className="billing__select-content">
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="Free">Free</SelectItem>
              <SelectItem value="M-Pesa">M-Pesa</SelectItem>
              <SelectItem value="M-Pesa-PayBill">M-Pesa Paybill</SelectItem>
              <SelectItem value="Stripe">Stripe</SelectItem>
              <SelectItem value="PayPal">PayPal</SelectItem>
              <SelectItem value="Co-op-Bank">Co-op Bank</SelectItem>
              <SelectItem value="Flutterwave">Flutterwave</SelectItem>
            </SelectContent>
          </Select>

          {/* STATUS */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="billing__select w-44">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="billing__select-content">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="AwaitingVerification">
                Awaiting Verification
              </SelectItem>
              <SelectItem value="Failed">Failed</SelectItem>
              <SelectItem value="Refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* TABLE */}
        <div className="billing__grid">
          {isLoading ? (
            <Loading />
          ) : (
            <Table className="billing__table">

              {/* HEAD */}
              <TableHeader className="billing__table-header">
                <TableRow className="billing__table-header-row">
                  <TableHead className="billing__table-cell">Student</TableHead>
                  <TableHead className="billing__table-cell">User ID</TableHead>
                  <TableHead className="billing__table-cell">Enrolled In</TableHead>
                  <TableHead className="billing__table-cell">Type</TableHead>
                  <TableHead className="billing__table-cell">Payment</TableHead>
                  <TableHead className="billing__table-cell">Amount</TableHead>
                  <TableHead className="billing__table-cell">Status</TableHead>
                  <TableHead className="billing__table-cell">Date</TableHead>
                </TableRow>
              </TableHeader>

              {/* BODY */}
              <TableBody className="billing__table-body">
                {filtered.length > 0 ? (
                  filtered.map((s) => {
                    const fullName =
                      `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim();
                    const colorClass = avatarColor(fullName || s.userId);

                    return (
                      <TableRow
                        key={s.transactionId}
                        className="billing__table-row cursor-pointer"
                        onClick={() => router.push(`/teacher/students/${s.userId}`)}
                      >
                        {/* STUDENT */}
                        <TableCell className="billing__table-cell">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 shrink-0">
                              <AvatarImage
                                src={s.imgUrl}
                                alt={fullName}
                              />
                              <AvatarFallback
                                className={`text-xs font-medium ${colorClass}`}
                              >
                                {getInitials(s.firstName, s.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-white-100 truncate">
                                {fullName || "Unknown"}
                              </p>
                              <p className="text-xs text-customgreys-dirtyGrey truncate">
                                {s.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        {/* USER ID */}
                        <TableCell className="billing__table-cell">
                          <span className="font-mono text-xs text-customgreys-dirtyGrey">
                            {s.userId}
                          </span>
                        </TableCell>

                        {/* ENROLLED IN */}
                        <TableCell className="billing__table-cell">
                          <div className="flex items-center gap-2 min-w-0 max-w-[200px]">
                            {s.purchaseImage && (
                              <img
                                src={s.purchaseImage}
                                alt={s.purchaseTitle}
                                className="h-8 w-12 rounded object-cover shrink-0"
                              />
                            )}
                            <span className="text-sm font-medium text-white-100 truncate">
                              {s.purchaseTitle ?? "—"}
                            </span>
                          </div>
                        </TableCell>

                        {/* TYPE */}
                        <TableCell className="billing__table-cell">
                          <Badge
                            variant="outline"
                            className={
                              s.purchaseType === "Bootcamp"
                                ? "border-violet-500 text-violet-400 text-xs"
                                : "border-blue-500 text-blue-400 text-xs"
                            }
                          >
                            {s.purchaseType === "Bootcamp"
                              ? "◈ Bootcamp"
                              : "▸ Course"}
                          </Badge>
                        </TableCell>

                        {/* PAYMENT METHOD */}
                        <TableCell className="billing__table-cell text-sm text-customgreys-dirtyGrey">
                          {s.paymentProvider}
                        </TableCell>

                        {/* AMOUNT */}
                        <TableCell className="billing__table-cell billing__amount">
                          {s.paymentProvider === "Free"
                            ? "Free"
                            : formatPrice(s.amount ?? 0)}
                        </TableCell>

                        {/* STATUS */}
                        <TableCell className="billing__table-cell">
                          <Badge variant={statusVariant(s.status)}>
                            {s.status}
                          </Badge>
                        </TableCell>

                        {/* DATE */}
                        <TableCell className="billing__table-cell text-sm text-customgreys-dirtyGrey">
                          {s.dateTime
                            ? new Date(s.dateTime).toLocaleDateString(
                                "en-KE",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "2-digit",
                                }
                              )
                            : "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow className="billing__table-row">
                    <TableCell
                      colSpan={8}
                      className="billing__table-cell text-center"
                    >
                      No students found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherUsers;