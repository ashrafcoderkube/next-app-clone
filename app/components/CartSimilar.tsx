"use client";

import { useAppDispatch, useAppSelector } from "../redux/hooks";
import CardComponent from "./customcomponents/CardComponent";
import { useEffect, useCallback } from "react";
import { fetchNewArrivals } from "../redux/slices/productSlice";
import { useTheme } from "../contexts/ThemeContext";
import SwiperNavButton from "./customcomponents/SwiperNavButton";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

function CartSimilar() {
  const dispatch = useAppDispatch();
  const { newArrivals } = useAppSelector((state) => state.products);
  const { theme, buttonTextColor } = useTheme() || {};

  // Embla Carousel setup
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: "start",
      slidesToScroll: 1,
      breakpoints: {
        "(min-width: 640px)": { slidesToScroll: 2 },
        "(min-width: 768px)": { slidesToScroll: 3 },
        "(min-width: 1024px)": { slidesToScroll: 4 },
        "(min-width: 1280px)": { slidesToScroll: 5 },
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
    dispatch(fetchNewArrivals());
  }, [dispatch]);

  return (
    <div className="pb-5 sm:pb-[80px]">
      {newArrivals?.length > 0 && (
        <>
          <section className="px-container ">
            <h6 className="text-[2rem] lg:text-[2.625rem] font-bold pl-[10px] text-left">
              You May Also Like
            </h6>
            <div>
              <div
                className="relative overflow-hidden"
                style={
                  {
                    "--button-color": theme?.buttonBackgroundColor || "#111111",
                  } as React.CSSProperties
                }
              >
                <div className="embla" ref={emblaRef}>
                  <div className="embla__container flex">
                    {newArrivals?.length > 0 &&
                      newArrivals.map((item, index) => (
                        <div
                          key={index}
                          className="embla__slide flex-[0_0_auto] min-w-0 pl-6 first:pl-0"
                        >
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
                      backgroundColor:
                        theme?.buttonBackgroundColor || "#111111",
                      color: buttonTextColor || "#ffffff",
                    }}
                  >
                    ‹
                  </button>
                  <button
                    className="similar-products-slider-next swiper-button-next"
                    onClick={scrollNext}
                    style={{
                      backgroundColor:
                        theme?.buttonBackgroundColor || "#111111",
                      color: buttonTextColor || "#ffffff",
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

export default CartSimilar;
