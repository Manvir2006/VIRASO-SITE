"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { adminNotifier } from "@/lib/admin-chime";

export type FeedItem = {
  id: string;
  type: "order" | "complaint" | "b2b" | "enquiry";
  title: string;
  subtitle: string;
  timestamp: string;
  href: string;
  status: string;
  amount?: number;
  badgeColor: string;
};

type Summary = {
  pendingOrdersCount: number;
  newComplaintsCount: number;
  newB2bCount: number;
  newEnquiriesCount: number;
  totalUnread: number;
};

export function AdminNotificationCenter() {
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState<Summary>({
    pendingOrdersCount: 0,
    newComplaintsCount: 0,
    newB2bCount: 0,
    newEnquiriesCount: 0,
    totalUnread: 0,
  });
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [soundOn, setSoundOn] = useState(true);
  const [latestToast, setLatestToast] = useState<FeedItem | null>(null);
  const knownIdsRef = useRef<Set<string>>(new Set());
  const initialLoadRef = useRef(true);

  const getAdminKey = () =>
    typeof window !== "undefined"
      ? window.sessionStorage.getItem("viraso-admin-key") || ""
      : "";

  const fetchFeed = async () => {
    const key = getAdminKey();
    if (!key) return;

    try {
      const res = await fetch("/api/admin/notifications/feed", {
        headers: { "x-admin-key": key },
      });
      if (!res.ok) return;

      const data = await res.json();
      if (!data || !data.feed) return;

      setSummary(data.summary || summary);
      setFeed(data.feed);

      // Check for newly arrived items
      const currentIds = new Set<string>(data.feed.map((i: FeedItem) => i.id));

      if (!initialLoadRef.current) {
        for (const item of data.feed as FeedItem[]) {
          if (!knownIdsRef.current.has(item.id)) {
            // BRAND NEW ITEM ARRIVED!
            triggerAlert(item);
            break; // trigger for newest
          }
        }
      } else {
        initialLoadRef.current = false;
      }

      knownIdsRef.current = currentIds;
    } catch (err) {
      console.error("Feed error:", err);
    }
  };

  const triggerAlert = (item: FeedItem) => {
    // 1. Play sound chime
    adminNotifier.playChime(item.type === "complaint" ? "complaint" : item.type === "b2b" ? "b2b" : "order");

    // 2. Native phone push notification
    adminNotifier.firePushNotification(
      item.type === "order" ? `🛒 New Order: ${item.title}` : item.type === "complaint" ? `⚠️ New Complaint: ${item.title}` : `💼 New B2B: ${item.title}`,
      item.subtitle,
      item.id
    );

    // 3. In-app floating toast banner
    setLatestToast(item);
    setTimeout(() => {
      setLatestToast((current) => (current?.id === item.id ? null : current));
    }, 7000);
  };

  useEffect(() => {
    setSoundOn(adminNotifier.isSoundEnabled());
    fetchFeed();

    // Poll every 18 seconds for live updates
    const interval = setInterval(fetchFeed, 18000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleSound = () => {
    const updated = adminNotifier.toggleSound();
    setSoundOn(updated);
  };

  const handleRequestPush = async () => {
    const granted = await adminNotifier.requestNotificationPermission();
    if (granted) {
      adminNotifier.firePushNotification(
        "Notifications Enabled ✅",
        "You will now receive alerts for incoming orders and complaints."
      );
    }
  };

  const formatTime = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  return (
    <>
      {/* Floating In-App Live Alert Toast */}
      {latestToast && (
        <div className="fixed top-4 right-4 left-4 z-50 mx-auto max-w-md animate-bounce rounded-2xl border border-amber-300 bg-[#0d2946] p-4 text-white shadow-2xl sm:left-auto">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="text-2xl">
                {latestToast.type === "order" ? "🛒" : latestToast.type === "complaint" ? "⚠️" : "💼"}
              </span>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-amber-400">
                  {latestToast.type === "order" ? "New Order Received!" : latestToast.type === "complaint" ? "New Customer Complaint!" : "New B2B Inquiry!"}
                </p>
                <p className="mt-0.5 text-sm font-bold text-white">{latestToast.title}</p>
                <p className="text-xs text-white/80">{latestToast.subtitle}</p>
              </div>
            </div>
            <button
              onClick={() => setLatestToast(null)}
              className="text-white/60 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="mt-3 flex items-center justify-end gap-2 border-t border-white/10 pt-2.5">
            <Link
              href={latestToast.href}
              onClick={() => setLatestToast(null)}
              className="rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-black text-[#0d2946] hover:bg-amber-300"
            >
              View Details →
            </Link>
          </div>
        </div>
      )}

      {/* Top Header Bell Button with Badge */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setOpen(!open);
            handleRequestPush();
          }}
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 hover:text-[#0d2946]"
          aria-label="Notifications"
        >
          <span className="text-lg">🔔</span>
          {summary.totalUnread > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-600 px-1.5 text-[10px] font-black text-white shadow-md animate-pulse">
              {summary.totalUnread > 99 ? "99+" : summary.totalUnread}
            </span>
          )}
        </button>

        {/* Notification Drawer Modal */}
        {open && (
          <>
            <div
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs"
            />
            <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm border-l border-slate-200 bg-white shadow-2xl transition-transform duration-300 sm:w-96">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-200 bg-[#0d2946] p-4 text-white">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🔔</span>
                  <div>
                    <h2 className="text-sm font-black tracking-wide">Live Notifications</h2>
                    <p className="text-[11px] text-white/70">
                      {summary.totalUnread} active actions needed
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleSound}
                    title={soundOn ? "Mute Alerts" : "Unmute Alerts"}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-sm hover:bg-white/20"
                  >
                    {soundOn ? "🔊" : "🔇"}
                  </button>
                  <button
                    onClick={() => setOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Status summary pills */}
              <div className="grid grid-cols-3 gap-2 border-b border-slate-100 bg-slate-50 p-3">
                <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-2 text-center">
                  <p className="text-base font-black text-amber-700">{summary.pendingOrdersCount}</p>
                  <p className="text-[10px] font-bold uppercase text-amber-900">Orders</p>
                </div>
                <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-2 text-center">
                  <p className="text-base font-black text-rose-700">{summary.newComplaintsCount}</p>
                  <p className="text-[10px] font-bold uppercase text-rose-900">Complaints</p>
                </div>
                <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-2 text-center">
                  <p className="text-base font-black text-blue-700">{summary.newB2bCount}</p>
                  <p className="text-[10px] font-bold uppercase text-blue-900">B2B Leads</p>
                </div>
              </div>

              {/* Feed List */}
              <div className="max-h-[calc(100vh-210px)] overflow-y-auto divide-y divide-slate-100">
                {feed.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    <p className="text-2xl">🎉</p>
                    <p className="mt-2 text-xs font-bold">All caught up!</p>
                    <p className="text-[11px]">No recent orders or complaints.</p>
                  </div>
                ) : (
                  feed.map((item) => (
                    <Link
                      key={item.id + item.type}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="block p-3.5 transition hover:bg-slate-50"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-base">
                          {item.type === "order" ? "🛒" : item.type === "complaint" ? "⚠️" : "💼"}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className="truncate text-xs font-bold text-slate-900">{item.title}</p>
                            <span className="text-[10px] text-slate-400">{formatTime(item.timestamp)}</span>
                          </div>
                          <p className="truncate text-[11px] text-slate-600 mt-0.5">{item.subtitle}</p>
                        </div>
                        <span className={`inline-block rounded-md px-1.5 py-0.5 text-[9px] font-black uppercase ${item.badgeColor}`}>
                          {item.status}
                        </span>
                      </div>
                    </Link>
                  ))
                )}
              </div>

              {/* Drawer Footer */}
              <div className="absolute inset-x-0 bottom-0 border-t border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => adminNotifier.playChime("order")}
                    className="font-bold text-[#0d2946] hover:underline"
                  >
                    🔔 Test Sound Chime
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      knownIdsRef.current = new Set(feed.map((i) => i.id));
                      setSummary({ ...summary, totalUnread: 0 });
                    }}
                    className="text-slate-500 hover:text-slate-800"
                  >
                    Mark All Seen
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
