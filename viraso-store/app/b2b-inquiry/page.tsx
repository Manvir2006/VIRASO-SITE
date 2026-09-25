"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Chandigarh",
  "Puducherry",
];

const FREQUENCY_OPTIONS = [
  "Regular Bulk Purchase",
  "Monthly",
  "Quarterly",
  "One Time",
];

export default function B2BInquiryPage() {
  // Form state
  const [companyName, setCompanyName] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [website, setWebsite] = useState("");

  const [contactPersonName, setContactPersonName] = useState("");
  const [mobile, setMobile] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [sameAsMobile, setSameAsMobile] = useState(true);
  const [email, setEmail] = useState("");

  const [monthlyQuantity, setMonthlyQuantity] = useState("");
  const [productRequirement, setProductRequirement] = useState("");
  const [purchaseFrequency, setPurchaseFrequency] = useState("Regular Bulk Purchase");
  const [additionalMessage, setAdditionalMessage] = useState("");

  // Submission state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState<{
    inquiryNumber: string;
    companyName: string;
    contactName: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Frontend validation
    if (!companyName.trim()) {
      setError("Please enter your Company or Business Name.");
      return;
    }
    if (!companyAddress.trim()) {
      setError("Please enter your Company Address.");
      return;
    }
    if (!city.trim()) {
      setError("Please enter your City.");
      return;
    }
    if (!state.trim()) {
      setError("Please select your State.");
      return;
    }
    const cleanPin = pinCode.replace(/[^0-9]/g, "");
    if (cleanPin.length !== 6) {
      setError("Please provide a valid 6-digit PIN code.");
      return;
    }
    if (!contactPersonName.trim()) {
      setError("Please enter the Contact Person Name.");
      return;
    }
    const cleanMobile = mobile.replace(/[^0-9]/g, "").slice(-10);
    if (cleanMobile.length !== 10) {
      setError("Please provide a valid 10-digit Mobile Number.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please provide a valid Email Address.");
      return;
    }
    if (!monthlyQuantity.trim()) {
      setError("Please specify your Monthly Required Quantity.");
      return;
    }
    if (!productRequirement.trim()) {
      setError("Please provide details of your Product Requirement.");
      return;
    }

    // Optional GST validation
    if (gstNumber.trim()) {
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstRegex.test(gstNumber.trim().toUpperCase())) {
        setError("Please enter a valid 15-character GSTIN (e.g. 07AAAAA0000A1Z5) or leave blank if not applicable.");
        return;
      }
    }

    setIsLoading(true);

    try {
      const payload = {
        company_name: companyName.trim(),
        gst_number: gstNumber.trim().toUpperCase() || undefined,
        company_address: companyAddress.trim(),
        city: city.trim(),
        state: state.trim(),
        pin_code: cleanPin,
        website: website.trim() || undefined,
        contact_person_name: contactPersonName.trim(),
        mobile: cleanMobile,
        whatsapp_number: sameAsMobile
          ? cleanMobile
          : whatsappNumber.replace(/[^0-9]/g, "").slice(-10) || cleanMobile,
        email: email.trim().toLowerCase(),
        monthly_quantity: monthlyQuantity.trim(),
        product_requirement: productRequirement.trim(),
        purchase_frequency: purchaseFrequency,
        additional_message: additionalMessage.trim() || undefined,
      };

      const res = await fetch("/api/b2b-inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit B2B inquiry. Please try again.");
      }

      // Success
      setSuccessData({
        inquiryNumber: data.inquiry.inquiry_number,
        companyName: companyName.trim(),
        contactName: contactPersonName.trim(),
      });
      setError("");
    } catch (err: any) {
      console.error("Submission failed:", err);
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyId = () => {
    if (successData?.inquiryNumber) {
      navigator.clipboard.writeText(successData.inquiryNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleResetForm = () => {
    setSuccessData(null);
    setCompanyName("");
    setGstNumber("");
    setCompanyAddress("");
    setCity("");
    setState("");
    setPinCode("");
    setWebsite("");
    setContactPersonName("");
    setMobile("");
    setWhatsappNumber("");
    setEmail("");
    setMonthlyQuantity("");
    setProductRequirement("");
    setAdditionalMessage("");
    setError("");
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-[#111111]">
      <SiteHeader />
      <main className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Subheader Quick Links */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0d2946]">Commercial & Wholesale</p>
              <h1 className="text-2xl font-black text-slate-900">B2B Trade Inquiries</h1>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/products"
                className="inline-flex rounded-full bg-[#0d2946] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#071d31]"
              >
                View Products
              </Link>
            </div>
          </div>

        {/* Main Card */}
        <div className="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-10 lg:p-12">
          {successData ? (
            /* Success View */
            <div className="py-8 text-center space-y-6 animate-in fade-in duration-300">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-600">
                ✓
              </div>

              <div>
                <span className="inline-block rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-emerald-800">
                  Submission Confirmed
                </span>
                <h1 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
                  B2B Inquiry Submitted Successfully
                </h1>
                <p className="mx-auto mt-3 max-w-lg text-sm text-slate-600">
                  Thank you, <strong className="text-slate-900">{successData.contactName}</strong>. Your wholesale inquiry for <strong className="text-slate-900">{successData.companyName}</strong> has been securely recorded.
                </p>
              </div>

              {/* Inquiry ID Card */}
              <div className="mx-auto max-w-md rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/80 to-slate-50 p-6 text-center shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Inquiry ID
                </p>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <span className="font-mono text-2xl font-black tracking-wider text-[#0d2946] sm:text-3xl">
                    {successData.inquiryNumber}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    {copied ? "Copied! ✓" : "Copy"}
                  </button>
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  Our business team will contact you shortly. Please keep your Inquiry ID for future reference.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                <Link
                  href="/"
                  className="rounded-full bg-[#0d2946] px-8 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-md transition hover:bg-[#071d31]"
                >
                  Return to Home
                </Link>
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="rounded-full border border-slate-300 bg-white px-6 py-3.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
                >
                  Submit Another Inquiry
                </button>
              </div>
            </div>
          ) : (
            /* Inquiry Form */
            <div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#0d2946]">
                  Viraso Enterprise Solutions
                </p>
                <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                  B2B / Wholesale Inquiry
                </h1>
                <p className="mt-2 text-sm text-slate-600">
                  Tell us about your business and requirements. Our team will contact you with suitable pricing and product information.
                </p>
              </div>

              {error && (
                <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-8 space-y-10">
                {/* SECTION 1: BUSINESS INFORMATION */}
                <div className="space-y-4">
                  <div className="border-b border-slate-200 pb-2">
                    <h2 className="text-sm font-black uppercase tracking-widest text-[#0d2946]">
                      1. Business Information
                    </h2>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Company / Business Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. ABC Garments & Manufacturing Pvt Ltd"
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:border-[#0d2946] focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        GST Number (Optional)
                      </label>
                      <input
                        type="text"
                        maxLength={15}
                        value={gstNumber}
                        onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                        placeholder="e.g. 07AAAAA0000A1Z5"
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm uppercase focus:border-[#0d2946] focus:bg-white focus:outline-none"
                      />
                      <p className="mt-1 text-[11px] text-slate-400">
                        Optional. Leave blank if your business is not GST registered.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Website (Optional)
                      </label>
                      <input
                        type="url"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="e.g. https://yourbusiness.com"
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#0d2946] focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Company Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={companyAddress}
                        onChange={(e) => setCompanyAddress(e.target.value)}
                        placeholder="Building, street, industrial area, plot number"
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#0d2946] focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Ludhiana, New Delhi, Surat"
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#0d2946] focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        State <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#0d2946] focus:bg-white focus:outline-none font-medium"
                      >
                        <option value="">Select State...</option>
                        {INDIAN_STATES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Pin Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={pinCode}
                        onChange={(e) => setPinCode(e.target.value)}
                        placeholder="e.g. 141003"
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm focus:border-[#0d2946] focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 2: CONTACT PERSON */}
                <div className="space-y-4">
                  <div className="border-b border-slate-200 pb-2">
                    <h2 className="text-sm font-black uppercase tracking-widest text-[#0d2946]">
                      2. Contact Person Details
                    </h2>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Contact Person Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={contactPersonName}
                        onChange={(e) => setContactPersonName(e.target.value)}
                        placeholder="e.g. Rajesh Kumar"
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#0d2946] focus:bg-white focus:outline-none font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Mobile Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        maxLength={10}
                        required
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="10-digit mobile number"
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm focus:border-[#0d2946] focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                          WhatsApp Number
                        </label>
                        <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={sameAsMobile}
                            onChange={(e) => setSameAsMobile(e.target.checked)}
                            className="rounded border-slate-300 text-[#0d2946] focus:ring-[#0d2946]"
                          />
                          <span>Same as mobile</span>
                        </label>
                      </div>
                      <input
                        type="tel"
                        maxLength={10}
                        disabled={sameAsMobile}
                        value={sameAsMobile ? mobile : whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        placeholder="WhatsApp contact number"
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm focus:border-[#0d2946] focus:bg-white focus:outline-none disabled:opacity-60"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. purchase@company.com"
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#0d2946] focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 3: BUSINESS REQUIREMENT */}
                <div className="space-y-4">
                  <div className="border-b border-slate-200 pb-2">
                    <h2 className="text-sm font-black uppercase tracking-widest text-[#0d2946]">
                      3. Business Requirement
                    </h2>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Monthly Required Quantity <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={monthlyQuantity}
                        onChange={(e) => setMonthlyQuantity(e.target.value)}
                        placeholder="e.g. 50 pcs / 100 sets / 500 units"
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold focus:border-[#0d2946] focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Expected Purchase Frequency
                      </label>
                      <select
                        value={purchaseFrequency}
                        onChange={(e) => setPurchaseFrequency(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:border-[#0d2946] focus:bg-white focus:outline-none"
                      >
                        {FREQUENCY_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Product Requirement <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={4}
                        required
                        value={productRequirement}
                        onChange={(e) => setProductRequirement(e.target.value)}
                        placeholder={"Write the products you are interested in, required quantity, model, or any special requirement.\n\nExample:\nViraso Sewing Machine Stand - 100 pcs/month\nViraso Electric Sewing Machine - 50 pcs/month"}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm focus:border-[#0d2946] focus:bg-white focus:outline-none font-medium leading-relaxed"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Additional Requirements / Message
                      </label>
                      <textarea
                        rows={3}
                        value={additionalMessage}
                        onChange={(e) => setAdditionalMessage(e.target.value)}
                        placeholder="Tell us about any special requirements, packaging, branding, delivery location, etc."
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm focus:border-[#0d2946] focus:bg-white focus:outline-none leading-relaxed"
                      />
                    </div>
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0d2946] py-4 text-base font-black uppercase tracking-wider text-white shadow-lg transition hover:bg-[#071d31] hover:shadow-xl disabled:opacity-60"
                  >
                    {isLoading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Submitting B2B Inquiry...</span>
                      </>
                    ) : (
                      <span>SUBMIT B2B INQUIRY</span>
                    )}
                  </button>
                  <p className="mt-3 text-center text-xs text-slate-500">
                    Your inquiry is directly delivered to the Marjara Enterprises commercial sales desk.
                  </p>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </main>
  </div>
  );
}
