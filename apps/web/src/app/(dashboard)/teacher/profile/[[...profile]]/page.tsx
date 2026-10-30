import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { UserProfile, useUser } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import React from "react";

const TeacherProfilePage = () => {
  const { user } = useUser();

  return (
    <>
      <Header
        title="Profile"
        subtitle="View your profile"
        rightElement={
          user && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/instructors/${user.id}`} target="_blank">
                <ExternalLink className="mr-2 size-4" />
                View public profile
              </Link>
            </Button>
          )
        }
      />
      <UserProfile
        path="/teacher/profile"
        routing="path"
        appearance={{
          baseTheme: dark,
          elements: {
            scrollBox: "bg-customgreys-darkGrey",
            navbar: {
              "& > div:nth-child(1)": {
                background: "none",
              },
            },
          },
        }}
      />
    </>
  );
};

export default TeacherProfilePage;
