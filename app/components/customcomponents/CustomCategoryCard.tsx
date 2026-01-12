'use client';

import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppSelector } from '@/app/redux/hooks';
import { RootState } from '@/app/redux/store';
import SafeImage from '../SafeImage';
import { useRouter } from 'next/navigation';

// Category item interface
interface CategoryItem {
  sub_category_id?: number;
  sub_category_name: string;
  sub_category_image: string;
  product_count?: number;
  products_count?: number;
  count?: number;
}

interface CustomCategoryCardProps {
  item: CategoryItem;
  index?: number;
  isSwiper?: boolean;
  isLoading?: boolean;
}

export default function CustomCategoryCard({
  item,
  index = 0,
  isSwiper = false,
  isLoading = false,
}: CustomCategoryCardProps) {
  const router = useRouter();
  const themeContext = useTheme() || {};
  const { textColor } = themeContext;
  const themeId = useAppSelector((state: RootState) => state.storeInfo.themeId);

  const goToShop = () =>
    router.push(
      `/shop?categories=${encodeURIComponent(
        item.sub_category_name
      ).toLowerCase()}`
    );

  // -------------------------------------------------
  // THEME VARIANTS FOR ALL 6 THEMES
  // Uses CSS classes that work with theme CSS files
  // -------------------------------------------------
  const variants = {
    1: {
      outerWrapper: null,
      wrapper:
        "hover-image-card w-full relative before:content-[''] before:block before:float-left before:pt-[125%] after:content-[''] after:table after:clear-both bg-[#f2f2f2] rounded-[1.125rem] flex flex-col flex-shrink-0 overflow-hidden cursor-pointer",
      imageWrapper:
        'w-full h-full absolute top-0 left-0 rounded-[1.125rem] overflow-hidden',
      imageClass:
        'w-full h-full absolute top-0 left-0 object-cover rounded-[1.125rem]',
      titleWrapper:
        'absolute bottom-[-5px] category-title px-2 py-[1rem] 2xl:py-[1.5rem] rounded-lg rounded-t-none overflow-hidden left-0 right-0',
      title:
        'text-sm font-bold sm:text-[1.125rem] whitespace-normal !text-white',
      extra: null,
    },

    2: {
      outerWrapper: null,
      wrapper:
        "w-full relative before:content-[''] before:block before:float-left before:pt-[100%] after:content-[''] after:table after:clear-both bg-[#f2f2f2] rounded-[1.125rem] flex flex-col flex-shrink-0 overflow-hidden cursor-pointer border-[0.1px] border-[#dedede]",
      imageWrapper: 'absolute w-full h-full top-0 left-0 object-cover',
      imageClass: 'w-full h-full absolute top-0 left-0 object-cover',
      titleWrapper:
        'bg-white rounded-[0.625rem] p-6 z-10 absolute max-w-[18.125rem] w-full bottom-6 -inset-x-1/2 mx-auto border-[0.1px] border-[#dedede]',
      title: 'font-medium text-2xl',
      extra: (
        <div className='underline font-semibold cursor-pointer'>Shop Now</div>
      ),
    },

    3: {
      outerWrapper: 'newsSlider-wrapper mb-[2.75rem]',
      wrapper:
        'my-box w-full relative bg-[#f2f2f2] rounded-[1.125rem] flex flex-col flex-shrink-0 overflow-hidden cursor-pointer',
      imageWrapper:
        'my-box-image w-full h-full absolute top-0 left-0 rounded-[1.125rem] overflow-hidden',
      imageClass: 'w-full h-full absolute top-0 left-0 object-cover',
      titleWrapper: 'my-category category-title',
      title:
        'text-sm sm:text-[1.125rem] font-bold text-white whitespace-normal',
      extra: null,
    },

    4: {
      outerWrapper: null,
      wrapper:
        'my-box w-full relative rounded-[1.125rem] flex flex-col flex-shrink-0 overflow-hidden cursor-pointer',
      imageWrapper:
        'aspect-[4/4] overflow-hidden relative border-radius-xl img-radius-xl',
      imageClass:
        'w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 bg-gray-200',
      titleWrapper: 'p-[1rem] flex flex-col text-start',
      title:
        'flex flex-col items-start justify-between font-bold text-xl !line-clamp-1',
      extra: <span>Explore Collection</span>,
    },

    5: {
      outerWrapper: null,
      wrapper:
        'my-box w-full relative rounded-[1.125rem] flex flex-col flex-shrink-0 overflow-hidden cursor-pointer',
      imageWrapper:
        'aspect-[4/4] overflow-hidden relative border-radius-xl img-radius-xl',
      imageClass:
        'w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 bg-gray-200',
      titleWrapper: 'p-[1rem] flex flex-col text-start',
      title: 'flex flex-col items-start justify-between font-bold text-xl',
      extra: <span>Explore Collection</span>,
    },
    6: {
      outerWrapper: null,
      wrapper:
        "my-box w-full relative before:content-[''] before:block before:float-left before:pt-[118%] after:content-[''] after:table after:clear-both bg-[#f2f2f2] rounded-[1.125rem] flex flex-col flex-shrink-0 overflow-hidden cursor-pointer group",
      imageWrapper:
        'w-full h-full absolute top-0 left-0 rounded-[1.125rem] overflow-hidden',
      imageClass:
        'w-full h-full absolute top-0 left-0 object-cover rounded-[1.125rem] transition-transform duration-700 group-hover:scale-110',
      titleWrapper:
        'absolute bottom-0 category-title px-4 py-6 rounded-lg rounded-t-none overflow-hidden left-0 right-0 z-10',
      title: 'text-lg font-bold sm:text-xl whitespace-normal text-white mb-1',
      extra: null,
    },
  };

  const v = variants[themeId as keyof typeof variants] || variants[1];

  // Skeleton component for loading state
  const SkeletonCard = () => (
    <div className={v.outerWrapper || ""}>
      <div className="relative">
        <div
          className={`${v.wrapper} animate-pulse`}
          style={
            themeId === 4 || themeId === 5 || themeId === 6
              ? {
                  border: "1px solid rgba(16, 16, 16, 0.06)",
                  borderRadius: themeId === 5 ? "0" : "1rem",
                }
              : undefined
          }
        >
          {/* Skeleton Image */}
          <div className={v.imageWrapper}>
            <div className={`${v.imageClass} bg-gray-300`} />
          </div>

          {/* Skeleton Overlay for Theme 6 */}
          {themeId === 6 && (
            <div className="absolute inset-0 bg-gradient-to-t from-gray-400/60 via-gray-400/40 to-transparent z-[5] pointer-events-none" />
          )}

          {/* Skeleton Number Badge for Theme 6 */}
          {themeId === 6 && (
            <div className="absolute top-5 left-5 w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center z-10">
              <div className="w-4 h-4 bg-gray-400 rounded" />
            </div>
          )}

          {/* Skeleton Arrow Icon for Theme 6 */}
          {themeId === 6 && (
            <div className="absolute bottom-10 right-5 w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center shadow-lg z-10">
              <div className="w-4 h-4 bg-gray-400 rounded" />
            </div>
          )}

          {themeId !== 3 && (
            <div
              className={v.titleWrapper}
              style={
                themeId === 2
                  ? {
                      backgroundColor: "#f9f9f9",
                    }
                  : undefined
              }
            >
              {/* Skeleton Title */}
              <div
                className={`${v.title} bg-gray-300 rounded h-6 mb-2`}
                style={{
                  backgroundColor: themeId === 1 || themeId === 6 ? 'rgba(255,255,255,0.3)' : '#e5e7eb',
                  color: 'transparent'
                }}
              >
                <span className="invisible">Skeleton Title</span>
              </div>

              {/* Skeleton Product Count for Theme 6 */}
              {themeId === 6 && (
                <div className="h-4 bg-gray-300 rounded w-16 mb-3" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
              )}

              {/* Skeleton Progress line for Theme 6 */}
              {themeId === 6 && (
                <div className="mt-4 h-0.5 bg-gray-300 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                  <div className="h-full w-0 bg-gray-400 rounded-full" />
                </div>
              )}

              {/* Skeleton Extra content */}
              {v.extra && (
                <div className="h-4 bg-gray-300 rounded w-20 mt-2" style={{ color: 'transparent' }}>
                  <span className="invisible">Shop Now</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Skeleton Title for Theme 3 */}
        {themeId === 3 && (
          <div className={v.titleWrapper}>
            <div className={`${v.title} bg-gray-300 rounded h-6`}>
              <span className="invisible">Skeleton Title</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Render skeleton if loading
  if (isLoading) {
    return <SkeletonCard />;
  }

  return (
    <div className={v.outerWrapper || ''}>
      <div className='relative p-3'>
        <div
          className={v.wrapper}
          onClick={goToShop}
          style={
            themeId === 4 || themeId === 5 || themeId === 6
              ? {
                  border: '1px solid rgba(16, 16, 16, 0.06)',
                  borderRadius: themeId === 5 ? '0' : '1rem',
                }
              : undefined
          }
        >
          {/* IMAGE */}
          <div className={v.imageWrapper}>
            <SafeImage
              src={item.sub_category_image}
              alt={item.sub_category_name}
              className={v.imageClass}
              width={400}
              height={400}
              isBlur={true}
            />
          </div>

          {/* Overlay for Theme 6 */}
          {themeId === 6 && (
            <div
              className={`absolute inset-0 bg-gradient-to-t from-[#111]/60 via-[#111]/40 to-transparent group-hover:from-[#111]/70 group-hover:via-[#111]/50 transition-colors pointer-events-none z-[5] `}
            />
          )}

          {/* Number Badge for Theme 6 */}
          {themeId === 6 && (
            <div className='absolute top-5 left-5 w-10 h-10 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center z-10 pointer-events-none'>
              <span className='text-lg font-bold text-[#1e293b]'>
                {String(index + 1).padStart(2, '0')}
              </span>
            </div>
          )}

          {/* Arrow Icon for Theme 6 - Show on hover */}
          {themeId === 6 && (
            <div className='absolute bottom-10 right-5 w-10 h-10 rounded-lg bg-white flex items-center justify-center transform translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 shadow-lg z-10 pointer-events-none'>
              <svg
                width='16'
                height='16'
                viewBox='0 0 16 16'
                fill='none'
                className=''
                style={{
                  color: themeContext?.buttonBackgroundColor,
                }}
              >
                <path
                  d='M4 12L12 4M12 4H6M12 4V10'
                  stroke='currentColor'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </div>
          )}

          {themeId !== 3 && (
            <div
              className={v.titleWrapper}
              style={
                themeId === 2
                  ? {
                      backgroundColor: themeContext?.backgroundColor,
                      color: textColor,
                    }
                  : undefined
              }
            >
              <h3
                className={v.title}
                style={{ color: themeContext?.bodyTextColor }}
              >
                {item.sub_category_name}
              </h3>
              {themeId === 6 &&
                (item.product_count || item.products_count || item.count) !==
                  undefined && (
                  <p className='text-white/70 text-sm'>
                    {item.product_count || item.products_count || item.count}{' '}
                    Products
                  </p>
                )}

              {/* Progress line for Theme 6 */}
              {themeId === 6 && (
                <div className='mt-4 h-0.5 bg-white/20 rounded-full overflow-hidden'>
                  <div
                    className='h-full w-0 group-hover:w-full transition-all duration-700 rounded-full'
                    style={{
                      backgroundColor: themeContext?.buttonBackgroundColor,
                    }}
                  />
                </div>
              )}
              {v.extra && <div style={{ color: textColor }}>{v.extra}</div>}
            </div>
          )}
        </div>
        {themeId === 3 && (
          <div
            className={v.titleWrapper}
            // style={
            //   themeId === 2
            //     ? {
            //         backgroundColor: themeContext?.backgroundColor,
            //         color: textColor,
            //         fontFamily: themeContext?.fontFamily,
            //       }
            //     : undefined
            // }
          >
            <h3 className={v.title}>{item.sub_category_name}</h3>
            {v.extra && (
              <div
                className='text-sm'
                style={{ color: textColor }}
              >
                {v.extra}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
