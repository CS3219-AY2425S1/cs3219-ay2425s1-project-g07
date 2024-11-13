import { Stack, Text } from '@chakra-ui/react';

export default function Layout({
  children,
}: {
  children: React.ReactNode,
}) {
  return (
    <div className="flex items-center justify-evenly min-h-screen bg-[#2C5282]">
      <Stack align="start">
        <Text className='logo-text' fontSize='50px'>{'{PeerPrep}'}</Text>
        <Text fontSize='30px' color='white'>Master Interviews Together!</Text>
      </Stack>
      {children}
    </div>
  );
}
