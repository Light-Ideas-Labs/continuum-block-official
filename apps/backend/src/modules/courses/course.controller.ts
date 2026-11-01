import { Request, Response } from "express";
import { getAuth, clerkClient } from "@clerk/express";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

import { getVideoDuration, formatDuration } from "../../utils/getVideoDuration";
import  { cloudinary } from "../../config/cloudinary.config";
import Course from "./model";

// Full access = the course owner, an admin, or someone with a completed
// enrollment. Everyone else only gets the redacted preview (see below).
const hasFullCourseAccess = async (course: any, req: Request): Promise<boolean> => {
    const { userId } = getAuth(req);
    if (!userId) return false;
    if (course.teacherId?.toString() === userId) return true;

    const enrolled = (course.enrollments || []).some((e: any) =>
        (typeof e === "string" ? e : e?.userId) === userId
    );
    if (enrolled) return true;

    const user = await clerkClient.users.getUser(userId).catch(() => null);
    return ((user?.publicMetadata?.userType as string) || "student") === "admin";
};

// Strip everything that lets a non-enrolled viewer consume paid content or
// see quiz answers — keep only what a marketing/curriculum-outline page needs.
const toPreviewCourse = (course: any) => {
    const obj = typeof course.toObject === "function" ? course.toObject() : course;
    return {
        ...obj,
        sections: (obj.sections || []).map((section: any) => ({
            sectionId: section.sectionId,
            sectionTitle: section.sectionTitle,
            sectionDescription: section.sectionDescription,
            duration: section.duration,
            chapters: (section.chapters || []).map((chapter: any) => ({
                chapterId: chapter.chapterId,
                type: chapter.type,
                title: chapter.title,
                duration: chapter.duration,
                locked: true,
            })),
        })),
    };
};

const createCourse = async (req: Request, res: Response): Promise<void> => {
    try {
        const { teacherId, teacherName } = req.body;
        
        if (!teacherId || !teacherName) {
            res.status(400).json({ 
                message: "Teacher Id and name are required" 
            });
            return;
        }
       
        const newCourse = new Course({
            teacherId,
            teacherName,
            title: "Untitled Course",
            description: "",
            category: "Uncategorized",
            image: "",
            price: 0,
            level: "Beginner",
            status: "Draft",
            sections: [],
            enrollments: [],
            quizResponses: [],
        });
        
        await newCourse.save();
        
        res.status(200).json({
            message: "Course created successfully",
            data: newCourse 
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Error creating course",
            error: error 
        });
    }
}

const listCourses = async (req: Request, res: Response): Promise<void> => {
    try {
        const { category } = req.query

        // Query courses based on the category parameter
        const query = category && category !== "all" ? { category } : {};
        const courses = await Course.find(query);

        res.json({
            message: "Courses retrieved successfully",
            data: courses
        }) 
    } catch (error) {
        console.log("error",error);
        res.status(500).json({ 
            message: "Error retrieving courses", 
            error: error 
        });
    }
}

const listCoursesByIds = async (req: Request, res: Response): Promise<void> => {
    try {
        const { courseIds } = req.body;
        if (!courseIds || !Array.isArray(courseIds)) {
            res.status(400).json({ message: "courseIds must be a non-empty array" });
            return;
        }
        
        const courses = await Course.find({ _id: { $in: courseIds } }).select("title image").exec();

        res.status(200).json({ 
            message: "Courses retrieved successfully the fuck", 
            data: courses 
        });
    } catch (error) {
        console.error("Error fetching courses by IDs:", error);
        res.status(500).json({ 
            message: "Error fetching courses", 
            error 
        });
    }
};


const getCourse = async (req: Request, res: Response): Promise<void> => {
    try {
        const { courseId } = req.params;

        const course = await Course.findById(courseId);

        if (!course) {
            res.status(404).json({
                message: "Course not found",
            })

            return
        }

        const fullAccess = await hasFullCourseAccess(course, req);

        res.status(200).json({
            message: "Course retrieved successfully",
            data: fullAccess ? course : toPreviewCourse(course),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error retrieving course",
            error: error
        });
    }
}

const updateCourse = async (req: Request, res: Response): Promise<void> => {
    try {
        const { courseId } = req.params;
        const { title, description, price, sections, category, status } = req.body;
        let image = req.file ? req.file.path : null;

        console.log("Update Course API called with courseId:", req.params);
        console.log("<====update body===>", req.body);
        console.log("<====update image===>", image);   
        const { userId } = getAuth(req);

        const course = await Course.findById(courseId);
        if (!course) {
            res.status(404).json({
                 message: "Course not found" 
                });
            return;
        }

        if (course.teacherId.toString() !== userId) {
            res.status(403).json({ 
                message: "Not authorized to update this course "
            });
            return;
        }

        // Prepare updated data
        const updateData: any = {};
        if (title) updateData.title = title;
        if (description) updateData.description = description;
        if (category) updateData.category = category;
        if (status) updateData.status = status;
        
        // UPLOAD IMAGE TO CLOUDINARY
        if (image) {
            const result = await cloudinary.uploader.upload(image, {
                folder: "continuum_block",
                public_id: courseId + "_image" // Optional: to have a custom public ID
            });
            updateData.image = result.url;  // Assuming `image` field in your course schema
            fs.unlinkSync(image); // Delete the file locally after uploading
        }
        
        if (price) {
            const numericPrice = parseInt(price);
            if (isNaN(numericPrice)) {
              res.status(400).json({
                message: "Invalid price format",
                error: "Price must be a valid number",
              });
              return;
            }
            updateData.price = numericPrice * 100;
        }

        let totalCourseDurationInSeconds = 0; // Track total course duration

        if (sections) {
            const sectionsData = typeof sections === "string" ? JSON.parse(sections) : sections;

            console.log("Sections data:", sectionsData);

            updateData.sections = sectionsData.map((section: any) => {
              let sectionDurationInSeconds = 0;

              const updatedChapters  = section.chapters.map((chapter: any) => {
                const updatedChapter = { ...chapter, chapterId: chapter.chapterId || uuidv4() };
                // Handle duration for each chapter
                if (chapter.type === "Video") {
                  // The frontend should pass the duration from getUploadVideoUrl
                  if (chapter.duration) {
                    updatedChapter.duration = chapter.duration; // e.g., "4min"
                    // Parse the duration to calculate the section total
                    const durationParts = chapter.duration.match(/(\d+)h?\s*(\d+)?min?/);
                    if (durationParts) {
                      const hours = parseInt(durationParts[1] || "0") * 3600;
                      const minutes = parseInt(durationParts[2] || "0") * 60;
                      sectionDurationInSeconds += hours + minutes;
                    }
                  } else {
                    // Fallback if duration is not provided
                    updatedChapter.duration = "0min";
                  }
                } else if (chapter.type === "Quiz") {
                  // Estimate quiz duration (e.g., 10 minutes)
                  updatedChapter.duration = chapter.duration || "10min";
                  sectionDurationInSeconds += 10 * 60; // 10 minutes in seconds
                } else if (chapter.type === "Text") {
                  // Estimate text duration (e.g., 5 minutes)
                  updatedChapter.duration = chapter.duration || "5min";
                  sectionDurationInSeconds += 5 * 60; // 5 minutes in seconds
                }

                // Handle quiz questions if present
                if (chapter.quiz) {
                  console.log(`Processing quiz for Chapter ${chapter.chapterId || updatedChapter.chapterId}:`, chapter.quiz);
                  updatedChapter.quiz = chapter.quiz.map((question: any) => {
                    const updatedQuestion = {
                      questionId: question.questionId || uuidv4(),
                      text: question.text,
                      options: question.options.map((option: any) => ({
                        optionId: option.optionId || uuidv4(),
                        text: option.text,
                        isCorrect: option.isCorrect,
                      })),
                    };
                    console.log(`Updated question for Chapter ${chapter.chapterId || updatedChapter.chapterId}:`, updatedQuestion);
                    return updatedQuestion;
                  });
                  console.log(`Updated quiz questions for Chapter ${chapter.chapterId || updatedChapter.chapterId}:`, updatedChapter.quiz);
                }
                return updatedChapter;
              });

              // Add section duration to total course duration
              totalCourseDurationInSeconds += sectionDurationInSeconds;

              return {
                ...section,
                sectionId: section.sectionId || uuidv4(),
                chapters: updatedChapters,
                duration: formatDuration(sectionDurationInSeconds), // Set the section duration
              }
            });
          }

          // Set the total course duration
          updateData.duration = formatDuration(totalCourseDurationInSeconds);
          
          console.log("Final update data:", updateData);
          await Course.findByIdAndUpdate(courseId, updateData, { new: true });
          const updatedCourse = await Course.findById(courseId);
          
          res.json({
            message: "Course updated successfully", 
            data: updatedCourse 
        });
    } catch(error) {
        console.log("<====error====>", error)
        res.status(500).json({ 
            message: "Error updating course", 
            error 
        });
    }
}

const getUploadVideoUrl = async (req: Request, res: Response): Promise<void> => {
    try {
        const file = req.file;
        console.log("file", file);

        if (!file) {
            res.status(400).json({
                message: "No file uploaded"
            });
            return;
        }

        const filePath = file.path;  // This depends on your multer setup to provide the local path
        const options = {
            folder: "continuum_block", 
            resource_type: "video" as "video",
            public_id: `videos/${uuidv4()}/${file.originalname}`,
            overwrite: true, // Depending on your requirement
        };

        // Upload the file directly to Cloudinary
        const result = await cloudinary.uploader.upload(filePath, options);

        // Optionally delete the file if it's temporarily stored locally
        fs.unlinkSync(filePath);

        // Extract the duration from the Cloudinary response
        const durationInSeconds = result.duration || 0; // Duration in seconds
        const formattedDuration = formatDuration(durationInSeconds); // Convert to human-readable format (e.g., "4min")
        console.log("formattedDuration", formattedDuration)

        res.json({
            message: "Video uploaded successfully",
            data: {
                uploadUrl: result.public_id,
                videoUrl: result.secure_url, // Use secure_url to ensure you use https
                duration: formattedDuration, // Return the formatted duration
            }
        });
    } catch (error) {
        console.error("Error uploading video:", error);
        res.status(500).json({
            message: "Error uploading video",
            error
        });
    }
}

const deleteCourse = async (req: Request, res: Response): Promise<void> => {
    try{
        const { courseId } = req.params;
        const { userId } = getAuth(req);

        const course = await Course.findById(courseId);
        console.log("course===>",course);
        if (!course) {
            res.status(404).json({ 
                message: "Course not found" 
            });
            return;
        }

        if (course.teacherId.toString() !== userId) {
            res.status(403).json({ 
                message: "Not authorized to delete this course " 
            });
            return;
        }

        await Course.findByIdAndDelete(courseId);

        res.json({ 
            message: "Course deleted successfully", 
            data: course 
        });
    } catch (error) {
        console.log("error===>",error);
        res.status(500).json({ 
            message: "Error deleting course", 
            error 
        });
    }
}

const addReview = async (req: Request, res: Response): Promise<void> => {
    try {
        const { courseId } = req.params;
        const { rating, comment } = req.body;
        const { userId } = getAuth(req);

        // Validate input
        if (!rating || !comment) {
            res.status(400).json({
                message: "Rating and comment are required"
            });
            return;
        }
        
        if (rating < 1 || rating > 5) {
            res.status(400).json({
                message: "Rating must be between 1 and 5"
            });
            return;
        }
        
        // Find the course
        const course = await Course.findById(courseId);
        if (!course) {
            res.status(404).json({
                message: "Course not found"
            });
            return;
        }

        // Create new review // Assuming req.user has a name property
        const newReview = {
            user: { userId, name: "Anonymous"}, 
            rating,
            comment,
            commentReplies: [],
        };

        // Add the review to the course
        course.reviews.push(newReview);
        
        // Calculate new average rating
        const totalRatings = course.reviews.reduce((sum, review) => sum + review.rating, 0);
        course.ratings = course.reviews.length > 0 ? totalRatings / course.reviews.length : 0;
        
        // Save the updated course
        await course.save();
        
        res.status(201).json({
            message: "Review added successfully",
            data:course
        });
    }  catch (error) {
        console.error("Error adding review:", error);
        res.status(500).json({
            message: "Error adding review",
            error
        });
    }
}

// New endpoint: Fetch quizzes for a specific chapter
const getChapterQuizzes = async (req: Request, res: Response): Promise<void> => {
    try {
      const { courseId, chapterId } = req.params;

      const { userId } = getAuth(req);
      if (!userId) {
        res.status(401).json({ message: "Authentication required" });
        return;
      }

      // Find the course
      const course = await Course.findById(courseId);
      if (!course) {
        res.status(404).json({
          message: "Course not found",
        });
        return;
      }

      if (!(await hasFullCourseAccess(course, req))) {
        res.status(403).json({
          message: "You must be enrolled in this course to access its quizzes",
        });
        return;
      }

      // Find the chapter within the course
      let targetChapter = null;
      for (const section of course.sections) {
        const chapter = section.chapters.find((ch: any) => ch.chapterId === chapterId);
        if (chapter) {
          targetChapter = chapter;
          break;
        }
      }
  
      if (!targetChapter) {
        res.status(404).json({
          message: "Chapter not found",
        });
        return;
      }
  
      // Check if the chapter has a quiz
      if (!targetChapter.quiz || targetChapter.quiz.length === 0) {
        res.status(404).json({
          message: "No quizzes found for this chapter",
        });
        return;
      }
  
      // Format the quiz data to match the frontend expectation
      const quizData = [
        {
          id: `quiz-${chapterId}`, // Generate a quiz ID (you can modify this logic)
          chapterId,
          // correctAnswer is intentionally never included here — the
          // answer key must not reach the client before it submits.
          questions: targetChapter.quiz.map((question: any) => ({
            id: question.questionId,
            question: question.text,
            options: question.options.map((option: any) => ({
              label: option.text,
              value: option.optionId,
            })),
          })),
        },
      ];
  
      res.status(200).json({
        message: "Quizzes retrieved successfully",
        data: quizData,
      });
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      res.status(500).json({
        message: "Error fetching quizzes",
        error,
      });
    }
  };

// New endpoint: Submit a quiz response
const submitQuizResponse = async (req: Request, res: Response): Promise<void> => {
    try {
      const { courseId, chapterId, quizId } = req.params;
      const { questionId, answer } = req.body;
      const { userId } = getAuth(req);

      if (!userId) {
        res.status(401).json({ message: "Authentication required" });
        return;
      }

      // Validate input
      if (!questionId || !answer) {
        res.status(400).json({
          message: "questionId and answer are required",
        });
        return;
      }

      // Find the course
      const course = await Course.findById(courseId);
      if (!course) {
        res.status(404).json({
          message: "Course not found",
        });
        return;
      }

      if (!(await hasFullCourseAccess(course, req))) {
        res.status(403).json({
          message: "You must be enrolled in this course to submit quiz answers",
        });
        return;
      }

      // Find the chapter
      let targetChapter = null;
      for (const section of course.sections) {
        const chapter = section.chapters.find((ch: any) => ch.chapterId === chapterId);
        if (chapter) {
          targetChapter = chapter;
          break;
        }
      }
  
      if (!targetChapter) {
        res.status(404).json({
          message: "Chapter not found",
        });
        return;
      }
  
      // Find the question
      const question = targetChapter.quiz.find((q: any) => q.questionId === questionId);
      if (!question) {
        res.status(404).json({
          message: "Question not found",
        });
        return;
      }
  
      // Check if the answer is correct
      const correctOption = question.options.find((option: any) => option.isCorrect);
      const isCorrect = correctOption && answer === correctOption.optionId;
  
      // Store the user's response
      const quizResponse = {
        userId,
        questionId,
        selectedOptionId: answer,
        isCorrect,
        submittedAt: new Date(),
      };
  
      course.quizResponses.push(quizResponse);
      await course.save();
  
      res.status(200).json({
        message: "Quiz response submitted successfully",
        data: { isCorrect },
      });
    } catch (error) {
      console.log("Error submitting quiz response:", error);
      res.status(500).json({
        message: "Error submitting quiz response",
        error,
      });
    }
  };


export {
    createCourse,
    listCourses,
    listCoursesByIds,
    getCourse,
    updateCourse,
    getUploadVideoUrl,
    deleteCourse,
    getChapterQuizzes, 
    submitQuizResponse,
}