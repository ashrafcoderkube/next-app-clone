function BackupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-gray-100 rounded-full p-6 shadow-inner mx-auto inline-block mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="64"
            height="64"
          >
            <g>
              <g data-name="Layer 2">
                <path
                  d="m22.51 7.15-1.57-4.7a1.75 1.75 0 0 0-1.66-1.2H4.72a1.75 1.75 0 0 0-1.66 1.2l-1.57 4.7a4.76 4.76 0 0 0-.24 1.5v.71a3.35 3.35 0 0 0 2.92 3.37 3.25 3.25 0 0 0 2.51-.82A2.91 2.91 0 0 0 7 11.6a3.22 3.22 0 0 0 2.5 1.15A3.27 3.27 0 0 0 12 11.6a3.22 3.22 0 0 0 2.52 1.15A3.28 3.28 0 0 0 17 11.58a3.31 3.31 0 0 0 .32.33 3.24 3.24 0 0 0 2.51.82 3.35 3.35 0 0 0 2.92-3.37v-.71a4.76 4.76 0 0 0-.24-1.5zM14.5 17.75h-5a.25.25 0 0 0-.25.25v4.75h5.5V18a.25.25 0 0 0-.25-.25z"
                  fill="#0079fb"
                />
                <path
                  d="M20 14.23h-.47a4.78 4.78 0 0 1-2.53-.69 4.72 4.72 0 0 1-2.5.71 4.85 4.85 0 0 1-2.52-.7 4.79 4.79 0 0 1-2.48.7 4.85 4.85 0 0 1-2.5-.7 4.7 4.7 0 0 1-2.49.7h-.47a4.48 4.48 0 0 1-1.77-.56V21A1.76 1.76 0 0 0 4 22.75h3.75v-5a1.5 1.5 0 0 1 1.5-1.5h5.5a1.5 1.5 0 0 1 1.5 1.5v5H20A1.76 1.76 0 0 0 21.75 21v-7.33a4.48 4.48 0 0 1-1.75.56z"
                  fill="#000"
                />
              </g>

              <circle
                cx="19"
                cy="5"
                r="3.3"
                fill="#fff"
                stroke="#e93331"
                strokeWidth="1.2"
              />
              <line
                x1="17.7"
                y1="3.7"
                x2="20.3"
                y2="6.3"
                stroke="#e93331"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
              <line
                x1="20.3"
                y1="3.7"
                x2="17.7"
                y2="6.3"
                stroke="#e93331"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </g>
          </svg>
        </div>
        <h1 className="font-bold text-3xl md:text-4xl mb-4 text-gray-900">
          Store Not Found
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          The store information could not be loaded. Please ensure the store is
          properly created in the system. Once the store is correctly set up, it
          will be displayed here.
        </p>
      </div>
    </div>
  );
}

export default BackupPage;

