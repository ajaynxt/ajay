(() => {
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touchDevice = matchMedia("(pointer: coarse)").matches || innerWidth <= 768;

  const splitWords = () => {
    $$("[data-split]").forEach((element) => {
      const label = element.textContent.trim();
      element.setAttribute("aria-label", label);
      element.innerHTML = label
        .split(/\s+/)
        .map((word) => `<span class="mask" aria-hidden="true"><span class="word">${word}</span></span>`)
        .join(" ");
    });
  };

  const loadVideos = () => {
    $$("video[data-src]").forEach((video) => {
      const media = video.closest(".media");
      video.addEventListener("error", () => {
        media.dataset.missing = "true";
        console.warn(`[Rajmahal] Missing asset: ${video.dataset.src}`);
      });
      video.src = video.dataset.src;
      video.load();
    });
  };

  const showStaticExperience = () => {
    $(".preloader")?.classList.add("is-hidden");
    $(".nav")?.classList.add("visible");
    $$(".word").forEach((word) => {
      word.style.transform = "none";
      word.style.opacity = "1";
    });
    $$(".scrub-chapter video").forEach((video) => {
      video.addEventListener("loadedmetadata", () => {
        video.currentTime = Math.min(0.1, video.duration || 0);
        video.pause();
      }, { once: true });
    });
  };

  const initMotion = () => {
    const { gsap, ScrollTrigger, Lenis } = window;
    if (!gsap || !ScrollTrigger) {
      showStaticExperience();
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const lenis = !reducedMotion && Lenis
      ? new Lenis({ duration: 1.05, smoothWheel: true })
      : null;

    if (lenis) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }

    if (reducedMotion) {
      showStaticExperience();
      return;
    }

    const preloader = gsap.timeline();
    preloader
      .to(".preloader-letter", { y: 0, opacity: 1, stagger: 0.07, ease: "power2.out" })
      .to(".preloader-line", { scaleX: 1, duration: 0.7, ease: "expo.out" }, "<.15")
      .to(".preloader", { yPercent: -100, duration: 0.9, ease: "expo.inOut", delay: 0.35 })
      .from(".hero .word", { yPercent: 110, stagger: 0.08, duration: 1.1, ease: "expo.out" }, "-=.35");

    const counter = { value: 0 };
    gsap.to(counter, {
      value: 100,
      duration: 1.55,
      onUpdate: () => {
        const element = $(".preloader-count");
        if (element) element.textContent = String(Math.round(counter.value)).padStart(3, "0");
      },
    });

    $$(".reveal").forEach((element) => {
      gsap.from($$(".word", element), {
        yPercent: 120,
        stagger: 0.055,
        duration: 1,
        ease: "expo.out",
        scrollTrigger: { trigger: element, start: "top 82%" },
      });
    });

    const scrubVideo = (selector, distance) => {
      const section = $(selector);
      const video = $("video", section);
      if (!section || !video || touchDevice) return;

      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: `+=${distance}%`,
        pin: true,
        scrub: 1,
        onUpdate: (state) => {
          const targetTime = video.duration * state.progress;
          if (video.duration && Math.abs(video.currentTime - targetTime) > 0.04) {
            video.currentTime = targetTime;
          }
          gsap.set($(".chapter-progress i", section), { scaleY: state.progress });
        },
      });
    };

    scrubVideo("#hero", 380);
    scrubVideo("#arrival", 320);
    scrubVideo("#night", 360);

    if (touchDevice) {
      $$(".scrub-chapter video").forEach((video) => {
        video.addEventListener("loadedmetadata", () => {
          video.currentTime = Math.min(0.1, video.duration || 0);
          video.pause();
        }, { once: true });
      });
    } else {
      gsap.to(".suite-track", {
        xPercent: -66.66,
        ease: "none",
        scrollTrigger: { trigger: "#suite", start: "top top", end: "+=260%", pin: true, scrub: 1 },
      });
      gsap.to(".portfolio-rail", {
        xPercent: -38,
        ease: "none",
        scrollTrigger: { trigger: "#portfolio", start: "top bottom", end: "bottom top", scrub: 1 },
      });
    }

    gsap.timeline({ scrollTrigger: { trigger: "#hero", start: "top top", end: "+=300%", scrub: 1 } })
      .to(".hero-title", { y: -120, opacity: 0, ease: "power2.out" }, 0.15)
      .fromTo(".hero-second", { y: 80, opacity: 0 }, { y: 0, opacity: 1, ease: "expo.out" }, 0.45);

    gsap.timeline({ scrollTrigger: { trigger: "#arrival", start: "top top", end: "+=280%", scrub: 1 } })
      .from(".arrival-copy .line-a", { xPercent: -120, opacity: 0 })
      .from(".arrival-copy .line-b", { xPercent: 120, opacity: 0 }, "<.2")
      .to(".jali-wipe", { opacity: 0.55, scale: 1, duration: 0.2 })
      .to(".jali-wipe", { opacity: 0, duration: 0.18 });

    gsap.fromTo(
      ".pool-window",
      { clipPath: "polygon(42% 12%,50% 0,58% 12%,68% 8%,78% 20%,78% 88%,22% 88%,22% 20%,32% 8%)" },
      {
        clipPath: "polygon(0 0,100% 0,100% 100%,0 100%)",
        ease: "expo.inOut",
        scrollTrigger: { trigger: "#pool", start: "top 75%", end: "top top", scrub: 1 },
      },
    );

    gsap.to(".float-1", { y: -100, scrollTrigger: { trigger: "#pool", scrub: 1 } });
    gsap.to(".float-2", { y: -180, scrollTrigger: { trigger: "#pool", scrub: 1 } });

    $$(".count").forEach((element) => {
      gsap.fromTo(
        element,
        { textContent: 0 },
        {
          textContent: Number(element.dataset.count),
          duration: 1.8,
          snap: { textContent: 1 },
          ease: "power2.out",
          scrollTrigger: { trigger: element, start: "top 85%", once: true },
        },
      );
    });
  };

  const initPlayback = () => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const video = $("video", entry.target);
        if (!video) return;
        if (entry.intersectionRatio >= 0.5) video.play().catch(() => {});
        else video.pause();
      });
    }, { threshold: [0.1, 0.5, 0.9] });

    $$(".autoplay").forEach((section) => observer.observe(section));
  };

  const initNavigation = () => {
    let lastScroll = 0;
    let ticking = false;
    addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = scrollY;
        const nav = $(".nav");
        nav?.classList.toggle("visible", y > innerHeight * 0.7);
        nav?.classList.toggle("hidden", y > lastScroll && y > innerHeight);
        lastScroll = y;
        ticking = false;
      });
    }, { passive: true });
  };

  const initCursor = () => {
    if (touchDevice || !window.gsap) return;
    const cursor = $(".cursor");
    if (!cursor) return;
    const moveX = gsap.quickTo(cursor, "x", { duration: 0.22, ease: "power2.out" });
    const moveY = gsap.quickTo(cursor, "y", { duration: 0.22, ease: "power2.out" });
    addEventListener("pointermove", (event) => {
      moveX(event.clientX);
      moveY(event.clientY);
    }, { passive: true });
    $$("a,button,.suite-card").forEach((element) => {
      element.addEventListener("pointerenter", () => cursor.classList.add("view"));
      element.addEventListener("pointerleave", () => cursor.classList.remove("view"));
    });
  };

  splitWords();
  loadVideos();
  initPlayback();
  initNavigation();
  addEventListener("load", () => {
    initMotion();
    initCursor();
  }, { once: true });
})();
