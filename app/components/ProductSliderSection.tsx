'use client';

import { useSelector } from 'react-redux';
import CardComponent from './customcomponents/CardComponent';
import { useTheme } from '../contexts/ThemeContext';
import { useEffect, useState, useCallback } from 'react';
import { fetchSimilarProducts } from '../redux/slices/productSlice';
import { useAppDispatch } from '../redux/hooks';
import { useParams } from 'next/navigation';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function ProductSliderSection() {
  const { slug } = useParams<{ slug: string }>();
  const dispatch = useAppDispatch();
  const { similarProducts, loading } = useSelector(
    (state: any) => state.products
  );
  const themeId = useSelector((state: any) => state.storeInfo?.themeId);
  const themeContext = useTheme() || {};
  const { buttonBackgroundColor = '#111111', buttonTextColor = '#ffffff' } =
    themeContext;

  useEffect(() => {
    if (slug) {
      dispatch(fetchSimilarProducts(slug));
    }
  }, [dispatch, slug]);

  // Embla Carousel setup - consistent with CategorySlider
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: 'start',
      slidesToScroll: 1,
      loop: false, // Set to false to allow proper prev/next disabling at ends
    }
    // [Autoplay({ delay: 3000, stopOnInteraction: true })]
  );

  // Track scroll state (same as CategorySlider)
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
      emblaApi.on('slidesChanged', updateScrollState); // Extra safety
    }
  }, [emblaApi, updateScrollState]);

  const scrollPrev = useCallback(() => {
    if (emblaApi && canScrollPrev) emblaApi.scrollPrev();
  }, [emblaApi, canScrollPrev]);

  const scrollNext = useCallback(() => {
    if (emblaApi && canScrollNext) emblaApi.scrollNext();
  }, [emblaApi, canScrollNext]);

  // Disable buttons if no products or at boundaries
  const hasNoSlides = !similarProducts || similarProducts.length === 0;
  const isPrevDisabled = hasNoSlides || !canScrollPrev;
  const isNextDisabled = hasNoSlides || !canScrollNext;

  // Re-init carousel when data changes (helps with image loading)
  useEffect(() => {
    if (emblaApi && similarProducts?.length > 0) {
      const timer = setTimeout(() => {
        emblaApi.reInit();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [similarProducts, emblaApi]);

  // Loading state with skeleton cards (similar to CategorySlider)

  return (
    <div
      className={themeId === 6 ? 'py-16 md:py-24 bg-white' : 'py-padding-100'}
    >
      {similarProducts && similarProducts.length > 0 && (
        <section
          className='px-container similar-products-section animation-section word-break'
          style={
            {
              '--button-color': buttonBackgroundColor,
            } as React.CSSProperties
          }
        >
          {/* Title Section */}
          {themeId === 6 ? (
            <div className='flex items-center gap-2 mb-4'>
              <span className='w-2 h-2 bg-[#10b981] rounded-full'></span>
              <p className='uppercase text-sm font-medium text-[#10b981]'>
                Similar Products
              </p>
            </div>
          ) : (
            <p
              className='uppercase'
              style={{
                color:
                  themeId === 3
                    ? buttonBackgroundColor
                    : themeId === 6
                    ? '#10b981'
                    : '#000',
              }}
            >
              Similar Products
            </p>
          )}

          <h2
            className={
              themeId === 6
                ? 'text-3xl md:text-4xl lg:text-5xl font-bold text-[#1e293b] mb-8 md:mb-12'
                : 'text-[2rem] lg:text-[2.625rem] font-bold mb-[1.25rem] lg:mb-5.5'
            }
          >
            You might also like
          </h2>

          {/* Carousel */}
          <div className='relative'>
            <div
              className='embla overflow-hidden'
              ref={emblaRef}
            >
              <div className='embla__container flex'>
                {similarProducts.map((item: any, index: number) => (
                  <div
                    key={item.id || index}
                    className='embla__slide w-1/2 md:w-1/3 lg:w-1/4 flex-shrink-0 min-w-0'
                  >
                    <div className='w-full px-3 h-full'>
                      <CardComponent product={item} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Buttons - hidden on mobile, visible on md+ */}
            <div className='animation-section'>
              <button
                className={`swiper-button-prev-custom swiper-button-prev z-20 !top-[45%] ${
                  isPrevDisabled ? 'swiper-button-disabled' : ''
                }`}
                onClick={scrollPrev}
                disabled={isPrevDisabled}
                style={{
                  backgroundColor: buttonBackgroundColor,
                  color: buttonTextColor,
                }}
              >
                <ChevronLeft className='w-6 h-6' />
              </button>
              <button
                className={`swiper-button-next-custom swiper-button-next z-20 !top-[45%] ${
                  isNextDisabled ? 'swiper-button-disabled' : ''
                }`}
                onClick={scrollNext}
                disabled={isNextDisabled}
                style={{
                  backgroundColor: buttonBackgroundColor,
                  color: buttonTextColor,
                }}
              >
                <ChevronRight className='w-6 h-6' />
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default ProductSliderSection;
