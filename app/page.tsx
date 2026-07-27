"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    gsap: any;
    ScrollTrigger: any;
    Lenis: any;
  }
}

const videos = {
  hero: "/assets/video/01-hero-aerial.mp4",
  arrival: "/assets/video/02-arrival-gate.mp4",
  durbar: "/assets/video/03-durbar-lobby.mp4",
  suite: "/assets/video/04-royal-suite.mp4",
  pool: "/assets/video/05-pool-gardens.mp4",
  night: "/assets/video/06-night-finale.mp4",
};

function VideoBackdrop({ src, className = "", loop = false }: { src: string; className?: string; loop?: boolean }) {
  const [missing, setMissing] = useState(false);
  return (
    <div className={`media ${missing ? "is-missing" : ""} ${className}`}>
      {!missing && <video data-src={src} muted playsInline autoPlay={loop} loop={loop} preload={src.includes("01-") ? "auto" : "metadata"} onError={() => {
        setMissing(true);
        console.warn(`[Rajmahal] Missing asset: ${src}`);
      }} poster={src.includes("01-") ? "/assets/video/poster.jpg" : undefined} />}
      <div className="fallback-shimmer" aria-hidden="true" />
    </div>
  );
}

const SplitWords = ({ children }: { children: string }) => (
  <span className="split" aria-label={children}>
    {children.split(" ").map((word, i) => <span className="mask" key={i}><span className="word">{word}</span></span>)}
  </span>
);

export default function Home() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const boot = () => {
      if (!window.gsap || !window.ScrollTrigger || !window.Lenis || !root.current) return setTimeout(boot, 80);
      const { gsap, ScrollTrigger, Lenis } = window;
      gsap.registerPlugin(ScrollTrigger);
      const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
      const touch = matchMedia("(pointer: coarse)").matches || innerWidth <= 768;
      const lenis = reduced ? null : new Lenis({ duration: 1.2, smoothWheel: true });
      if (lenis) {
        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add((time: number) => lenis.raf(time * 1000));
        gsap.ticker.lagSmoothing(0);
      }

      document.querySelectorAll<HTMLVideoElement>("video").forEach(v => {
        const src = v.dataset.src;
        if (src) v.src = src;
      });

      const pre = gsap.timeline();
      pre.to(".preloader-letter", { y: 0, opacity: 1, stagger: .07, ease: "power2.out" })
        .to(".preloader-line", { scaleX: 1, duration: .7, ease: "expo.out" }, "<.15")
        .to(".preloader", { yPercent: -100, duration: .9, ease: "expo.inOut", delay: .45 })
        .from(".hero .word", { yPercent: 110, stagger: .08, duration: 1.1, ease: "expo.out" }, "-=.35");
      gsap.to({ n: 0 }, { n: 100, duration: 1.65, onUpdate() {
        const el = document.querySelector(".preloader-count");
        if (el) el.textContent = String(Math.round(this.targets()[0].n)).padStart(3, "0");
      }});

      document.querySelectorAll(".reveal").forEach(el => gsap.from((el as HTMLElement).querySelectorAll(".word"), {
        yPercent: 120, stagger: .055, duration: 1, ease: "expo.out",
        scrollTrigger: { trigger: el, start: "top 82%" }
      }));

      const scrubVideo = (section: string, distance = 320) => {
        const el = document.querySelector<HTMLElement>(section);
        const v = el?.querySelector<HTMLVideoElement>("video");
        if (!el || !v || reduced || touch) return;
        v.pause();
        v.autoplay = false;
        ScrollTrigger.create({
          trigger: el, start: "top top", end: `+=${distance}%`, pin: true, scrub: 1,
          onUpdate: (s: any) => {
            if (v.duration && Math.abs(v.currentTime - v.duration * s.progress) > .04) v.currentTime = v.duration * s.progress;
            gsap.set(el.querySelector(".chapter-progress i"), { scaleY: s.progress });
          }
        });
      };
      scrubVideo("#hero", 380); scrubVideo("#arrival", 320); scrubVideo("#night", 360);

      gsap.timeline({ scrollTrigger: { trigger: "#hero", start: "top top", end: "+=300%", scrub: 1 } })
        .to(".hero-title", { y: -120, opacity: 0, ease: "power2.out" }, .15)
        .fromTo(".hero-second", { y: 80, opacity: 0 }, { y: 0, opacity: 1, ease: "expo.out" }, .45);
      gsap.timeline({ scrollTrigger: { trigger: "#arrival", start: "top top", end: "+=280%", scrub: 1 } })
        .from(".arrival-copy .line-a", { xPercent: -120, opacity: 0 })
        .from(".arrival-copy .line-b", { xPercent: 120, opacity: 0 }, "<.2")
        .to(".jali-wipe", { opacity: .55, scale: 1, duration: .2 })
        .to(".jali-wipe", { opacity: 0, duration: .18 });

      const observer = new IntersectionObserver(entries => entries.forEach(e => {
        const video = e.target.querySelector<HTMLVideoElement>("video");
        if (!video) return;
        if (e.intersectionRatio >= .5) video.play().catch(() => {});
        else video.pause();
      }), { threshold: [.1, .5, .9] });
      document.querySelectorAll(".autoplay").forEach(el => observer.observe(el));

      document.querySelectorAll(".count").forEach(el => {
        const n = Number(el.getAttribute("data-count"));
        gsap.fromTo(el, { textContent: 0 }, { textContent: n, duration: 1.8, snap: { textContent: 1 }, ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true }});
      });
      if (!touch) gsap.to(".suite-track", { xPercent: -66.66, ease: "none", scrollTrigger: { trigger: "#suite", start: "top top", end: "+=260%", pin: true, scrub: 1 } });
      gsap.fromTo(".pool-window", { clipPath: "polygon(42% 12%,50% 0,58% 12%,68% 8%,78% 20%,78% 88%,22% 88%,22% 20%,32% 8%)" },
        { clipPath: "polygon(0 0,100% 0,100% 100%,0 100%)", ease: "expo.inOut", scrollTrigger: { trigger: "#pool", start: "top 75%", end: "top top", scrub: 1 }});
      gsap.to(".float-1", { y: -100, scrollTrigger: { trigger: "#pool", scrub: 1 }});
      gsap.to(".float-2", { y: -180, scrollTrigger: { trigger: "#pool", scrub: 1 }});
      if (!touch) gsap.to(".portfolio-rail", { xPercent: -38, ease: "none", scrollTrigger: { trigger: "#portfolio", start: "top bottom", end: "bottom top", scrub: 1 }});

      let last = 0;
      addEventListener("scroll", () => {
        const y = scrollY, nav = document.querySelector(".nav");
        nav?.classList.toggle("visible", y > innerHeight * .7);
        nav?.classList.toggle("hidden", y > last && y > innerHeight);
        last = y;
      }, { passive: true });

      const cursor = document.querySelector<HTMLElement>(".cursor");
      if (!touch && cursor) {
        addEventListener("mousemove", e => gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: .25, ease: "power2.out" }));
        document.querySelectorAll("a,button,.suite-card").forEach(el => {
          el.addEventListener("mouseenter", () => cursor.classList.add("view"));
          el.addEventListener("mouseleave", () => cursor.classList.remove("view"));
        });
      }
      const magnetic = document.querySelector<HTMLElement>(".magnetic");
      magnetic?.addEventListener("mousemove", (e: MouseEvent) => {
        const r = magnetic.getBoundingClientRect();
        gsap.to(magnetic, { x: (e.clientX - r.left - r.width / 2) * .12, y: (e.clientY - r.top - r.height / 2) * .12, duration: .35 });
      });
      magnetic?.addEventListener("mouseleave", () => gsap.to(magnetic, { x: 0, y: 0 }));
      return () => { observer.disconnect(); lenis?.destroy(); ScrollTrigger.getAll().forEach((t: any) => t.kill()); };
    };
    const cleanup = boot();
    return () => { if (typeof cleanup === "function") cleanup(); };
  }, []);

  return (
    <div ref={root}>
      <Script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js" strategy="afterInteractive" />
      <Script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js" strategy="afterInteractive" />
      <Script src="https://cdn.jsdelivr.net/npm/lenis@1.3.11/dist/lenis.min.js" strategy="afterInteractive" />
      <div className="preloader"><div className="preloader-name">{"RAJMAHAL".split("").map((l,i)=><span key={i} className="preloader-letter">{l}</span>)}</div><i className="preloader-line"/><span className="preloader-count">000</span></div>
      <div className="grain"/><div className="cursor"><span>VIEW</span></div>
      <nav className="nav"><a href="#hero" className="brand" aria-label="AJAY NXT home">AN</a><div><a href="#durbar">The Palace</a><a href="#suite">Suites</a><a href="#pool">Experiences</a><a href="#reserve">AJAY NXT</a></div></nav>
      <div className="edge-number" aria-hidden="true">01 <i/> 06</div>

      <main>
        <section id="hero" className="chapter hero">
          <VideoBackdrop src={videos.hero}/>
          <div className="vignette"/>
          <div className="hero-title"><p className="eyebrow">THE RAJMAHAL PALACE · UDAIPUR</p><h1><SplitWords>Where Kings Once Dreamed</SplitWords></h1></div>
          <h2 className="hero-second"><em>Now, You Will.</em></h2>
          <div className="scroll-cue"><i/>Scroll to descend</div><div className="chapter-progress"><i/></div>
        </section>

        <section id="arrival" className="chapter arrival">
          <VideoBackdrop src={videos.arrival}/><div className="vignette"/>
          <p className="eyebrow chapter-label">01 — THE ARRIVAL</p>
          <h2 className="arrival-copy"><span className="line-a">Through gates carved</span><span className="line-b">by a hundred hands</span></h2>
          <div className="jali-wipe"/><div className="chapter-progress"><i/></div>
        </section>

        <section id="durbar" className="chapter durbar autoplay">
          <div className="durbar-video"><VideoBackdrop src={videos.durbar} loop/></div>
          <div className="ivory-panel">
            <p className="eyebrow dark">02 — THE DURBAR HALL</p>
            <h2 className="reveal"><SplitWords>A welcome written in marble and light.</SplitWords></h2>
            <p>Beyond the scalloped arches, history lingers in hand-painted ceilings, mirrored stone and the quiet ceremony of arrival.</p>
            <div className="facts"><span><b className="count" data-count="1743">1743</b>Year Founded</span><span><b className="count" data-count="92">92</b>Royal Suites</span><span><b className="count" data-count="14">14</b>Garden Acres</span></div>
          </div>
        </section>

        <section id="suite" className="chapter suite autoplay">
          <VideoBackdrop src={videos.suite} loop/><div className="vignette"/>
          <div className="suite-heading"><p className="eyebrow">03 — PRIVATE WORLDS</p><h2 className="reveal"><SplitWords>The Maharaja Suites</SplitWords></h2></div>
          <div className="suite-track">
            {[["The Maharaja Suite","A private kingdom above the lake."],["The Moon Palace","Silver light, carved stone, perfect silence."],["The Mewar Residence","A garden courtyard held entirely yours."]].map((x,i)=>
              <article className="suite-card" key={x[0]}><span>0{i+1}</span><h3>{x[0]}</h3><p>{x[1]}</p><small>From ₹80,000 / night</small></article>)}
          </div>
        </section>

        <section id="pool" className="chapter pool autoplay">
          <div className="pool-window"><VideoBackdrop src={videos.pool} loop/><div className="vignette"/></div>
          <p className="eyebrow pool-label">04 — POOL & GARDENS</p>
          <span className="floating float-1">Stillness</span><span className="floating float-2">Marigold</span><span className="floating float-3">Dawn</span>
        </section>

        <section id="night" className="chapter night">
          <VideoBackdrop src={videos.night}/><div className="vignette"/>
          <div className="night-content"><p className="eyebrow">05 — AFTER DARK</p><h2 className="reveal"><SplitWords>Some places you visit. This one, you remember.</SplitWords></h2>
            <a id="reserve" className="reserve magnetic" href="https://ajaynxt.com" target="_blank" rel="noreferrer">Explore AJAY NXT <span>↗</span></a>
          </div><div className="chapter-progress"><i/></div>
        </section>
      </main>

      <section id="portfolio" className="portfolio">
        <div className="portfolio-head">
          <p className="eyebrow">AJAY NXT · PERSONAL CONCEPT SHOWCASE</p>
          <h2>Ideas in motion.<br/><em>Built to be remembered.</em></h2>
          <p>A self-initiated luxury hospitality demo by Ajay Saini—created to showcase cinematic web direction, development, motion and visual storytelling.</p>
        </div>
        <div className="portfolio-viewport">
          <div className="portfolio-rail">
            <a className="work-card work-card-gold" href="https://diamondrestaurants.com/" target="_blank" rel="noreferrer">
              <span>01 · WEBSITE + SYSTEM</span><div className="work-orbit"/><h3>Diamond<br/>Restaurants</h3><p>Premium restaurant experience, responsive build and an easy content system.</p><b>View live project ↗</b>
            </a>
            <article className="work-card work-card-teal">
              <span>02 · PRODUCT CONCEPT</span><div className="route-line"/><h3>Move<br/>To Go</h3><p>Customer app, rider experience, live tracking and an operations dashboard.</p><b>Mobility architecture ↗</b>
            </article>
            <article className="work-card work-card-rose">
              <span>03 · FILM + DIGITAL</span><div className="film-frame">▶</div><h3>Wedding<br/>Stories</h3><p>Cinematic pacing, colour, music-led storytelling and digital presentation.</p><b>Selected collaborations ↗</b>
            </article>
            <a className="work-card work-card-ivory" href="https://ajaynxt.com" target="_blank" rel="noreferrer">
              <span>04 · COMPLETE PORTFOLIO</span><div className="an-mark">AN</div><h3>Create<br/>What’s Next.</h3><p>Web design, development, app UI, video editing and AI creative systems.</p><b>Visit ajaynxt.com ↗</b>
            </a>
          </div>
        </div>
        <div className="capability-marquee"><div><span>WEB DESIGN</span><i>✦</i><span>DEVELOPMENT</span><i>✦</i><span>APP UI</span><i>✦</i><span>VIDEO EDITING</span><i>✦</i><span>AI CREATIVE</span><i>✦</i><span>WEB DESIGN</span><i>✦</i><span>DEVELOPMENT</span><i>✦</i><span>APP UI</span></div></div>
      </section>

      <section className="creator">
        <div className="creator-index">AJAY<br/>NXT</div>
        <div className="creator-copy">
          <p className="eyebrow">CREATOR OF THIS EXPERIENCE</p>
          <h2>Ajay Saini</h2>
          <p className="creator-manifesto">I don’t decorate screens. I turn ambitious ideas into digital experiences that are impossible to ignore.</p>
          <p>I’m Ajay Saini—the creator behind AJAY NXT. From premium websites and app experiences to cinematic edits and AI-powered visuals, I combine design, development and storytelling to make good businesses look unforgettable.</p>
          <div className="creator-tags"><span>Web Design</span><span>Development</span><span>App UI</span><span>Video Editing</span><span>AI Creative</span></div>
        </div>
        <div className="creator-contact">
          <p>Available for projects across India and worldwide.</p>
          <p>Currently in Shimla, Himachal Pradesh<br/>From Narsara · Ramgarh Shekhawati · Sikar, Rajasthan 331024</p>
          <a href="https://ajaynxt.com" target="_blank" rel="noreferrer">ajaynxt.com ↗</a>
          <a href="https://www.instagram.com/ajay_nxt_/" target="_blank" rel="noreferrer">@ajay_nxt_ ↗</a>
          <a href="https://wa.me/919929562585" target="_blank" rel="noreferrer">WhatsApp: +91 99295 62585 ↗</a>
          <a href="mailto:ajayx3neha@gmail.com">ajayx3neha@gmail.com ↗</a>
        </div>
      </section>
      <footer><div className="footer-top"><div><p className="eyebrow dark">THE RAJMAHAL PALACE</p><h2>Where imagination becomes experience.</h2></div><div className="footer-links"><a href="#durbar">Palace</a><a href="#suite">Suites</a><a href="#pool">Experiences</a><a href="https://ajaynxt.com" target="_blank" rel="noreferrer">AJAY NXT</a></div></div><div className="jali-border"/><div className="footer-bottom"><span>A fictional luxury hospitality concept</span><span>Designed & built by Ajay Saini · AJAY NXT</span></div></footer>
    </div>
  );
}
