"use client";

import { AttemptHistory, QuestionHistory } from "@/types/History";
import {
  getAttemptHistoryForSession,
  getQuestionHistoryByRoomIdAndUserId,
} from "@/services/historyService";
import useAuth from "@/hooks/useAuth";
import {
  Spinner,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Box,
  Text,
  Grid,
  GridItem,
  Code,
  Card,
  Toast,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Tag,
  TagLabel,
  Flex,
  Button,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Question } from "@/types/Question";
import { IoMdEyeOff, IoMdEye } from "react-icons/io";
import { marked } from "marked";
import { topicText } from "@/app/utils";
import { useRouter } from "next/navigation";
import { getQuestionById } from "@/services/questionService";

type PageParams = {
  params: {
    roomId: string;
  };
};

export default function Page({ params }: PageParams) {
  const router = useRouter();
  const roomId = params.roomId;
  const [attempts, setAttempts] = useState<AttemptHistory[]>([]);
  const { username, userId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedAttempt, setSelectedAttempt] = useState<
    AttemptHistory | undefined
  >();
  const [question, setQuestion] = useState<Question | undefined>();
  const [questionHistory, setQuestionHistory] = useState<
    QuestionHistory | undefined
  >();

  useEffect(() => {
    if (!username || !userId) return;

    console.log("User ID", userId);
    const fetchData = async () => {
      const attempts = await getAttemptHistoryForSession(username, roomId);
      const questionHistory = await getQuestionHistoryByRoomIdAndUserId(
        userId,
        roomId
      );

      if (!questionHistory) {
        console.error("Question History was not found");
        throw new Error("Question History not found");
      }

      setQuestionHistory(questionHistory);
      console.log("Setting question history", questionHistory);

      const question = await getQuestionById(questionHistory.questionId);
      if (!question) {
        console.error("Question was not found");
        throw new Error("Question not found");
      }

      setQuestion(question);
      console.log("Setting question:", question);

      setAttempts(attempts);
    };

    fetchData()
      .finally(() => {
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error getting data:", error);
        Toast({
          title: "Error",
          description: "There was an error getting the data.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      });
  }, [roomId, username]);

  useEffect(() => {
    if (attempts.length < 1) return;

    setSelectedAttempt(attempts[0]);
  }, [attempts]);

  if (!loading && !questionHistory) {
    return (
      <Box textAlign="center" mt={20}>
        <Box mb={4}>
          <Text fontSize="2xl" fontWeight="bold">
            The History was Deleted.
          </Text>
          <Text color="gray.500">
            It looks like the history was deleted for this session.
          </Text>
        </Box>
        <Button colorScheme="teal" onClick={() => router.push("/profile")}>
          Back to Profile
        </Button>
      </Box>
    );
  }

  if (!loading && !question) {
    return (
      <Box textAlign="center" mt={20}>
        <Box mb={4}>
          <Text fontSize="2xl" fontWeight="bold">
            The Question was Deleted.
          </Text>
          <Text color="gray.500">
            It looks like the question was deleted for this session.
          </Text>
        </Box>
        <Button colorScheme="teal" onClick={() => router.push("/profile")}>
          Back to Profile
        </Button>
      </Box>
    );
  }

  return (
    <Box height="100vh" display="flex" flexDirection="column">
      {loading || !question || !questionHistory ? (
        <Box textAlign="center">
          <Spinner size="xl" m={5} />
          <Text>Getting things ready...</Text>
        </Box>
      ) : (
        <Grid
          templateColumns="repeat(6, 1fr)"
          gap={5}
          padding={2}
          height={"100%"}
          flex="1"
          overflow={"hidden"}
        >
          <GridItem colSpan={1}>
            <Card height="90vh" padding={4} overflow={"hidden"}>
              <Box height="auto" overflowY="scroll">
                <Text fontSize="2xl" mb={3} textAlign={"left"}>
                  Attempts
                </Text>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Attempted</Th>
                      <Th>Language</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {attempts.map((attempt) => (
                      <Tr
                        key={attempt.timeAttempted.toISOString()}
                        bg={
                          selectedAttempt?.timeAttempted ===
                          attempt.timeAttempted
                            ? "blue.50"
                            : "white"
                        }
                        onClick={() => setSelectedAttempt(attempt)}
                        cursor="pointer"
                      >
                        <Td>{attempt.timeAttempted.toLocaleDateString()}</Td>
                        <Td>
                          <Tag colorScheme="teal">
                            {attempt.programmingLanguage}
                          </Tag>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </Card>
          </GridItem>

          <GridItem colSpan={5}>
            <Card maxHeight="90vh" padding={6} overflow={"hidden"}>
              <Box height="auto" overflowY="scroll">
                <Flex alignItems={"center"}>
                  <Box flex="1">
                    <Text fontSize="2xl" mb={3}>
                      {question.title}
                    </Text>
                  </Box>

                  <Text fontSize={"small"}>
                    {question.topics.map((topic, idx) => topicText(topic, idx))}
                  </Text>
                </Flex>

                {selectedAttempt ? (
                  <Box>
                    <Text mb={2}>
                      <strong>Attempted:</strong>{" "}
                      {selectedAttempt.timeAttempted.toDateString()}
                      {", "}
                      {selectedAttempt.timeAttempted.toLocaleTimeString()}
                    </Text>
                    <Text mb={2}>
                      <strong>Collaborators:</strong>{" "}
                      {[username, questionHistory.collaboratorId].map(
                        (user, idx) => (
                          <Tag key={idx} colorScheme="blue" mr={1}>
                            <TagLabel>{user}</TagLabel>
                          </Tag>
                        )
                      )}
                    </Text>
                    <Text mb={2}>{""}</Text>
                    <Flex mb={2}>
                      <Box flex="1" textAlign={"left"}>
                        <Text>
                          <strong>Code: </strong>
                        </Text>
                      </Box>
                      <Tag
                        colorScheme="teal"
                        textAlign={"center"}
                        justifyContent={"center"}
                      >
                        {selectedAttempt.programmingLanguage}
                      </Tag>
                    </Flex>

                    <Code
                      display="block"
                      whiteSpace="pre-wrap"
                      p={4}
                      bg="gray.100"
                      borderRadius="md"
                      overflowX="auto"
                      mb={4}
                    >
                      {selectedAttempt.attemptCode}
                    </Code>
                    {question ? (
                      <Box>
                        <Accordion allowMultiple size="lg">
                          <AccordionItem>
                            <AccordionButton>
                              <Box flex="1" textAlign="left">
                                <strong>Question Description</strong>
                              </Box>
                              <AccordionIcon />
                            </AccordionButton>
                            <AccordionPanel pb={4}>
                              <Text mb={2}>
                                <div
                                  className="max-h-fit"
                                  dangerouslySetInnerHTML={{
                                    __html: marked(question.description || ""),
                                  }}
                                ></div>
                              </Text>
                            </AccordionPanel>
                          </AccordionItem>

                          <AccordionItem>
                            {({ isExpanded }) => (
                              <>
                                <AccordionButton>
                                  <Box textAlign="left">
                                    <strong>Solution</strong>
                                  </Box>
                                  <Box flex="1" mx={2}>
                                    {isExpanded ? <IoMdEye /> : <IoMdEyeOff />}
                                  </Box>
                                  <AccordionIcon />
                                </AccordionButton>
                                <AccordionPanel pb={4}>
                                  <Text mb={2}>Suggested Solution:</Text>
                                  <Code
                                    display="block"
                                    whiteSpace="pre-wrap"
                                    p={4}
                                    bg="gray.100"
                                    borderRadius="md"
                                    overflowX="auto"
                                  >
                                    {question.solution}
                                  </Code>
                                </AccordionPanel>
                              </>
                            )}
                          </AccordionItem>
                        </Accordion>
                      </Box>
                    ) : (
                      <Text>No question to show</Text>
                    )}
                  </Box>
                ) : (
                  <Text>No attempts to show</Text>
                )}
              </Box>
            </Card>
          </GridItem>
        </Grid>
      )}
    </Box>
  );
}
