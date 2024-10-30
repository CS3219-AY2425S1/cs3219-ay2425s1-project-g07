'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { marked } from 'marked';
import YjsEditor from '@/components/YjsEditor';
import { SimpleGrid, Stack, Spinner, Text } from '@chakra-ui/react';
import { getRoom } from '@/services/collabService';
import useAuth from '@/hooks/useAuth';
import { Room } from '@/types/Room';
import { QuestionComplexity } from '@/types/Question';
import { difficultyText, topicText } from '../../questions/page';

type PageParams = {
  params: {
    roomId: string;
  };
};

export default function Page({ params }: PageParams) {
  const roomId = params.roomId;
  const [room, setRoom] = useState<Room>();
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { username } = useAuth();

  useEffect(() => {
    const fetchRoom = async () => {
      const room = await getRoom(roomId);
      setRoom(room);
      setLoading(false);
    };
  
    fetchRoom();
  }, [roomId]);

  return (
    <>
     { loading || !room ? (
      <div className='flex flex-col justify-center items-center min-h-screen'>
        <Spinner size='xl' m={5}/>
        <Text>Getting things ready...</Text>
      </div>
     ) : room && (
        <SimpleGrid columns={2} flex="1" className='m-8' spacing={8}>
          <Stack className='p-8 h-[85vh] overflow-y-auto' spacing={4} border="1px" borderColor="gray.200" borderRadius="md">
            <Text fontSize="xl" fontWeight="bold">{room?.question?.title}</Text>
            <div className=''>
                {difficultyText(room?.question.complexity as QuestionComplexity)}
            </div>
            <div className='mb-3'>
                {room?.question.topics.map((topic, idx) => (topicText(topic, idx)))}
            </div>
            <div className='max-h-fit' dangerouslySetInnerHTML={{ __html: marked(room?.question?.description || '') }}></div>
          </Stack>
          <Stack border="1px h-[85vh] overflow-y-auto" borderColor="gray.200" borderRadius="md">
            <YjsEditor userId={username} roomId={roomId} />
          </Stack>
        </SimpleGrid>
     )}
    </>
  );
}
