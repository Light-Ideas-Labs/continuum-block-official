"use client";

import React, { useState } from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { toast } from "sonner";
import { Form, FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CustomFormField } from "@/components/CustomFormField";
import PasswordStrengthMeter from "@/components/auth/PasswordStrengthMeter";
import { signUpSchema, SignUpFormData } from "@/lib/schemas";

const SignUpComponent = () => {
  const { isLoaded, signUp } = useSignUp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isCheckoutPage = searchParams.get("showSignUp") !== null;
  const courseId = searchParams.get("id");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const signInUrl = isCheckoutPage
    ? `/checkout?step=1&id=${courseId}&showSignUp=false`
    : "/signin";

  const methods = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
    },
  });

  const password = methods.watch("password");

  const onSubmit = async (data: SignUpFormData) => {
    if (!isLoaded) return;
    setIsSubmitting(true);
    try {
      const [firstName, ...rest] = data.fullName.trim().split(" ");
      const lastName = rest.join(" ");

      await signUp.create({
        firstName,
        lastName: lastName || undefined,
        emailAddress: data.email,
        password: data.password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      const params = new URLSearchParams({ flow: "signup" });
      if (isCheckoutPage) {
        params.set("showSignUp", "true");
        if (courseId) params.set("id", courseId);
      }
      router.push(`/verify-code?${params.toString()}`);
    } catch (err: any) {
      const message =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        "Failed to sign up. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white-100">Sign Up</h1>
        <p className="mt-1 text-sm text-customgreys-dirtyGrey">
          Create an account to start learning.
        </p>
      </div>

      <Form {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
          <CustomFormField
            name="fullName"
            label="Full Name"
            type="text"
            placeholder="Jane Doe"
            labelClassName="text-white-50"
          />
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
            <PasswordStrengthMeter password={password} className="mt-2" />
          </div>
          <CustomFormField
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            labelClassName="text-white-50"
          />

          <FormField
            control={methods.control}
            name="agreeToTerms"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-start gap-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="mt-0.5"
                    />
                  </FormControl>
                  <label className="text-sm text-customgreys-dirtyGrey">
                    I agree with{" "}
                    <Link href="/terms" className="text-primary-400 hover:text-primary-300">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-primary-400 hover:text-primary-300">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating account..." : "Sign Up"}
          </Button>
        </form>
      </Form>

      <p className="text-center text-sm text-customgreys-dirtyGrey">
        Already have an account?{" "}
        <Link
          href={signInUrl}
          className="font-medium text-primary-400 hover:text-primary-300"
        >
          Sign In
        </Link>
      </p>
    </div>
  );
};

export default SignUpComponent;
