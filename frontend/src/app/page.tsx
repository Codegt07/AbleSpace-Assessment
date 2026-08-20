"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    google?: any;
  }
}

export default function Home() {
  const router = useRouter();

  const googleCodeClient =
    useRef<any>(null);

  const handleGuestLogin = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/guest`,
        {
          method: "POST",
        },
      );

      if (!response.ok) {
        throw new Error("Guest login failed");
      }

      const guest = await response.json();

      localStorage.setItem(
        "guest",
        JSON.stringify(guest),
      );

      router.push("/tasks");
    } catch (error) {
      console.error(
        "Guest Login Error:",
        error,
      );
    }
  };

  const handleGoogleCode = async (
    response: any,
  ) => {
    try {
      if (!response?.code) {
        throw new Error(
          "Google authorization code missing",
        );
      }

      const result = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/google`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            "X-Requested-With":
              "XMLHttpRequest",
          },
          body: JSON.stringify({
            code: response.code,
          }),
        },
      );

      const data = await result.json();

      if (!result.ok) {
        throw new Error(
          data.message ||
            "Google login failed",
        );
      }

      localStorage.setItem(
        "guest",
        JSON.stringify(data),
      );

      router.push("/tasks");
    } catch (error) {
      console.error(
        "Google Login Error:",
        error,
      );
    }
  };

  useEffect(() => {
    const loadGoogle = () => {
      if (!window.google) {
        return;
      }

      googleCodeClient.current =
        window.google.accounts.oauth2.initCodeClient(
          {
            client_id:
              process.env
                .NEXT_PUBLIC_GOOGLE_CLIENT_ID,

            scope:
              "openid email profile",

            ux_mode: "popup",

            callback:
              handleGoogleCode,
          },
        );
    };

    if (window.google) {
      loadGoogle();
      return;
    }

    const script =
      document.createElement("script");

    script.src =
      "https://accounts.google.com/gsi/client";

    script.async = true;
    script.defer = true;

    script.onload = loadGoogle;

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="-mt-10 flex w-full max-w-[370px] flex-col items-center">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-[24px] w-[24px] items-center justify-center rounded-[7px] bg-[#171717]">
            <svg
              width="14"
              height="16"
              viewBox="0 0 12 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 1L10.5 11.5L6 13L1.5 11.5L6 1Z"
                stroke="white"
                strokeWidth="1.3"
                strokeLinejoin="round"
              />

              <path
                d="M6 1V13M1.5 11.5L6 7L10.5 11.5"
                stroke="white"
                strokeWidth="1.1"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <span className="text-[15px] font-semibold text-[#171717]">
            Pyramid
          </span>
        </div>

        <div className="w-full rounded-[22px] border border-[#dedede] bg-white px-6 py-[22px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <h1 className="text-center text-[20px] font-semibold leading-6 text-[#171717]">
            Let&apos;s get back on track
          </h1>

          <p className="mt-2 text-center text-[14px] text-[#777777]">
            Enter your email below to login
            to your account.
          </p>

          <div className="mt-6 space-y-[11px]">
            <button
              type="button"
              onClick={handleGuestLogin}
              className="h-[38px] w-full rounded-full bg-[#171717] text-[14px] font-medium text-white cursor-pointer transition-opacity hover:opacity-90"
            >
              Continue as Guest
            </button>

            <button
              type="button"
              onClick={() => {
                googleCodeClient.current?.requestCode();
              }}
              className="flex h-[38px] w-full items-center justify-center gap-2 rounded-full border cursor-pointer border-[#dedede] bg-white text-[14px] font-medium text-[#171717] transition-colors hover:bg-[#fafafa]"
            >
              <span className="text-[18px] font-semibold">
                G
              </span>

              Login with Google
            </button>
          </div>
        </div>

        <p className="mt-6 max-w-[220px] text-center text-[11px] leading-[15px] text-[#888888]">
          By clicking continue, you agree to
          <br />
          our{" "}
          <a
            href="#"
            className="underline underline-offset-2"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="#"
            className="underline underline-offset-2"
          >
            Privacy
          </a>
          <br />
          <a
            href="#"
            className="underline underline-offset-2"
          >
            Policy
          </a>
        </p>
      </div>
    </main>
  );
}