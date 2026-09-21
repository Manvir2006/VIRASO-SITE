import { promises as fs } from "fs";
import path from "path";

export type SocialLinks = {
  instagram: string;
  youtube: string;
  facebook: string;
};

const dataDir = path.join(process.cwd(), "data", "website");
const socialLinksFile = path.join(dataDir, "social-links.json");

const defaults: SocialLinks = {
  instagram: "https://www.instagram.com/viraso_official?stkn=ZWM1djF1d2JyOWpw",
  youtube: "https://youtube.com/@virasoindia?si=nCkBxidKvEny91YP",
  facebook: "https://www.facebook.com/share/1Ci84kDEz8/",
};

function isSafeSocialUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && ["instagram.com", "www.instagram.com", "youtube.com", "www.youtube.com", "youtu.be", "facebook.com", "www.facebook.com"].includes(url.hostname.toLowerCase());
  } catch {
    return false;
  }
}

export function validateSocialLinks(input: Partial<SocialLinks>): SocialLinks {
  const links = {
    instagram: String(input.instagram || "").trim(),
    youtube: String(input.youtube || "").trim(),
    facebook: String(input.facebook || "").trim(),
  };
  if (!isSafeSocialUrl(links.instagram) || !isSafeSocialUrl(links.youtube) || !isSafeSocialUrl(links.facebook)) {
    throw new Error("Use valid HTTPS Instagram, YouTube, and Facebook URLs.");
  }
  return links;
}

async function ensureStore() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(socialLinksFile);
  } catch {
    await fs.writeFile(socialLinksFile, JSON.stringify(defaults, null, 2), "utf8");
  }
}

export async function getSocialLinks() {
  await ensureStore();
  try {
    const raw = await fs.readFile(socialLinksFile, "utf8");
    return validateSocialLinks(JSON.parse(raw));
  } catch {
    return defaults;
  }
}

export async function saveSocialLinks(input: Partial<SocialLinks>) {
  const links = validateSocialLinks(input);
  await ensureStore();
  await fs.writeFile(socialLinksFile, JSON.stringify(links, null, 2), "utf8");
  return links;
}
