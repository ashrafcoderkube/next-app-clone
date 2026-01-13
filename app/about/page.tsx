"use client";

import { useEffect } from "react";
import Loader from "../components/customcomponents/Loader";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { fetchAboutSection } from "../redux/slices/aboutSection";
import HtmlContent from "../components/HtmlContent";

function About() {
  const dispatch = useAppDispatch();
  const { aboutSection, loading } = useAppSelector(
    (state) => state.aboutSection
  );

  useEffect(() => {
    dispatch(fetchAboutSection());
  }, [dispatch]);

  return (
    <div>
      {/* Page title replaced with metadata export (see layout.tsx) */}
      <div className="mx-auto py-50-padding px-container 2xl:px-0 max-w-[90%]">
        <div>
          <div className="space-y-5 text-left w-full">
            {loading ? (
              <Loader />
            ) : aboutSection?.content ? (
              <div className="prose max-w-none">
                <HtmlContent htmlContent={aboutSection.content} />
              </div>
            ) : (
              <div className="text-center text-2xl font-bold">
                No content available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
