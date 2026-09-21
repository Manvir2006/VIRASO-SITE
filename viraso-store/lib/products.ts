export type ProductSpec = {
  label: string;
  value: string;
};

export type Product = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  mrp: number;
  stock: string;
  shortDescription: string;
  description: string;
  features: string[];
  specifications: ProductSpec[];
  material?: string;
  dimensions?: string;
  weight?: string;
  warranty?: string;
  whatsIncluded?: string;
  image: string;
  gallery: string[];
};

const product1Gallery = [
  "/products/product 1/Main image.jpg",
  "/products/product 1/1.jpg",
  "/products/product 1/3.jpg",
  "/products/product 1/5.jpg",
  "/products/product 1/6.jpg",
  "/products/product 1/7.jpg",
  "/products/product 1/8.jpg",
  "/products/product 1/Board (1).jpg",
  "/products/product 1/gfdg.jpg",
  "/products/product 1/scsdc.jpg",
];

const product2Gallery = [
  "/products/PRODUCT 2/Main inage.jpg",
  "/products/PRODUCT 2/11.jpg",
  "/products/PRODUCT 2/4.jpg",
  "/products/PRODUCT 2/6.jpg",
  "/products/PRODUCT 2/8.jpg",
  "/products/PRODUCT 2/9.jpg",
];

const product3Gallery = [
  "/products/product 3/Main image.jpg",
  "/products/product 3/01.jpg",
  "/products/product 3/10.jpg",
  "/products/product 3/4.jpg",
  "/products/product 3/5.jpg",
  "/products/product 3/6.jpg",
  "/products/product 3/7.jpg",
  "/products/product 3/gfdg.jpg",
  "/products/product 3/scsdc.jpg",
];

const product4Gallery = [
  "/products/PRODUCT 4/Main image.jpg",
  "/products/PRODUCT 4/1.jpg",
  "/products/PRODUCT 4/2.jpg",
  "/products/PRODUCT 4/3.jpg",
  "/products/PRODUCT 4/4.jpg",
  "/products/PRODUCT 4/5.jpg",
  "/products/PRODUCT 4/6.jpg",
  "/products/PRODUCT 4/9.jpg",
];

const product5Gallery = [
  "/products/PRODUCT 5/Main image.jpg",
  "/products/PRODUCT 5/1.jpg",
  "/products/PRODUCT 5/2.jpg",
  "/products/PRODUCT 5/3.jpg",
  "/products/PRODUCT 5/4.jpg",
  "/products/PRODUCT 5/5.jpg",
];

const product6Gallery = [
  "/products/PRODUCT 6/Mian image.jpg",
  "/products/PRODUCT 6/1.jpg",
  "/products/PRODUCT 6/2.jpg",
  "/products/PRODUCT 6/3.jpg",
  "/products/PRODUCT 6/4.jpg",
  "/products/PRODUCT 6/5.jpg",
];

const product7Gallery = [
  "/products/PRODUCT 7/Main image.png",
  "/products/PRODUCT 7/S1.png",
  "/products/PRODUCT 7/S2.png",
  "/products/PRODUCT 7/S3.png",
  "/products/PRODUCT 7/S4.png",
  "/products/PRODUCT 7/sv new .jpg",
];

const product8Gallery = [
  "/products/product 8/Main image.jpg",
  "/products/product 8/2.jpg",
  "/products/product 8/3.jpg",
  "/products/product 8/4.jpg",
  "/products/product 8/5.jpg",
];

export const products: Product[] = [
  {
    id: "SM01",
    slug: "sm01-domestic-sewing-machine-stand-table-with-belt",
    sku: "SM01",
    name: "Viraso Domestic Sewing Machine Stand & Table with Belt",
    category: "Sewing Machine Stands",
    price: 2599,
    mrp: 7999,
    stock: "In Stock",
    shortDescription:
      "Strong iron frame with durable wooden tabletop for a stable and smooth sewing experience.",
    description:
      "The Viraso SM01 Domestic Sewing Machine Stand & Table with Belt is designed for stable and smooth sewing performance. It features a strong iron frame with a durable wooden tabletop, ensuring long-lasting use. The stand supports sewing speed up to 1600 SPM and includes a belt for efficient operation. Suitable for most domestic sewing machines, ideal for home and tailoring purposes.",
    features: [
      "Strong iron frame",
      "Durable wooden tabletop",
      "Supports sewing speed up to 1600 SPM",
      "Includes belt for efficient operation",
      "Suitable for most domestic sewing machines",
    ],
    specifications: [
      { label: "Model", value: "SM01" },
      { label: "Product Type", value: "Domestic Sewing Machine Stand & Table with Belt" },
      { label: "Material", value: "Iron frame and wooden tabletop" },
      { label: "Speed Support", value: "Up to 1600 SPM" },
      { label: "Compatibility", value: "Most domestic sewing machines" },
    ],
    material: "Iron frame and wooden tabletop",
    dimensions: "Standard domestic sewing machine stand dimensions",
    weight: "Not specified",
    warranty: "Contact support for warranty information",
    whatsIncluded: "Sewing machine stand, table, belt",
    image: product1Gallery[0],
    gallery: product1Gallery,
  },
  {
    id: "SM02",
    slug: "sm02-sewing-machine-stand-without-table-with-belt",
    sku: "SM02",
    name: "Viraso Sewing Machine Stand & WHITOUT Table with Belt",
    category: "Sewing Machine Stands",
    price: 1999,
    mrp: 5999,
    stock: "In Stock",
    shortDescription:
      "Sturdy stand design with belt support for domestic sewing machines.",
    description:
      "The Viraso SM02 Sewing Machine Stand & WITHOUT Table with Belt is designed for stable and smooth sewing performance. It features a strong iron frame with a durable wooden tabletop, ensuring long-lasting use. The stand supports sewing speed up to 1600 SPM and includes a belt for efficient operation. Suitable for most domestic sewing machines, ideal for home and tailoring purposes.",
    features: [
      "Strong iron frame",
      "Belt included for efficient running",
      "Built for stable sewing performance",
      "Suitable for most domestic sewing machines",
    ],
    specifications: [
      { label: "Model", value: "SM02" },
      { label: "Product Type", value: "Sewing Machine Stand Without Table with Belt" },
      { label: "Material", value: "Iron frame" },
      { label: "Speed Support", value: "Up to 1600 SPM" },
      { label: "Compatibility", value: "Most domestic sewing machines" },
    ],
    material: "Iron frame",
    dimensions: "Standard domestic sewing machine stand dimensions",
    weight: "Not specified",
    warranty: "Contact support for warranty information",
    whatsIncluded: "Sewing machine stand, belt",
    image: product2Gallery[0],
    gallery: product2Gallery,
  },
  {
    id: "SM03",
    slug: "sm03-umbrella-ta1-sewing-machine-stand-table-with-belt",
    sku: "SM03",
    name: "Viraso Umbrella/TA-1 Sewing Machine Stand & Table with Belt",
    category: "Sewing Machine Stands",
    price: 2899,
    mrp: 8399,
    stock: "In Stock",
    shortDescription:
      "Umbrella/TA-1 stand with sturdy construction for smooth daily sewing use.",
    description:
      "The Viraso SM03 Umbrella/TA-1 Sewing Machine Stand & Table with Belt is designed for stable and smooth sewing performance. It features a strong iron frame with a durable wooden tabletop, ensuring long-lasting use. The stand supports sewing speed up to 1600 SPM and includes a belt for efficient operation. Suitable for most domestic sewing machines, ideal for home and tailoring purposes.",
    features: [
      "Strong iron frame",
      "Durable wooden tabletop",
      "Suitable for umbrella/TA-1 sewing machines",
      "Includes belt for smooth operation",
    ],
    specifications: [
      { label: "Model", value: "SM03" },
      { label: "Product Type", value: "Umbrella/TA-1 Sewing Machine Stand & Table with Belt" },
      { label: "Material", value: "Iron frame and wooden tabletop" },
      { label: "Speed Support", value: "Up to 1600 SPM" },
      { label: "Compatibility", value: "Most domestic sewing machines" },
    ],
    material: "Iron frame and wooden tabletop",
    dimensions: "Standard umbrella / TA-1 stand dimensions",
    weight: "Not specified",
    warranty: "Contact support for warranty information",
    whatsIncluded: "Sewing machine stand, table, belt",
    image: product3Gallery[0],
    gallery: product3Gallery,
  },
  {
    id: "SM04",
    slug: "sm04-overlock-sewing-machine-stand-table-with-belt",
    sku: "SM04",
    name: "Viraso OVERLOCK Sewing Machine Stand & Table with Belt",
    category: "Sewing Machine Stands",
    price: 2799,
    mrp: 8999,
    stock: "In Stock",
    shortDescription:
      "Overlock sewing machine stand built for stable and dependable operation.",
    description:
      "The Viraso SM04 OVERLOCK Sewing Machine Stand & Table with Belt is designed for stable and smooth sewing performance. It features a strong iron frame with a durable wooden tabletop, ensuring long-lasting use. The stand supports sewing speed up to 1600 SPM and includes a belt for efficient operation. Suitable for most domestic sewing machines, ideal for home and tailoring purposes.",
    features: [
      "Strong iron frame",
      "Durable wooden tabletop",
      "Built for overlock sewing machine use",
      "Includes belt for operation",
    ],
    specifications: [
      { label: "Model", value: "SM04" },
      { label: "Product Type", value: "Overlock Sewing Machine Stand & Table with Belt" },
      { label: "Material", value: "Iron frame and wooden tabletop" },
      { label: "Speed Support", value: "Up to 1600 SPM" },
      { label: "Compatibility", value: "Most domestic sewing machines" },
    ],
    material: "Iron frame and wooden tabletop",
    dimensions: "Standard overlock sewing machine stand dimensions",
    weight: "Not specified",
    warranty: "Contact support for warranty information",
    whatsIncluded: "Sewing machine stand, table, belt",
    image: product4Gallery[0],
    gallery: product4Gallery,
  },
  {
    id: "SM05",
    slug: "sm05-domestic-sewing-machine-wooden-table-only",
    sku: "SM05",
    name: "Viraso DOMESTIC Sewing Machine WOODEN TABLE ONLY & Table with Belt",
    category: "Wooden Tables",
    price: 1199,
    mrp: 3999,
    stock: "In Stock",
    shortDescription:
      "Wooden table option designed for durability, stability, and smooth stitching support.",
    description:
      "The Viraso SM05 Upgrade your stitching experience with the Viraso Domestic Sewing Machine Stand with Wooden Table, designed for durability, stability, and smooth performance. Built with a heavy-duty metal frame and high-quality wooden top, this stand ensures vibration-free operation, making it perfect for both beginners and professional tailors. The sturdy construction provides long-lasting support for manual sewing machines, while the ergonomic design allows comfortable and efficient stitching for extended hours. Ideal for home use, boutiques, and small businesses, this stand is a reliable choice for everyday sewing needs.",
    features: [
      "Heavy-duty metal frame",
      "High-quality wooden top",
      "Vibration-free operation",
      "Ideal for home use and small businesses",
    ],
    specifications: [
      { label: "Model", value: "SM05" },
      { label: "Product Type", value: "Domestic Sewing Machine Wooden Table" },
      { label: "Material", value: "Metal frame and wooden top" },
      { label: "Use Case", value: "Home use, boutiques, small businesses" },
    ],
    material: "Metal frame and wooden top",
    dimensions: "Not specified",
    weight: "Not specified",
    warranty: "Contact support for warranty information",
    whatsIncluded: "Wooden table and stand support",
    image: product5Gallery[0],
    gallery: product5Gallery,
  },
  {
    id: "SM06",
    slug: "sm06-ta1-umbrella-sewing-machine-wooden-table-only",
    sku: "SM06",
    name: "Viraso TA1/UMBRELLA Sewing Machine WOODEN TABLE ONLY & Table with Belt",
    category: "TA1 / Umbrella",
    price: 1399,
    mrp: 3999,
    stock: "In Stock",
    shortDescription:
      "Table solution for TA1 and umbrella sewing machine setups with sturdy support.",
    description:
      "The Viraso SM06 Upgrade your stitching experience with the Viraso Domestic Sewing Machine Stand with Wooden Table, designed for durability, stability, and smooth performance. Built with a heavy-duty metal frame and high-quality wooden top, this stand ensures vibration-free operation, making it perfect for both beginners and professional tailors. The sturdy construction provides long-lasting support for manual sewing machines, while the ergonomic design allows comfortable and efficient stitching for extended hours. Ideal for home use, boutiques, and small businesses, this stand is a reliable choice for everyday sewing needs.",
    features: [
      "Heavy-duty metal frame",
      "High-quality wooden top",
      "Built for TA1/umbrella setups",
      "Comfortable and efficient stitching support",
    ],
    specifications: [
      { label: "Model", value: "SM06" },
      { label: "Product Type", value: "TA1/Umbrella Sewing Machine Wooden Table" },
      { label: "Material", value: "Metal frame and wooden top" },
      { label: "Use Case", value: "Home use, boutiques, small businesses" },
    ],
    material: "Metal frame and wooden top",
    dimensions: "Not specified",
    weight: "Not specified",
    warranty: "Contact support for warranty information",
    whatsIncluded: "Wooden table and stand support",
    image: product6Gallery[0],
    gallery: product6Gallery,
  },
  {
    id: "SM07",
    slug: "sm07-domestic-sewing-machine-only-belt-3pcs",
    sku: "SM07",
    name: "Viraso DOMESTIC Sewing Machine ONLY BELT , 3PCS",
    category: "Replacement Belts",
    price: 199,
    mrp: 3999,
    stock: "In Stock",
    shortDescription:
      "Replacement belt pack designed for smooth sewing machine operation and easy installation.",
    description:
      "The Viraso SM07 Upgrade your sewing experience with this high-quality Sewing Machine Belt, designed for smooth performance and long-lasting durability. Made from strong braided material, this belt provides excellent grip and ensures efficient power transmission for manual sewing machines. This belt is easy to install and fits most standard sewing machines, making it a perfect replacement for worn-out or broken belts. Its durable construction reduces slipping and enhances stitching precision. The pack includes multiple belts, offering great value for money and convenience for long-term use. Key Features: High-quality braided material for durability Strong grip for smooth machine operation Easy to install and replace Compatible with most manual sewing machines Long-lasting performance Pack of 3 for added value",
    features: [
      "Strong braided material",
      "Excellent grip for smooth operation",
      "Easy to install and replace",
      "Compatible with most manual sewing machines",
      "Pack of 3",
    ],
    specifications: [
      { label: "Model", value: "SM07" },
      { label: "Product Type", value: "Sewing Machine Belt, 3PCS" },
      { label: "Material", value: "Braided material" },
      { label: "Pack Size", value: "3 pieces" },
      { label: "Compatibility", value: "Most manual sewing machines" },
    ],
    material: "Braided material",
    dimensions: "Not specified",
    weight: "Not specified",
    warranty: "Contact support for warranty information",
    whatsIncluded: "3 belts",
    image: product7Gallery[0],
    gallery: product7Gallery,
  },
  {
    id: "VS519",
    slug: "viraso-12-stitch-electric-sewing-machine",
    sku: "VS519",
    name: "Viraso 12-Stitch Electric Sewing Machine",
    category: "Electric Sewing Machines",
    price: 6999,
    mrp: 24999,
    stock: "In Stock",
    shortDescription:
      "A compact electric sewing machine with 12 built-in stitch patterns for everyday home sewing and alterations.",
    description:
      "Upgrade your stitching experience with the Viraso 12-Stitch Electric Sewing Machine, designed for smooth, convenient, and efficient sewing at home. With 12 built-in stitch patterns, this versatile machine is suitable for a variety of everyday stitching, repairing, alteration, and creative sewing needs. The machine features a user-friendly design that makes it convenient for both beginners and regular users. Its compact and practical construction makes it suitable for home use while providing reliable performance for everyday sewing tasks. Whether you are stitching clothes, making alterations, repairing garments, or working on creative sewing projects, the Viraso 12-Stitch Sewing Machine is designed to make sewing easier and more convenient.",
    features: [
      "12 built-in stitch patterns",
      "Suitable for home and everyday sewing",
      "Easy-to-use operation",
      "Smooth and efficient stitching performance",
      "Suitable for beginners and regular users",
      "Compact and practical design",
      "Ideal for stitching, repairing and alterations",
      "Reliable performance for everyday sewing",
    ],
    specifications: [
      { label: "Model", value: "VS519" },
      { label: "Product Type", value: "12-Stitch Electric Sewing Machine" },
      { label: "Power Type", value: "Electric" },
      { label: "Built-in Stitches", value: "12" },
      { label: "Use Case", value: "Home & everyday sewing" },
    ],
    material: "Metal and durable housing",
    dimensions: "Compact home-use body",
    weight: "Not specified",
    warranty: "Contact support for warranty information",
    whatsIncluded: "Electric sewing machine and standard accessories",
    image: product8Gallery[0],
    gallery: product8Gallery,
  },
];

export const getProductBySlug = (slug: string) =>
  products.find((product) => product.slug === slug);

export const getProductById = (id: string) =>
  products.find((product) => product.id === id);
