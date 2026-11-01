import { Request, Response } from "express";
import { clerkClient, getAuth } from "@clerk/express";

import User from "./model"

const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userData = req.body;

    // Step 2: Create the user in MongoDB
    const newUser = new User({
      clerkUserId: userData.id,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      userType: userData.userType || "student",
    });

    await newUser.save();

    res.status(201).json({
      message: "User created successfully",
      data: { 
        newUser 
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating user",
      error: error instanceof Error ? error.message : error,
    });
  }
};

const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    // Fetch user details from Clerk
    const clerkUser = await clerkClient.users.getUser(userId);

    // Fetch user details from MongoDB
    const mongoUser = await User.findOne({ clerkUserId: userId });

    res.json({
      message: "User details retrieved successfully",
      data: { clerkUser, mongoUser },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching user details",
      error: error instanceof Error ? error.message : error,
    });
  }
};

const listUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Fetch users from MongoDB (pagination example)
    const users = await User.find()
      .skip((+page - 1) * +limit)
      .limit(+limit);

    res.json({
      message: "Users retrieved successfully",
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving users",
      error: error instanceof Error ? error.message : error,
    });
  }
};

const syncUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    // Fetch user details from Clerk
    const clerkUser = await clerkClient.users.getUser(userId);

    const mongoUserUpdate = {
      firstName: clerkUser.firstName || undefined,
      lastName: clerkUser.lastName || undefined,
      email: clerkUser.emailAddresses[0]?.emailAddress || undefined,
      isVerified: clerkUser.emailAddresses[0]?.verification?.status === "verified",
      clerkMetadata: clerkUser.publicMetadata || {},
    };

    // Update MongoDB
    const updatedMongoUser = await User.findOneAndUpdate(
      { clerkUserId: userId },
      { $set: mongoUserUpdate },
      { new: true, upsert: true }
    );

    res.json({
      message: "User synchronized successfully",
      data: { clerkUser, mongoUser: updatedMongoUser },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error synchronizing user",
      error: error instanceof Error ? error.message : error,
    });
  }
};
  
  
  
const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { userId: authUserId } = getAuth(req);

    // Only the user themself, or an admin, may delete this account.
    if (authUserId !== userId) {
      const requester = authUserId ? await clerkClient.users.getUser(authUserId) : null;
      const requesterRole = (requester?.publicMetadata?.userType as string) || "student";
      if (requesterRole !== "admin") {
        res.status(403).json({ message: "You can only delete your own account" });
        return;
      }
    }

    // Delete user from Clerk
    await clerkClient.users.deleteUser(userId);

    // Delete user from MongoDB
    await User.findOneAndDelete({ clerkUserId: userId });

    res.json({
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting user",
      error: error instanceof Error ? error.message : error,
    });
  }
};
  

const updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        const { userId: authUserId } = getAuth(req);
        const userData = req.body;

        // Only the user themself, or an admin, may update this profile.
        if (authUserId !== userId) {
          const requester = authUserId ? await clerkClient.users.getUser(authUserId) : null;
          const requesterRole = (requester?.publicMetadata?.userType as string) || "student";
          if (requesterRole !== "admin") {
            res.status(403).json({ message: "You can only update your own profile" });
            return;
          }
        }

        // Step 1: Update the user in Clerk
        // NOTE: role/userType is intentionally not settable here — use the
        // admin-only PUT /promote-role/:userId endpoint to change roles.
        const clerkUser = await clerkClient.users.updateUserMetadata(userId, {
            publicMetadata: {
              settings: userData?.publicMetadata?.settings,
            },
          });

        // Step 2: Update the user in MongoDB
        const mongoUserUpdate = {
            firstName: clerkUser.firstName || undefined,
            lastName: clerkUser.lastName || undefined,
            email: clerkUser.emailAddresses[0]?.emailAddress || undefined,
            isVerified: clerkUser.emailAddresses[0]?.verification?.status === "verified",
            clerkMetadata: clerkUser.publicMetadata || {},
          };

          const updatedMongoUser = await User.findOneAndUpdate(
            { clerkUserId: userId },
            { $set: mongoUserUpdate },
            { new: true, upsert: true } // Create a new document if one doesn't exist
          );

          console.log("<=updated Mongo User=>", updatedMongoUser)
      
          res.json({ 
            message: "User updated successfully", 
            data: { clerkUser, mongoUser: updatedMongoUser } 
        });
    } catch (error) {
        console.log("<===error===>", error)
        res.status(500).json({ 
            message: "Error updating user", 
            error: error 
        });
    }
}

const ALLOWED_ROLES = ["student", "teacher", "admin"];

const promoteUserRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { role } = req.body; // 'student' | 'teacher' | 'admin'

    if (!ALLOWED_ROLES.includes(role)) {
      res.status(400).json({
        message: `role must be one of: ${ALLOWED_ROLES.join(", ")}`,
      });
      return;
    }

    // Update role in Clerk (userType is the convention used elsewhere in this codebase)
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        userType: role,
      },
    });

    // Update role in MongoDB
    const updatedMongoUser = await User.findOneAndUpdate(
      { clerkUserId: userId },
      { $set: { userType: role } },
      { new: true }
    );

    res.json({
      message: `User role updated to ${role} successfully`,
      data: updatedMongoUser,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating user role",
      error: error instanceof Error ? error.message : error,
    });
  }
};
  

export {
    createUser,
    getUser,
    listUsers,
    syncUser,
    deleteUser,
    updateUser,
    promoteUserRole
}