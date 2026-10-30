"use client";

import React, { useEffect, useState } from "react";
import { useSignIn, useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { CustomFormField } from "@/components/CustomFormField";
import { signInSchema, SignInFormData } from "@/lib/schemas";

const SignInComponent = () => {
  const { isLoaded, signIn, setActive } = useSignIn();
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isCheckoutPage = searchParams.get("showSignUp") !== null;
  const courseId = searchParams.get("id");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [justSignedIn, setJustSignedIn] = useState(false);

  const signUpUrl = isCheckoutPage
    ? `/checkout?step=1&id=${courseId}&showSignUp=true`
    : "/signup";

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

  const methods = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: SignInFormData) => {
    if (!isLoaded) return;
    setIsSubmitting(true);
    try {
      const result = await signIn.create({
        identifier: data.email,
        password: data.password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        setJustSignedIn(true);
      } else {
        toast.error(
          "Additional verification is required for this account. Please contact support."
        );
      }
    } catch (err: any) {
      const message =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        "Failed to sign in. Please check your details and try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white-100">Sign In</h1>
        <p className="mt-1 text-sm text-customgreys-dirtyGrey">
          Welcome back! Please enter your details.
        </p>
      </div>

      <Form {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
          <CustomFormField
            name="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            labelClassName="text-white-50"
          />
          <div>
            <CustomFormField
              name="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              labelClassName="text-white-50"
            />
            <div className="mt-2 text-right">
              <Link
                href="/forgot-password"
                className="text-sm text-primary-400 hover:text-primary-300"
              >
                Forgot password?
              </Link>
            </div>
          </div>
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </Form>

      <p className="text-center text-sm text-customgreys-dirtyGrey">
        Don&apos;t have an account?{" "}
        <Link
          href={signUpUrl}
          className="font-medium text-primary-400 hover:text-primary-300"
        >
          Sign Up
        </Link>
      </p>
    </div>
  );
};

export default SignInComponent;
