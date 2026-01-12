"use client";
import { useEffect, useRef, useState } from "react";

export default function LazyVideo({
  sources,
  className = "",
  interactive = false,
  crossOrigin = null,
}) {
  // Determine the source URL
  const sourceUrl = typeof sources === "string" ? sources : sources?.src;
  let fixedUrl = sourceUrl;

  if (typeof sourceUrl === "string") {
    let src = sourceUrl.trim();

    // Convert .mov to .mp4
    if (src.toLowerCase().endsWith(".mov")) {
      src = src.replace(/\.mov(\?|$)/i, ".mp4$1");
    }

    const urlMatch = src.match(/^((https?:\/\/[^/]+)\/)\2+/);
    if (urlMatch) {
      const baseUrl = urlMatch[2];
      src = src.replace(
        new RegExp(`^${baseUrl}/(${baseUrl}/)+`, "g"),
        baseUrl + "/"
      );
    }

    fixedUrl = src;
  }

  const fixedSources =
    typeof sources === "string"
      ? { src: fixedUrl }
      : { ...sources, src: fixedUrl };

  const videoRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (videoRef.current) observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible && videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay was prevented - this is expected on some browsers
          // Video will remain paused until user interaction
        });
      }
    }
  }, [isVisible]);

  const handlePlay = (e) => {
    if (!interactive) return;
    e.currentTarget.controls = false;
  };

  const handleClick = (e) => {
    if (!interactive) return;
    e.currentTarget.controls = true;
    setTimeout(() => {
      if (e.currentTarget) e.currentTarget.controls = false;
    }, 2000);
  };

  const handleError = (e) => {
    console.error("Video loading error:", e);

    if (e.target.tagName === "SOURCE") {
      const src = e.target.src;
      console.error("Failed to load video source:", src);
      fetch(src, { method: "HEAD" })
        .then((response) => {
          console.log("Video URL status:", response.status);
        })
        .catch((err) => {
          console.error("Network fetch failed:", err.message);
        });
    }

    setError(true);
  };

  const handleLoadedData = () => {
    setError(false);
  };

  const getVideoType = (url) => {
    const ext = url?.split(".").pop()?.toLowerCase();
    const types = {
      mp4: "video/mp4",
      mov: "video/quicktime",
      m4v: "video/x-m4v",
      webm: "video/webm",
      ogg: "video/ogg",
      ogv: "video/ogg",
      mkv: "video/x-matroska",
      ts: "video/mp2t",
      avi: "video/x-msvideo",
      wmv: "video/x-ms-wmv",
    };
    return types[ext] || "video/mp4";
  };

  const videoSources = Array.isArray(fixedSources)
    ? fixedSources
    : typeof fixedSources === "object" && fixedSources !== null
    ? Object.values(fixedSources)
    : [fixedSources];

  return (
    <>
      <video
        ref={videoRef}
        autoPlay={isVisible}
        loop
        muted
        playsInline
        preload={isVisible ? "auto" : "none"}
        crossOrigin={crossOrigin}
        onClick={handleClick}
        onPlay={handlePlay}
        onError={handleError}
        onLoadedData={handleLoadedData}
        className={className}
      >
        {videoSources.map((src, index) => (
          <source
            key={index}
            src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${src}`}
            type={getVideoType(
              `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${src}`
            )}
          />
        ))}
      </video>
      {error && (
        <div
          className="video-error"
          style={{
            color: "#ef4444",
            fontSize: "12px",
            padding: "8px",
            backgroundColor: "#fee2e2",
            borderRadius: "4px",
            marginTop: "4px",
          }}
        >
          Your browser does not support the video tag.
        </div>
      )}
    </>
  );
}
