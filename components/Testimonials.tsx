"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PixelAvatar from "@/components/PixelAvatar";
import { GOOGLE_MAPS_REVIEWS_URL } from "@/lib/testimonials";
import type { Testimonial } from "@/lib/testimonials";
import { getTestimonials } from "@/lib/efficiency-center";
import { useReveal } from "@/hooks/useReveal";

const COPIES = 3;

export default function Testimonials() {
  const head = useReveal({ stagger: true });
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const startX = useRef(0);
  const scrollStart = useRef(0);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  // getTestimonials() fetches from Strapi, so this runs client-side.
  useEffect(() => {
    let cancelled = false;

    getTestimonials().then((data) => {
      if (cancelled) return;
      setTestimonials(data);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const ITEMS = useMemo(
    () => Array.from({ length: COPIES }, () => testimonials).flat(),
    [testimonials]
  );

  const loopScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const oneSet = track.scrollWidth / COPIES;
    if (track.scrollLeft < oneSet) {
      track.scrollLeft += oneSet;
    } else if (track.scrollLeft > oneSet * (COPIES - 1)) {
      track.scrollLeft -= oneSet;
    }
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const oneSet = track.scrollWidth / COPIES;
    track.scrollLeft = oneSet * Math.floor(COPIES / 2);
  }, [testimonials]);

  const onScroll = useCallback(() => {
    loopScroll();
  }, [loopScroll]);

  const onPointerDown = (e: React.PointerEvent) => {
    const track = trackRef.current;
    if (!track) return;
    dragging.current = true;
    startX.current = e.clientX;
    scrollStart.current = track.scrollLeft;
    track.setPointerCapture(e.pointerId);
    track.style.cursor = "grabbing";
    track.style.scrollSnapType = "none";
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const track = trackRef.current;
    if (!track) return;
    const dx = e.clientX - startX.current;
    track.scrollLeft = scrollStart.current - dx;
  };

  const onPointerUp = (e: React.PointerEvent) => {
    dragging.current = false;
    const track = trackRef.current;
    if (!track) return;
    track.releasePointerCapture(e.pointerId);
    track.style.cursor = "";
    track.style.scrollSnapType = "";
  };

  return (
    <section className="testimonials" id="testimonials" aria-labelledby="testimonials-heading">
      <div className="testimonials__inner container">
        <div className={`testimonials__head ${head.className}`} ref={head.ref}>
          <h2 id="testimonials-heading" className="testimonials__title">
            What our members say
          </h2>
          <p className="testimonials__lead">
            Real feedback from teams who work from Efficiency Center on the Al-Khobar Corniche.
          </p>
        </div>

        <div className="testimonials__carousel">
          <div className="testimonials__fade testimonials__fade--left" aria-hidden="true" />
          <div className="testimonials__fade testimonials__fade--right" aria-hidden="true" />

          <div
            ref={trackRef}
            className="testimonials__track"
            onScroll={onScroll}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            role="region"
            aria-label="Testimonial quotes"
          >
            {ITEMS.map((item, i) => (
              <article
                key={`${item.id}-${i}`}
                className="testimonials__card"
                aria-hidden={i >= testimonials.length && i < ITEMS.length - testimonials.length ? true : undefined}
              >
                <div className="testimonials__card-media">
                  <PixelAvatar seed={item.id} variant={item.silhouette} className="testimonials__portrait" />
                </div>
                <div className="testimonials__card-body">
                  <blockquote className="testimonials__quote">{item.quote}</blockquote>
                  <footer className="testimonials__meta">
                    <cite className="testimonials__attribution">
                      {item.name}, {item.role}
                    </cite>
                  </footer>
                </div>
              </article>
            ))}
          </div>
        </div>

        <p className="testimonials__source">
          <a href={GOOGLE_MAPS_REVIEWS_URL} target="_blank" rel="noopener noreferrer">
            Read all reviews on Google Maps
          </a>
        </p>
      </div>
    </section>
  );
}