"use client";

import React, { ReactNode } from "react";

interface AdminTableShellProps {
  title: string;
  description: string;
  totalCount?: number;
  actions?: ReactNode;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: ReactNode;
  filterPills?: { label: string; active: boolean; onClick: () => void; count?: number }[];
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  onResetFilters?: () => void;
  children: ReactNode;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
    itemsPerPage: number;
  };
}

export function AdminTableShell({
  title,
  description,
  totalCount,
  actions,
  searchPlaceholder = "Search records...",
  searchValue,
  onSearchChange,
  filters,
  filterPills,
  isLoading = false,
  isEmpty = false,
  emptyMessage = "No records found matching your criteria.",
  onResetFilters,
  children,
  pagination,
}: AdminTableShellProps) {
  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-3">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#0d2946]">Management</p>
            {totalCount !== undefined && (
              <span className="rounded-full bg-[#0d2946]/10 px-2.5 py-0.5 text-xs font-bold text-[#0d2946]">
                {totalCount} Total
              </span>
            )}
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">{title}</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">{description}</p>
        </div>

        {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
      </div>

      {/* Filter Pills (if any) */}
      {filterPills && filterPills.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {filterPills.map((pill) => (
            <button
              key={pill.label}
              type="button"
              onClick={pill.onClick}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold transition ${
                pill.active
                  ? "bg-[#0d2946] text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span>{pill.label}</span>
              {pill.count !== undefined && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] ${
                    pill.active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {pill.count}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Search & Custom Filters Bar */}
      {(onSearchChange || filters) && (
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
          {onSearchChange && (
            <div className="relative flex-1">
              <svg
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchValue || ""}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-sm transition focus:border-[#0d2946] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0d2946]"
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          {filters && <div className="flex flex-wrap items-center gap-3">{filters}</div>}
        </div>
      )}

      {/* Main Table Content Container */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex min-h-[260px] flex-col items-center justify-center p-12 text-slate-400">
            <svg className="h-8 w-8 animate-spin text-[#0d2946]" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="mt-4 text-sm font-semibold text-slate-600">Loading records from database...</p>
          </div>
        ) : isEmpty ? (
          <div className="flex min-h-[260px] flex-col items-center justify-center p-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="mt-4 text-base font-bold text-slate-800">{emptyMessage}</p>
            <p className="mt-1 text-xs text-slate-500">Try adjusting your filters or search terms.</p>
            {onResetFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                className="mt-4 rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
          children
        )}

        {/* Pagination Footer */}
        {pagination && pagination.totalPages > 1 && !isEmpty && (
          <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 bg-slate-50/50 px-6 py-4 sm:flex-row">
            <p className="text-xs font-medium text-slate-500">
              Showing{" "}
              <span className="font-bold text-slate-800">
                {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}
              </span>{" "}
              to{" "}
              <span className="font-bold text-slate-800">
                {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}
              </span>{" "}
              of <span className="font-bold text-slate-800">{pagination.totalItems}</span> records
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={pagination.currentPage <= 1}
                onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="px-2 text-xs font-semibold text-slate-600">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                type="button"
                disabled={pagination.currentPage >= pagination.totalPages}
                onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
