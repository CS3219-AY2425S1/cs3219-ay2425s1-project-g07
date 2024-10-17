"use client";

import { Box, Button, FormControl, FormLabel, Select, Flex, useToast, Spinner } from "@chakra-ui/react";
import { useState } from "react";
import { QuestionComplexity, QuestionTopic } from "@/types/Question";

export default function CreateQuestionPage() {
  const toast = useToast();

  const MATCH_DURATION = 30;

  const [topic, setTopic] = useState<QuestionTopic | undefined>();
  const [complexity, setComplexity] = useState<QuestionComplexity | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(MATCH_DURATION);

  const handleTopicChange = (e: React.ChangeEvent<HTMLSelectElement>) => setTopic(e.target.value as QuestionTopic);
  const handleComplexityChange = (e: React.ChangeEvent<HTMLSelectElement>) => setComplexity(e.target.value as QuestionComplexity);

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

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
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
          return 0; 
        }
        return prev - 1;
      });
    }, 1000);
  };

  const onCancelMatch = () => {
    setTopic(undefined);
    setComplexity(undefined);
    setIsLoading(false);
    setCountdown(MATCH_DURATION); 
  };

  return (
    <Flex justifyContent="center" h="100%">
      <Box p={8} width={500}>
        <FormControl id="topic" mb={4} isRequired>
          <FormLabel>Topic</FormLabel>
          <Select name="topic" value={topic || ""} onChange={handleTopicChange} isDisabled={isLoading}>
            <option value="" disabled>Select a topic</option>
            {Object.values(QuestionTopic).map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </Select>
        </FormControl>

        <FormControl id="complexity" mb={4} isRequired>
          <FormLabel>Complexity</FormLabel>
          <Select name="complexity" value={complexity || ""} onChange={handleComplexityChange} isDisabled={isLoading}>
            <option value="" disabled>Select complexity</option>
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
              'Match'
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
      </Box>
    </Flex>
  );
}
