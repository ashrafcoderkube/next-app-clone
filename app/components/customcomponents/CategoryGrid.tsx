'use client';

import React, { useCallback } from 'react';
import Link from 'next/link';
import SafeImage from '../SafeImage';
import useEmblaCarousel from 'embla-carousel-react';
import AutoplayEmbla from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '@/app/contexts/ThemeContext';

interface Category {
  sub_category_id?: string | number;
  sub_category_name: string;
  sub_category_image: string;
}

interface CategoryGridProps {
  categories: Category[];
  headerTextColor?: string;
  maxItems?: number;
  gridClasses?: string;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  headerTextColor = '#111111',
  maxItems = 16,
  gridClasses = 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8',
}) => {
  const themeContext = useTheme() || {};
  // Embla Carousel setup
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: 'center',
      slidesToScroll: 1,
      loop: true,
    },
    [AutoplayEmbla({ delay: 3000, stopOnInteraction: true })]
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Show placeholder if there are no categories
  if (!categories || categories.length === 0) {
    return (
      <div className='flex items-center justify-center p-4'>
        <p
          className='text-sm'
          style={{
            color: headerTextColor,
          }}
        >
          No categories found
        </p>
      </div>
    );
  }

  return (
    <>
      <div className='relative w-full'>
        <div className='overflow-hidden'>
          <div
            className='embla'
            ref={emblaRef}
          >
            <div className='embla__container flex h-full'>
              {categories.slice(0, maxItems).map((category, idx) => (
                <div
                  key={category.sub_category_id || idx}
                  className='flex flex-col items-center group flex-[0_0_auto] w-[6.5rem] md:w-[8rem] xl:w-[9rem] px-2'
                >
                  <Link
                    href={`/shop?categories=${encodeURIComponent(
                      category.sub_category_name
                    ).toLowerCase()}`}
                    className='hover-image-card flex flex-col items-center w-full'
                    style={{ textDecoration: 'none' }}
                  >
                    <div className='w-[5rem] h-[5rem] rounded-xl flex items-center justify-center mb-2 overflow-hidden border border-[#666666]/15'>
                      <SafeImage
                        width={80}
                        height={80}
                        src={category.sub_category_image}
                        alt={category.sub_category_name}
                        className='object-cover w-full h-full transition-transform duration-200 hover:scale-105'
                      />
                    </div>
                    <span
                      className='text-xs text-center transition-colors duration-200 block w-full break-words line-clamp-2'
                      style={{
                        color: headerTextColor,
                      }}
                    >
                      {category.sub_category_name}
                    </span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Navigation arrows - visible only on md and larger */}
      </div>
      <div className='hidden md:block animation-section'>
        <button
          className='swiper-button-prev-custom swiper-button-prev z-20 !top-[45%] !left-[10px]'
          onClick={scrollPrev}
          style={{
            color: themeContext?.buttonTextColor || '#ffffff',
          }}
        >
          <ChevronLeft />
        </button>
        <button
          className='swiper-button-next-custom swiper-button-next z-20 !top-[45%] !right-[10px]'
          onClick={scrollNext}
          style={{
            color: themeContext?.buttonTextColor || '#ffffff',
          }}
        >
          <ChevronRight />
        </button>
      </div>
    </>
  );
};

export default CategoryGrid;
