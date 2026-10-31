"use client";

import React from "react";
import { useUser } from "@clerk/nextjs";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import { useQuizAttempts } from "@/hooks/useQuizAttempts";

const UserQuizAttempts = () => {
  const { user, isLoaded } = useUser();
  const { attempts, isLoading, isError } = useQuizAttempts();

  if (!isLoaded || isLoading) return <Loading />;
  if (!user) return <div>Please sign in to view your quiz attempts.</div>;
  if (isError) return <div>Failed to load quiz attempts.</div>;

  return (
    <div className="user-quiz-attempts">
      <Header title="My Quiz Attempts" subtitle="Quizzes you've taken across your courses" />

      {attempts.length === 0 ? (
        <p className="mt-4 text-sm text-customgreys-dirtyGrey">
          No quiz attempts yet. Take a quiz in one of your courses to see it here.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {attempts.map((attempt) => (
            <div
              key={`${attempt.courseId}-${attempt.chapterId}`}
              className="flex items-center justify-between rounded-lg border border-customgreys-darkGrey bg-customgreys-secondarybg p-4"
            >
              <div>
                <p className="font-medium text-white-100">{attempt.chapterTitle}</p>
                <p className="text-sm text-customgreys-dirtyGrey">{attempt.courseTitle}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${
                  attempt.passed
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                {Math.round(attempt.score)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserQuizAttempts;
