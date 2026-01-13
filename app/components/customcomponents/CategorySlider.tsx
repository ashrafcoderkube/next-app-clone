'use client';

import React, {
  useEffect,
  useMemo,
  useCallback,
  useState,
} from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { RootState } from "../../redux/store";
import CustomCategoryCard from "./CustomCategoryCard";
import { fetchProductCategories } from "@/app/redux/slices/productSlice";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { selectProductCategories } from "@/app/redux/selectors";

export default function CategorySlider() {
  const themeContext = useTheme() || {};
  const dispatch = useAppDispatch();
  const { textColor } = themeContext;
  const isSwiper = (themeContext?.categoryLayout || "swiper") === "swiper";
  const { categories, loading } = useAppSelector(selectProductCategories);

  useEffect(() => {
    if (categories.length === 0) {
      dispatch(fetchProductCategories());
    }
  }, [dispatch, categories.length]);

  // Embla Carousel setup
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: 'start',
      slidesToScroll: 1, // Always scroll one slide at a time for smooth movement
    }
    // [Autoplay({ delay: 2000, stopOnInteraction: true })]
  );

  // Track scroll state
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateScrollState = useCallback(() => {
    if (emblaApi) {
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    }
  }, [emblaApi]);

  useEffect(() => {
    if (emblaApi) {
      updateScrollState();
      emblaApi.on('select', updateScrollState);
      emblaApi.on('reInit', updateScrollState);
    }
  }, [emblaApi, updateScrollState]);

  const scrollPrev = useCallback(() => {
    if (emblaApi && canScrollPrev) emblaApi.scrollPrev();
  }, [emblaApi, canScrollPrev]);

  const scrollNext = useCallback(() => {
    if (emblaApi && canScrollNext) emblaApi.scrollNext();
  }, [emblaApi, canScrollNext]);

  // Check if there are no slides or not enough slides to scroll
  const hasNoSlides = categories.length === 0;
  const isPrevDisabled = hasNoSlides || !canScrollPrev;
  const isNextDisabled = hasNoSlides || !canScrollNext;

  if (loading) {
    const skeletonItems = Array.from({ length: 8 }, (_, idx) => ({
      sub_category_id: idx,
      sub_category_name: '',
      sub_category_image: '',
    }));

    return (
      <div className='px-container'>
        {isSwiper ? (
          <div className='newsSlider-wrapper'>
            <div className='relative'>
              <div className='flex gap-6 overflow-hidden'>
                {skeletonItems.slice(0, 4).map((item, idx) => (
                  <div
                    key={idx}
                    className='flex-shrink-0'
                    style={{ width: '280px' }}
                  >
                    <CustomCategoryCard
                      isLoading={true}
                      isSwiper={isSwiper}
                      item={item}
                      index={idx}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <section className='py-padding-100'>
            <div className='grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 xxl:grid-cols-5 gap-4'>
              {skeletonItems.map((item, idx) => (
                <CustomCategoryCard
                  key={idx}
                  isLoading={true}
                  item={item}
                  index={idx}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  return (
    <>
      <div className='px-container'>
        {isSwiper ? (
          <div
            className='newsSlider-wrapper'
            style={
              {
                '--button-color':
                  themeContext?.buttonBackgroundColor || '#111111',
              } as React.CSSProperties
            }
          >
            {categories.length > 0 ? (
              <>
                <div
                  className='relative'
                  style={
                    {
                      '--button-color':
                        themeContext?.buttonBackgroundColor || '#111111',
                    } as React.CSSProperties
                  }
                >
                  <div
                    className='embla overflow-hidden'
                    ref={emblaRef}
                  >
                    <div className='embla__container flex justify-center align-center'>
                      {categories.map((item, idx) => (
                        <div
                          key={item.sub_category_id || idx}
                          className='embla__slide w-1/2 md:w-1/3 lg:w-1/4 flex-shrink-0 min-w-0'
                        >
                          <CustomCategoryCard
                            isSwiper={isSwiper}
                            item={item}
                            index={idx}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Navigation arrows - always visible */}
                  <div className='hidden md:block animation-section'>
                    <button
                      className={`swiper-button-prev-custom swiper-button-prev swiper-button-prev1 ${isPrevDisabled ? "swiper-button-disabled" : ""
                        }`}
                      onClick={scrollPrev}
                      disabled={isPrevDisabled}
                      style={{
                        backgroundColor:
                          themeContext?.buttonBackgroundColor || '#111111',
                        color: themeContext?.buttonTextColor || '#ffffff',
                      }}
                    >
                      <ChevronLeft className='w-6 h-6' />
                    </button>
                    <button
                      className={`swiper-button-next-custom swiper-button-next swiper-button-next1 ${isNextDisabled ? "swiper-button-disabled" : ""
                        }`}
                      onClick={scrollNext}
                      disabled={isNextDisabled}
                      style={{
                        backgroundColor:
                          themeContext?.buttonBackgroundColor || '#111111',
                        color: themeContext?.buttonTextColor || '#ffffff',
                      }}
                    >
                      <ChevronRight className='w-6 h-6' />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className='flex items-center justify-center p-4'>
                <p
                  className='text-sm'
                  style={{
                    color: textColor,
                  }}
                >
                  No categories found
                </p>
              </div>
            )}
          </div>
        ) : (
          <section className='py-padding-100'>
            {categories.length > 0 ? (
              <div className='grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 xxl:grid-cols-5 gap-4'>
                {categories.map((item, idx) => (
                  <CustomCategoryCard
                    key={item.sub_category_id || idx}
                    item={item}
                    index={idx}
                  />
                ))}
              </div>
            ) : (
              <div className='flex items-center justify-center p-4'>
                <p
                  className='text-sm'
                  style={{
                    color: textColor,
                  }}
                >
                  No categories found
                </p>
              </div>
            )}
          </section>
        )}
      </div>
    </>
  );
}
