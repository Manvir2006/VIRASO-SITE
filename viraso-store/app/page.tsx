import Image from "next/image";
import Link from "next/link";
import { getPublishedProducts } from "@/lib/product-store";
import { SupportNav } from "@/components/support-nav";
import { FollowUs } from "@/components/follow-us";
import { SiteFooter } from "@/components/site-footer";

const categories = [
  { name: "Domestic Stands", image: "/products/product 1/5.jpg" },
  { name: "Wooden Tables", image: "/products/PRODUCT 5/1.jpg" },
  { name: "TA1 / Umbrella", image: "/products/product 3/4.jpg" },
  { name: "Replacement Belts", image: "/products/PRODUCT 7/S1.png" },
];

const highlights = [
  "Heavy-duty iron construction",
  "Built for home and professional use",
  "Strong wood-top stability",
  "Suitable for retail and wholesale buyers",
];

const trustStats = [
  { label: "Happy customers", value: "1 Lakh+" },
  { label: "Brand presence", value: "India" },
  { label: "Focus", value: "Quality" },
  { label: "Support", value: "Fast" },
];

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = (await getPublishedProducts()).slice(0, 4).map((product) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    mrp: product.mrp,
    image: product.image,
    badge: product.category,
  }));

  return (
    <main className="min-h-screen bg-[var(--brand-bg)] text-[var(--brand-black)]">
      <header className="sticky top-0 z-50 border-b border-[var(--brand-border)] bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative flex h-16 w-44 sm:w-48 items-center justify-center overflow-hidden rounded-xl border border-[var(--brand-border)] bg-white p-2 shadow-sm">
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
              <p className="font-viraso text-2xl font-black lowercase tracking-tight text-[var(--brand-navy)]" style={{ fontFamily: '"Geometr415 Blk BT", "Geometr 415", Eurostile, sans-serif' }}>
                viraso
              </p>
              <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--brand-muted)]">
                By Marjara Enterprises
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-semibold text-[var(--brand-black)] md:flex">
            <Link href="/" className="transition hover:text-[var(--brand-navy)]">Home</Link>
            <Link href="/products" className="transition hover:text-[var(--brand-navy)]">Products</Link>
            <Link href="/about" className="transition hover:text-[var(--brand-navy)]">About Us</Link>
            <Link href="/warranty" className="transition hover:text-[var(--brand-navy)]">Warranty</Link>
            <Link href="/product-registration" className="transition hover:text-[var(--brand-navy)]">Registration</Link>
            <Link href="/support/contact" className="transition hover:text-[var(--brand-navy)]">Contact</Link>
          </nav>

          <div className="flex items-center gap-3">
            <SupportNav />
            <Link
              href="/cart"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--brand-border)] bg-white text-xl text-[var(--brand-navy)] shadow-sm transition hover:border-[var(--brand-navy)]"
              aria-label="Cart"
            >
              🛒
            </Link>
            <Link
              href="/products"
              className="hidden rounded-full bg-[var(--brand-navy)] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--brand-navy-dark)] sm:inline-flex"
            >
              Shop Products
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-[var(--brand-border)] bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-24">
          <div className="relative z-10">
            <p className="mb-5 inline-flex rounded-full border border-[var(--brand-navy)]/15 bg-[var(--brand-navy)]/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--brand-navy)]">
              Manufacturing & sales
            </p>
            <h1 className="max-w-xl text-4xl font-black tracking-[-0.04em] text-[var(--brand-black)] sm:text-5xl lg:text-6xl">
              Reliable sewing machine stands for home, tailoring, and business use.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--brand-muted)]">
              Viraso is a professional sewing machine stand and accessory brand by Marjara Enterprises, built for quality,
              practical performance, and dependable daily use.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/products"
                className="rounded-full bg-[var(--brand-navy)] px-6 py-3 text-sm font-bold text-white transition hover:bg-[var(--brand-navy-dark)]"
              >
                View Products
              </Link>
              <Link
                href="/support/contact"
                className="rounded-full border border-[var(--brand-navy)] bg-white px-6 py-3 text-sm font-bold text-[var(--brand-navy)] transition hover:bg-[var(--brand-navy)] hover:text-white"
              >
                Contact Us
              </Link>
            </div>
          </div>

          <div className="relative z-10">
            <div className="rounded-[2rem] border border-[var(--brand-border)] bg-white p-4 shadow-[0_20px_50px_rgba(13,41,70,0.08)]">
              <div className="overflow-hidden rounded-[1.5rem] bg-[#edf2f7]">
                <Image
                  src="/products/product 1/1.jpg"
                  alt="Viraso sewing machine stand"
                  width={900}
                  height={1000}
                  priority
                  className="h-[520px] w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-4 text-center md:text-left">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-navy)]">Featured products</p>
          <h2 className="text-3xl font-black text-[var(--brand-black)] sm:text-4xl">Professional solutions for sewing work</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {products.map((product) => (
            <article key={product.id} className="group overflow-hidden rounded-[1.5rem] border border-[var(--brand-border)] bg-white transition hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(13,41,70,0.08)]">
              <div className="relative h-64 overflow-hidden bg-[#f1f5f9]">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={600}
                  height={600}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                />
                <span className="absolute left-4 top-4 rounded-full bg-[var(--brand-navy)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                  {product.badge}
                </span>
              </div>
              <div className="space-y-4 p-5">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--brand-navy)]">{product.id}</p>
                  <h3 className="mt-2 text-lg font-bold text-[var(--brand-black)]">{product.name}</h3>
                </div>

                <div className="flex items-end gap-2">
                  <span className="text-2xl font-black text-[var(--brand-black)]">₹{product.price.toLocaleString("en-IN")}</span>
                  <span className="text-sm text-[var(--brand-muted)] line-through">₹{product.mrp.toLocaleString("en-IN")}</span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex rounded-full border border-[var(--brand-border)] bg-[#f8fafc] px-3 py-1 text-xs font-semibold text-[var(--brand-success)]">
                    In Stock
                  </span>
                  <Link
                    href="/products"
                    className="inline-flex rounded-full bg-[var(--brand-navy)] px-4 py-2 text-sm font-bold text-white transition hover:bg-[var(--brand-navy-dark)]"
                  >
                    View Product
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-[var(--brand-border)] bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-4 lg:px-8">
          {categories.map((category) => (
            <div key={category.name} className="group overflow-hidden rounded-[1.5rem] border border-[var(--brand-border)] bg-[#f9fafb]">
              <div className="h-40 overflow-hidden">
                <Image src={category.image} alt={category.name} width={500} height={500} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-[var(--brand-black)]">{category.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-[var(--brand-border)] bg-white p-8 shadow-[0_20px_40px_rgba(13,41,70,0.04)] lg:p-12">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-navy)]">About Viraso</p>
              <h2 className="mt-4 text-3xl font-black text-[var(--brand-black)] sm:text-4xl">A Product of Marjara Enterprises</h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--brand-muted)]">
                Viraso is a growing Indian brand committed to delivering innovative sewing and machinery solutions across India.
              </p>
              <Link
                href="/about"
                className="mt-6 inline-flex rounded-full bg-[var(--brand-navy)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[var(--brand-navy-dark)]"
              >
                Learn More
              </Link>
            </div>

            <div className="overflow-hidden rounded-[1.5rem] border border-[var(--brand-border)] bg-[#f8fafc] p-3">
              <div className="flex min-h-[260px] items-center justify-center overflow-hidden rounded-[1rem] bg-white">
                <Image
                  src="/logo/Untitled design (1).jpg"
                  alt="Viraso by Marjara Enterprises logo"
                  width={900}
                  height={700}
                  className="h-full min-h-[260px] w-full object-cover scale-[1.7]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[var(--brand-navy)] text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/80">B2B / Wholesale</p>
              <h2 className="mt-4 text-3xl font-black sm:text-4xl">Built for retail and business buyers.</h2>
              <p className="mt-5 max-w-xl text-lg leading-8 text-white/85">
                We support both retail customers and business buyers with dependable sewing solutions designed for practical everyday performance.
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/15 bg-white/5 p-8 shadow-[0_20px_60px_rgba(7,29,49,0.35)]">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/70">Need a bulk quote?</p>
              <p className="mt-6 text-2xl font-black text-white">Contact for business pricing.</p>
              <Link
                href="/b2b-inquiry"
                className="mt-6 inline-flex rounded-full bg-white px-7 py-3.5 text-sm font-black uppercase tracking-wider text-[var(--brand-navy)] transition hover:bg-slate-100 shadow-md hover:shadow-lg"
              >
                SEND B2B INQUIRY
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 rounded-[2rem] border border-[var(--brand-border)] bg-white p-8 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-navy)]">Contact</p>
            <h2 className="mt-4 text-3xl font-black text-[var(--brand-black)]">Let’s help you choose the right product.</h2>
            <p className="mt-4 max-w-lg text-[var(--brand-muted)]">
              Whether you are buying for home use or business requirements, our team can guide you to the most suitable range.
            </p>
          </div>

          <div className="space-y-4 text-[var(--brand-black)]">
            <p><span className="font-bold">Phone:</span> 6280377678</p>
            <p><span className="font-bold">Email:</span> viraso.india@gmail.com</p>
            <p><span className="font-bold">GSTIN:</span> 03TIMPS1405N1ZL</p>
            <p><span className="font-bold">UDYAM No.:</span> UDYAM-PB-12-0283538</p>
            <p><span className="font-bold">Address:</span> #5598, Street No.22, Gobind Nagar, Daba Road, New Shimalpuri, Ludhiana 141003</p>
            <a
              href="https://wa.me/916280377678"
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex rounded-full bg-[var(--brand-navy)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[var(--brand-navy-dark)]"
            >
              Message on WhatsApp
            </a>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
