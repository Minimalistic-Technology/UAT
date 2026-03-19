const ComingSoon = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 px-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-800 mb-4 font-sans">
          We’re Updating Our Policies
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 leading-relaxed font-sans">
          We’re currently making important updates to improve your experience
          and ensure greater transparency. The page you’re looking for will be
          available soon.
        </p>

        <p className="text-sm sm:text-base text-gray-500 mb-8 font-sans">
          Thank you for your patience while we work on these improvements.
        </p>
      </div>
    </div>
  );
};

export default ComingSoon;