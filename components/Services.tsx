"use client";

import { useEffect, useState } from "react";
import { SERVICE_PILLARS } from "@/lib/profile";
import { withBasePath } from "@/lib/paths";
import { getUnits } from "@/lib/efficiency-center";
import type { UnitWithShape } from "@/lib/efficiency-center";
import { useReveal } from "@/hooks/useReveal";
import Image from "next/image";

export default function Services() {
  const intro = useReveal({ stagger: true });
  const grid = useReveal();
  const [units, setUnits] = useState<UnitWithShape[]>([]);

  // getUnits() fetches from Strapi, so this runs client-side.
  useEffect(() => {
    let cancelled = false;

    getUnits().then((data) => {
      if (cancelled) return;
      setUnits(data);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="services" id="services">
      <div className={`services__intro-block ${intro.className}`} ref={intro.ref}>
        <div className="container services__intro-inner">
          <h2 className="services__title">Everything your business needs under one roof</h2>
        </div>
      </div>

      <div className="services__stories">
        {SERVICE_PILLARS.map((pillar, index) => {
          const num = String(index + 1).padStart(2, "0");
          const isReverse = index % 2 === 1;
          return (
            <article
              key={pillar.slug}
              className={`services__story ${isReverse ? "services__story--reverse" : ""}`}
            >
              <div className="container services__story-grid">
                <div className="services__story-copy">
                  <span className="services__story-num">{num}</span>
                  <h3 className="services__story-title">{pillar.title}</h3>
                  <p className="services__story-text">{pillar.summary}</p>
                </div>
                <div className="services__story-media">
                  <Image
                    src={withBasePath(pillar.image)}
                    alt={pillar.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 60vw"
                    priority={index === 0}
                  />
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="services__units" id="spaces">
        <div className="container">
          <div className="services__units-top">
            <div className="services__units-head">
              <h2 className="services__title services__title--sm">Spaces designed for every need</h2>
            </div>
            <div className="services__units-cta">
              <a
                href="https://wa.me/966581115550?text=Hello%20Efficiency%20Center%2C%20I%20would%20like%20to%20book%20a%20tour.%0A%0A%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%20%D9%85%D8%B1%D9%83%D8%B2%20%D8%A7%D9%84%D9%83%D9%81%D8%A7%D8%A1%D8%A9%D8%8C%20%D8%A3%D8%B1%D8%BA%D8%A8%20%D8%A8%D8%AD%D8%AC%D8%B2%20%D8%AC%D9%88%D9%84%D8%A9."
                className="btn btn--solid btn--pill"
                target="_blank"
                rel="noopener noreferrer"
              >
                Book a tour
              </a>
            </div>
          </div>

          <div className={`units-grid ${grid.className}`} ref={grid.ref}>
            {units.map((unit) => (
              <div
                key={unit.slug}
                className={`unit-card ${unit.shape === "tall" ? "unit-card--featured" : ""}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={unit.image}
                  alt={unit.title}
                  className="unit-card__img"
                  loading="lazy"
                />
                <div className="unit-card__overlay" />
                <div className="unit-card__content">
                  <h3 className="unit-card__title">{unit.title}</h3>
                  <p className="unit-card__detail">{unit.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}