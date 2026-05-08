import React from "react";

export const Icon = ({ name, className = "h-5 w-5", strokeWidth = 1.5 }) => {
  const common = {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    strokeWidth,
  };

  switch (name) {
    case "home":
      return (
        <svg {...common} className={className} stroke="currentColor">
          <path
            d="M3 11.5L12 4l9 7.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5 21V11h14v10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "plane":
      return (
        <svg {...common} className={className} stroke="currentColor">
          <path
            d="M2 16l20-8-7 9-3-2-6 1 2-7-6 3z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "star":
      return (
        <svg {...common} className={className} stroke="currentColor">
          <path
            d="M12 3l2.6 5.6L20 10l-4 3.6L17 20l-5-2.6L7 20l1-6.4L4 10l5.4-1.4L12 3z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "calendar":
      return (
        <svg {...common} className={className} stroke="currentColor">
          <rect
            x="3"
            y="5"
            width="18"
            height="16"
            rx="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16 3v4M8 3v4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "message":
      return (
        <svg {...common} className={className} stroke="currentColor">
          <path
            d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "users":
      return (
        <svg {...common} className={className} stroke="currentColor">
          <path
            d="M17 21v-2a4 4 0 0 0-3-3.87"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7 21v-2a4 4 0 0 1 3-3.87"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "search":
      return (
        <svg {...common} className={className} stroke="currentColor">
          <circle
            cx="11"
            cy="11"
            r="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M21 21l-4.35-4.35"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "bell":
      return (
        <svg {...common} className={className} stroke="currentColor">
          <path
            d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14V11a6 6 0 1 0-12 0v3a2 2 0 0 1-.6 1.6L4 17h5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "settings":
      return (
        <svg {...common} className={className} stroke="currentColor">
          <path
            d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 8.6 15a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 13 8.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 15z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "chev-left":
      return (
        <svg {...common} className={className} stroke="currentColor">
          <path
            d="M15 18l-6-6 6-6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "chev-right":
      return (
        <svg {...common} className={className} stroke="currentColor">
          <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "chev-down":
      return (
        <svg {...common} className={className} stroke="currentColor">
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "clipboard":
      return (
        <svg {...common} className={className} stroke="currentColor">
          <path
            d="M16 4h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect
            x="8"
            y="2"
            width="8"
            height="4"
            rx="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "check":
      return (
        <svg {...common} className={className} stroke="currentColor">
          <path
            d="M20 6L9 17l-5-5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "x":
      return (
        <svg {...common} className={className} stroke="currentColor">
          <path
            d="M18 6L6 18M6 6l12 12"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "eye":
      return (
        <svg {...common} className={className} stroke="currentColor">
          <path
            d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="12"
            cy="12"
            r="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "edit":
      return (
        <svg {...common} className={className} stroke="currentColor">
          <path
            d="M3 21l3-1 11-11 1-3-3 1L4 20z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "trash":
      return (
        <svg {...common} className={className} stroke="currentColor">
          <polyline
            points="3 6 5 6 21 6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10 11v6M14 11v6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "file":
      return (
        <svg {...common} className={className} stroke="currentColor">
          <path
            d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M14 2v6h6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "refresh":
      return (
        <svg {...common} className={className} stroke="currentColor">
          <path d="M20 7v6h-6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 17v-6h6" strokeLinecap="round" strokeLinejoin="round" />
          <path
            d="M20 7a9 9 0 1 0 0 10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "credit-card":
      return (
        <svg {...common} className={className} stroke="currentColor">
          <rect
            x="2"
            y="5"
            width="20"
            height="14"
            rx="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M2 10h20" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return <span className={className} />;
  }
};

export default Icon;
