'use client';

import React, { useEffect } from 'react';
import ButtonLink from '../customcomponents/ButtonLink';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchHomeSection } from '../../redux/slices/homeSection';
import { selectHomeSectionData } from '../../redux/selectors';
import Slider from '../customcomponents/Slider';
import SafeImage from '../SafeImage';
import HtmlContent from '../HtmlContent';
import {
  getFromSessionStorage,
  setToSessionStorage,
} from '../../utils/sessionStorage';
import { requestIdleCallbackSafe } from '../../utils/requestIdleCallback';

/* ------------------ HERO IMAGE ------------------ */
const SingleImage = React.memo(({ data }: { data: any }) => {
  const imageUrl = data?.image_url || data?.image;
  if (!imageUrl) return null;

  return (
    <section className='relative w-full overflow-hidden'>
      {/* FIXED HEIGHT → NO CLS */}
      <div className='relative before:content-[""] before:block before:float-left before:pt-[100%] md:before:pt-[45%] after:content-[""] after:table after:clear-both h-full w-full bg-[#f2f2f2]'>
        <SafeImage
          src={imageUrl}
          alt={data?.title || 'Hero Banner'}
          fill
          priority
          // fetchPriority='high'
          sizes='(max-width: 768px) 100vw, 1920px'
          className='object-cover'
        />
      </div>

      {/* CONTENT */}
      <div className='content-wrapper absolute inset-0 flex items-center'>
        <div>
          {data?.title && (
            <h1 className='text-[26px] md:text-[52px] uppercase text-white font-bold mb-2 px-6'>
              {data.title}
            </h1>
          )}

          {data?.content && (
            <div className='uppercase text-white text-base md:text-[22px] mb-4 px-6'>
              <HtmlContent htmlContent={data.content} />
            </div>
          )}

          <div className='px-6'>
            <ButtonLink
              to='/shop'
              buttonType='banner'
            >
              View Collection
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
});
SingleImage.displayName = 'SingleImage';

/* ------------------ HERO VIDEO ------------------ */
const Video = React.memo(({ data }: { data: any }) => {
  const videoUrl = data?.video_url || data?.video;
  if (!videoUrl) return null;

  return (
    <section className='relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden'>
      <video
        className='w-full h-full object-cover'
        muted
        playsInline
        preload='none'
        poster='/banner-poster.webp'
      >
        <source
          src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${videoUrl}`}
          type='video/mp4'
        />
      </video>
    </section>
  );
});
Video.displayName = 'Video';

/* ------------------ MAIN BANNER ------------------ */
const Banner = React.memo(() => {
  const dispatch = useAppDispatch();
  const { homeSection, loading } = useAppSelector(selectHomeSectionData);

  useEffect(() => {
    const cacheKey = 'home_section_data';
    const cachedData = getFromSessionStorage(cacheKey);

    if (cachedData) {
      dispatch({
        type: 'homeSection/fetchHomeSection/fulfilled',
        payload: cachedData,
      });
    } else {
      requestIdleCallbackSafe(
        () => {
          dispatch(fetchHomeSection())
            .unwrap()
            .then((result) => {
              if (result) {
                setToSessionStorage(cacheKey, result);
              }
            })
            .catch(console.error);
        },
        { timeout: 2000 }
      );
    }
  }, [dispatch]);

  const hero = homeSection?.hero;

  /* PLACEHOLDER → NO CLS */
  if (loading) {
    return (
      <div className='w-full aspect-[16/9] md:aspect-[21/9] bg-[#f2f2f2]' />
    );
  }

  if (!hero) return null;

  /* MOBILE VIDEO FALLBACK */
  if (hero.hero_type === 'video' && typeof window !== 'undefined') {
    if (window.innerWidth < 768) {
      return <SingleImage data={hero} />;
    }
    return <Video data={hero} />;
  }

  if (hero.hero_type === 'slider') {
    return <Slider data={hero} />;
  }

  if (hero.hero_type === 'image') {
    return <SingleImage data={hero} />;
  }

  return <SingleImage data={hero} />;
});

Banner.displayName = 'Banner';

export default Banner;
