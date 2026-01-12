"use client";

import React, { useEffect } from "react";
import Loader from "../components/customcomponents/Loader";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { fetchPrivacyPolicy } from "../redux/slices/privacyPolicySlice";
import HtmlContent from "../components/HtmlContent";

const PrivacyPolicy: React.FC = () => {
  const dispatch = useAppDispatch();
  const { privacyPolicy, loading } = useAppSelector(
    (state) => state.privacyPolicy
  );

  useEffect(() => {
    dispatch(fetchPrivacyPolicy());
  }, [dispatch]);

  return (
    <div className="px-container mx-auto py-padding-100 min-h-screen flex flex-col max-w-[90%]">
      <div className="mx-auto w-full">
        <div className="rounded-lg">
          {loading ? (
            <Loader />
          ) : privacyPolicy?.content ? (
            <div className="prose max-w-none">
              <HtmlContent htmlContent={privacyPolicy.content} />
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

export default PrivacyPolicy;
