"use client";

import Link from "next/link";
import React, { useState, useRef, useEffect } from "react";
import { Bell, BookOpen, SearchIcon } from "lucide-react";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";


const NonDashboardNavbar = () => {
  const { user } = useUser();
  const userRole = user?.publicMetadata?.userType as "student" | "teacher";
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false); // Track input focus
  const inputRef = useRef<HTMLInputElement>(null); // Ref to the input

  // Handle search navigation on Enter key press or click
  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      e.preventDefault(); // Prevent default form submission (if any)
      window.location.href = `/search?query=${encodeURIComponent(searchQuery.trim())}`; // Use window.location.href for simplicity
      setSearchQuery(""); // Clear the input after navigation
    } else if (e.key === "Enter" && !searchQuery.trim()) {
      window.location.href = "/search"; // Navigate to search page if query is empty
    }
  };

  return (
    <nav className="nondashboard-navbar">
      <div className="nondashboard-navbar__container">
        {/* Brand + search + Nav links */}
        <div className="flex items-center gap-4">
          <Link href="/" className="nondashboard-navbar__brand" scroll={false}>
            Continuum Block
          </Link>

          {/* Search bar */}
            <div className="relative group">
            <div
              className={cn(
                "flex items-center w-[320px] lg:w-[420px] space-x-2 rounded-lg border border-gray-700 px-3 py-1.5",
                "bg-customgreys-primarybg hover:bg-customgreys-darkerGrey transition-all duration-300",
                "focus-within:ring-1 focus-within:ring-primary-700"
              )}
              >
                <SearchIcon className="h-3.5 w-3.5 text-customgreys-dirtyGrey group-hover:text-white-50 transition-all duration-300 flex-shrink-0" />
                <Input
                  ref={inputRef} 
                  type="search"
                  placeholder="Search courses, bootcamps..."
                  className="w-full border-0 h-8 font-semibold text-customgreys-dirtyGrey group-hover:text-white-50 focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearch}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                />
              </div>
              {isFocused && (
                <div className="absolute left-0 mt-1 text-xs text-customgreys-dirtyGrey">
                  Press Enter to search
                </div>
              )}
            </div>
           {/* Nav links */}
          <div className="hidden lg:flex items-center gap-6 text-sm text-customgreys-dirtyGrey">
            <Link href="/search" scroll={false} className="hover:text-white-50 transition-colors duration-200">
              Courses
            </Link>
            <Link href="/bootcamps" scroll={false} className="hover:text-white-50 transition-colors duration-200">
              Bootcamps
            </Link>
            <Link href="/instructors" scroll={false} className="hover:text-white-50 transition-colors duration-200">
              Instructors
            </Link>
            <Link href="/#about" scroll={false} className="hover:text-white-50 transition-colors duration-200">
              About
            </Link>
            <Link href="/#faq" scroll={false} className="hover:text-white-50 transition-colors duration-200">
              FAQ
            </Link>
          </div>
        </div>
        <div className="nondashboard-navbar__actions">
          <button className="nondashboard-navbar__notification-button">
            <span className="nondashboard-navbar__notification-indicator"></span>
            <Bell className="nondashboard-navbar__notification-icon" />
          </button>
          <SignedIn>
            <UserButton
              appearance={{
                baseTheme: dark,
                elements: {
                  userButtonOuterIdentifier: "text-customgreys-dirtyGrey",
                  userButtonBox: "scale-90 sm:scale-100",
                },
              }}
              showName={true}
              userProfileMode="navigation"
              userProfileUrl={
                userRole === "teacher" ? "/teacher/profile" : "/user/profile"
              }
            />
          </SignedIn>
          <SignedOut>
            <Link
              href="/signin"
              className="text-xs text-customgreys-dirtyGrey hover:bg-customgreys-darkerGrey hover:text-white-50 px-3 py-1 rounded border border-customgreys-dirtyGrey transition-colors"
              scroll={false}
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-xs bg-primary-700 hover:bg-primary-600 text-white-100 px-3 py-1 rounded transition-colors"
              scroll={false}
            >
              Sign up
            </Link>
          </SignedOut>
        </div>
      </div>
    </nav>
  );
};

export default NonDashboardNavbar;
