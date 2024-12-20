"use client";

import React, { useEffect, useState } from "react";
import YjsEditor from "@/components/YjsEditor";
import { SimpleGrid, Stack, Spinner, Text } from "@chakra-ui/react";
import { getRoom } from "@/services/collabService";
import useAuth from "@/hooks/useAuth";
import { Room } from "@/types/Room";
import { ChatBox } from "@/components/ChatBox";
import { Question } from "@/components/Question";

type PageParams = {
  params: {
    roomId: string;
  };
};

export default function Page({ params }: PageParams) {
  const roomId = params.roomId;
  const [room, setRoom] = useState<Room>();
  const [loading, setLoading] = useState(true);
  const { username } = useAuth();
  const [questionId, setQuestionId] = useState<string>("");

  useEffect(() => {
    const fetchRoom = async () => {
      const room = await getRoom(roomId, username);
      setRoom(room);
      if (room) {
        setQuestionId(room.question._id!); // _id will definitely exist, filled by mongodb
        setLoading(!username || !room); // If username is not yet available, keep loading
      } else {
        setLoading(false);
      }
    };
    setLoading(true);
    fetchRoom();
  }, [roomId, username]);

  return (
    <>
      {loading ? (
        <div className="flex flex-col justify-center items-center min-h-screen">
          <Spinner size="xl" m={5} />
          <Text>Getting things ready...</Text>
        </div>
      ) : room ? (
        <SimpleGrid columns={2} flex="1" className="m-8" spacing={4}>
          <Stack
            h="85vh"
            overflowY="auto"
            border="1px"
            borderColor="gray.200"
            borderRadius="md"
            spacing={0}
          >
            <Question question={room.question} />
            <ChatBox users={room.users} roomId={roomId} />
          </Stack>
          <Stack
            spacing={4}
            h="85vh"
            overflowY="auto"
            border="1px"
            borderColor="gray.200"
            borderRadius="md"
          >
            <YjsEditor
              userId={username}
              roomId={roomId}
              questionId={questionId}
            />
          </Stack>
        </SimpleGrid>
      ) : (
        <div className="flex flex-col justify-center items-center min-h-screen">
          <Text color="red">Invalid room</Text>
        </div>
      )}
    </>
  );
}
