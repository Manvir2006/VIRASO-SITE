import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { aboutPageContent } from "./content";
import { SupportNav } from "@/components/support-nav";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "About Viraso | Marjara Enterprises",
  description:
    "Learn about Viraso by Marjara Enterprises, our journey, product focus, customer trust, and commitment to quality and innovation.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#f5f7fb] text-[#111111]">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative flex h-16 w-44 sm:w-48 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
              <Image
                src="/logo/viraso-logo-cropped.png"
                alt="Viraso logo"
                width={220}
                height={75}
                className="h-full w-full object-contain"
                priority
              />
            </div>
            <div className="leading-none">
              <p className="font-viraso text-2xl font-black lowercase tracking-tight text-[#0d2946]" style={{ fontFamily: '"Geometr415 Blk BT", "Geometr 415", Eurostile, sans-serif' }}>viraso</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-semibold text-[#111111] md:flex">
            <Link href="/" className="transition hover:text-[#0d2946]">Home</Link>
            <Link href="/products" className="transition hover:text-[#0d2946]">Products</Link>
            <Link href="/about" className="transition hover:text-[#0d2946]">About</Link>
            <Link href="/support/contact" className="transition hover:text-[#0d2946]">Contact</Link>
          </nav>

          <div className="flex items-center gap-3">
            <SupportNav />
            <Link
              href="/products"
              className="inline-flex rounded-full bg-[#0d2946] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#071d31]"
            >
              Shop Products
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 pb-10 pt-16 sm:px-6 lg:px-8 lg:pb-16 lg:pt-20">
        <div className="mb-6 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#0d2946]">About</p>
          <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] text-[#111111] sm:text-5xl">
            {aboutPageContent.pageTitle}
          </h1>
          <p className="mt-3 text-lg text-slate-600">{aboutPageContent.subtitle}</p>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-20">
          <div className="flex flex-col justify-center">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#0d2946]">Who We Are</p>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-[#111111] sm:text-4xl">
              {aboutPageContent.intro.heading}
            </h2>
            <p className="mt-3 text-lg font-medium text-slate-600">{aboutPageContent.intro.subheading}</p>
            <p className="mt-6 text-lg leading-8 text-slate-700">{aboutPageContent.intro.text}</p>
          </div>

          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-xl overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-100 p-4 shadow-[0_24px_55px_rgba(13,41,70,0.08)]">
              <Image
                src="/logo/Untitled design (1).jpg"
                alt="Viraso logo"
                width={900}
                height={900}
                className="w-full rounded-[1.5rem] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mb-10 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#0d2946]">Our Journey</p>
          <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-[#111111] sm:text-4xl">
            {aboutPageContent.journey.heading}
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#0d2946] text-xl font-black text-white">
              01
            </div>
            <p className="text-lg leading-8 text-slate-700">{aboutPageContent.journey.text.split("\n\n")[0]}</p>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#0d2946] text-xl font-black text-white">
              02
            </div>
            <p className="text-lg leading-8 text-slate-700">{aboutPageContent.journey.text.split("\n\n")[1]}</p>
          </div>
        </div>
      </section>

      <section className="bg-[#0d2946] text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/80">Our Growth</p>
          <div className="mt-6 text-5xl font-black tracking-[-0.06em] sm:text-7xl">
            {aboutPageContent.growth.headline}
          </div>
          <h2 className="mt-4 text-2xl font-bold sm:text-3xl">{aboutPageContent.growth.label}</h2>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-200">{aboutPageContent.growth.text}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mb-10 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#0d2946]">What We Believe</p>
          <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-[#111111] sm:text-4xl">
            What We Believe
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {aboutPageContent.values.map((value) => (
            <div key={value.title} className="rounded-[1.5rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#edf2f7] text-2xl font-black text-[#0d2946]">
                {value.icon}
              </div>
              <h3 className="text-xl font-black uppercase tracking-[0.08em] text-[#111111]">{value.title}</h3>
              <p className="mt-4 text-base leading-7 text-slate-600">{value.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#0d2946] text-white">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/80">Our Tagline</p>
          <blockquote className="mt-8 text-3xl font-black leading-tight tracking-[-0.04em] sm:text-5xl">
            “{aboutPageContent.tagline}”
          </blockquote>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mb-10 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#0d2946]">Why Customers Trust Viraso</p>
          <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-[#111111] sm:text-4xl">
            Why Customers Trust Viraso
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {aboutPageContent.trustReasons.map((reason, index) => (
            <div key={reason} className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_18px_30px_rgba(13,41,70,0.06)]">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#edf2f7] text-lg font-black text-[#0d2946]">
                {index + 1}
              </div>
              <p className="text-base font-semibold leading-7 text-[#111111]">{reason}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mb-10 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#0d2946]">Our Products</p>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-[#111111] sm:text-4xl">Our Products</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {aboutPageContent.productCategories.map((category) => (
              <Link key={category.name} href={category.href} className="group overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50 transition hover:-translate-y-1 hover:shadow-[0_20px_35px_rgba(13,41,70,0.06)]">
                <div className="h-52 overflow-hidden">
                  <Image
                    src={category.image}
                    alt={category.name}
                    width={600}
                    height={600}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-[#111111]">{category.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm lg:p-12">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#0d2946]">Our Commitment</p>
          <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-[#111111] sm:text-4xl">Our Commitment</h2>
          <p className="mt-6 max-w-4xl text-lg leading-8 text-slate-700">{aboutPageContent.commitment}</p>
        </div>
      </section>

      <section className="bg-white pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-slate-200 bg-[#f8fafc] p-8 text-center shadow-sm lg:p-12">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#0d2946]">Explore</p>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-[#111111] sm:text-4xl">
              {aboutPageContent.cta.heading}
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">{aboutPageContent.cta.text}</p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/products"
                className="inline-flex justify-center rounded-full bg-[#0d2946] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#071d31]"
              >
                {aboutPageContent.cta.primary}
              </Link>
              <Link
                href="/support/contact"
                className="inline-flex justify-center rounded-full border border-[#0d2946] bg-white px-6 py-3 text-sm font-bold text-[#0d2946] transition hover:bg-[#0d2946] hover:text-white"
              >
                {aboutPageContent.cta.secondary}
              </Link>
            </div>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
