"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getEvents } from "@/lib/efficiency-center";
import type { EventCard } from "@/lib/events";
import { useReveal } from "@/hooks/useReveal";

const COPIES = 3;

export default function Events() {
  const head = useReveal({ stagger: true });
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const startX = useRef(0);
  const scrollStart = useRef(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [events, setEvents] = useState<EventCard[]>([]);

  // getEvents() fetches from Strapi, so this runs client-side.
  useEffect(() => {
    let cancelled = false;

    getEvents().then((data) => {
      if (cancelled) return;
      setEvents(data);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const ITEMS = useMemo(
    () => Array.from({ length: COPIES }, () => events).flat(),
    [events]
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const update = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    setIsMobile(mq.matches);
    const update = () => setIsMobile(mq.matches);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const loopScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track || isMobile) return;
    const oneSet = track.scrollWidth / COPIES;

    if (track.scrollLeft < oneSet || track.scrollLeft > oneSet * (COPIES - 1)) {
      track.style.scrollSnapType = "none";
      if (track.scrollLeft < oneSet) {
        track.scrollLeft += oneSet;
      } else {
        track.scrollLeft -= oneSet;
      }
      requestAnimationFrame(() => {
        track.style.scrollSnapType = "";
      });
    }
  }, [isMobile]);

  const updateScale = useCallback(() => {
    const track = trackRef.current;
    if (!track || reducedMotion || isMobile) return;

    const cards = track.querySelectorAll<HTMLElement>(".events__card");
    const center = track.getBoundingClientRect().left + track.clientWidth / 2;

    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      const cardCenter = rect.left + rect.width / 2;
      const dist = Math.abs(center - cardCenter);
      const maxDist = track.clientWidth * 0.5;
      const progress = Math.max(0, 1 - dist / maxDist);

      const scale = 0.65 + progress * 0.35;
      const opacity = 1;
      const rotateY = (center - cardCenter) / maxDist * 8;

      card.style.transform = `perspective(1200px) scale(${scale}) rotateY(${rotateY}deg)`;
      card.style.opacity = `${opacity}`;
    });
  }, [reducedMotion, isMobile]);

  const onScroll = useCallback(() => {
    loopScroll();
    updateScale();
  }, [loopScroll, updateScale]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const cards = track.querySelectorAll<HTMLElement>(".events__card");

    if (isMobile) {
      cards.forEach((card) => {
        card.style.transform = "";
        card.style.opacity = "";
      });
      track.scrollLeft = 0;
      return;
    }

    const oneSet = track.scrollWidth / COPIES;
    const cardWidth = cards[0]?.offsetWidth ?? 400;
    const gap = 80;
    const keetaOffset = (cardWidth + gap) * 1;
    track.scrollLeft = oneSet * Math.floor(COPIES / 2) + keetaOffset - (track.clientWidth / 2 - cardWidth / 2);
    updateScale();
  }, [updateScale, isMobile, events]);

  useEffect(() => {
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [updateScale]);

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
    <section className="events" id="events">
      <div className="container">
        <div className={`events__head ${head.className}`} ref={head.ref}>
          <h2 className="events__title">Moments that bring the center to life.</h2>
        </div>
      </div>

      <div className="events__carousel">
        <div className="events__fade events__fade--left" aria-hidden="true" />
        <div className="events__fade events__fade--right" aria-hidden="true" />

        <div
          ref={trackRef}
          className="events__track"
          onScroll={onScroll}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          role="region"
          aria-label="Event highlights"
        >
          {ITEMS.map((event, i) => (
            <article
              key={`${event.id}-${i}`}
              className="events__card"
              aria-hidden={i >= events.length && i < ITEMS.length - events.length ? true : undefined}
            >
              {event.video ? (
                <video
                  src={event.video}
                  className="events__card-img"
                  muted
                  loop
                  playsInline
                  autoPlay
                  preload="none"
                  draggable={false}
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={event.image}
                  alt={event.title}
                  className="events__card-img"
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                />
              )}
              <div className="events__card-overlay" />
              <div className="events__card-content">
                <h3 className="events__card-title">{event.title}</h3>
                <p className="events__card-desc">{event.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}