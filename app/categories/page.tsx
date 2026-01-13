"use client";

import React, { useEffect } from "react";
import Loader from "../components/customcomponents/Loader";
import Icon from "../components/customcomponents/Icon";
import CustomCategoryCard from "../components/customcomponents/CustomCategoryCard";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { fetchProductCategories } from "../redux/slices/productSlice";
import { selectProductCategories } from "../redux/selectors";

function Categories() {
  const { categories, loading } = useAppSelector((selectProductCategories));
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (categories.length === 0) {
      dispatch(fetchProductCategories());
    }
  }, [dispatch]);

  return (
    <div>
      <section className="px-container py-padding-100">
        {loading ? (
          <Loader />
        ) : categories.length > 0 ? (
          <div className="grid-responsive-shop word-break">
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

