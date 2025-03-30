
interface LoadingSpinnerProps {
  text?: string;
}

const LoadingSpinner = ({ text = "Loading..." }: LoadingSpinnerProps) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-full border-4 border-t-purple border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
        <div className="absolute inset-1 rounded-full border-4 border-r-purple-light border-l-transparent border-t-transparent border-b-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
      </div>
      <p className="mt-4 text-sm font-medium text-purple animate-pulse-slow">{text}</p>
    </div>
  );
};

export default LoadingSpinner;
