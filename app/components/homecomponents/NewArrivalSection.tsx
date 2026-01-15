"use client";

import React, { useEffect } from "react";
import CardComponent from "../customcomponents/CardComponent";
import ButtonLink, { ButtonLink2 } from "../customcomponents/ButtonLink";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { fetchNewArrivals } from "../../redux/slices/productSlice";
import {
  selectThemeData,
  selectNewArrivalsData,
  selectThemeColors,
} from "../../redux/selectors";
import ProductSkeleton from "../customcomponents/ProductSkeleton";
import { getFromSessionStorage, setToSessionStorage } from "../../utils/sessionStorage";

const NewArrivalSection = React.memo(function NewArrivalSection() {
  const dispatch = useAppDispatch();
  const { themeId } = useAppSelector(selectThemeData);
  const { newArrivals, loading } = useAppSelector(selectNewArrivalsData);
  const themeColors = useAppSelector(selectThemeColors);

  // Fetch new arrivals on mount with session storage caching
  useEffect(() => {
    const cacheKey = 'new_arrivals_data';
    const cachedData = getFromSessionStorage(cacheKey);
    
    if (cachedData) {
      // If cached data exists, manually update the Redux state
      dispatch({ type: 'products/fetchNewArrivals/fulfilled', payload: cachedData });
    } else {
      // If no cached data, make the API call
      dispatch(fetchNewArrivals())
        .unwrap()
        .then((result) => {
          if (result) {
            // Cache the successful response
            setToSessionStorage(cacheKey, result);
          }
        })
        .catch((error) => {
          console.error('Error fetching new arrivals:', error);
        });
    }
  }, [dispatch]);

  const products = newArrivals || [];

  // Memoize sliced products to prevent recalculation
  const displayedProducts = React.useMemo(() => {
    return products.slice(0, themeId === 6 ? 8 : products.length);
  }, [products, themeId]);

  return (
    <div className="px-container py-[20px] sm:pb-[50px] md:pb-[50px] lg:pb-[50px] py-padding-100">
      <section>
        {/* {themeId !== 2 && (
          <h2
            className='text-[2rem] lg:text-[2.625rem] font-bold section-title-margin mb-5.5'
            style={{
              color: themeColors?.bodyTextColor,
              textAlign: themeId === 2 ? 'left' : 'center',
            }}
          >
            New Trending
          </h2>
        )} */}
        {/* {themeId === 2 && ( */}
        <div className="feature-flex-wrapper similar-products-section animation-section mb-[1.25rem] lg:mb-7.5">
          <div>
            <p
              className="uppercase"
              style={{
                color: themeColors?.bodyTextColor,
              }}
            >
              Explore
            </p>
            <h2
              className="text-[2rem] lg:text-[2.625rem] font-bold !mb-0"
              style={{
                color: themeColors?.bodyTextColor,
              }}
            >
              New Trending
            </h2>
          </div>

          {themeId === 2 && (
            <ButtonLink2
              to="/shop"
              style={{
                color: themeColors?.bodyTextColor,
              }}
            >
              Shop ALL New Trending
            </ButtonLink2>
          )}
        </div>
        {/* )} */}

        {loading ? (
          <ProductSkeleton viewMode="grid" count={12} />
        ) : products?.length > 0 ? (
          <React.Fragment>
            <div className="featured-products-grid gap-responsive word-break">
              {displayedProducts.map((product: any, index: number) => (
                <div key={`${product.id}-${index}`}>
                  <CardComponent product={product} viewMode="grid" />
                </div>
              ))}
            </div>

            {(themeId === 1 ||
              themeId === 3 ||
              themeId === 4 ||
              themeId === 5) && (
              <div className="mt-[20px] lg:mt-[3.125rem] text-center">
                <ButtonLink to="/shop">Shop ALL New Trending</ButtonLink>
              </div>
            )}
          </React.Fragment>
        ) : (
          <p className="text-center opacity-50">No products found.</p>
        )}
      </section>
    </div>
  );
});

NewArrivalSection.displayName = "NewArrivalSection";

export default NewArrivalSection;
