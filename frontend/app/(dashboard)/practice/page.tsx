"use client";

import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Select,
  Flex,
  useToast,
  Spinner,
  Text,
  GridItem,
  Grid,
} from "@chakra-ui/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { QuestionComplexity, QuestionTopic } from "@/types/Question";
import {
  cancelMatchRequest,
  getMatchSocket,
  makeMatchRequest,
} from "@/services/matchingService";
import { getRoom } from "@/services/collabService";
import useAuth from "@/hooks/useAuth";
import { MatchRequestResponse, MatchResult } from "@/types/Match";
import { Socket } from "socket.io-client";
import { addHistory } from "@/services/historyService";

export default function MatchingPage() {
  const toast = useToast();
  const router = useRouter();
  const { username, userId } = useAuth();

  const MATCH_DURATION = 30;

  const [topic, setTopic] = useState<QuestionTopic | undefined>();
  const [complexity, setComplexity] = useState<
    QuestionComplexity | undefined
  >();
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(MATCH_DURATION);

  const [isMatched, setIsMatched] = useState(false);
  const [matchedWithUser, setMatchedWithUser] = useState<string | undefined>(
    undefined
  );
  const [matchedTopic, setMatchedTopic] = useState<string>("");
  const [roomId, setRoomId] = useState<string>("");

  const [checkMatchSocket, setCheckMatchSocket] = useState<Socket | null>(null);
  const [checkMatchInterval, setCheckMatchInterval] =
    useState<NodeJS.Timeout | null>(null);

  const handleTopicChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setTopic(e.target.value as QuestionTopic);
  const handleComplexityChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setComplexity(e.target.value as QuestionComplexity);

  const onSubmitMatch = () => {
    if (!topic || !complexity) {
      toast.closeAll();
      toast({
        title: "Error",
        description: "Please select both a topic and a complexity level.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    setIsLoading(true);
    setCountdown(MATCH_DURATION);
    setIsMatched(false);
    setMatchedWithUser(undefined);

    console.log("Sending match request...");
    const socket = getMatchSocket();
    setCheckMatchSocket(socket);
    makeMatchRequest(
      socket,
      {
        userId: username,
        topic: topic,
        difficulty: complexity,
        timestamp: Date.now(),
      },
      (res: MatchRequestResponse) => {
        console.log("Match request sent:", res);

        if (res.error || !res.expiry) return;

        // Start countdown timer
        let initialCountdown = Math.ceil((res.expiry - Date.now()) / 1000);
        setCountdown(initialCountdown);
        const interval = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 0) {
              clearInterval(interval);
              setCheckMatchInterval(null);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        setCheckMatchInterval(interval);
      }
    )
      .then((res: MatchResult) => {
        if (checkMatchInterval) {
          clearInterval(checkMatchInterval);
          setCheckMatchInterval(null);
        }

        setCheckMatchSocket(null);

        if (res.result === "timeout") {
          // On match timeout
          setIsLoading(false);
          toast.closeAll();
          toast({
            title: "Match Not Found",
            description: "Please try again.",
            status: "info",
            duration: 3000,
            isClosable: true,
            position: "top",
          });
          setIsMatched(false);
          setMatchedWithUser(undefined);

          return;
        }

        if (res.result === "error" || !res.matchFound) {
          setIsLoading(false);
          toast.closeAll();
          toast({
            title: "Match Failed",
            description: res.error,
            status: "error",
            duration: 3000,
            isClosable: true,
            position: "top",
          });
          setIsMatched(false);
          setMatchedWithUser(undefined);

          return;
        }

        const matchFound = res.matchFound;

        // On match found
        setIsLoading(false);
        toast.closeAll();
        toast({
          title: "Match Found",
          description: "You have been matched!",
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
        handleFoundMatch(matchFound.matchedRoom);

        // Handle match found logic here
        setIsMatched(true);
        setMatchedWithUser(matchFound.matchedWithUserId);
        setMatchedTopic(matchFound.matchedTopic);
        setRoomId(matchFound.matchedRoom);
      })
      .catch((err) => {
        console.error("Error sending match request:", err);
        setIsLoading(false);
        toast.closeAll();
        toast({
          title: "Error",
          description: "Failed to send match request. Please try again.",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      });
  };

  const onCancelMatch = () => {
    if (checkMatchInterval) {
      clearInterval(checkMatchInterval);
      setCheckMatchInterval(null);
    }
    setTopic(undefined);
    setComplexity(undefined);
    setIsLoading(false);
    setCountdown(MATCH_DURATION);
    setIsMatched(false);
    setMatchedWithUser(undefined);
    cancelMatchOnBackend();
  };

  const cancelMatchOnBackend = () => {
    if (!checkMatchSocket) return;

    cancelMatchRequest(checkMatchSocket);
  };

  const onClickGoToRoom = () => {
    getRoom(roomId).then((room) => {
      const questionId = room.question._id;

      if (matchedWithUser === undefined) {
        console.error("Error getting room:");
        return;
      }

      if (questionId === undefined) {
        console.error("Error getting room:");
        return;
      }

      addHistory({
        studentId: userId,
        questionId: questionId,
        timeAttempted: new Date(),
        timeCreated: new Date(),
        collaboratorId: matchedWithUser,
        questionDifficulty: room.question.complexity,
        questionTopics: room.question.topics,
        roomId: roomId,
        questionTitle: room.question.title,
      })
        .then(() => {
          router.push(`/rooms/${roomId}`);
        })
        .catch((error) => {
          console.error("Error adding history:", error);

          if (error.response && error.response.status === 409) {
            toast({
              title: "Conflict",
              description: "Redirecting to room, please wait...",
              status: "warning",
              duration: 3000,
              isClosable: true,
              position: "top",
            });
            router.push(`/rooms/${roomId}`);
          } else {
            toast({
              title: "Error",
              description: "Failed to Process Match. Please try again.",
              status: "error",
              duration: 3000,
              isClosable: true,
              position: "top",
            });
          }
        });
    });
  };

  const handleFoundMatch = (roomId: string) => {
    // Verify that room exists
    setTimeout(async () => {
      try {
        const room = await getRoom(roomId);
      } catch (error) {
        console.error("Error getting room:", error);
        return;
      }
    }, 3000);
  };

  return (
    <Flex justifyContent="center" h="100%">
      <Box p={8} width={500}>
        <FormControl id="topic" mb={4} isRequired>
          <FormLabel>Topic</FormLabel>
          <Select
            name="topic"
            value={topic || ""}
            onChange={handleTopicChange}
            isDisabled={isLoading}
          >
            <option value="" disabled>
              Select a topic
            </option>
            {Object.values(QuestionTopic).map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </Select>
        </FormControl>

        <FormControl id="complexity" mb={4} isRequired>
          <FormLabel>Complexity</FormLabel>
          <Select
            name="complexity"
            value={complexity || ""}
            onChange={handleComplexityChange}
            isDisabled={isLoading}
          >
            <option value="" disabled>
              Select a complexity
            </option>
            {Object.values(QuestionComplexity).map((complexity) => (
              <option key={complexity} value={complexity}>
                {complexity}
              </option>
            ))}
          </Select>
        </FormControl>

        <Flex justifyContent="space-between" marginTop={6}>
          <Button
            colorScheme="blue"
            onClick={onSubmitMatch}
            isDisabled={isLoading}
          >
            {isLoading ? (
              <>
                <Spinner size="sm" mr={3} />
                {countdown}
              </>
            ) : (
              "Match"
            )}
          </Button>
          <Button
            colorScheme="red"
            onClick={onCancelMatch}
            isDisabled={!isLoading}
          >
            Cancel
          </Button>
        </Flex>

        {isMatched && (
          <Box
            mt={12}
            px={4}
            py={8}
            borderWidth={1}
            borderRadius="lg"
            boxShadow="md"
          >
            <Box textAlign="center">
              <Text fontWeight="bold" fontSize="xl" mb={4}>
                Matched with:
              </Text>
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <GridItem>
                  <Text fontSize="lg" color="black">
                    User:
                  </Text>
                </GridItem>
                <GridItem>
                  <Text fontSize="lg" color="teal.500">
                    {matchedWithUser}
                  </Text>
                </GridItem>
                <GridItem>
                  <Text fontSize="lg" color="black">
                    Difficulty:
                  </Text>
                </GridItem>
                <GridItem>
                  <Text fontSize="lg" color="teal.500">
                    {matchedTopic.split("-")[0]}
                  </Text>
                </GridItem>
                <GridItem>
                  <Text fontSize="lg" color="black">
                    Topic:
                  </Text>
                </GridItem>
                <GridItem>
                  <Text fontSize="lg" color="teal.500">
                    {matchedTopic.split("-")[1]}
                  </Text>
                </GridItem>
                <GridItem>
                  <Text fontSize="lg" color="black">
                    Room ID:
                  </Text>
                </GridItem>
                <GridItem>
                  <Text fontSize="lg" color="teal.500">
                    {roomId}
                  </Text>
                </GridItem>
                <GridItem colSpan={2} textAlign="center">
                  <Button colorScheme="teal" onClick={() => onClickGoToRoom()}>
                    Go to Code
                  </Button>
                </GridItem>
              </Grid>
            </Box>
          </Box>
        )}
      </Box>
    </Flex>
  );
}
