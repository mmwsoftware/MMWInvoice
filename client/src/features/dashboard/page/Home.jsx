import { useState, useEffect } from "react";
import DocumentCards from "../components/DocumentCards";
import RecentDocuments from "../components/RecentDocuments";

export default function Home() {
  const [greeting, setGreeting] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    setTimeout(() => setMounted(true), 50);
  }, []);

  return (
    <div
      style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "32px 24px",
      }}
    >
      {/* Greeting */}
      <div
        style={{
          marginBottom: "32px",
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(12px)",
          transition: "all 0.5s ease-out",
        }}
      >
        <h1
          style={{
            fontSize: "28px",
            fontWeight: 700,
            color: "#0f172a",
            margin: 0,
          }}
        >
          {greeting}, Vicky{" "}
          <span className="animate-wave" style={{ display: "inline-block" }}>
            👋
          </span>
        </h1>
        <p
          style={{
            marginTop: "6px",
            fontSize: "15px",
            color: "#64748b",
          }}
        >
          What would you like to create today?
        </p>
      </div>

      {/* Action Cards */}
      <DocumentCards mounted={mounted} />

      {/* Recent Documents Table */}
      <RecentDocuments mounted={mounted} />

      <style>{`
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          15% { transform: rotate(14deg); }
          30% { transform: rotate(-8deg); }
          40% { transform: rotate(14deg); }
          50% { transform: rotate(-4deg); }
          60% { transform: rotate(10deg); }
          70% { transform: rotate(0deg); }
        }
        .animate-wave {
          animation: wave 1.8s ease-in-out;
          transform-origin: 70% 70%;
        }
      `}</style>
    </div>
  );
}
