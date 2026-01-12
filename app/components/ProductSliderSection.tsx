"use client";

import { useSelector } from "react-redux";
import CardComponent from "./customcomponents/CardComponent";
import { useTheme } from "../contexts/ThemeContext";
import SwiperNavButton from "./customcomponents/SwiperNavButton";
import { useEffect, useState, useCallback } from "react";
import { fetchSimilarProducts } from "../redux/slices/productSlice";
import { useAppDispatch } from "../redux/hooks";
import { useParams } from "next/navigation";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

function ProductSliderSection() {
  const { slug } = useParams<{ slug: string }>();
  const dispatch = useAppDispatch();
  const { similarProducts } = useSelector((state: any) => state.products);
  const themeId = useSelector((state: any) => state.storeInfo?.themeId);
  const themeContext = useTheme() || {};

  // Embla Carousel setup
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: 'start',
      slidesToScroll: 1,
      breakpoints: {
        '(min-width: 640px)': { slidesToScroll: 2 },
        '(min-width: 768px)': { slidesToScroll: 3 },
        '(min-width: 1024px)': { slidesToScroll: 4 },
        '(min-width: 1280px)': { slidesToScroll: 5 },
      },
    },
    [Autoplay({ delay: 4000, stopOnInteraction: true })]
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);


  useEffect(() => {
    if (slug) {
      dispatch(fetchSimilarProducts(slug));
    }
  }, [dispatch, slug]);

  // This runs ONLY when data + images are actually in DOM
  useEffect(() => {
    if (similarProducts?.length === 0) return;

    // Wait for images to load + next tick
    const timer = setTimeout(() => {
      // Embla Carousel handles updates automatically
    }, 150);

    return () => clearTimeout(timer);
  }, [similarProducts]);

  return (
    <div
      className={themeId === 6 ? "py-16 md:py-24 bg-white" : "py-padding-100 "}
    >
      {similarProducts?.length > 0 && (
        <>
          <section
            className="px-container similar-products-section word-break"
            style={{
              "--button-color": themeContext?.buttonBackgroundColor || "#111111",
            } as React.CSSProperties}
          >
            {themeId === 6 ? (
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 bg-[#10b981] rounded-full"></span>
                <p className="uppercase text-sm font-medium text-[#10b981]">
                  Similar Products
                </p>
              </div>
            ) : (
              <p
                className="uppercase"
                style={{
                  color:
                    themeId === 3
                      ? themeContext?.buttonBackgroundColor
                      : themeId === 6
                        ? "#10b981"
                        : "#000",
                }}
              >
                Similar Products
              </p>
            )}
            <h2
              className={
                themeId === 6
                  ? "text-3xl md:text-4xl lg:text-5xl font-bold text-[#1e293b] mb-8 md:mb-12"
                  : "text-[2rem] lg:text-[2.625rem] font-bold mb-[1.25rem] lg:mb-5.5"
              }
            >
              You might also like
            </h2>
            <div>
              <div
                className="relative overflow-hidden"
                style={{
                  "--button-color": themeContext?.buttonBackgroundColor || "#111111",
                } as React.CSSProperties}
              >
                <div className="embla" ref={emblaRef}>
                  <div className="embla__container flex">
                    {similarProducts?.length > 0 &&
                      similarProducts.map((item: any, index: number) => (
                        <div key={index} className="embla__slide flex-[0_0_auto] min-w-0 pl-6 first:pl-0">
                          <CardComponent product={item} />
                        </div>
                      ))}
                  </div>
                </div>

                {/* Navigation arrows - visible only on md and larger (desktop) */}
                <div className="hidden md:block">
                  <button
                    className="similar-products-slider-prev swiper-button-prev"
                    onClick={scrollPrev}
                    style={{
                      backgroundColor: themeContext?.buttonBackgroundColor || "#111111",
                      color: themeContext?.buttonTextColor || "#ffffff",
                    }}
                  >
                    ‹
                  </button>
                  <button
                    className="similar-products-slider-next swiper-button-next"
                    onClick={scrollNext}
                    style={{
                      backgroundColor: themeContext?.buttonBackgroundColor || "#111111",
                      color: themeContext?.buttonTextColor || "#ffffff",
                    }}
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default ProductSliderSection;
