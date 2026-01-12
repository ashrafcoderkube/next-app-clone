'use client';

import React, { useMemo } from 'react';
import SafeImage from '../SafeImage';
import { useAppSelector } from '../../redux/hooks';
import { selectThemeData, selectHomeSectionData } from '../../redux/selectors';
import ButtonLink from '../customcomponents/ButtonLink';
import HtmlContent from '../HtmlContent';
import { useTheme } from '@/app/contexts/ThemeContext';

// Type definitions
// interface MarqueeTextProps {
//   items: string[];
//   style?: React.CSSProperties;
// }

// const MarqueeText: React.FC<MarqueeTextProps> = ({
//   items = [],
//   style = {},
// }) => {
//   const repeatedItems = Array(8).fill(items).flat();
//   return (
//     <div className="flex gap-[1rem] text-[0.875rem] mr-[1.875rem] marquee-span items-center">
//       {repeatedItems.map((item, i) => (
//         <React.Fragment key={i}>
//           <span className="uppercase">{item}</span>
//           <span className="dots" style={style} />
//         </React.Fragment>
//       ))}
//     </div>
//   );
// };

interface AdvertisementProps {
  isLoading?: boolean;
}

const Advertisement = React.memo(function Advertisement({ isLoading = false }: AdvertisementProps) {
  const { homeSection } = useAppSelector(selectHomeSectionData);
  const { themeId } = useAppSelector(selectThemeData);
  const themeContext = useTheme() || {};
  const { bottomFooterTextColor, textColor } = themeContext;

  const secondarySection = useMemo(() => {
    return homeSection?.secondary;
  }, [homeSection]);

  // Memoize parsed data to prevent recalculation
  const parsedData = useMemo(() => {
    const parseTags = (tagsString: string | null): string[] => {
      if (!tagsString) return [];
      try {
        // Try parsing as JSON array first
        const parsed = JSON.parse(tagsString);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        // If not JSON, try splitting by comma
        return tagsString
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean);
      }
    };

    return {
      image_url: secondarySection?.image || null,
      title: secondarySection?.title || '',
      content: secondarySection?.content || secondarySection?.description || '',
      tags: parseTags(secondarySection?.tags || null),
      currentThemeId: themeId || 1,
    };
  }, [secondarySection, themeId]);

  const { image_url, title, content, tags, currentThemeId } = parsedData;

  // Skeleton components
  const SkeletonSharedLayout: React.FC = () => (
    <div
      style={{
        backgroundColor:
          themeId == 1
            ? ''
            : themeId == 3
            ? themeContext.backgroundColor
            : themeContext.bottomFooterBackgroundColor,
        color: themeContext.bodyTextColor,
        fontFamily: themeContext.fontFamily,
      }}
    >
      <div className='relative flex items-center justify-center w-full py-[1.875rem] px-container border-radius-xl lg:h-[48.75rem] h-[30rem] overflow-hidden word-break pb-0'>
        {/* Skeleton Image Background */}
        <div className='w-full h-full bg-gray-300 animate-pulse border-radius-xl' />

        <div className='view-collection absolute top-1/2 left-1/2 w-full text-white max-w-[20rem] lg:max-w-[44.5625rem] md:max-w-[40rem] sm:max-w-[35rem] -translate-x-1/2 -translate-y-1/2 category-title p-[20px] sm:p-[2.5rem] md:p-[3.6875rem] border-radius-xl overflow-hidden'>
          <div className='flex flex-col gap-[0.9375rem]'>
            {/* Skeleton Title */}
            <div className='h-8 lg:h-12 bg-gray-400 rounded animate-pulse' />
            {/* Skeleton Description */}
            <div className='h-6 lg:h-8 bg-gray-400 rounded animate-pulse w-3/4' />
            {/* Skeleton Button */}
            <div className='h-12 bg-gray-400 rounded animate-pulse w-40' />
          </div>
        </div>
      </div>
    </div>
  );

  const SkeletonTheme2Layout: React.FC = () => (
    <div
      className='sm:py-[4.375rem] py-[2.5rem]'
      style={{
        backgroundColor:
          themeContext.bottomFooterBackgroundColor || '#f4f691',
        color: bottomFooterTextColor || '#ffffff',
      }}
    >
      <div className='px-container border-radius-xl relative'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-[1.5rem] items-center'>
          {/* Skeleton Image */}
          <div className="w-full relative before:content-[''] before:block before:float-left before:pt-[65%] lg:before:pt-[70.6%] after:content-[''] after:table after:clear-both rounded-[1.125rem] overflow-hidden flex flex-col align-items-center justify-center border-[0.625rem] border-[#ffffff]/45 bg-gray-300 animate-pulse" />

          {/* Skeleton Content */}
          <div>
            <div className='view-collection md:ps-12'>
              <div className='flex flex-col justify-start text-start'>
                {/* Skeleton Title */}
                <div className='h-8 lg:h-12 bg-gray-400 rounded animate-pulse mb-4' />
                {/* Skeleton Description */}
                <div className='h-6 lg:h-8 bg-gray-400 rounded animate-pulse w-4/5 mb-6' />
                {/* Skeleton Button */}
                <div className='h-12 bg-gray-400 rounded animate-pulse w-32' />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const SkeletonTheme6Layout: React.FC = () => (
    <section
      className='py-24 overflow-hidden'
      style={{
        backgroundColor: `${
          themeContext.bottomFooterBackgroundColor || '#1f2937'
        }1A`,
        color: bottomFooterTextColor || '#ffffff',
      }}
    >
      <div className='grid lg:grid-cols-2 gap-0 min-h-[500px] md:min-h-[600px] lg:min-h-[700px] text-left'>
        {/* Left Side - Content Skeleton */}
        <div className='relative z-10 w-full py-12 md:py-16 lg:py-20 lg:max-w-[710px] px-4 sm:px-6 lg:px-8 ml-auto'>
          {/* Badge Skeleton */}
          <div className='h-8 bg-gray-300 rounded-full animate-pulse w-32 mb-4' />

          {/* Title Skeleton */}
          <div className='h-12 md:h-16 lg:h-20 bg-gray-300 rounded animate-pulse mb-6' />

          {/* Description Skeleton */}
          <div className='h-6 md:h-8 lg:h-10 bg-gray-300 rounded animate-pulse w-4/5 mb-8' />

          {/* Button Skeleton */}
          <div className='h-12 bg-gray-300 rounded animate-pulse w-28' />
        </div>

        {/* Right Side - Image Skeleton */}
        <div className='relative h-[400px] md:h-[500px] lg:h-full overflow-hidden bg-gray-300 animate-pulse' />
      </div>
    </section>
  );

  const SharedLayout: React.FC = () => (
    <div
      // className='py-[0.9375rem]'
      style={{
        backgroundColor:
          themeId == 1
            ? ''
            : themeId == 3
            ? themeContext.backgroundColor
            : themeContext.bottomFooterBackgroundColor,
        color: themeContext.bodyTextColor,
        fontFamily: themeContext.fontFamily,
      }}
    >
      {/* {tags?.length > 0 && currentThemeId !== 3 && (
        <Marquee>
          <MarqueeText
            items={tags}
            style={{
              backgroundColor: themeContext.bodyTextColor,
            }}
          />
        </Marquee>
      )} */}

      <div className='relative flex items-center justify-center w-full py-[1.875rem] px-container border-radius-xl lg:h-[48.75rem] h-[30rem] overflow-hidden word-break pb-0'>
        {image_url && (
          <div className='w-full h-full'>
            <SafeImage
              src={image_url}
              alt={title}
              width={1920}
              height={780}
              className='w-full h-full border-radius-xl object-cover'
            />
          </div>
        )}
        <div className='view-collection absolute top-1/2 left-1/2 w-full text-white max-w-[20rem] lg:max-w-[44.5625rem] md:max-w-[40rem] sm:max-w-[35rem] -translate-x-1/2 -translate-y-1/2 category-title p-[20px] sm:p-[2.5rem] md:p-[3.6875rem] border-radius-xl overflow-hidden'>
          <div className='flex flex-col gap-[0.9375rem]'>
            <h2 className='text-lg font-bold text-[1.625rem] lg:text-[2.625rem] whitespace-normal line-clamp-2'>
              {title || ''}
            </h2>
            <div
              className='text-[1rem] lg:text-[22px] whitespace-normal line-clamp-2'
              title={content?.replace(/<[^>]*>?/gm, '') || ''}
            >
              <HtmlContent htmlContent={content} />
            </div>

            <div>
              <ButtonLink
                to='/shop'
                buttonType='collection'
              >
                View Collection
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>

      {/* {tags?.length > 0 && currentThemeId !== 3 && (
        <Marquee direction="right">
          <MarqueeText
            items={tags}
            style={{
              backgroundColor: themeContext.bodyTextColor,
            }}
          />
        </Marquee>
      )} */}
    </div>
  );

  const themeLayout: Record<number, React.ReactElement> = {
    1: isLoading ? <SkeletonSharedLayout /> : <SharedLayout />,
    2: isLoading ? <SkeletonTheme2Layout /> : (
      <div
        className='sm:py-[4.375rem] py-[2.5rem]'
        style={{
          backgroundColor:
            themeContext.bottomFooterBackgroundColor || '#f4f691',
          color: bottomFooterTextColor || '#ffffff',
        }}
      >
        <div className='px-container border-radius-xl relative'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-[1.5rem] items-center'>
            <div className="w-full relative before:content-[''] before:block before:float-left before:pt-[65%] lg:before:pt-[70.6%] after:content-[''] after:table after:clear-both rounded-[1.125rem] overflow-hidden flex flex-col align-items-center justify-center border-[0.625rem] border-[#ffffff]/45">
              {image_url && (
                <SafeImage
                  src={image_url}
                  alt={title}
                  width={800}
                  height={600}
                  className='w-full h-full object-cover absolute top-0 left-0'
                />
              )}
            </div>
            <div>
              <div className='view-collection md:ps-12'>
                <div className='flex flex-col justify-start text-start'>
                  <h2 className='text-lg font-bold text-[1.625rem] lg:text-[2.625rem] whitespace-normal leading-none mb-1 line-clamp-2'>
                    {title}
                  </h2>
                  <div
                    className='text-[1rem] lg:text-[1.375rem] whitespace-normal line-clamp-2'
                    title={content?.replace(/<[^>]*>?/gm, '') || ''}
                  >
                    <HtmlContent htmlContent={content} />
                  </div>

                  <div className='pt-3 md:pt-7.5'>
                    <ButtonLink
                      to='/shop'
                      buttonType='collection'
                    >
                      View Collection
                    </ButtonLink>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    3: isLoading ? <SkeletonSharedLayout /> : <SharedLayout />,
    4: isLoading ? <SkeletonSharedLayout /> : <SharedLayout />,
    5: isLoading ? <SkeletonSharedLayout /> : <SharedLayout />,
    6: isLoading ? <SkeletonTheme6Layout /> : (
      <section
        className='py-24 overflow-hidden'
        style={{
          backgroundColor: `${
            themeContext.bottomFooterBackgroundColor || '#1f2937'
          }1A`,
          color: bottomFooterTextColor || '#ffffff',
        }}
      >
        <div className='grid lg:grid-cols-2 gap-0 min-h-[500px] md:min-h-[600px] lg:min-h-[700px] text-left'>
          {/* Left Side - Content */}
          <div className='relative z-10 w-full py-12 md:py-16 lg:py-20 lg:max-w-[710px] px-4 sm:px-6 lg:px-8 ml-auto'>
            {/* Badge/Label */}
            <span
              className='flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-4 w-fit'
              style={{
                backgroundColor: `${textColor || '#1f2937'}1A`,
                color: textColor || '#1f2937',
              }}
            >
              <span
                className='w-2 h-2 rounded-full'
                style={{
                  backgroundColor: textColor || '#1f2937',
                }}
              ></span>
              Explore Collection
            </span>

            {/* Title */}
            <h2
              className='text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight line-clamp-2'
              style={{
                color: textColor || '#1f2937',
              }}
            >
              {title || ''}
            </h2>

            {/* Description */}
            <div
              className='text-base md:text-lg lg:text-xl mb-8 leading-relaxed line-clamp-2'
              style={{
                color: textColor || '#1f2937',
              }}
              title={content?.replace(/<[^>]*>?/gm, '') || ''}
            >
              <HtmlContent htmlContent={content} />
            </div>

            {/* CTA Button */}
            <div>
              <ButtonLink to='/shop'>Shop Now</ButtonLink>
            </div>
          </div>

          {/* Right Side - Full Image */}
          <div className='relative h-[400px] md:h-[500px] lg:h-full overflow-hidden'>
            {image_url ? (
              <SafeImage
                src={image_url}
                alt={title || ''}
                width={1200}
                height={800}
                className='w-full h-full object-cover transition-transform duration-700 hover:scale-105'
              />
            ) : (
              <div className='w-full h-full bg-gradient-to-br from-[#ecfdf5] to-[#d1fae5]' />
            )}
            {/* Subtle overlay gradient */}
            <div className='absolute inset-0 bg-gradient-to-l from-[#f0fdf4]/10 via-transparent to-transparent' />
          </div>
        </div>
      </section>
    ),
  };

  return themeLayout[currentThemeId] || themeLayout[1];
});

Advertisement.displayName = 'Advertisement';

export default Advertisement;
