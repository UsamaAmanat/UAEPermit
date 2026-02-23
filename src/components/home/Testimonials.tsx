"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";

const Testimonials = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

const reviews = [
  {
    id: 1,
    name: "Yuting Hygge",
    rating: 5,
    review:
      "Process was so fast — submitted docs in morning, visa done by evening.",
  },
  {
    id: 2,
    name: "Syrine Chedly",
    rating: 5,
    review:
      "Extremely satisfied — smooth, transparent, professional visa service.",
  },
  {
    id: 3,
    name: "Panos Voulgaris",
    rating: 5,
    review:
      "Super fast service — visa for my wife in less than <strong>24 hours.</strong>",
  },
  {
    id: 4,
    name: "Prashant Bahadur",
    rating: 5,
    review:
      "Professional service — visa in less than <strong>12 hours</strong>, highly recommended.",
  },
  {
    id: 5,
    name: "Nazmira Singh",
    rating: 5,
    review:
      "Friendly consultant and fast services from start to finish.",
  },
  {
    id: 6,
    name: "Hardip Nagra",
    rating: 5,
    review:
      "Great communication and excellent response despite time difference.",
  },
  {
    id: 7,
    name: "Melle",
    rating: 5,
    review:
      "Quick and easy! Responded via WhatsApp, got fast approval.",
  },
  {
    id: 8,
    name: "Clifford",
    rating: 5,
    review:
      "Seamless, easy process — visa in hand within hours.",
  },
  {
    id: 9,
    name: "Dipta Chopra",
    rating: 5,
    review:
      "Easiest experience — guided via WhatsApp, visa done in under <strong>24 hrs.</strong>",
  },
  {
    id: 10,
    name: "Annelia Els",
    rating: 5,
    review:
      "Excellent assistance, clear communication and hassle free process.",
  },
];

  // Duplicate reviews for seamless infinite scroll
  const duplicatedReviews = [...reviews, ...reviews, ...reviews];

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Auto scroll effect (desktop only)
  useEffect(() => {
    if (isMobile) return; // Disable auto-scroll on mobile

    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let animationFrame: number;

    const startScrolling = () => {
      const scroll = () => {
        if (!isPaused && !isDragging && scrollContainer) {
          scrollContainer.scrollLeft += 1;

          // Reset scroll position for infinite loop
          if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 3) {
            scrollContainer.scrollLeft = 0;
          }
        }
        animationFrame = requestAnimationFrame(scroll);
      };
      animationFrame = requestAnimationFrame(scroll);
    };

    startScrolling();

    return () => cancelAnimationFrame(animationFrame);
  }, [isPaused, isDragging, isMobile]);

  // Update current index based on scroll position
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      if (isMobile) {
        const containerWidth = scrollContainer.offsetWidth;
        const scrollPosition = scrollContainer.scrollLeft;
        const index =
          Math.round(scrollPosition / containerWidth) % reviews.length;
        setCurrentIndex(index);
      } else {
        const cardWidth = 380 + 24; // card width + gap
        const scrollPosition = scrollContainer.scrollLeft;
        const index = Math.round(scrollPosition / cardWidth) % reviews.length;
        setCurrentIndex(index);
      }
    };

    scrollContainer.addEventListener("scroll", handleScroll);
    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, [reviews.length, isMobile]);

  // Smooth mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMobile) return;
    setIsDragging(true);
    setIsPaused(true);
    setStartX(e.pageX - (scrollRef.current?.offsetLeft || 0));
    setScrollLeft(scrollRef.current?.scrollLeft || 0);
    if (scrollRef.current) {
      scrollRef.current.style.scrollBehavior = "auto";
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || isMobile) return;
    e.preventDefault();
    const x = e.pageX - (scrollRef.current?.offsetLeft || 0);
    const walk = x - startX;
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (scrollRef.current) {
      scrollRef.current.style.scrollBehavior = "smooth";
    }
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      if (scrollRef.current) {
        scrollRef.current.style.scrollBehavior = "smooth";
      }
    }
  };

  return (
    <div className="py-12 md:py-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        {/* Heading */}
        <h2 className="text-[22px] md:text-[28px] lg:text-[36px] font-medium text-black text-center mb-8 md:mb-12">
          Reviews
        </h2>
      </div>

      {/* Reviews Carousel - Full Width */}
      <div
        ref={scrollRef}
        className={`flex gap-4 md:gap-6 overflow-x-auto pb-6 md:pb-8 select-none hide-scrollbar ${
          !isMobile ? "cursor-grab active:cursor-grabbing md:px-8" : "px-4"
        }`}
        style={{
          scrollSnapType: isMobile ? "x mandatory" : "none",
          scrollBehavior: isMobile ? "auto" : "smooth",
          WebkitOverflowScrolling: "touch",
        }}
        onMouseEnter={() => !isMobile && setIsPaused(true)}
        onMouseLeave={() => {
          if (!isMobile) {
            setIsPaused(false);
            handleMouseLeave();
          }
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {(isMobile ? reviews : duplicatedReviews).map((review, index) => (
          <div
            key={`${review.id}-${index}`}
            className="flex-shrink-0 bg-white border-2 border-[#62E9C9]/30 rounded-3xl p-4 md:p-6 shadow-sm"
            style={{
              scrollSnapAlign: isMobile ? "center" : "none",
              scrollSnapStop: isMobile ? "always" : "normal",
              width: isMobile ? "calc(100% - 32px)" : "380px",
            }}
          >
            {/* Name and Stars */}
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h3 className="text-[13px] md:text-[14px] font-bold text-black">
                {review.name}
              </h3>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    width="16"
                    height="16"
                    viewBox="0 0 19 19"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M0 18.1517H18.1517V0H0V18.1517Z" fill="#00B67A" />
                    <path
                      d="M9.07587 12.2354L11.8366 11.5346L12.9904 15.089L9.07587 12.2354ZM15.4258 7.6394H10.5666L9.072 3.06274L7.57738 7.6394H2.71808L6.65199 10.4737L5.15745 15.0503L9.09135 12.216L11.5113 10.4775L15.4258 7.64328V7.6394Z"
                      fill="white"
                    />
                  </svg>
                ))}
              </div>
            </div>

            {/* Review Text */}
            <div
              className="text-[12px] md:text-[14px] font-medium text-black leading-relaxed"
              dangerouslySetInnerHTML={{ __html: review.review }}
            />
          </div>
        ))}
      </div>

      {/* Pagination Dots - Only show active */}
      <div className="flex justify-center gap-2 mt-8">
        {reviews.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full transition-colors ${
              currentIndex === index ? "bg-[#62E9C9]" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Testimonials;
