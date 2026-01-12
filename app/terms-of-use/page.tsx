"use client";

import React, { useEffect } from "react";
import Loader from "../components/customcomponents/Loader";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { fetchTermsOfUse } from "../redux/slices/termsOfUseSlice";
import HtmlContent from "../components/HtmlContent";

const Terms: React.FC = () => {
  const dispatch = useAppDispatch();
  const { termsOfUse, loading } = useAppSelector((state) => state.termsOfUse);

  useEffect(() => {
    dispatch(fetchTermsOfUse());
  }, [dispatch]);

  return (
    <div className="px-container mx-auto py-padding-100 min-h-screen flex flex-col max-w-[90%]">
      <div className="mx-auto w-full">
        <div className="rounded-lg">
          {loading ? (
            <Loader />
          ) : termsOfUse?.content ? (
            <div className="prose max-w-none">
              <HtmlContent htmlContent={termsOfUse.content} />
            </div>
          ) : (
            <div className="text-center text-2xl font-bold">
              No content available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Terms;
