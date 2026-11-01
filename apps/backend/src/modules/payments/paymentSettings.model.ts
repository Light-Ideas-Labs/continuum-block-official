import mongoose, { Schema } from "mongoose";

const mpesaPaybillSchema = new Schema(
  {
    businessNumber: { type: String, required: true }, // 400200
    accountNumber: { type: String, required: true },  // 1100806
    businessName: { type: String, required: true },   // CONTINUUM BLOCK TECH
    instructions: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const coopBankSchema = new Schema(
  {
    bankName: { type: String, default: "Co-operative Bank" },
    accountName: { type: String, required: true }, // CONTINUUM BLOCK TECH
    accountType: { type: String, default: "MSME" },
    accountNumber: { type: String, required: true }, // 01102322450001
    branch: { type: String, default: "" },
    swiftCode: { type: String, default: "" },
    instructions: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const paymentSettingsSchema = new Schema(
  {
    orgKey: { type: String, required: true, unique: true, default: "continuum-block" },
    mpesaPaybill: { type: mpesaPaybillSchema, required: true },
    coopBank: { type: coopBankSchema, required: true },
  },
  { timestamps: true }
);

const PaymentSettings = mongoose.model("PaymentSettings", paymentSettingsSchema);
export default PaymentSettings;
