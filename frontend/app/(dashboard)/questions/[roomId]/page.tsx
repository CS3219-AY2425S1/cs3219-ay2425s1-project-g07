"use client";

import React, { useEffect, useRef, useState } from 'react';
import { marked } from 'marked';
import CodeEditor from '@/components/CodeEditor';
import { SimpleGrid, Stack, Spinner, Text } from '@chakra-ui/react';
import { getRoom } from '@/services/collabService';
import { Room } from '@/types/Room';
import { Question } from '@/types/Question';

type PageParams = {
  params: {
    roomId: string;
  };
};

export default function Page({ params }: PageParams) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const roomId = params.roomId;
  const [room, setRoom] = useState<Room>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRoom(roomId).then((room) => {
      setRoom(room);
    });
    setLoading(false);
  }, [roomId]);

  return (
    <>
     { loading ? (
      <div className='flex justify-center items-center min-h-screen'>
        <Spinner />
      </div>
     ) : (
        <SimpleGrid columns={2} flex="1" className='m-8' spacing={8}>
          <Stack className='p-8 h-[85vh] overflow-y-auto' spacing={4} border="1px" borderColor="gray.200" borderRadius="md">
            <Text fontSize="xl" fontWeight="bold">{room?.question?.title}</Text>
            <div className='max-h-fit overflow-scroll' dangerouslySetInnerHTML={{ __html: marked(room?.question?.description || '') }}></div>
          </Stack>
          <Stack border="1px h-[85vh] overflow-y-auto" borderColor="gray.200" borderRadius="md">
            <CodeEditor editorRef={editorRef} params={params} />
          </Stack>
        </SimpleGrid>
     )}
    </>
  );
}
