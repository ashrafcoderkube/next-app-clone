import Link from "next/link";
import Icon from "./customcomponents/Icon";

function NotFound() {
  return (
    <div>
      <div className="max-w-[40rem] xl:max-w-[35rem] mx-auto py-10 md:py-[6.5rem] px-4 sm:px-6 2xl:px-[0] text-center">
        <span className="bg-gray-100 rounded-full p-5 shadow-inner mx-auto inline-block ">
          <Icon name="notFound" strokeWidth={2} size={49} />
        </span>
        <h3 className="font-bold text-4xl my-5">Oops! Page not found</h3>
        <p className="text-lg">
          The page you're looking for doesn't exist or may have been moved. Try
          navigating from the homepage or contact our support team.
        </p>
        <div className="flex flex-wrap sm:flex-nowrap sm:flex-row gap-4 justify-center my-5">
          <Link href="/" className="inline-flex text-center gap-2 btn px-[1.5rem] py-[0.9375rem] rounded-lg text-sm font-medium focus:outline-none items-center uppercase">
            Go to Homepage
          </Link>
          <Link
            href="/contact"
            className="inline-flex text-center gap-2 border px-[1.5rem] py-[0.9375rem] rounded-lg text-sm font-medium focus:outline-none items-center uppercase
            border-radius-xl"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
