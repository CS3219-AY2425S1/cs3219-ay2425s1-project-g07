'use client';

import React from 'react';
import { useState, useEffect } from "react";
import { usePathname } from 'next/navigation';
import { Stack, Text, Spacer, Box, Flex, Spinner, useToast } from "@chakra-ui/react";
import { HamburgerIcon } from "@/public/icons/HamburgerIcon";
import { ChevronIcon } from "@/public/icons/ChevronIcon";
import NavbarCards, { NavbarCardProps } from "@/components/NavbarCard";
import questionImage from '@/public/images/questions.png';
import practiceImage from '@/public/images/practice.png';
import profileImage from '@/public/images/profile.png';
import Link from "next/link";
import useAuth from "@/hooks/useAuth";
import { useRouter } from 'next/navigation';

const items: NavbarCardProps[] = [
  {
    imageSrc: questionImage,
    title: "All Questions",
    description: "Create, edit, and view all questions here.",
    route: "/questions",
  },
  {
    imageSrc: practiceImage,
    title: "Practice",
    description: "Find a match and start practicing now!",
    route: "/practice",
  },
  {
    imageSrc: profileImage,
    title: "My Profile",
    description: "View your profile and change settings here.",
    route: "/profile",
  },
];

export default function Layout({
  children
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const toast = useToast();

  const [isToggled, setIsToggled] = useState(false);
  const [isUserTriggered, setIsUserTriggered] = useState(false);
  const pathname = usePathname();
  const { username, isLoading, isAuthenticated } = useAuth();

  const handleToggle = () => {
    setIsToggled(!isToggled);
    setIsUserTriggered(true);
  };

  useEffect(() => {
    setIsToggled(false);
    setIsUserTriggered(false);
  }, [pathname]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.closeAll();
      toast({
        title: "Please login first!",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router, toast]);

  if (isLoading) {
    return (
      <div className='flex flex-col justify-center items-center h-[100vh]'>
        <Spinner size='xl' thickness='4px' color='blue.500' emptyColor='gray.200' className="m-10" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; 
  }

  return (
    <Flex direction="column" height="100vh">
      <Stack direction="row" align="center" justify="space-between" className="bg-[#2C5282] p-2 px-8 ">
        <Link href="/questions">
          <Text className="logo-text">
            {'{PeerPrep}'}
          </Text>
        </Link>
        <Spacer />
        <>
          <Text fontSize="20px" color="white">
            {username}
          </Text>
          <Box ml={10} onClick={handleToggle} cursor="pointer">
            {isToggled ? <ChevronIcon /> : <HamburgerIcon />}
          </Box>
        </>
      </Stack>
      <Box
        position="absolute"
        top="60px"
        left="0"
        width="100%"
        className={`${isUserTriggered ? 'transition-all duration-500 ease-in-out' : ''}`}
        style={{ maxHeight: isToggled ? '500px' : '0', overflow: 'hidden' }}
        bg="white"
        zIndex="10"
      >
        <Stack direction="row" align="center" justify="space-between" className="px-8 ">
          {items.map((item, index) => (
            <NavbarCards key={index} {...item} />
          ))}
        </Stack>
      </Box>
      {children}
    </Flex>
  );
}
