import { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import fs from "fs";

import  { cloudinary } from "../../config/cloudinary.config";
import Bootcamp from "./model";
import Course from "../courses/model";
import { enrollMemberInBootcampCore } from "./bootcamp.utils";

// Create a new bootcamp
const createBootcamp = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("Request body:", req.body.hostedBy.type);

    const userId = req.body.hostedBy.id;
    const name =  req.body.hostedBy.name
    const type = req.body.hostedBy.type

    if (!userId || !name  || !type ) {
      res.status(400).json({
        message: "User ID and hostedBy details (name and id) are required"
      });
      return;
    }

    const startDate = new Date();
    const duration = "4 weeks";
    const durationInWeeks = parseInt(duration.split(" ")[0], 10); // Extract number of weeks
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + durationInWeeks * 7) // Add weeks to startDate

    const newBootcamp = new Bootcamp({
      hostedBy:{
        type: type || "Individual",
        name: name,
        id: userId
      },
      title: "Untitled Bootcamp",
      description: "No description provided",
      startDate: new Date(),
      endDate,
      duration: "4 weeks", // Default duration
      type: "Part-Time", // Default type
      liveClasses: {
        count: 1,
        description: "No live classes scheduled",
        schedule: [],
      },
      practicalCaseStudy: "Not specified",
      weeklyFeedback: "Not specified",
      certification: "Certificate of Completion",
      enrollmentStatus: "Open",
      status: "Draft",
      courses: [],
      members: [],
      price: {
        amount: 0,
        currency: "USD"
      }
    });

    await newBootcamp.save();

    res.status(201).json({
      message: "Bootcamp created successfully",
      data: newBootcamp,
    });
  } catch (error) {
    console.log("Error creating bootcamp:", error);
    res.status(500).json({
      message: "Error creating bootcamp",
      error,
    });
  }
};

// List all bootcamps with optional filtering
const listBootcamps = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type } = req.query;

    // Build query based on filters
    const query = type && type !== "all" ? { type } : {};
    const bootcamps = await Bootcamp.find(query);
    console.log("Bootcamps retrieved:", bootcamps);

    res.status(200).json({
      message: "Bootcamps retrieved successfully",
      data: bootcamps,
    });
  } catch (error) {
    console.error("Error retrieving bootcamps:", error);
    res.status(500).json({
      message: "Error retrieving bootcamps",
      error,
    });
  }
};

// Get a specific bootcamp by ID
const getBootcamp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bootcampId } = req.params;

    const bootcamp = await Bootcamp.findById(bootcampId);
    if (!bootcamp) {
      res.status(404).json({
        message: "Bootcamp not found",
      });
      return;
    }

    res.status(200).json({
      message: "Bootcamp retrieved successfully",
      data: bootcamp,
    });
  } catch (error) {
    console.error("Error retrieving bootcamp:", error);
    res.status(500).json({
      message: "Error retrieving bootcamp",
      error,
    });
  }
};

// Update a bootcamp
const updateBootcamp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bootcampId } = req.params;
    const { title, startDate, duration, type, liveClasses, practicalCaseStudy, weeklyFeedback, certification, enrollmentStatus, status } = req.body;
    let image = req.file ? req.file.path : null;
    const { userId } = getAuth(req);

    console.log("Bootcamp ID:", bootcampId);
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);

    if (!userId) {
      res.status(401).json({ message: "Unauthorized: User not authenticated" });
      return;
    }

    const bootcamp = await Bootcamp.findById(bootcampId);
    if (!bootcamp) {
      res.status(404).json({
        message: "Bootcamp not found",
      });
      return;
    }
    

    // Check if the user is authorized to update (assuming you add a `createdBy` field)
    // if (bootcamp.createdBy !== userId) {
    //   res.status(403).json({ message: "Not authorized to update this bootcamp" });
    //   return;
    // }

    // Prepare updated data
    const updateData: any = {};
    if (title) updateData.title = title;
    if (startDate) updateData.startDate = new Date(startDate);
    if (duration) updateData.duration = duration;
    if (type) updateData.type = type;
    if (liveClasses) {
      updateData.liveClasses = {
        count: liveClasses.count ?? bootcamp.liveClasses?.count ?? 0,
        description: liveClasses.description ?? bootcamp.liveClasses?.description ?? "No live classes scheduled",
      };
    }
    if (practicalCaseStudy) updateData.practicalCaseStudy = practicalCaseStudy;
    if (weeklyFeedback) updateData.weeklyFeedback = weeklyFeedback;
    if (certification) updateData.certification = certification;
    if (enrollmentStatus) updateData.enrollmentStatus = enrollmentStatus;
    if (status) updateData.status = status;
    updateData.updatedAt = new Date();
    
    // UPLOAD IMAGE TO CLOUDINARY
    if (image) {
        const result = await cloudinary.uploader.upload(image, {
            folder: "continuum_block/Bootcamp", // Optional: to have a folder in cloudinary
            public_id: bootcampId + "_image" // Optional: to have a custom public ID
        });
        updateData.image = result.url;  // Assuming `image` field in your course schema
        fs.unlinkSync(image); // Delete the file locally after uploading
    }

    console.log("Final update data:", updateData);
    const updatedBootcamp = await Bootcamp.findByIdAndUpdate(bootcampId, updateData, { new: true });

    res.status(200).json({
      message: "Bootcamp updated successfully",
      data: updatedBootcamp,
    });
  } catch (error) {
    console.error("Error updating bootcamp:", error);
    res.status(500).json({
      message: "Error updating bootcamp",
      error,
    });
  }
};

// Delete a bootcamp
const deleteBootcamp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bootcampId } = req.params;
    const { userId } = getAuth(req);

    if (!userId) {
      res.status(401).json({ message: "Unauthorized: User not authenticated" });
      return;
    }

    const bootcamp = await Bootcamp.findById(bootcampId);
    if (!bootcamp) {
      res.status(404).json({
        message: "Bootcamp not found",
      });
      return;
    }

    // Check authorization (assuming you add a `createdBy` field)
    // if (bootcamp.createdBy !== userId) {
    //   res.status(403).json({ message: "Not authorized to delete this bootcamp" });
    //   return;
    // }

    await Bootcamp.deleteOne({ bootcampId });

    res.status(200).json({
      message: "Bootcamp deleted successfully",
      data: bootcamp,
    });
  } catch (error) {
    console.error("Error deleting bootcamp:", error);
    res.status(500).json({
      message: "Error deleting bootcamp",
      error,
    });
  }
};

// Add a course to a bootcamp
const addCourseToBootcamp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bootcampId, courseId } = req.body;
    const { userId } = getAuth(req);

    if (!userId) {
      res.status(401).json({ message: "Unauthorized: User not authenticated" });
      return;
    }

    const bootcamp = await Bootcamp.findById(bootcampId);
    if (!bootcamp) {
      res.status(404).json({
        message: "Bootcamp not found",
      });
      return;
    }

    // Check authorization (assuming you add a `createdBy` field)
    // if (bootcamp.createdBy !== userId) {
    //   res.status(403).json({ message: "Not authorized to modify this bootcamp" });
    //   return;
    // }

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({
        message: "Course not found",
      });
      return;
    }

    // Check if the course is already in the bootcamp
    const courseExists = bootcamp.courses.some((c: any) => c.courseId === courseId);
    if (courseExists) {
      res.status(400).json({
        message: "Course already added to this bootcamp",
      });
      return;
    }

    // Add the course to the bootcamp
    bootcamp.courses.push({
      courseId: courseId,
      title: course.title,
    });

    await bootcamp.save();

    res.status(200).json({
      message: "Course added to bootcamp successfully",
      data: bootcamp,
    });
  } catch (error) {
    console.error("Error adding course to bootcamp:", error);
    res.status(500).json({
      message: "Error adding course to bootcamp",
      error,
    });
  }
};

// Enroll a member in a bootcamp
const enrollMemberInBootcamp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bootcampId, memberId, fullName } = req.body;
    const { userId } = getAuth(req);

    if (!userId) {
      res.status(401).json({ message: "Unauthorized: User not authenticated" });
      return;
    }

    const result = await enrollMemberInBootcampCore(bootcampId, memberId, fullName);
    if (!result.ok) {
      res.status(result.status).json({ message: result.message });
      return;
    }

    res.status(200).json({
      message: "Member enrolled in bootcamp successfully",
      data: result.bootcamp,
    });
  } catch (error) {
    console.error("Error enrolling member in bootcamp:", error);
    res.status(500).json({
      message: "Error enrolling member in bootcamp",
      error,
    });
  }
};

// Remove a member from a bootcamp
const removeMemberFromBootcamp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bootcampId, memberId } = req.body;
    const { userId } = getAuth(req);

    if (!userId) {
      res.status(401).json({ message: "Unauthorized: User not authenticated" });
      return;
    }

    const bootcamp = await Bootcamp.findById(bootcampId);
    if (!bootcamp) {
      res.status(404).json({
        message: "Bootcamp not found",
      });
      return;
    }

    // Check authorization (assuming you add a `createdBy` field)
    // if (bootcamp.createdBy !== userId) {
    //   res.status(403).json({ message: "Not authorized to modify this bootcamp" });
    //   return;
    // }

    // Check if the member is enrolled
    const memberIndex = bootcamp.members.findIndex((m: any) => m.memberId === memberId);
    if (memberIndex === -1) {
      res.status(400).json({
        message: "Member not found in this bootcamp",
      });
      return;
    }

    // Remove the member from the bootcamp
    bootcamp.members.splice(memberIndex, 1);

    await bootcamp.save();

    res.status(200).json({
      message: "Member removed from bootcamp successfully",
      data: bootcamp,
    });
  } catch (error) {
    console.error("Error removing member from bootcamp:", error);
    res.status(500).json({
      message: "Error removing member from bootcamp",
      error,
    });
  }
};

export {
  createBootcamp,
  listBootcamps,
  getBootcamp,
  updateBootcamp,
  deleteBootcamp,
  addCourseToBootcamp,
  enrollMemberInBootcamp,
  removeMemberFromBootcamp,
};