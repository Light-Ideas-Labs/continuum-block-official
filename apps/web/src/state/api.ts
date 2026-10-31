import calculateOverallProgress from "@/lib/progressUtils";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BaseQueryApi, FetchArgs } from "@reduxjs/toolkit/query";
import { User } from "@clerk/nextjs/server";
import { Clerk } from "@clerk/clerk-js";
import { toast } from "sonner";

import { Mention, TweetUser } from "@/types/type";

const customBaseQuery = async (args: string | FetchArgs, api: BaseQueryApi, extraOptions: any) => {
  const baseQuery = fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: async (headers) => {
      const token = await window.Clerk?.session?.getToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  });

  try {
    const result: any = await baseQuery(args, api, extraOptions);
    console.log("results....", result)

    if (result.error) {
      const errorData = result.error.data;
      const errorMessage = errorData?.message || result.error.status.toString() || "An error occurred";
      toast.error(`Error: ${errorMessage}`);
    }

    const isMutationRequest = (args as FetchArgs).method && (args as FetchArgs).method !== "GET";

    if (isMutationRequest) {
      const successMessage = result.data?.message;
      if (successMessage) toast.success(successMessage);
    }

    if (result.data) {
      result.data = result.data.data;
    } else if (
      result.error?.status === 204 ||
      result.meta?.response?.status === 24
    ) {
      return { data: null };
    }

    return result;
  } catch (error: unknown) {
    console.log("error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return { error: { status: "FETCH_ERROR", error: errorMessage } };
  }
};

export const api = createApi({ 
  baseQuery: customBaseQuery, 
  reducerPath: "api", 
  tagTypes: ["Users", "Courses", "Bootcamps", "CourseProgress"], 
  
  endpoints: (build) => ({
    /* USER CLERK AND MONGODB USER */
    createUser: build.mutation<User,{ userId: string; firstName: string; lastName: string; email: string; userType?: string }>({
      query: (newUser) => ({
        url: "users/create/${newUser.userId}",
        method: "POST",
        body: newUser,
      }),
      invalidatesTags: ["Users"],
    }),

    updateUser: build.mutation<User, { userId: string; email?: string; firstName?: string; lastName?: string; userType?: string; }>({
      query: ({ userId, ...updatedUser }) => ({
        url: `users/update/${userId}`,
        method: "PUT",
        body: updatedUser,
      }),
      invalidatesTags: ["Users"],
    }),

    /* COURSES */
    createCourse: build.mutation({
      query: (courseData) => ({
        url: "courses/create",
        method: "POST",
        body: courseData,
      }),
      invalidatesTags: ["Courses"],
    }),
    
    listCourses: build.query<Course[], { category?: string }>({
      query: ({ category }) => ({
        url: "courses/all-courses",
        params: { category },
      }),
      providesTags: ["Courses"],
    }),

    listCoursesByIds: build.query<Course[], string[]>({
      query: (courseIds) => ({
        url: "courses/by-ids",
        method: "POST",
        body: { courseIds },
      }),
      providesTags: ["Courses"],
    }),

    getCourse: build.query({
      query: (id: string) => ({
        url: `courses/${id}`,
        method: "GET",
      }),
      
      providesTags: (result, error, id) => [{ type: "Courses", id }],
    }),

    updateCourse: build.mutation({
      query: ({ courseId, updateData }) => ({
        url: `courses/update/${courseId}`,
        method: "PUT",
        body: updateData as FormData,
      }),
      invalidatesTags: (result, error, { courseId }) => [{ type: "Courses", id: courseId }],
    }),

    deleteCourse: build.mutation({
      query: (courseId: string) => ({
        url: `courses/delete/${courseId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Courses"],
    }),

    getUploadVideoUrl: build.mutation({
      query: ({ courseId, sectionId, chapterId, formData }) => ({
        url: `courses/${courseId}/sections/${sectionId}/chapters/${chapterId}/get-upload-url`,
        method: "POST",
        body: formData,
      }),
    }),

    // Fetch quizzes for a specific chapter
    getChapterQuizzes: build.query<Quiz[], { courseId: string; chapterId: string }>({
      query: ({ courseId, chapterId }) => ({
        url: `courses/${courseId}/chapters/${chapterId}/quizzes`,
        method: "GET",
      }),
      providesTags: (result, error, { chapterId }) => [{ type: "Courses", id: chapterId }],
    }),

    // Submit quiz response (optional, if you want to track user answers)
    submitQuizResponse: build.mutation<
      { success: boolean; message: string },
      { courseId: string; chapterId: string; quizId: string; questionId: string; answer: string; userId: string }
    >({
      query: ({ courseId, chapterId, quizId, questionId, answer, userId }) => ({
        url: `courses/${courseId}/chapters/${chapterId}/quizzes/${quizId}/submit`,
        method: "POST",
        body: { questionId, answer, userId },
      }),
      invalidatesTags: (result, error, { chapterId }) => [{ type: "Courses", id: chapterId }],
    }),

    /* BOOTCAMPS */
    createBootcamp: build.mutation({
      query: (bootcampData) => ({
        url: "bootcamps/create",
        method: "POST",
        body: bootcampData,
      }),
      invalidatesTags: ["Bootcamps"],
    }),

    listBootcamps: build.query<Bootcamp[], { type?: string }>({
      query: ({ type }) => ({
        url: "bootcamps/all-bootcamps",
        params: { type },
      }),
      providesTags: ["Bootcamps"],
    }),

    getBootcamp: build.query({
      query: (id) => ({
        url: `bootcamps/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Bootcamps", id }],
    }),

    updateBootcamp: build.mutation({
      query: ({ bootcampId, updateData }) => ({
        url: `bootcamps/update/${bootcampId}`,
        method: "PUT",
        body: updateData as FormData,
      }),
      invalidatesTags: (result, error, { bootcampId }) => [{ type: "Bootcamps", id: bootcampId }],
    }),

    deleteBootcamp: build.mutation({
      query: (bootcampId) => ({
        url: `bootcamps/${bootcampId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Bootcamps"],
    }),

    addCourseToBootcamp: build.mutation<Bootcamp,{ bootcampId: string; courseId: string }>({
      query: ({ bootcampId, courseId }) => ({
        url: "bootcamps/add-course",
        method: "POST",
        body: { bootcampId, courseId },
      }),
      invalidatesTags: (result, error, { bootcampId }) => [{ type: "Bootcamps", id: bootcampId }],
    }),

    enrollMemberInBootcamp: build.mutation<
      Bootcamp,
      { bootcampId: string; memberId: string }
    >({
      query: ({ bootcampId, memberId }) => ({
        url: "bootcamps/enroll-member",
        method: "POST",
        body: { bootcampId, memberId },
      }),
      invalidatesTags: (result, error, { bootcampId }) => [{ type: "Bootcamps", id: bootcampId }],
    }),

    removeMemberFromBootcamp: build.mutation<
      Bootcamp,
      { bootcampId: string; memberId: string }
    >({
      query: ({ bootcampId, memberId }) => ({
        url: "bootcamps/remove-member",
        method: "POST",
        body: { bootcampId, memberId },
      }),
      invalidatesTags: (result, error, { bootcampId }) => [{ type: "Bootcamps", id: bootcampId }],
    }),

    /* TWEETS */
    getUserByUsername: build.query<TweetUser, string>({
      query: (username: string) => ({
        url: `tweets/user/by/username/${username}`,
        method: "GET"
      })
    }),
    getUserMentionsById: build.query<Mention, string>({
      query: (userId: string) => ({
        url: `tweets/user/${userId}/mentions`,
        method: "GET"
      })
    }),

    /* BUY COURSE TRANSACTIONS */
    createTransaction: build.mutation<Transaction, Partial<Transaction>>({
      query: (transaction) => ({
        url: "transactions",
        method: "POST",
        body: transaction,
      }),
    }),

    getTransactions: build.query<Transaction[], string>({
      query: (userId) => `transactions?userId=${userId}`,
    }),



    // createStripePaymentIntent: build.mutation<{ clientSecret: string }, { amount: number }>({
    //   query: ({ amount }) => ({
    //     url: `/transactions/stripe/payment-intent`,
    //     method: "POST",
    //     body: { amount },
    //   }),
    // }),

    /* M-PESA PAYMENT INTEGRATION */
    initiateMpesaPayment: build.mutation<any, { phone: string; amount: number; courseId: string; userId: string }>({
      query: (paymentData) => ({
        url: "transactions/mpesa/stkpush",
        method: "POST",
        body: paymentData,
      }),
    }),

    getTeacherStudents: build.query<TeacherStudent[], string>({
      query: (teacherId) => ({
        url: `transactions/${teacherId}/students`,
        method: "GET",
      }),
      providesTags: ["Users", "Courses", "Bootcamps"],
    }),

    /* INSTRUCTORS */

    listInstructors: build.query<InstructorSummary[], void>({
      query: () => ({ url: "users/instructors" }),
      providesTags: ["Users", "Courses", "Bootcamps"],
    }),

    getInstructor: build.query<InstructorDetail, string>({
      query: (teacherId) => ({ url: `users/instructors/${teacherId}` }),
      providesTags: (result, error, id) => [{ type: "Users", id }],
    }),

    /* USER COURSE PROGRESS */
    getUserEnrolledCourses: build.query({
      query: (userId: string) => ({
        url: `course-progress/${userId}/enrolled-courses`,
        method: "GET",
      }),
      providesTags: ["Courses", "CourseProgress"],
    }),

    getUserCourseProgress: build.query({
      query: ({ userId, courseId }: { userId: string; courseId: string }) => ({
        url: `course-progress/${userId}/courses/${courseId}`,
        method: "GET",
      }),
      providesTags: ["CourseProgress"],
    }),

    getUserCourseProgressBatch: build.query<CourseProgress[], { userId: string; courseIds: string[] }>({
      query: ({ userId, courseIds }) => ({
        url: `course-progress/${userId}/courses/batch`,
        method: "POST",
        body: { courseIds },
      }),
      providesTags: ["CourseProgress"],
    }),

    // leaderboard endpoint for a specific user
    getLearningLeaderboard: build.query({
      query: (userId: string) => ({
        url: `course-progress/leaderboard/${userId}`,
        method: "GET",
      }),
      providesTags: ["CourseProgress"],
    }),

    getCourseLeaderboard: build.query<LeaderboardEntry[], string>({
      query: (courseId: string) => ({
        url: `course-progress/leaderboard/course/${courseId}`,
        method: "GET",
      }),
      providesTags: ["CourseProgress"],
    }),

    updateUserCourseProgress: build.mutation({
      query: ({ userId, courseId, progressData }: { userId: string; courseId: string; progressData: any }) => ({
        url: `course-progress/${userId}/courses/${courseId}`,
        method: "PUT",
        body: progressData,
      }),
      invalidatesTags: ["CourseProgress"],
      async onQueryStarted(
        { userId, courseId, progressData },
        { dispatch, queryFulfilled }
      ) {
        console.log("fuck the Updating course progress for user:", userId, "course:", courseId, "with data:", progressData);
        const patchResult = dispatch(
          api.util.updateQueryData("getUserCourseProgress", { userId, courseId },
            (draft) => {
              // Merge the new sections data with the existing sections
              const updatedSections = progressData.sections.reduce((acc: any, newSection: any) => {
                const existingSection = acc.find((s: any) => s.sectionId === newSection.sectionId);

                if (existingSection) {
                  // Update chapters in the existing section
                  newSection.chapters.forEach((newChapter: any) => {
                    const existingChapter = existingSection.chapters.find((c: any) => c.chapterId === newChapter.chapterId);
                    if (existingChapter) {
                      Object.assign(existingChapter, {
                        ...existingChapter,
                        ...newChapter,
                        completionTime: newChapter.completed ? (existingChapter.completionTime || new Date().toISOString()) : existingChapter.completionTime || null,
                        score: newChapter.score !== undefined ? newChapter.score : existingChapter.score || 0,
                        isLocked: newChapter.isLocked !== undefined ? newChapter.isLocked : existingChapter.isLocked || false,
                      });
                    } else {
                      existingSection.chapters.push({
                        ...newChapter,
                        completionTime: newChapter.completed ? new Date().toISOString() : null,
                        score: newChapter.score || 0,
                        isLocked: newChapter.isLocked || false,
                      });
                    }
                  });
                  return acc;
                }
                return [...acc, newSection];
              }, draft.sections || []);

              updatedSections.forEach((section: any) => {
                const totalScore = section.chapters.reduce((sum: number, chapter: any) => sum + (chapter.score || 0), 0);
                section.sectionScore = section.chapters.length > 0 ? totalScore / section.chapters.length : 0;
              });
              
              // Update the draft with the new sections and recalculate overall progress
              draft.sections = updatedSections;
              draft.overallProgress = calculateOverallProgress(updatedSections); // Use the utility function
              draft.totalPoints = Math.min(draft.overallProgress * 100, 100) * 10;
              draft.totalPrize = Math.min(draft.overallProgress * 100, 100) * 50;
              draft.completionStatus = draft.overallProgress === 1 ? "completed" : "in-progress";
              draft.lastActivityDate = new Date().toISOString();

              const existingBadges = draft.badges ? draft.badges.map((badge: any) => badge.name) : [];
              if (draft.overallProgress >= 0.5 && !existingBadges.includes("Intermediate Learner")) {
                draft.badges.push({
                  name: "Intermediate Learner",
                  category: "Heroic",
                  level: 1,
                  earnedAt: new Date().toISOString(),
                  description: "Reached 50% completion—halfway to greatness!",
                });
              }
              if (draft.overallProgress === 1 && !existingBadges.includes("Course Master")) {
                draft.badges.push({
                  name: "Course Master",
                  category: "Heroic",
                  level: 3,
                  earnedAt: new Date().toISOString(),
                  description: "Completed the course a true hero of learning!",
                });
              }
              
              draft.engagementScore = (draft.engagementScore || 0) + 10; // Increment engagement score for each update
            })
          );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),

  });

export const {
  useCreateUserMutation,
  useUpdateUserMutation,

  useGetUserMentionsByIdQuery,
  useGetUserByUsernameQuery,

  useCreateCourseMutation,
  useListCoursesQuery,
  useListCoursesByIdsQuery,
  useGetCourseQuery,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  useGetUploadVideoUrlMutation,
  useGetChapterQuizzesQuery, 
  useSubmitQuizResponseMutation,

  useCreateBootcampMutation,
  useListBootcampsQuery,
  useGetBootcampQuery,
  useUpdateBootcampMutation,
  useDeleteBootcampMutation,
  useAddCourseToBootcampMutation,
  useEnrollMemberInBootcampMutation,
  useRemoveMemberFromBootcampMutation,

  useCreateTransactionMutation,
  useGetTransactionsQuery,
  useInitiateMpesaPaymentMutation,
  // useCreateStripePaymentIntentMutation,

  useGetTeacherStudentsQuery,

  useListInstructorsQuery,
  useGetInstructorQuery,

  useGetUserEnrolledCoursesQuery,
  useGetUserCourseProgressQuery,
  useGetUserCourseProgressBatchQuery,
  useGetLearningLeaderboardQuery, 
  useGetCourseLeaderboardQuery, 
  useUpdateUserCourseProgressMutation,

} = api;
