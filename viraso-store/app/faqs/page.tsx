import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Frequently Asked Questions (FAQs) | Viraso",
  description: "Find answers to frequently asked questions about Viraso sewing machine stands, order tracking, warranty, and customer support.",
};

const faqs = [
  {
    category: "Orders & Delivery",
    items: [
      {
        q: "How can I track my Viraso order?",
        a: "You can track your order at any time on our Track Order page using your Viraso Order ID and registered mobile number. You'll see real-time updates and live courier tracking links from our shipping partners.",
        link: { href: "/track-order", text: "Track Your Order →" },
      },
      {
        q: "Which courier partners deliver Viraso products?",
        a: "We ship orders across India using trusted logistics partners including Ekart, Delhivery, and Shadowfax to ensure fast and safe doorstep delivery.",
      },
      {
        q: "How long does delivery take?",
        a: "Standard delivery usually takes 3 to 7 business days depending on your delivery location and pin code across India.",
      },
    ],
  },
  {
    category: "Products & Compatibility",
    items: [
      {
        q: "Which sewing machine heads are compatible with Viraso stands?",
        a: "Viraso heavy-duty sewing machine stands and tables are engineered to be universally compatible with standard domestic and industrial machine heads from leading brands like Singer, Usha, Merrit, Brother, and others in both TA1 and Umbrella configurations.",
        link: { href: "/products", text: "View All Products →" },
      },
      {
        q: "What materials are used in Viraso stands?",
        a: "Our stands are built with heavy-gauge reinforced cast iron/steel framing and premium durable tabletops designed for maximum stability, zero vibration, and years of dependable everyday use.",
      },
      {
        q: "Is assembly required for sewing machine stands?",
        a: "Yes, our stands come carefully packaged with all necessary hardware, nuts, bolts, and pedal assemblies for straightforward setup. If you need any assistance during assembly, our customer care team is glad to help.",
      },
    ],
  },
  {
    category: "Warranty & Product Registration",
    items: [
      {
        q: "How do I register my Viraso product for warranty?",
        a: "You can register your purchase within 30 days of delivery through our online Product Registration form using your invoice details and product serial number.",
        link: { href: "/product-registration", text: "Register Product →" },
      },
      {
        q: "What does the warranty cover?",
        a: "Viraso provides warranty coverage against manufacturing defects on structural frames and components. Please visit our Warranty page for complete terms and policies.",
        link: { href: "/warranty", text: "Read Warranty Terms →" },
      },
      {
        q: "How do I raise a complaint or claim for a damaged or missing part?",
        a: "If your product arrives damaged or has a missing component, please submit a claim on our Product Complaint page with your details and photos. Our support team resolves issues promptly.",
        link: { href: "/support/product-complaint", text: "Submit Product Complaint →" },
      },
    ],
  },
  {
    category: "B2B & Wholesale Inquiries",
    items: [
      {
        q: "Can I buy Viraso sewing machine stands in bulk for wholesale or retail?",
        a: "Yes! Viraso by Marjara Enterprises manufactures and supplies sewing stands and machinery directly to retail shops, tailoring academies, distributors, and garment businesses across India.",
        link: { href: "/b2b-inquiry", text: "Send B2B Wholesale Inquiry →" },
      },
      {
        q: "Do you provide GST invoices for business purchases?",
        a: "Yes, all business orders come with an official GST-compliant tax invoice. You can input your 15-character GSTIN during inquiry or purchase.",
      },
    ],
  },
  {
    category: "Contact & Support",
    items: [
      {
        q: "How can I speak directly with Viraso customer care?",
        a: "You can call us directly at 6280377678, email us at viraso.india@gmail.com, or submit a message through our Contact page.",
        link: { href: "/contact", text: "Contact Us →" },
      },
    ],
  },
];

export default function FAQsPage() {
  return (
    <main className="min-h-screen bg-[#f5f7fb] text-[#111111]">
      <SiteHeader />

      {/* Hero Section */}
      <section className="bg-[#0d2946] px-4 py-16 text-center text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/70">
            Help & Knowledge Base
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-base text-white/80">
            Find answers to common questions regarding Viraso sewing machine stands, delivery tracking, warranty, and customer support.
          </p>
        </div>
      </section>

      {/* FAQ Categories & Q&A Cards */}
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-12">
          {faqs.map((cat) => (
            <div key={cat.category}>
              <h2 className="border-b border-slate-200 pb-3 text-xl font-black tracking-tight text-[#0d2946]">
                {cat.category}
              </h2>
              <div className="mt-6 space-y-4">
                {cat.items.map((item) => (
                  <div
                    key={item.q}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-[#0d2946]/30"
                  >
                    <h3 className="text-base font-bold text-[#0d2946]">
                      {item.q}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {item.a}
                    </p>
                    {item.link && (
                      <Link
                        href={item.link.href}
                        className="mt-3 inline-block text-xs font-bold text-[#0d2946] underline hover:text-[#071d31]"
                      >
                        {item.link.text}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Still Have Questions Box */}
        <div className="mt-16 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h3 className="text-xl font-black text-[#0d2946]">
            Still have questions?
          </h3>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">
            Our support team in Ludhiana is here to assist you with order status, technical product compatibility, or bulk purchase inquiries.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact"
              className="rounded-full bg-[#0d2946] px-6 py-3 text-xs font-bold text-white transition hover:bg-[#071d31]"
            >
              Contact Support
            </Link>
            <a
              href="tel:6280377678"
              className="rounded-full border border-slate-300 bg-slate-50 px-6 py-3 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
            >
              📞 Call: 6280377678
            </a>
          </div>
        </div>
      </section>

      {/* Unified Site Footer */}
      <SiteFooter />
    </main>
  );
}
