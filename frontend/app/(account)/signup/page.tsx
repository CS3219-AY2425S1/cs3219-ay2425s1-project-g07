"use client";

import { useState } from 'react';
import { Stack, Input, Text, Button, FormControl, FormLabel } from '@chakra-ui/react';
import Link from 'next/link';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rePassword, setRePassword] = useState('');

  const handleSignup = () => {
    alert(`Email: ${email}\nUsername: ${username}\nPassword: ${password}\nRePassword: ${rePassword}`);
    setEmail('');
    setUsername('');
    setPassword('');
    setRePassword('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSignup();
    }
  };

  return (
    <Stack spacing={4} className='bg-[#E2E8F0] p-7 rounded-lg' width='450px'>
      <Text fontSize='20px' color='black' as='b' mb='10px'>Sign up</Text>
      <FormControl>
        <FormLabel fontSize='15px' color='black'>Email</FormLabel>
        <Input
          placeholder='Enter your email address'
          bg='white'
          size='md'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </FormControl>
      <FormControl>
        <FormLabel fontSize='15px' color='black'>Username</FormLabel>
        <Input
          placeholder='Enter your username'
          bg='white'
          size='md'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </FormControl>
      <FormControl>
        <FormLabel fontSize='15px' color='black'>Password</FormLabel>
        <Input
          placeholder='Enter your password'
          type='password'
          bg='white'
          size='md'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </FormControl>
      <FormControl>
        <FormLabel fontSize='15px' color='black'>Re-enter Password</FormLabel>
        <Input
          placeholder='Enter your password again'
          type='password'
          bg='white'
          size='md'
          value={rePassword}
          onChange={(e) => setRePassword(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </FormControl>
      <Button colorScheme='blue' mt='30px' mb='20px' onClick={handleSignup}>Sign up</Button>
      <Stack align="center">
        <Stack direction="row" spacing={1}>
          <Text fontSize='10px' color='black'>Already have an account?</Text>
          <Link href={"/login"}>
            <Text variant="link" fontSize='10px' color='black' textDecoration='underline'>Sign in</Text>
          </Link>
        </Stack>
      </Stack>
    </Stack>
  )
}