"use client";

import { useEffect, useState } from "react";
import { getPartnerLogos, type PartnerLogoItem } from "@/lib/efficiency-center";
import { useReveal } from "@/hooks/useReveal";

function PartnerLogoItemView({ partner }: { partner: PartnerLogoItem }) {
  const [placeholder, setPlaceholder] = useState(false);

  return (
    <div className={`partners__logo ${placeholder ? "partners__logo--placeholder" : ""}`}>
      {!placeholder && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={partner.logo}
          alt={`${partner.name} logo`}
          width={120}
          height={80}
          loading="lazy"
          className="partners__logo-img--color"
          onError={() => setPlaceholder(true)}
          draggable={false}
        />
      )}
    </div>
  );
}

export default function Partners() {
  const intro = useReveal({ stagger: true });
  const [partners, setPartners] = useState<PartnerLogoItem[]>([]);

  // getPartnerLogos() fetches from Strapi, so this runs client-side.
  useEffect(() => {
    let cancelled = false;

    getPartnerLogos().then((data) => {
      if (cancelled) return;
      setPartners(data);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const half = Math.ceil(partners.length / 2);
  const row1 = partners.slice(0, half);
  const row2 = partners.slice(half);

  return (
    <section className="section partners" id="partners">
      <div className="container">
        <div className={`partners__intro ${intro.className}`} ref={intro.ref}>
          <h2 className="section-heading">Our clients</h2>
          <p className="partners__subtext">
            Businesses of all sizes choose Efficiency Center as their workspace. Here are some of the companies that work from our branches.
          </p>
        </div>
      </div>

      <div className="partners__marquee">
        <div className="partners__row partners__row--left">
          <div className="partners__row-inner">
            {[...row1, ...row1].map((partner, i) => (
              <PartnerLogoItemView key={`${partner.name}-${i}`} partner={partner} />
            ))}
          </div>
        </div>
        <div className="partners__row partners__row--right">
          <div className="partners__row-inner">
            {[...row2, ...row2].map((partner, i) => (
              <PartnerLogoItemView key={`${partner.name}-${i}`} partner={partner} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}