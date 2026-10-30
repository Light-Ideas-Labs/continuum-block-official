import axios from "axios";
import { env } from "../config/envConfig";

export const initiateFlutterwavePayment = async ({
  amount,
  email,
  name,
  tx_ref,
}: {
  amount: number;
  email: string;
  name: string;
  tx_ref: string;
}) => {
  const response = await axios.post(
    "https://api.flutterwave.com/v3/payments",
    {
      tx_ref,
      amount,
      currency: "KES",
      redirect_url: `${env.APP_FRONTEND_URL}/payment-success`,
      customer: {
        email,
        name,
      },
      customizations: {
        title: "Continuum Block",
        description: "Course Payment",
      },
    },
    {
      headers: {
        Authorization: `Bearer ${env.FLW_CLIENT_SECRET_KEY}`,
      },
    }
  );

  return response.data;
};