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
import { useGetTransactionsQuery } from "@/state/api";
import { useUser } from "@clerk/nextjs";
import React, { useMemo, useState } from "react";

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
const TeacherBilling = () => {
  const [paymentType, setPaymentType] = useState("all");
  const [search, setSearch] = useState("");

  const { user, isLoaded } = useUser();

  const { data: transactions = [], isLoading } = useGetTransactionsQuery(
    user?.id || "",
    { skip: !isLoaded || !user }
  );

  const filteredData = useMemo(() => {
    return transactions.filter((tx: any) => {
      const matchesType =
        paymentType === "all" || tx.paymentProvider === paymentType;

      const userName = `${tx.user?.firstName ?? ""} ${tx.user?.lastName ?? ""}`.toLowerCase();
      const matchesSearch =
        !search ||
        tx.paymentProvider?.toLowerCase().includes(search.toLowerCase()) ||
        tx.status?.toLowerCase().includes(search.toLowerCase()) ||
        tx.paymentReference?.toLowerCase().includes(search.toLowerCase()) ||
        tx.purchaseTitle?.toLowerCase().includes(search.toLowerCase()) ||
        userName.includes(search.toLowerCase());

      return matchesType && matchesSearch;
    });
  }, [transactions, paymentType, search]);

  if (!isLoaded) return <Loading />;
  if (!user) return <div>Please sign in.</div>;

  return (
    <div className="billing">
      <div className="billing__container">

        {/* HEADER */}
        <h2 className="billing__title">Payment History</h2>

        {/* FILTERS */}
        <div className="billing__filters flex gap-4 items-center">
          <Input
            placeholder="Search by user, course, reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="billing__select max-w-sm"
          />

          <Select value={paymentType} onValueChange={setPaymentType}>
            <SelectTrigger className="billing__select">
              <SelectValue placeholder="Payment Type" />
            </SelectTrigger>
            <SelectContent className="billing__select-content">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Free">Free</SelectItem>
              <SelectItem value="M-Pesa">M-Pesa</SelectItem>
              <SelectItem value="M-Pesa-PayBill">M-Pesa Paybill</SelectItem>
              <SelectItem value="Stripe">Stripe</SelectItem>
              <SelectItem value="PayPal">PayPal</SelectItem>
              <SelectItem value="Co-op-Bank">Co-op Bank</SelectItem>
              <SelectItem value="Flutterwave">Flutterwave</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* TABLE */}
        <div className="billing__grid">
          {isLoading ? (
            <Loading />
          ) : (
            <Table className="billing__table">
              <TableHeader className="billing__table-header">
                <TableRow className="billing__table-header-row">
                  <TableHead className="billing__table-cell">Student</TableHead>
                  <TableHead className="billing__table-cell">Purchased</TableHead>
                  <TableHead className="billing__table-cell">Type</TableHead>
                  <TableHead className="billing__table-cell">Amount</TableHead>
                  <TableHead className="billing__table-cell">Method</TableHead>
                  <TableHead className="billing__table-cell">Status</TableHead>
                  <TableHead className="billing__table-cell">Created</TableHead>
                  <TableHead className="billing__table-cell">Updated</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="billing__table-body">
                {filteredData.length > 0 ? (
                  filteredData.map((tx: any) => {
                    const fullName = `${tx.user?.firstName ?? ""} ${tx.user?.lastName ?? ""}`.trim();
                    const colorClass = avatarColor(fullName || tx.userId);

                    return (
                      <TableRow key={tx._id} className="billing__table-row">

                        {/* STUDENT */}
                        <TableCell className="billing__table-cell">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 shrink-0">
                              <AvatarImage
                                src={tx.user?.imgUrl}
                                alt={fullName}
                              />
                              <AvatarFallback
                                className={`text-xs font-medium ${colorClass}`}
                              >
                                {getInitials(tx.user?.firstName, tx.user?.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-white-100 truncate">
                                {fullName || "Unknown"}
                              </p>
                              <p className="text-xs text-customgreys-dirtyGrey truncate">
                                {tx.user?.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        {/* PURCHASED */}
                        <TableCell className="billing__table-cell">
                          <div className="flex items-center gap-2 max-w-[180px]">
                            {tx.purchaseImage && (
                              <img
                                src={tx.purchaseImage}
                                alt={tx.purchaseTitle}
                                className="h-7 w-10 rounded object-cover shrink-0"
                              />
                            )}
                            <span className="text-sm font-medium text-white-100 truncate">
                              {tx.purchaseTitle ?? "—"}
                            </span>
                          </div>
                        </TableCell>

                        {/* TYPE */}
                        <TableCell className="billing__table-cell">
                          {tx.purchaseType ? (
                            <Badge
                              variant="outline"
                              className={
                                tx.purchaseType === "Bootcamp"
                                  ? "border-violet-500 text-violet-400 text-xs"
                                  : "border-blue-500 text-blue-400 text-xs"
                              }
                            >
                              {tx.purchaseType === "Bootcamp"
                                ? "◈ Bootcamp"
                                : "▸ Course"}
                            </Badge>
                          ) : (
                            <span className="text-customgreys-dirtyGrey text-xs">—</span>
                          )}
                        </TableCell>

                        {/* AMOUNT */}
                        <TableCell className="billing__table-cell billing__amount">
                          {tx.paymentProvider === "Free"
                            ? "Free"
                            : formatPrice(tx.amount)}
                        </TableCell>

                        {/* METHOD */}
                        <TableCell className="billing__table-cell text-sm text-customgreys-dirtyGrey">
                          {tx.paymentProvider}
                        </TableCell>

                        {/* STATUS */}
                        <TableCell className="billing__table-cell">
                          <Badge variant={statusVariant(tx.status)}>
                            {tx.status}
                          </Badge>
                        </TableCell>

                        {/* CREATED */}
                        <TableCell className="billing__table-cell text-sm text-customgreys-dirtyGrey">
                          {tx.createdAt
                            ? new Date(tx.createdAt).toLocaleDateString("en-KE", {
                                day: "numeric",
                                month: "short",
                                year: "2-digit",
                              })
                            : new Date(tx.dateTime).toLocaleDateString()}
                        </TableCell>

                        {/* UPDATED */}
                        <TableCell className="billing__table-cell text-sm text-customgreys-dirtyGrey">
                          {tx.updatedAt
                            ? new Date(tx.updatedAt).toLocaleDateString("en-KE", {
                                day: "numeric",
                                month: "short",
                                year: "2-digit",
                              })
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
                      No transactions found
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

export default TeacherBilling;