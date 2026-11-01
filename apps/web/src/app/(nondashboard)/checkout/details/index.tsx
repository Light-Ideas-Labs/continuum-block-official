"use client";

import CoursePreview from "@/components/CoursePreview";
import BootcampCheckoutPreview from "@/components/BootcampCheckoutPreview";
import { CustomFormField } from "@/components/CustomFormField";
import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import { useCurrentCourse } from "@/hooks/useCurrentCourse";
import { GuestFormData, guestSchema } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import React, {useState, useEffect} from "react";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import SignUpComponent from "@/components/SignUp";
import SignInComponent from "@/components/SignIn";
import { formatPrice } from "@/lib/utils";
import { useCreateTransactionMutation, useInitiateMpesaPaymentMutation } from "@/state/api";
import { useCheckoutNavigation } from "@/hooks/useCheckoutNavigation";
import { toast } from "sonner";

const CheckoutDetailsPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phone, setPhone] = useState("");

  const { navigateToStep, type } = useCheckoutNavigation();
  const { course: selectedCourse, isLoading, isError } = useCurrentCourse();
  const searchParams = useSearchParams();
  const showSignUp = searchParams.get("showSignUp") === "true";

  const [createTransaction] = useCreateTransactionMutation();
  const [initiateMpesaPayment] = useInitiateMpesaPaymentMutation();

  const methods = useForm<GuestFormData>({
    resolver: zodResolver(guestSchema),
    defaultValues: {
      email: "",
      phone: "",
    },
  });

  const handleFreeEnrollmentGuestCheckout = async (data: GuestFormData | undefined) => {
    try {
      const transactionData: Partial<Transaction> = {
        transactionId: `free_${Date.now()}`,
        userId: "guest",
        [type === "bootcamp" ? "bootcampId" : "courseId"]: selectedCourse._id,
        paymentProvider: 'Free',
        amount: selectedCourse.price || 0,
      };
      
      console.log("Free guest enrollment transaction data:", transactionData);
      await createTransaction(transactionData).unwrap();
      toast.success(`Enrolled to ${selectedCourse.title} course for free! (Price: ${formatPrice(selectedCourse.price)})`);
      navigateToStep(3); // Navigate to the completion page
    } catch (error) {
      console.log("Error enrolling in free course:", error);
      toast.error("Failed to enroll in free course");
    }
  }

  const handleMpesaGuestCheckout = async (data: GuestFormData) => {
    console.log("Form data: ==>>", formatPrice(selectedCourse.price), data);
    if (!selectedCourse || !selectedCourse.phone) return;

    const normalizedPhone = data.phone.replace(/^(\+254|254)/, "254"); // Normalize phone to 2547XXXXXXXX
    console.log("Normalized phone for M-Pesa:", normalizedPhone); // Debug

    if (!selectedCourse) return;

    try {
      const response = await initiateMpesaPayment({
        phone: normalizedPhone,
        amount: selectedCourse.price,
        [type === "bootcamp" ? "bootcampId" : "courseId"]: selectedCourse._id,
        userId: "guest", // Replace with actual user ID from Clerk or auth
      }).unwrap();

      console.log("M-Pesa payment initiated:", response);

      toast.success("M-Pesa payment initiated. Check your phone for the prompt!");
    } catch (error) {
      console.error("Error initiating M-Pesa payment:", error);
      toast.error("Failed to initiate M-Pesa payment");
    }
  };

  const handleSubmit = async (data: GuestFormData | undefined) => { 
    if (!data) return;
    setIsSubmitting(true);

    if (selectedCourse.price === 0) {
      await handleFreeEnrollmentGuestCheckout(data);
    } else {
      await handleMpesaGuestCheckout(data);
    }
  }




  if (isLoading) return <Loading />;
  if (isError) return <div>Failed to fetch course data</div>;
  if (!selectedCourse) return <div>Course not found</div>;

  return (
    <div className="checkout-details">
      <div className="checkout-details__container">
        <div className="checkout-details__preview">
          {type === "bootcamp" ? (
            <BootcampCheckoutPreview course={selectedCourse} />
          ) : (
            <CoursePreview course={selectedCourse} />
          )}
        </div>

        {/* STRETCH FEATURE */}
        <div className="checkout-details__options">
          <div className="checkout-details__guest">
            <h2 className="checkout-details__title">Guest Checkout</h2>
            <p className="checkout-details__subtitle">
              {selectedCourse.price > 0 ? "Enter your details to initiate M-Pesa payment and complete your purchase." : "Confirm your free course enrollment below."}
            </p>
            <Form {...methods}>
              <form id="payment-form" className="checkout-details__form" onSubmit={methods.handleSubmit((data) => { console.log(data); })} >
              {selectedCourse.price > 0 && (
                <>
                <CustomFormField
                  name="email"
                  label="Email address"
                  type="email"
                  className="w-full rounded mt-4"
                  labelClassName="font-normal text-white-50"
                  inputClassName="py-3"
                />
                
                <CustomFormField
                  name="phone"
                  label="Phone Number (M-Pesa)"
                  type="tel"
                  className="w-full rounded mt-4"
                  labelClassName="font-normal text-white-50"
                  inputClassName="py-3"
                  value={phone}
                  onChange={(e) => {
                    const newPhone = e.target.value;
                    setPhone(newPhone);
                    console.log("Phone state updated to:", newPhone); // Debug state update
                  }}
                  disabled={isSubmitting}
                  placeholder="(e.g., +2547XXXXXXXX)"
                />
                </>
              )}
              <Button 
                type={selectedCourse.price === 0 ? "button" : "submit"}
                onClick={selectedCourse.price === 0 ? () => handleFreeEnrollmentGuestCheckout : undefined}
                className="checkout-details__submit"
                disabled={isSubmitting || (selectedCourse.price > 0 && !methods.watch("phone"))}
              >
                {isSubmitting ? "Processing..." : selectedCourse.price > 0 ? "Pay with M-Pesa" : "Enroll for Free"}
                </Button>
              </form>
            </Form>
          </div>

          <div className="checkout-details__divider">
            <hr className="checkout-details__divider-line" />
            <span className="checkout-details__divider-text">Or</span>
            <hr className="checkout-details__divider-line" />
          </div>

          <div className="checkout-details__auth">
            {showSignUp ? <SignUpComponent /> : <SignInComponent />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutDetailsPage;
