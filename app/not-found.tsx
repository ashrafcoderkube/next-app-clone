"use client";

import Icon from "./components/customcomponents/Icon";
import ButtonLink from "./components/customcomponents/ButtonLink";

export default function NotFound() {
  return (
    <div>
      <div className="max-w-[40rem] xl:max-w-[35rem] mx-auto py-10 md:py-[6.5rem] px-4 sm:px-6 2xl:px-[0] text-center">
        <span className="bg-gray-100 rounded-full p-5 shadow-inner mx-auto inline-block ">
          <Icon name="notFound" strokeWidth="2" size={49} />
        </span>
        <h3 className="font-bold text-4xl my-5">Oops! Page not found</h3>
        <p className="text-lg">
          The page you're looking for doesn't exist or may have been moved. Try
          navigating from the homepage or contact our support team.
        </p>
        <div className="flex flex-wrap sm:flex-nowrap sm:flex-row gap-4 justify-center my-5">
          <ButtonLink to="/" showIcon={false} className="w-full lg:w-1/2">
            Home
          </ButtonLink>
          <ButtonLink
          
            to="/contact"
            showIcon={false}
            buttonStyle="outline"
            className="w-full lg:w-1/2"
          >
            Contact Support
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}


