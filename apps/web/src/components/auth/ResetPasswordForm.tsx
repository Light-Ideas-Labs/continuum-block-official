"use client";

import React, { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { CustomFormField } from "@/components/CustomFormField";
import PasswordStrengthMeter from "@/components/auth/PasswordStrengthMeter";
import { resetPasswordSchema, ResetPasswordFormData } from "@/lib/schemas";

const ResetPasswordForm = () => {
  const { isLoaded, signIn } = useSignIn();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const password = methods.watch("password");

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!isLoaded) return;
    setIsSubmitting(true);
    try {
      const result = await signIn.resetPassword({ password: data.password });
      if (result.status === "complete") {
        toast.success("Password reset. Please sign in with your new password.");
        router.push("/signin");
      } else {
        toast.error("Could not reset password. Please try again.");
      }
    } catch (err: any) {
      const message =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        "Could not reset password. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white-100">Set Password</h1>
        <p className="mt-1 text-sm text-customgreys-dirtyGrey">
          Your new password must be different from previous password
        </p>
      </div>

      <Form {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
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
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ResetPasswordForm;
