"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Stack, Input, Text, Button, FormControl, FormLabel, useToast } from '@chakra-ui/react';
import Link from 'next/link';
import { loginUser } from '@/services/userService';

export default function LoginPage() {
  const toast = useToast();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async () => {
    try {
      await loginUser(email, password);
      toast.closeAll();
      toast({
        title: 'Success',
        description: 'Logged in successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      router.push('/questions');
    } catch (error) {
      toast.closeAll();
      toast({
        title: 'Error',
        description: 'Invalid email or password',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      setEmail('');
      setPassword('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <Stack spacing={4} className='bg-[#E2E8F0] p-7 rounded-lg' width='450px'>
      <Text fontSize='20px' color='black' as='b' mb='10px'>Login</Text>
      <FormControl>
        <FormLabel fontSize='15px' color='black'>Email Address</FormLabel>
        <Input
          placeholder='Enter your email address'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          bg='white'
          size='md'
        />
      </FormControl>
      <FormControl>
        <FormLabel fontSize='15px' color='black'>Password</FormLabel>
        <Input
          placeholder='Enter your password'
          type='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          bg='white'
          size='md'
        />
      </FormControl>
      <Button colorScheme='blue' onClick={handleSubmit} mt='30px' mb='20px'>Login</Button>
      <Stack align="center">
        {/* <Link href={"/resetpassword"}>
          <Text variant="link" fontSize='10px' color='black' textDecoration='underline' onClick={() => router.push("/resetpassword")}>Forgot password?</Text>
        </Link> */}
        <Stack direction="row" spacing={1}>
          <Text fontSize='10px' color='black'>Don't have an account?</Text>
          <Link href={"/signup"}>
            <Text variant="link" fontSize='10px' color='black' textDecoration='underline'>Sign up</Text>
          </Link>
        </Stack>
      </Stack>
    </Stack>
  );
}
