"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import ButtonLink from "./ButtonLink";
import Icon from "./Icon";
import { useTheme } from "../../contexts/ThemeContext";
import { RootState } from "../../redux/store";
import { useAppSelector } from "@/app/redux/hooks";
import SafeImage, { NoImage } from "../SafeImage";
import HtmlContent from "../HtmlContent";
import Image from "next/image";
import LazyVideo from "../LazyVideo";
import { ChevronLeft, ChevronRight, RotateCw } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import AutoplayEmbla from "embla-carousel-autoplay";
import { DotButton, useDotButton } from "./EmblaDotButton";

const Slider = ({ data }: { data: any }) => {
  const sliderFiles = data?.slider_files || [];
  const themeContext = useTheme() || {};
  const themeId = useAppSelector(
    (state: RootState) => state.storeInfo?.themeId
  );

  // Embla Carousel setup
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: "center",
      slidesToScroll: 1,
      loop: true,
    },
    [AutoplayEmbla({ delay: 3000, stopOnInteraction: true })]
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const { selectedIndex, scrollSnaps, onDotButtonClick } =
    useDotButton(emblaApi);
  return (
    <section className="animation-section h-full">
      <div className="relative w-full h-full overflow-hidden">
        <div className="embla h-full" ref={emblaRef}>
          <div className="embla__container flex h-full">
            {sliderFiles.map((file: string, idx: number) => (
              <div
                key={file}
                className="embla__slide flex-[0_0_100%] min-w-0 relative"
              >
                <div className="relative before:content-[''] before:block before:float-left sm:before:pt-[48%] before:pt-[100%] md:before:pt-[45%] after:content-[''] after:table after:clear-both h-full">
                  {/\.(webm|mp4|mov|m4v|ogg|ogv)$/i.test(file) ? (
                    <LazyVideo
                      sources={{ src: file }}
                      className="w-full h-full absolute top-0 left-0 object-cover transition-all duration-500"
                    />
                  ) : (
                    <Image
                      src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${file}`}
                      // alt={`Slide ${idx + 1}`}
                      // fill={true}
                      className="w-full h-full absolute top-0 left-0 object-cover transition-all duration-500"
                      style={{
                        aspectRatio: "16/9",
                        objectFit: "cover",
                        height: "100%",
                      }}
                      width={1920}
                      height={1080}
                      loading="eager"
                      fetchPriority="high"
                      alt="Premium collection"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="content-wrapper px-container absolute inset-0 z-10 flex flex-col justify-center items-center">
          <p
            className={`
              text-[1.625rem] lg:text-[52px] uppercase text-white mb-[8px] font-bold line-clamp-2 `}
          >
            {data?.[0]?.title || ""}
          </p>
          <div
            className={`uppercase text-white line-clamp-3 mb-5 line-clamp-2`}
            title={data?.[0]?.content?.replace(/<[^>]*>?/gm, "") || ""}
          >
            <HtmlContent htmlContent={data?.[0]?.content} />
          </div>

          <div className={` pointer-events-auto`}>
            <ButtonLink to="/shop" buttonType="banner">
              View Collection
            </ButtonLink>
          </div>
        </div>
        {/* Navigation arrows - visible only on md and larger (desktop) */}
        <div className="hidden md:block">
          <button
            className="swiper-button-prev-custom swiper-button-prev z-20"
            onClick={scrollPrev}
            style={{
              color: themeContext?.buttonTextColor || "#ffffff",
            }}
          >
            <ChevronLeft />
          </button>
          <button
            className="swiper-button-next-custom swiper-button-next z-20"
            onClick={scrollNext}
            style={{
              color: themeContext?.buttonTextColor || "#ffffff",
            }}
          >
            <ChevronRight />
          </button>
        </div>

        {/* Simple dots indicator for mobile */}
        <div className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
          {sliderFiles.map((_, index) => (
            // <button
            //   key={index}
            //   className="w-2 h-2 rounded-full bg-white/50"
            //   style={{
            //     backgroundColor:
            //       index === 0 ? "white" : "rgba(255,255,255,0.5)",
            //   }}
            // />
            <DotButton
              key={index}
              onClick={() => onDotButtonClick(index)}
              className={"embla__dot".concat(
                index === selectedIndex ? " embla__dot--selected" : ""
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Slider;

export const ThumbnailSlider = ({
  galleryItems,
  setSelectedIndex,
  selectedIndex,
  productName,
  wholesalerId,
}: {
  galleryItems: string[];
  setSelectedIndex: (index: number) => void;
  selectedIndex: number;
  productName: string;
  wholesalerId: number | string | null;
}) => {
  const themeId = useSelector((state: RootState) => state.storeInfo?.themeId);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    containScroll: "keepSnaps",
    dragFree: true,
    align: "start",
  });

  const onThumbClick = (index: number) => {
    setSelectedIndex(index);
  };

  return (
    <div>
      <div className="" ref={emblaRef}>
        <div className="flex flex-col gap-2">
          {galleryItems.map((item: string, index: number) => (
            <div
              key={index}
              className={`flex-[0_0_auto]  w-16 h-16 md:w-24 md:h-24 cursor-pointer scale-100 ${
                themeId === 2 ? "rounded-[10px]" : "rounded-lg"
              } overflow-hidden transition duration-250 ${
                selectedIndex === index
                  ? "ring-2 ring-blue-500 opacity-100"
                  : "opacity-60 hover:opacity-80 "
              }`}
              style={{ border: "1px solid rgba(17, 17, 17, 0.1)" }}
              onClick={() => onThumbClick(index)}
            >
              {item && /\.(webm|mp4|mov|m4v|ogg|ogv)$/i.test(item) ? (
                <LazyVideo
                  sources={{ src: item }}
                  className="w-full h-full object-cover"
                />
              ) : (
                <SafeImage
                  src={item}
                  alt={`${productName} thumbnail ${index + 1}`}
                  fill={true}
                  className="w-full h-full object-cover"
                  wholesalerId={wholesalerId}
                  enableExifRotation={true}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const MainSlider = ({
  galleryItems,
  setSelectedIndex,
  selectedIndex,
  setLightboxImage,
  productName,
  wholesalerId,
}: {
  galleryItems: string[];
  setSelectedIndex: (index: number) => void;
  selectedIndex: number;
  setLightboxImage: (image: string | null) => void;
  productName: string;
  wholesalerId: number | string | null;
}) => {
  const themeContext = useTheme() || {};
  const themeId = useSelector((state: RootState) => state.storeInfo?.themeId);
  const [imageRotations, setImageRotations] = useState({});
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
  });

  const handleImageRotation = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setImageRotations((prev) => ({
      ...prev,
      [index]: ((prev[index] || 0) + 90) % 360,
    }));
  };

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      const selected = emblaApi.selectedScrollSnap();
      setSelectedIndex(selected);
    };

    emblaApi.on("select", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.scrollTo(selectedIndex);
  }, [emblaApi, selectedIndex]);

  const nextSlide = () => {
    if (emblaApi) emblaApi.scrollNext();
  };

  const prevSlide = () => {
    if (emblaApi) emblaApi.scrollPrev();
  };

  const currentItem = galleryItems[selectedIndex] || galleryItems[0];

  return (
    <div className="relative w-full md:max-w-full flex-1">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {galleryItems.map((item: string, index: number) => (
            <div key={index} className="flex-[0_0_100%] relative mr-5">
              {galleryItems.length > 0 && item && (
                <div className="relative">
                  <div
                    className="absolute p-2 bg-white rounded-full left-5 bottom-5 z-10 cursor-pointer hover:opacity-70 transition-opacity"
                    onClick={() => setLightboxImage(item)}
                  >
                    <Icon name="zoom" strokeWidth="0" />
                  </div>
                </div>
              )}

              {item ? (
                <div
                  className={`slider__image w-full h-full ${
                    themeId === 2 ? "rounded-[10px]" : "border-radius-xl"
                  } overflow-hidden relative`}
                  style={{ aspectRatio: "1/1", maxHeight: "600px" }}
                >
                  {item && /\.(webm|mp4|mov|m4v|ogg|ogv)$/i.test(item) ? (
                    <LazyVideo
                      sources={{ src: item }}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className={`w-full h-full overflow-hidden ${
                        themeId === 2 ? "rounded-[10px]" : "border-radius-xl"
                      }`}
                      style={{
                        transform: `rotate(${imageRotations[index] || 0}deg)`,
                        border: `0.1px solid ${themeContext.textColor}1A`,
                      }}
                    >
                      <SafeImage
                        src={item}
                        alt={`${productName} ${index + 1}`}
                        onClick={() => setLightboxImage(item)}
                        fill={true}
                        className="w-full h-full object-contain cursor-pointer transition-transform duration-300 hover:scale-105"
                        wholesalerId={wholesalerId}
                        enableExifRotation={true}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className="slider__image w-full h-full rounded-[10px] overflow-hidden flex items-center justify-center text-gray-500 bg-gray-100"
                  style={{
                    aspectRatio: "1/1",
                    maxHeight: "600px",
                    border: "1px solid rgba(17, 17, 17, 0.1)",
                  }}
                >
                  <NoImage
                    width={200}
                    height={200}
                    className="object-contain"
                  />
                </div>
              )}

              {!/\.(webm|mp4|mov|m4v|ogg|ogv)$/i.test(item) && item && (
                <button
                  onClick={(e) => handleImageRotation(e, index)}
                  className="absolute bottom-5 right-5 z-20 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-all duration-200 hover:scale-110 cursor-pointer"
                  title="Rotate Image"
                  aria-label="Rotate Image"
                >
                  <RotateCw size={18} className="text-gray-700" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation buttons */}
      {galleryItems.length > 1 && (
        <>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-all duration-200"
            onClick={prevSlide}
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-all duration-200"
            onClick={nextSlide}
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Image indicators */}
      {galleryItems.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {galleryItems.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === selectedIndex ? "bg-white" : "bg-white/50"
              }`}
              onClick={() => setSelectedIndex(index)}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Combined Thumbs Slider Component
export const ThumbsSlider = ({
  galleryItems,
  setLightboxImage,
  productName,
  wholesalerId,
}: {
  galleryItems: string[];
  setLightboxImage: (image: string | null) => void;
  productName: string;
  wholesalerId: number | string | null;
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <div className="flex gap-1">
      {galleryItems.length > 1 && (
        <ThumbnailSlider
          galleryItems={galleryItems}
          setSelectedIndex={setSelectedIndex}
          selectedIndex={selectedIndex}
          productName={productName}
          wholesalerId={wholesalerId}
        />
      )}
      {/* Main Slider */}
      <MainSlider
        galleryItems={galleryItems}
        setSelectedIndex={setSelectedIndex}
        selectedIndex={selectedIndex}
        setLightboxImage={setLightboxImage}
        productName={productName}
        wholesalerId={wholesalerId}
      />

      {/* Thumbnail Slider */}
    </div>
  );
};

export const LightboxSlider = ({
  galleryItems,
  activeIndex,
  setLightboxImage,
  ref,
  productName,
  wholesalerId,
}: {
  galleryItems: string[];
  activeIndex: number;
  setLightboxImage: (image: string | null) => void;
  ref: React.RefObject<any>;
  productName: string;
  wholesalerId: number | string | null;
}) => {
  const themeContext = useTheme() || {};
  const { textColor } = themeContext;
  const [imageRotations, setImageRotations] = useState({});
  const [currentIndex, setCurrentIndex] = useState(activeIndex);

  const handleImageRotation = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setImageRotations((prev) => ({
      ...prev,
      [index]: ((prev[index] || 0) + 90) % 360,
    }));
  };

  // Lock body scroll when lightbox is open
  useEffect(() => {
    // Save current scroll position
    const scrollY = window.scrollY;

    // Lock body scroll
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    // Cleanup: restore scroll when lightbox closes
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      window.scrollTo(0, scrollY);
    };
  }, []);

  // Prevent wheel events from scrolling background
  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setLightboxImage(null); // close lightbox
      } else if (e.key === "ArrowLeft") {
        setCurrentIndex(
          (prev) => (prev - 1 + galleryItems.length) % galleryItems.length
        );
      } else if (e.key === "ArrowRight") {
        setCurrentIndex((prev) => (prev + 1) % galleryItems.length);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [setLightboxImage, galleryItems.length]);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % galleryItems.length);
  };

  const prevImage = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + galleryItems.length) % galleryItems.length
    );
  };

  const currentItem = galleryItems[currentIndex];

  return (
    <>
      <div
        className="fixed inset-0 flex items-center justify-center z-50 bg-black/90"
        onWheel={handleWheel}
        onTouchMove={(e) => e.stopPropagation()}
        style={{
          backgroundColor: themeContext?.backgroundColor || "rgba(0,0,0,0.9)",
          color: textColor,
        }}
      >
        <div className="relative w-full h-full flex items-center justify-center p-6">
          <button
            name="Close Lightbox"
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 z-20 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer transition-all hover:bg-white/20"
            aria-label="Close lightbox"
          >
            <Icon name="close" size={24} className="text-white" />
          </button>

          {currentItem && (
            <div className="relative max-w-4xl max-h-full flex items-center justify-center">
              {/\.(webm|mp4|mov|m4v|ogg|ogv)$/i.test(currentItem) ? (
                <LazyVideo
                  sources={{ src: currentItem }}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div
                  className="relative transition-transform duration-500"
                  style={{
                    transform: `rotate(${
                      imageRotations[currentIndex] || 0
                    }deg)`,
                  }}
                >
                  <SafeImage
                    src={currentItem}
                    alt={productName}
                    width={800}
                    height={600}
                    className="max-w-full max-h-[80vh] object-contain"
                    wholesalerId={wholesalerId}
                    enableExifRotation={true}
                  />
                </div>
              )}

              {/* Navigation buttons */}
              {galleryItems.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer transition-all hover:bg-white/20"
                    aria-label="Previous image"
                  >
                    <span className="text-white text-2xl">‹</span>
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer transition-all hover:bg-white/20"
                    aria-label="Next image"
                  >
                    <span className="text-white text-2xl">›</span>
                  </button>
                </>
              )}

              {/* Rotation button for images */}
              {currentItem &&
                !/\.(webm|mp4|mov|m4v|ogg|ogv)$/i.test(currentItem) && (
                  <button
                    onClick={(e) => handleImageRotation(e, currentIndex)}
                    className="absolute bottom-4 right-4 z-30 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white/20 transition-all duration-200 cursor-pointer"
                    title="Rotate Image"
                    aria-label="Rotate Image"
                  >
                    <RotateCw size={20} className="text-white" />
                  </button>
                )}

              {/* Image counter */}
              {galleryItems.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm">
                  {currentIndex + 1} / {galleryItems.length}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
