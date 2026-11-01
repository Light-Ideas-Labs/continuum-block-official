import mongoose, { Schema } from "mongoose";
import { clerkClient } from "@clerk/express";

const emailRegexPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new Schema(
  {
    clerkUserId: { type: String, required: true, unique: true }, // Clerk user ID
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      validate: {
        validator: function (value: string) {
          return emailRegexPattern.test(value);
        },
        message: "please enter a valid email",
      },
      unique: true,
    },
    imgUrl: { type: String },
    avatar: { public_id: String, url: String },
    isVerified: { type: Boolean, default: false },
    userType: { type: String, enum: ["student", "teacher", "admin"], default: "student" },
    courses: [{ courseId: String }],
    clerkMetadata: { type: mongoose.Schema.Types.Mixed, default: {} }, // Store additional Clerk data like publicMetadata
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("clerkId")) {
    const clerkUser = await clerkClient.users.getUser(this.clerkUserId);
    if (clerkUser) {
      this.firstName = clerkUser.firstName || this.firstName;
      this.lastName = clerkUser.lastName || this.lastName;
      this.email = clerkUser.emailAddresses[0]?.emailAddress || this.email;
      this.isVerified = clerkUser.emailAddresses[0]?.verification?.status === "verified";
      this.clerkMetadata = clerkUser.publicMetadata;
    }
  }
  next();
});

const userModel = mongoose.model("Users", userSchema);
export default userModel;
