import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Please enter both username and password.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await login(username, password);
      navigate("/dashboard/home");
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-3 sm:p-5">

      {/* Main Card */}
      <div
        className="
          login-container
          w-full max-w-md md:max-w-275
          overflow-hidden
          rounded-2xl
          bg-white
          shadow-[0_15px_50px_rgba(15,23,42,0.12)]
          flex flex-col md:flex-row
        "
      >

        {/* ================= LEFT ================= */}
        <div
          className="
            left-panel
            hidden md:block
            relative
            md:w-[50%]
            md:min-h-145
            overflow-hidden
            bg-[#06428d]
            text-white
          "
        >

          {/* Background Image */}
          <div
            className="
              absolute inset-0
              bg-cover bg-center
              opacity-35
            "
            style={{
              backgroundImage: "url('/images/mmw-building.jpg')",
            }}
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-linear-to-br from-[#04377b] via-[#0752a5] to-[#0b68c7]" />

          {/* Content */}
          <div className="relative z-10 h-full md:min-h-145 flex flex-col justify-between gap-8 p-6 sm:p-8 md:p-10">

            {/* Logo */}
            <div className="animate-slide-down flex items-center gap-3">

              <div className="h-14 w-20 bg-white rounded-lg flex items-center justify-center shadow-md">
                <img
                  src="/logo.png"
                  alt="MMW"
                  className="max-h-16 max-w-18 object-contain"
                />
              </div>

              <div>
                <p className="text-base font-semibold">
                  Maxmoc Motor Works
                </p>

                <p className="text-xs text-blue-100">
                  India Private Limited
                </p>
              </div>

            </div>


            {/* Main Content */}
            <div className="animate-slide-up max-w-110">

              <p className="mb-3 text-xs font-medium uppercase tracking-[0.15em] text-blue-200">
                Business Document Management
              </p>

              <h1 className="text-2xl lg:text-3xl font-bold leading-tight">
                Invoice & Quotation
                <br />
                <span className="text-blue-100">
                  Management
                </span>
              </h1>

              <p className="mt-4 max-w-95 text-sm sm:text-base leading-6 text-blue-100">
                Create professional quotations and tax invoices with ease.
              </p>


              {/* Features */}
              <div className="mt-6 space-y-3">

                <Feature
                  icon="⚡"
                  title="Fast"
                />

                <Feature
                  icon="✓"
                  title="Accurate"
                />

                <Feature
                  icon="🔒"
                  title="Secure"
                />

                <Feature
                  icon="✦"
                  title="Professional"
                />

              </div>

            </div>


            {/* Footer */}
            <div className="text-xs text-blue-200/80">
              © 2026 Maxmoc Motor Works India Pvt Ltd
              <span className="mx-2">•</span>
              All rights reserved
            </div>

          </div>
        </div>


        {/* ================= RIGHT ================= */}
        <div
          className="
            right-panel
            flex-1
            flex items-center justify-center
            bg-[#f8fafc]
            p-6
            sm:p-8
            md:p-10
          "
        >

          <div className="w-full max-w-100 animate-fade-in">

            {/* Mobile Company Logo (visible on mobile only) */}
            <div className="md:hidden flex flex-col items-center mb-6 text-center">
              <div className="h-16 w-24 bg-white rounded-xl flex items-center justify-center shadow-xs border border-slate-200/80 p-2 mb-2.5">
                <img
                  src="/logo.png"
                  alt="MMW Logo"
                  className="max-h-12 max-w-20 object-contain"
                />
              </div>
              <h1 className="text-base font-bold text-slate-800 leading-tight">
                Maxmoc Motor Works
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                India Private Limited
              </p>
            </div>

            {/* Heading */}
            <div className="mb-7 text-center md:text-left">

              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Welcome Back
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Sign in to continue to your account
              </p>

            </div>


            {/* Error Alert */}
            {error && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "12px 14px",
                  marginBottom: "20px",
                  borderRadius: "10px",
                  backgroundColor: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#b91c1c",
                  fontSize: "13.5px",
                  fontWeight: 500,
                  animation: "fadeIn 0.2s ease-out",
                }}
              >
                <svg
                  style={{ height: "18px", width: "18px", flexShrink: 0 }}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                  />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* Username */}
              <div>

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Username
                </label>

                <div className="relative">

                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base text-slate-400">
                    👤
                  </span>

                  <input
                    type="text"
                    placeholder="Enter username (e.g. admin)"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="
                      h-12
                      w-full
                      rounded-lg
                      border border-slate-200
                      bg-white
                      pl-11 pr-3
                      text-sm
                      outline-none
                      transition
                      duration-200
                      focus:border-blue-500
                      focus:ring-4
                      focus:ring-blue-500/10
                    "
                  />

                </div>

              </div>


              {/* Password */}
              <div>

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Password
                </label>

                <div className="relative">

                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base text-slate-400">
                    🔒
                  </span>

                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="
                      h-12
                      w-full
                      rounded-lg
                      border border-slate-200
                      bg-white
                      pl-11 pr-11
                      text-sm
                      outline-none
                      transition
                      duration-200
                      focus:border-blue-500
                      focus:ring-4
                      focus:ring-blue-500/10
                    "
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="
                      absolute
                      right-3.5
                      top-1/2
                      -translate-y-1/2
                      text-base
                      text-slate-400
                      hover:text-blue-600
                      transition
                    "
                  >
                    {showPassword ? "◉" : "◌"}
                  </button>

                </div>

              </div>


              {/* Login */}
              <button
                type="submit"
                disabled={loading}
                className="
                  group
                  relative
                  h-12
                  w-full
                  overflow-hidden
                  rounded-lg
                  bg-blue-600
                  text-base
                  font-semibold
                  text-white
                  shadow-md
                  shadow-blue-600/20
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:bg-blue-700
                  hover:shadow-lg
                  active:translate-y-0
                  disabled:opacity-70
                "
              >

                {/* Small shine animation */}
                <span
                  className="
                    absolute
                    inset-y-0
                    -left-16
                    w-12
                    rotate-12
                    bg-white/20
                    transition-all
                    duration-700
                    group-hover:left-[110%]
                  "
                />

                <span className="relative flex items-center justify-center gap-2">

                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Login
                      <span className="transition-transform duration-200 group-hover:translate-x-1">
                        →
                      </span>
                    </>
                  )}

                </span>

              </button>

            </form>


            {/* Bottom Security */}
            <div className="mt-6 text-center">

              <p className="text-xs text-slate-400">
                🔒 Secure business document management
              </p>

            </div>

          </div>

        </div>

      </div>


      {/* Animations */}
      <style>{`

        .login-container {
          animation: containerIn 0.6s ease-out;
        }

        .animate-slide-down {
          animation: slideDown 0.7s ease-out;
        }

        .animate-slide-up {
          animation: slideUp 0.8s ease-out;
        }

        .animate-fade-in {
          animation: fadeIn 0.8s ease-out;
        }

        @keyframes containerIn {
          from {
            opacity: 0;
            transform: scale(0.97);
          }

          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-15px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(15px);
          }

          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

      `}</style>

    </div>
  );
}


/* ================= FEATURE ================= */

function Feature({ icon, title }) {
  return (
    <div className="flex items-center gap-3">

      <div
        className="
          flex
          h-9
          w-9
          items-center
          justify-center
          rounded-md
          bg-white/10
          text-sm
          transition
          duration-300
          hover:scale-110
          hover:bg-white/20
        "
      >
        {icon}
      </div>

      <span className="text-sm font-medium text-blue-50">
        {title}
      </span>

    </div>
  );
}