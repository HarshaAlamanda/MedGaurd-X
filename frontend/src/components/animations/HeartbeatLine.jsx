export default function HeartbeatLine({ className = '' }) {
  return (
    <svg
      viewBox="0 0 400 80"
      className={`w-full ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <polyline
        className="ecg-line"
        points="0,40 30,40 50,40 60,10 70,70 80,40 100,40 130,40 150,40 160,5 175,75 185,40 200,40 230,40 250,40 265,15 275,65 285,40 310,40 340,40 360,40 375,10 385,70 395,40 400,40"
        stroke="url(#ecgGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <defs>
        <linearGradient id="ecgGrad" x1="0" y1="0" x2="400" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0d9488" stopOpacity="0" />
          <stop offset="40%" stopColor="#2dd4bf" />
          <stop offset="70%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}
