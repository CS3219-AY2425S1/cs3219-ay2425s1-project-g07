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
import { QuestionComplexity, QuestionTopic } from "@/types/Question";
import {
  testSend,
  checkMatch,
  cancelMatchRequest,
  makeMatchRequest,
} from "@/services/matchingService";
import { ANY_TOPIC } from "@/types/Match";
import useAuth from "@/hooks/useAuth";

export default function CreateQuestionPage() {
  const toast = useToast();

  const { username } = useAuth();

  const MATCH_DURATION = 30;

  const [topic, setTopic] = useState<
    QuestionTopic | typeof ANY_TOPIC | undefined
  >();
  const [complexity, setComplexity] = useState<
    QuestionComplexity | undefined
  >();
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(MATCH_DURATION);

  const [isMatched, setIsMatched] = useState(false);
  const [matchedWithUser, setMatchedWithUser] = useState<string | undefined>(
    undefined
  );
  const [matchedTopic, setMatchedTopic] = useState<string | undefined>(
    undefined
  );

  const [checkMatchInterval, setCheckMatchInterval] =
    useState<NodeJS.Timeout | null>(null);

  const handleTopicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setTopic(val == ANY_TOPIC ? ANY_TOPIC : (val as QuestionTopic));
  };

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
    makeMatchRequest({
      userId: username,
      topic: topic,
      difficulty: complexity,
      timestamp: Date.now(),
    })
      .then((res) => {
        console.log("Match request sent:", res);
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

    const pollForMatch = () => {
      let loopCounter = 0;

      const intervalId = setInterval(() => {
        console.log("Polling for match...");
        checkMatch(username)
          .then((res) => {
            if (res.status === "MATCHED") {
              clearInterval(intervalId);
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

              // Handle match found logic here
              setIsMatched(true);
              setMatchedWithUser(res.matchedWithUserId);
              setMatchedTopic(res.topic);
            } else {
              loopCounter++;
              setCountdown((prevCountdown) => prevCountdown - 1);
              if (loopCounter >= MATCH_DURATION) {
                clearInterval(intervalId);
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
                cancelMatchOnBackend(); // Cancel match request if match not found
                setIsMatched(false);
                setMatchedWithUser(undefined);
              }
            }
          })
          .catch((err) => {
            console.error("Error checking match status:", err);
            clearInterval(intervalId);
            setIsLoading(false);
            toast.closeAll();
            toast({
              title: "Error",
              description: "Failed to check match status. Please try again.",
              status: "error",
              duration: 3000,
              isClosable: true,
              position: "top",
            });
          });
      }, 1000);

      setCheckMatchInterval(intervalId);
    };

    pollForMatch();
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
    cancelMatchRequest({
      userId: username,
      topic: topic!,
      difficulty: complexity!,
      timestamp: Date.now(),
    })
      .then((res) => {
        console.log("Match request cancelled:", res);
      })
      .catch((err) => {
        console.error("Error cancelling match request:", err);
        toast.closeAll();
        toast({
          title: "Error",
          description: "Failed to cancel match request. Please try again.",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      });
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
            {
              //Add the any selection value
              <option key={ANY_TOPIC} value={ANY_TOPIC}>
                {ANY_TOPIC}
              </option>
            }
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
              Select complexity
            </option>
            <option value={QuestionComplexity.EASY}>Easy</option>
            <option value={QuestionComplexity.MEDIUM}>Medium</option>
            <option value={QuestionComplexity.HARD}>Hard</option>
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
                    Topic:
                  </Text>
                </GridItem>
                <GridItem>
                  <Text fontSize="lg" color="teal.500">
                    {matchedTopic}
                  </Text>
                </GridItem>
              </Grid>
            </Box>
          </Box>
        )}
      </Box>
    </Flex>
  );
}
