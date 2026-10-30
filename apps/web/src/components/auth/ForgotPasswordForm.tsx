"use client";

import React, { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { CustomFormField } from "@/components/CustomFormField";
import { forgotPasswordSchema, ForgotPasswordFormData } from "@/lib/schemas";

const ForgotPasswordForm = () => {
  const { isLoaded, signIn } = useSignIn();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    if (!isLoaded) return;
    setIsSubmitting(true);
    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: data.email,
      });

      router.push(
        `/verify-code?flow=reset&email=${encodeURIComponent(data.email)}`
      );
    } catch (err: any) {
      const message =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        "Could not find an account with that email.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white-100">
          Forgot Password?
        </h1>
        <p className="mt-1 text-sm text-customgreys-dirtyGrey">
          Enter your email to reset your password.
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
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending..." : "Submit"}
          </Button>
        </form>
      </Form>

      <p className="text-center text-sm text-customgreys-dirtyGrey">
        Remember Password?{" "}
        <Link
          href="/signin"
          className="font-medium text-primary-400 hover:text-primary-300"
        >
          Sign In
        </Link>
      </p>
    </div>
  );
};

export default ForgotPasswordForm;
