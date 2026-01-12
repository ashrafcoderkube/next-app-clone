'use client';

import React from 'react';
import { useAppSelector } from '../redux/hooks';
import { selectThemeData } from '../redux/selectors';
// import LazyOnVisible from './LazyOnVisible';
import dynamic from 'next/dynamic';
import BannerSkeleton from './customcomponents/BannerSkeleton';
import FeatureSectionSkeleton from './customcomponents/FeatureSectionSkeleton';
import AdvertisementSkeleton from './customcomponents/AdvertisementSkeleton';
import NewArrivalSectionSkeleton from './customcomponents/NewArrivalSectionSkeleton';

const Banner = dynamic(() => import('./homecomponents/Banner'), {
  ssr: false,
  loading: () => <BannerSkeleton />,
});

const ShopCategory = dynamic(() => import('./homecomponents/ShopCategory'), {
  ssr: false,
  loading: () => null,
});

const FeatureSection = dynamic(() => import('./homecomponents/FeatureSection'), {
  ssr: false,
  loading: () => <FeatureSectionSkeleton />,
});

const Advertisement = dynamic(() => import('./homecomponents/Advertisement'), {
  ssr: false,
  loading: () => <AdvertisementSkeleton />,
});

const NewArrivalSection = dynamic(() => import('./homecomponents/NewArrivalSection'), {
  ssr: false,
  loading: () => <NewArrivalSectionSkeleton />,
});

const HomeContent = React.memo(function HomeContent() {
  const { themeId, isWholesaler } = useAppSelector(selectThemeData);

  return (
    <div>
      <div className={`relative overflow-hidden ${themeId === 6 ? '' : ''}`}>
        <Banner />
      </div>

      <div>
        {/* <LazyOnVisible> */}
          <ShopCategory />
        {/* </LazyOnVisible> */}
        {/* <LazyOnVisible> */}
          <FeatureSection />
        {/* </LazyOnVisible> */}

        {isWholesaler ? (
          ''
        ) : (
          <>
            {themeId !== 4 && themeId !== 5 && (
                <Advertisement />
            )}
          </>
        )}

        {/* <LazyOnVisible> */}
          <NewArrivalSection />
        {/* </LazyOnVisible> */}
      </div>
    </div>
  );
});

HomeContent.displayName = 'HomeContent';

export default HomeContent;
