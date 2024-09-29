"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This is the entry point of the application. 
// It redirects to the login page.
const HomePage = () => {
  const router = useRouter();

  useEffect(() => {
    router.push('/questions');
  }, [router]);

  return null;
};

export default HomePage;
