export default function HeartLogo({ className = "w-12 h-12", animate = false }) {
    return (
        <svg
            className={className}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Outer Circle */}
            <circle
                cx="50"
                cy="50"
                r="48"
                stroke="url(#gradient)"
                strokeWidth="3"
                fill="none"
                className={animate ? "animate-pulse" : ""}
            />

            {/* Heart Shape */}
            <path
                d="M50 75 C50 75, 25 55, 25 40 C25 30, 32 25, 40 25 C45 25, 50 30, 50 30 C50 30, 55 25, 60 25 C68 25, 75 30, 75 40 C75 55, 50 75, 50 75 Z"
                fill="url(#gradient)"
                className={animate ? "animate-[heartbeat_1.5s_ease-in-out_infinite]" : ""}
            />

            {/* Gradient Definition */}
            <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ff6ec7" />
                    <stop offset="100%" stopColor="#b794f6" />
                </linearGradient>
            </defs>
        </svg>
    );
}
