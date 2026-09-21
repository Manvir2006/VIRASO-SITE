"use client";

import React from "react";

interface AdminDeleteModalProps {
  isOpen: boolean;
  title?: string;
  itemType: string;
  itemName: string;
  itemId?: string;
  consequences?: string;
  confirmLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

export function AdminDeleteModal({
  isOpen,
  title,
  itemType,
  itemName,
  itemId,
  consequences = "This action will archive this record from the active platform views. Historical audit trails will be preserved.",
  confirmLabel = "Confirm Delete",
  isLoading = false,
  onConfirm,
  onClose,
}: AdminDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-red-100 bg-white p-6 shadow-2xl sm:p-8">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800 disabled:opacity-50"
        >
          ✕
        </button>

        {/* Warning Icon */}
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>

        {/* Title */}
        <h3 className="mt-5 text-2xl font-black text-slate-900">
          {title || `Delete ${itemType}`}
        </h3>

        {/* Item details card */}
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{itemType}</p>
          <p className="mt-1 text-base font-black text-slate-900 line-clamp-2">{itemName}</p>
          {itemId && (
            <p className="mt-1 font-mono text-xs font-semibold text-[#0d2946]">ID: {itemId}</p>
          )}
        </div>

        {/* Consequences message */}
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900">
          <span className="font-bold">Notice: </span>
          {consequences}
        </div>

        {/* Action Buttons */}
        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
