"use client";

import React, { useEffect, useMemo } from "react";
import Loader from "../components/customcomponents/Loader";
import Icon from "../components/customcomponents/Icon";
import CustomCategoryCard from "../components/customcomponents/CustomCategoryCard";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { RootState } from "../redux/store";
import { fetchProductCategories } from "../redux/slices/productSlice";

function Categories() {
  const { productCategories, loading } = useAppSelector((state: RootState) => state.products);
const dispatch = useAppDispatch();
  useEffect(() => {
    if(!productCategories) {
      dispatch(fetchProductCategories());
    }
  }, [dispatch]); 
  const categories = useMemo(
    () => productCategories?.sub_categories || [],
    [productCategories?.sub_categories]
  );

  return (
    <div>
      <section className="px-container py-padding-100">
        {loading ? (
          <Loader />
        ) : categories.length > 0 ? (
          <div
            className="grid-responsive-shop word-break"
          // variants={containerVariants}
          // initial="hidden"
          // animate="visible"
          >
            {categories.map((item, index) => (
              <div key={item.sub_category_id || index}>
                <CustomCategoryCard item={item} index={index} />
              </div>
            ))}
          </div>
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center gap-[0.9375rem]">
            <Icon
              name="empty"
              className="w-[6.25rem] h-[6.25rem]"
              viewBox="0 0 100 100"
            />
            <p className="text-center">No categories found</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default Categories;

