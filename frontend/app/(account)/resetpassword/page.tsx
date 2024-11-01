// "use client";

// import { useState } from 'react';
// import { Stack, Input, Text, Button, FormControl, FormLabel } from '@chakra-ui/react';
// import Link from 'next/link';

// export default function ResetPasswordPage() {
//   const [email, setEmail] = useState('');

//   const handleReset = () => {
//     alert(`Email: ${email}`);
//     setEmail('');
//   };

//   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === 'Enter') {
//       handleReset();
//     }
//   };

//   return (
//     <Stack spacing={4} className='bg-[#E2E8F0] p-7 rounded-lg' width='450px'>
//       <Text fontSize='20px' color='black' as='b' >Reset Password</Text>
//       <Text fontSize='15px' color='black' mb='10px'>Please enter the email address associated with your account.</Text>
//       <FormControl>
//         <FormLabel fontSize='15px' color='black'>Email</FormLabel>
//         <Input
//           placeholder='Enter your email address'
//           bg='white'
//           size='md'
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//         />
//       </FormControl>
//       <Button colorScheme='blue' mt='30px' mb='20px' onClick={handleReset}>Send Reset Link</Button>
//       <Stack align="center">
//         <Stack direction="row" spacing={1}>
//           <Text fontSize='10px' color='black'>Back to</Text>
//           <Link href={"/login"}>
//             <Text variant="link" fontSize='10px' color='black' textDecoration='underline'>Login</Text>
//           </Link>
//         </Stack>
//       </Stack>
//     </Stack>
//   )
// }

// Keeping this so the build doesn't break
export default function ResetPasswordPage() {
  return <div></div>
}