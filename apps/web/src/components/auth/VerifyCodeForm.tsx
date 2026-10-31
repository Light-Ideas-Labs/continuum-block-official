"use client";

import React, { useEffect, useState } from "react";
import { useSignIn, useSignUp, useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import OtpInput from "@/components/auth/OtpInput";

const RESEND_COOLDOWN_SECONDS = 60;

const VerifyCodeForm = () => {
  const { isLoaded: signInLoaded, signIn, setActive: setActiveSignIn } = useSignIn();
  const { isLoaded: signUpLoaded, signUp, setActive: setActiveSignUp } = useSignUp();
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  const flow = searchParams.get("flow") === "reset" ? "reset" : "signup";
  const email = searchParams.get("email") || signUp?.emailAddress || "";
  const isCheckoutPage = searchParams.get("showSignUp") !== null;
  const courseId = searchParams.get("id");

  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [justSignedIn, setJustSignedIn] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_COOLDOWN_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const getRedirectUrl = () => {
    if (isCheckoutPage) {
      return `/checkout?step=2&id=${courseId}&showSignUp=true`;
    }
    const userType = user?.publicMetadata?.userType as string;
    if (userType && userType.toLowerCase() === "teacher") {
      return "/teacher/courses";
    }
    return "/user/courses";
  };

  useEffect(() => {
    if (justSignedIn && user) {
      router.push(getRedirectUrl());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [justSignedIn, user]);

  const handleVerify = async () => {
    if (code.length !== 6) {
      toast.error("Enter the full 6-digit code");
      return;
    }

    setIsSubmitting(true);
    try {
      if (flow === "signup") {
        if (!signUpLoaded) return;
        const result = await signUp.attemptEmailAddressVerification({ code });
        if (result.status === "complete") {
          await setActiveSignUp({ session: result.createdSessionId });
          setJustSignedIn(true);
        } else {
          toast.error("Verification incomplete. Please try again.");
        }
      } else {
        if (!signInLoaded) return;
        const result = await signIn.attemptFirstFactor({
          strategy: "reset_password_email_code",
          code,
        });
        if (result.status === "needs_new_password") {
          router.push("/reset-password");
        } else {
          toast.error("Verification incomplete. Please try again.");
        }
      }
    } catch (err: any) {
      const message =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        "Invalid or expired code.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    try {
      if (flow === "signup") {
        if (!signUpLoaded) return;
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      } else {
        if (!signInLoaded || !email) return;
        await signIn.create({
          strategy: "reset_password_email_code",
          identifier: email,
        });
      }
      toast.success("A new code has been sent.");
      setSecondsLeft(RESEND_COOLDOWN_SECONDS);
    } catch (err: any) {
      toast.error("Could not resend the code. Please try again shortly.");
    }
  };

  const maskedEmail = email
    ? email.replace(/^(.{2}).+(@.+)$/, "$1******$2")
    : "your email";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white-100">Email OTP</h1>
        <p className="mt-1 text-sm text-customgreys-dirtyGrey">
          OTP sent to your Email Address ending {maskedEmail}
        </p>
      </div>

      <OtpInput value={code} onChange={setCode} disabled={isSubmitting} />

      {secondsLeft > 0 ? (
        <p className="text-sm text-customgreys-dirtyGrey">
          Code expires in {String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:
          {String(secondsLeft % 60).padStart(2, "0")}
        </p>
      ) : null}

      <Button
        type="button"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
        onClick={handleVerify}
      >
        {isSubmitting ? "Verifying..." : "Verify & Proceed"}
      </Button>

      <p className="text-center text-sm text-customgreys-dirtyGrey">
        Didn&apos;t get the OTP?{" "}
        {secondsLeft > 0 ? (
          <span className="text-customgreys-darkerGrey">Resend OTP</span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            className="font-medium text-primary-400 hover:text-primary-300"
          >
            Resend OTP
          </button>
        )}
      </p>
    </div>
  );
};

export default VerifyCodeForm;
