"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function EmployeeLoginPage() {
  const router = useRouter();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Change Password flow if mustChangePassword
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [targetEmployeeId, setTargetEmployeeId] = useState("");
  const [pendingRedirectUrl, setPendingRedirectUrl] = useState("/admin/dashboard");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/employee/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginId: loginId.trim(), password: password.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed.");
      }

      if (data.mustChangePassword) {
        setTargetEmployeeId(data.employee.employee_id);
        setPendingRedirectUrl(data.redirectUrl || "/admin/dashboard");
        setShowPasswordChange(true);
        setIsLoading(false);
        return;
      }

      // Store in session storage so admin pages can use it if needed
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("viraso-employee-user", JSON.stringify(data.employee));
      }

      router.push(data.redirectUrl || "/admin/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please try again.");
      setIsLoading(false);
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsChangingPassword(true);

    try {
      const res = await fetch("/api/employee/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_id: targetEmployeeId,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update password.");

      router.push(pendingRedirectUrl);
    } catch (err: any) {
      setError(err.message || "Failed to change password.");
      setIsChangingPassword(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f7fb] px-4 py-12 text-[#111111] sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="relative flex h-14 w-40 sm:w-44 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
              <Image
                src="/logo/viraso-logo-cropped.png"
                alt="Viraso logo"
                width={200}
                height={68}
                className="h-full w-full object-contain"
                priority
              />
            </div>
            <span
              className="font-viraso text-2xl font-black lowercase tracking-tight text-[#0d2946]"
              style={{ fontFamily: '"Geometr415 Blk BT", "Geometr 415", Eurostile, sans-serif' }}
            >
              viraso
            </span>
          </Link>
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.2em] text-[#0d2946]">
            Employee & Personnel Portal
          </p>
        </div>

        {/* Card */}
        <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          {!showPasswordChange ? (
            <div>
              <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Sign In</h1>
              <p className="mt-1 text-xs text-slate-500">
                Enter your assigned Employee ID or Username to access your workspace.
              </p>

              {error && (
                <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700 animate-in fade-in">
                  ✕ {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="mt-6 space-y-5">
                <div>
                  <label
                    htmlFor="loginIdInput"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                  >
                    Employee ID / Username
                  </label>
                  <input
                    id="loginIdInput"
                    type="text"
                    required
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    placeholder="e.g. EMP0001 or admin"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:border-[#0d2946] focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="passwordInput"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                  >
                    Password
                  </label>
                  <input
                    id="passwordInput"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:border-[#0d2946] focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0d2946] py-4 text-xs font-black uppercase tracking-wider text-white shadow-md transition hover:bg-[#071d31] hover:shadow-lg disabled:opacity-60"
                  >
                    {isLoading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      <span>LOGIN TO WORKSPACE →</span>
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-6 border-t border-slate-100 pt-4 text-center space-y-2">
                <p className="text-[11px] text-slate-400">
                  Forgot credentials? Contact your System Administrator or HR.
                </p>
                <p className="text-xs font-semibold text-slate-600">
                  Are you a System Admin?{" "}
                  <Link href="/admin/login" className="font-bold text-[#0d2946] underline hover:text-[#071d31]">
                    Admin Login →
                  </Link>
                </p>
              </div>
            </div>
          ) : (
            /* First Time Password Reset View */
            <div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-bold text-amber-800">
                🔒 Security Notice: An administrator reset your password. Please choose a new personal password before continuing.
              </div>

              <h2 className="mt-6 text-2xl font-black text-slate-900">Set New Password</h2>
              <p className="mt-1 text-xs text-slate-500">
                Choose a strong password with at least 6 characters.
              </p>

              {error && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                  ✕ {error}
                </div>
              )}

              <form onSubmit={handleChangePasswordSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#0d2946] focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#0d2946] focus:bg-white focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="mt-2 inline-flex w-full items-center justify-center rounded-2xl bg-[#0d2946] py-3.5 text-xs font-black uppercase tracking-wider text-white hover:bg-[#071d31] disabled:opacity-60 shadow-md"
                >
                  {isChangingPassword ? "Saving..." : "Save Password & Proceed →"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
