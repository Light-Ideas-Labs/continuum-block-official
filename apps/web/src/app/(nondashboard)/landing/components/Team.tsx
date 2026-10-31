"use client";

import { useState, useEffect } from "react"
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card";
import { Facebook, Instagram, Linkedin } from "lucide-react";

interface TeamProps {
  imageUrl: string;
  name: string;
  position: string;
  description: string;
  socialNetworks: SociaNetworkslProps[];
}

interface SociaNetworkslProps {
  name: string;
  url: string;
}

const teamList: TeamProps[] = [
  {
    imageUrl: "https://res.cloudinary.com/dbfydlpwo/image/upload/v1741347307/continuum_block/hzpq5irvpbub7gxiibe0.jpg",
    name: "Jordan Muthemba",
    position: "Founder & Blockchain Trainer",
    description: `“Blockchain isn't just a technological evolution; it's a cultural revolution... It's crucial we navigate not just with the intent to innovate, but also with a commitment to ethical practices that benefit all.”`,
    socialNetworks: [
      {
        name: "Linkedin",
        url: "https://www.linkedin.com/in/leopoldo-miranda/",
      },
      {
        name: "Instagram",
        url: "https://www.instagram.com/",
      },
    ],
  },
  {
    imageUrl: "https://i.pravatar.cc/150?img=35",
    name: "Michael Chege",
    position: "Marketing Strategist & co-Founder",
    description: `“Blockchain isn't just tech—it's a bold shift redefining trust and transparency. From decentralized dreams to a future where fairness is built-in, it's our chance to innovate responsibly. Join us to shape this equitable world.”`,
    socialNetworks: [
      {
        name: "Linkedin",
        url: "",
      },
      {
        name: "Facebook",
        url: "",
      },
      {
        name: "Instagram",
        url: "",
      },
    ],
  },
  // {
  //   imageUrl: "https://i.pravatar.cc/150?img=17",
  //   name: "Bruce Rogers",
  //   position: "Backend Developer",
  //   socialNetworks: [
  //     {
  //       name: "Linkedin",
  //       url: "https://www.linkedin.com/in/leopoldo-miranda/",
  //     },
  //     {
  //       name: "Facebook",
  //       url: "https://www.facebook.com/",
  //     },
  //   ],
  // },
];


const Team = () => {

  const socialIcon = (iconName: string) => {
    switch (iconName) {
      case "Linkedin":
        return <Linkedin size="20" />;

      case "Facebook":
        return <Facebook size="20" />;

      case "Instagram":
        return <Instagram size="20" />;
    }
  };

  return (
    <section id="team" className="container py-24 sm:py-32">
      <h2 className="text-3xl lg:text-4xl font-bold md:text-center">
        <span className="bg-gradient-to-b from-[#F596D3] to-[#D247BF] text-transparent bg-clip-text">
        Continuum Block Pioneers{" "}
        </span>
        The Architects of Innovation
      </h2>

      <p className="md:w-3/4 mx-auto mt-4 mb-8 text-xl text-muted-foreground text-center">
      Meet the Continuum Block Pioneers, a group of visionary developers, strategists, and thinkers dedicated to reshaping the landscape of blockchain technology. 
      Our team is not just built on expertise but on a foundation of passion and a relentless pursuit of innovation. Each member brings a unique blend of skills and experiences, driving us forward as we develop groundbreaking solutions and foster a decentralized future. 
      From coding new protocols to strategizing the blockchain&apos;s integration into everyday life, our pioneers are on the front lines, ensuring Continuum Block remains at the cutting edge of blockchain technology.
      </p>

     <div className="flex justify-center gap-8 mt-8">       {/* grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 gap-y-10 items-center */}
        {teamList.map(({ imageUrl, name, position, description, socialNetworks }: TeamProps) => (
          <Card
            key={name}
            className="bg-muted/50 relative mt-8 flex flex-col justify-center items-center max-w-sm"
          >
            <CardHeader className="mt-8 flex flex-col justify-center items-center pb-2 pt-12">
              <div className="relative w-24 h-24">
                <Image
                  src={imageUrl}
                  alt={`${name} ${position.replace(/'/g, "'")}`}
                  width={150}
                  height={150}
                  className="rounded-full w-24 h-24 aspect-square object-cover absolute -top-12"
                />
              </div>
              <CardTitle className="text-center mt-12">{name}</CardTitle>
              <CardDescription className="text-center from-[#F596D3] to-[#D247BF]">
                {position}
              </CardDescription>
            </CardHeader>

            <CardContent className="text-center pb-2">
            <p>{description}</p>
            </CardContent>

            <CardFooter className="flex justify-center gap-2">
              {socialNetworks.map(({ name, url }: SociaNetworkslProps) => (
                <div key={name}>
                  <a
                    rel="noreferrer noopener"
                    href={url}
                    target="_blank"
                    className={buttonVariants({
                      variant: "ghost",
                      size: "sm",
                    })}
                  >
                    <span className="sr-only">{name} icon</span>
                    {socialIcon(name)}
                  </a>
                </div>
              ))}
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default Team
