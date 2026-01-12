import React from "react";

interface HtmlContentProps {
  htmlContent: string;
}

const HtmlContent: React.FC<HtmlContentProps> = ({ htmlContent }) => {
  return (
    <div
      className={`
      [&_ul]:list-disc
      [&_ul]:pl-6
      [&_ul]:text-left
      [&_ol]:list-disc
      [&_ol]:pl-6
      [&_ol]:text-left
      [&_a]:text-blue-600
      [&_a]:underline
      hover:[&_a]:text-blue-800
      [&_p]:text-left
      [&_h1]:text-left [&_h1]:mb-2
      [&_h2]:text-left [&_h2]:mb-2
      [&_h3]:text-left [&_h3]:mb-2
      [&_h4]:text-left [&_h4]:mb-2
      [&_h5]:text-left [&_h5]:mb-2
      [&_h6]:text-left [&_h6]:mb-2

      /* Responsive heading and paragraph font sizes, margin below */
      [&_h1]:text-2xl md:[&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-4
      [&_h2]:text-xl md:[&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mb-4
      [&_h3]:text-lg md:[&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mb-4
      [&_h4]:text-base md:[&_h4]:text-lg [&_h4]:font-semibold [&_h4]:mb-4
      [&_h5]:text-base md:[&_h5]:text-md [&_h5]:font-medium [&_h5]:mb-4
      [&_h6]:text-sm md:[&_h6]:text-base [&_h6]:font-medium [&_h6]:mb-4
      [&_p]:text-base md:[&_p]:text-lg [&_p]:mb-3
      [&_blockquote]:pl-4 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300  [&_blockquote]:italic [&_blockquote]:my-4
      [&_table]:w-full
      [&_table]:border
      [&_table]:border-collapse
      [&_table]:mb-6
      [&_th]:text-left [&_th]:border [&_th]:px-4 [&_th]:py-2
      [&_td]:border [&_td]:px-4 [&_td]:py-2
      [&_li]:mb-2
      [&_section]:mb-6
    `}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

export default HtmlContent;
