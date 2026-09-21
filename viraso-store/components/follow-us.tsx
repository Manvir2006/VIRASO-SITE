"use client";

import { useEffect, useState } from "react";
import { FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa";

type SocialLinks = { instagram: string; youtube: string; facebook: string };

const platforms = [
  { key: "instagram" as const, label: "Instagram", Icon: FaInstagram },
  { key: "youtube" as const, label: "YouTube", Icon: FaYoutube },
  { key: "facebook" as const, label: "Facebook", Icon: FaFacebookF },
];

export function FollowUs() {
  const [links, setLinks] = useState<SocialLinks | null>(null);

  useEffect(() => {
    fetch("/api/social-links", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => setLinks(data))
      .catch(() => setLinks(null));
  }, []);

  if (!links) return null;

  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white">Follow Us</h3>
      <p className="mt-4 max-w-xs text-sm leading-6 text-white/70">Follow Viraso on social media for product updates, new launches, offers, videos and company updates.</p>
      <div className="mt-5 flex flex-wrap gap-3">
        {platforms.map(({ key, label, Icon }) => (
          <a
            key={key}
            href={links[key]}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Follow Viraso on ${label}`}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/5 text-xl text-white transition duration-200 hover:scale-105 hover:border-white hover:bg-white hover:text-[#0d2946]"
            title={label}
          >
            <Icon aria-hidden="true" />
          </a>
        ))}
      </div>
    </div>
  );
}
