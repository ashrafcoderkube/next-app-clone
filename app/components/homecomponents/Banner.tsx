'use client';

import React, { useEffect } from 'react';
import ButtonLink from '../customcomponents/ButtonLink';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchHomeSection } from '../../redux/slices/homeSection';
import { selectHomeSectionData } from '../../redux/selectors';
import Slider from '../customcomponents/Slider';
import SafeImage from '../SafeImage';
import HtmlContent from '../HtmlContent';
import BannerSkeleton from '../customcomponents/BannerSkeleton';
import { getFromSessionStorage, setToSessionStorage } from '../../utils/sessionStorage';

const SingleImage = React.memo(function SingleImage({ data }: { data: any }) {
  // Support both API structure (image) and component structure (image_url)
  const imageUrl = data?.image_url || data?.image;

  return (
    <div className='hero-overlay relative'>
      {imageUrl && (
        <div className="relative before:content-[''] before:block before:float-left before:pt-[100%] md:before:pt-[45%] after:content-[''] after:table after:clear-both bg-[#f2f2f2] h-full w-full">
          <SafeImage
            src={imageUrl}
            alt={data?.title || 'Hero Image'}
            className='absolute top-0 left-0 object-cover transition-all duration-500'
            width={1920}
            height={1080}
            style={{ aspectRatio: '16/9', objectFit: 'cover', height: '100%' }}
          />
        </div>
      )}
      <div className='content-wrapper'>
        <div>
          {data?.title && (
            <p className='text-[1.625rem] lg:text-[52px] uppercase text-white mb-[8px] font-bold line-clamp-2'>
              {data?.title || 'Wardrobe Refresh'}
            </p>
          )}
          {data?.content && (
            <div
              className='text-[1.625rem] lg:text-[52px] uppercase text-white mb-[8px] font-bold line-clamp-2 px-6'
              title={data?.content?.replace(/<[^>]*>?/gm, '') || ''}
            >
              <HtmlContent htmlContent={data?.content} />
            </div>
          )}

          <div>
            <ButtonLink
              to='/shop'
              buttonType='banner'
            >
              View Collection
            </ButtonLink>
          </div>
        </div>
      </div>
    </div>
  );
});

const Video = React.memo(function Video({ data }: { data: any }) {
  // Support both API structure (video) and component structure (video_url)
  const videoUrl = data?.video_url || data?.video;

  return (
    <div className='hero-overlay relative'>
      {videoUrl && (
        <div className='w-full h-full'>
          <video
            src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${videoUrl}`}
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
          />
        </div>
      )}
      <div className='content-wrapper'>
        <div>
          <p className='text-[1.625rem] lg:text-[52px] uppercase text-white sm:mb-[8px] mb-4 font-bold line-clamp-2 px-6'>
            {data?.title || 'Wardrobe Refresh'}
          </p>
          <div
            className='uppercase text-white sm:mb-[8px] mb-4 text-base sm:text-[1.625rem] lg:text-[22px]'
            title={data?.content?.replace(/<[^>]*>?/gm, '') || ''}
          >
            <HtmlContent htmlContent={data?.content} />
          </div>
          <div>
            <ButtonLink
              to='/shop'
              buttonType='banner'
            >
              View Collection
            </ButtonLink>
          </div>
        </div>
      </div>
    </div>
  );
});

const Banner = React.memo(function Banner() {
  const dispatch = useAppDispatch();
  const { homeSection, loading } = useAppSelector(selectHomeSectionData);

  // Fetch home section data on component mount with session storage caching
  useEffect(() => {
    const cacheKey = 'home_section_data';
    const cachedData = getFromSessionStorage(cacheKey);
    
    if (cachedData) {
      // If cached data exists, manually update the Redux state
      // We need to dispatch a custom action since we can't directly call fulfilled
      dispatch({ type: 'homeSection/fetchHomeSection/fulfilled', payload: cachedData });
    } else {
      // If no cached data, make the API call
      dispatch(fetchHomeSection())
        .unwrap()
        .then((result) => {
          if (result) {
            // Cache the successful response (the full response object)
            setToSessionStorage(cacheKey, result);
          }
        })
        .catch((error) => {
          console.error('Error fetching home section:', error);
        });
    }
  }, [dispatch]);

  // Get hero section from Redux state
  const heroSection = homeSection?.hero;

  // Show loading state
  if (loading) {
    return <BannerSkeleton />;
  }

  // If no hero section data, show placeholder
  if (!heroSection) {
    return <SingleImage data={null} />;
  }

  // Handle slider type - use first image from slider_files
  if (heroSection?.hero_type === 'slider') {
    return <Slider data={heroSection} />;
  }

  // Handle image type
  if (heroSection?.hero_type === 'image') {
    return <SingleImage data={heroSection} />;
  }

  // Handle video type
  if (heroSection?.hero_type === 'video') {
    return <Video data={heroSection} />;
  }

  // Default fallback
  return <SingleImage data={heroSection} />;
});

Banner.displayName = 'Banner';

export default Banner;
