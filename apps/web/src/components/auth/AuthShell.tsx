import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface AuthShellProps {
  children: React.ReactNode;
}

const AuthShell = ({ children }: AuthShellProps) => {
  return (
    <div className="flex min-h-screen w-full bg-customgreys-primarybg">
      {/* Brand panel */}
      <div className="relative hidden w-[42%] flex-col justify-between overflow-hidden bg-gradient-to-br from-primary-950 via-primary-800 to-primary-700 p-12 lg:flex">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary-500/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-primary-400/10 blur-3xl"
          aria-hidden
        />

        <Link href="/" className="relative z-10 flex items-center gap-2">
          <Image
            src="/continuum-block-logo.jpeg"
            alt="Continuum Block logo"
            width={32}
            height={26}
            className="rounded"
          />
          <span className="text-lg font-semibold text-white-100">
            Continuum Block
          </span>
        </Link>

        <div className="relative z-10 max-w-sm space-y-4">
          <h1 className="text-3xl font-semibold leading-tight text-white-100">
            Learn, build, and grow with Continuum Block.
          </h1>
          <p className="text-sm text-white-50/80">
            Access your courses, track your progress, and keep learning right
            where you left off.
          </p>
        </div>

        <svg
          className="relative z-10 h-20 w-20 text-primary-400/40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1}
          aria-hidden
        >
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="5" />
        </svg>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-1 flex-col px-6 py-8 sm:px-12 lg:w-[58%]">
        <div className="flex justify-end">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-customgreys-dirtyGrey transition-colors hover:text-white-50"
          >
            <ArrowLeft className="size-4" />
            Back to Home
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default AuthShell;
