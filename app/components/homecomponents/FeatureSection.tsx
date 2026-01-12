"use client";

import React, { useEffect } from "react";
import CardComponent from "../customcomponents/CardComponent";
import ButtonLink from "../customcomponents/ButtonLink";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { fetchFeaturedProducts } from "../../redux/slices/productSlice";
import {
  selectFeaturedProducts,
  selectFeaturedProductsLoading,
  selectThemeColors,
  selectThemeData,
} from "../../redux/selectors";
import ProductSkeleton from "../customcomponents/ProductSkeleton";
import { getFromSessionStorage, setToSessionStorage } from "../../utils/sessionStorage";

const FeatureSection = React.memo(function FeatureSection() {
  const dispatch = useAppDispatch();
  const featured = useAppSelector(selectFeaturedProducts);
  const loading = useAppSelector(selectFeaturedProductsLoading);
  const themeColors = useAppSelector(selectThemeColors);
  const { themeId } = useAppSelector(selectThemeData);

  // Fetch featured products on mount with session storage caching
  useEffect(() => {
    const cacheKey = 'featured_products_data';
    const cachedData = getFromSessionStorage(cacheKey);

    if (cachedData) {
      // If cached data exists, manually update the Redux state
      dispatch({ type: 'products/fetchFeaturedProducts/fulfilled', payload: cachedData });
    } else {
      // If no cached data, make the API call
      dispatch(fetchFeaturedProducts())
        .unwrap()
        .then((result) => {
          if (result) {
            // Cache the successful response
            setToSessionStorage(cacheKey, result);
          }
        })
        .catch((error) => {
          console.error('Error fetching featured products:', error);
        });
    }
  }, [dispatch]);

  const featuredArray = featured || [];

  if (!featuredArray || featuredArray.length === 0) {
    if (!loading) {
      // return (
      //   <div className="px-container py-[20px] sm:pb-[50px] md:pb-[50px] lg:pb-[50px]">
      //     <h2
      //       className="text-[2rem] lg:text-[2.625rem] font-bold section-title-margin mb-5.5"
      //       style={{
      //         color: themeColors?.bodyTextColor,
      //         textAlign: themeId === 2 ? "left" : "center",
      //       }}
      //     >
      //       Featured Products
      //     </h2>
      //     <ProductSkeleton viewMode="grid" count={8} />
      //   </div>
      // );
      return null;
    }

    return null;
  }

  return (
    <div className=" px-container py-[20px] sm:pb-[50px] md:pb-[50px] lg:pb-[50px]">
      <h2
        className="text-[2rem] lg:text-[2.625rem] font-bold section-title-margin mb-5.5"
        style={{
          color: themeColors?.bodyTextColor,
          textAlign: themeId === 2 ? "left" : "center",
        }}
      >
        Featured Products
      </h2>

      {loading ? (
        <ProductSkeleton viewMode="grid" count={8} />
      ) : (
        <div className="featured-products-grid gap-responsive word-break">
          {featuredArray.map((product: any) => (
            <CardComponent key={product.id} product={product} viewMode="grid" />
          ))}
        </div>
      )}

      {/* <div className="mt-[30px] lg:mt-[3.125rem] text-center">
        <ButtonLink to="/shop">View All Featured</ButtonLink>
      </div> */}
    </div>
  );
});

FeatureSection.displayName = "FeatureSection";

export default FeatureSection;
