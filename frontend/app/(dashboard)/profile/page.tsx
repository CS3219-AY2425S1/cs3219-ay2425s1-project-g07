"use client";

import { useState, useRef, useEffect, use } from "react";
import {
  Avatar,
  Button,
  Card,
  HStack,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Stack,
  Tag,
  TagLabel,
  TagLeftIcon,
  VStack,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Text,
  Flex,
  Progress,
  Box,
  Grid,
  GridItem,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from "@chakra-ui/react";
import { AtSignIcon, LinkIcon } from "@chakra-ui/icons";
import { deleteUser, updateUser } from "@/services/userService";
import useAuth from "@/hooks/useAuth";

import { getQuestionHistory } from "@/services/historyService";
import { QuestionHistory } from "@/types/History";
import { it } from "node:test";
import { fetchQuestions } from "@/services/questionService";
import { Question } from "@/types/Question";

export default function ProfilePage() {
  const toast = useToast();
  const { userId, username, email, setUsername, setEmail } = useAuth();
  const [isEdit, setIsEdit] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setNewUsername(username);
    setNewEmail(email);
  }, [username, email]);

  const handleDeleteProfile = () => {
    try {
      deleteUser(userId);
    } catch (error) {
      toast.closeAll();
      toast({
        title: "Error",
        description: "Failed to delete profile",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const handleUpdateProfile = async () => {
    if (!newUsername || !newEmail) {
      toast.closeAll();
      toast({
        title: "Error",
        description: "All fields are required",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    try {
      await updateUser(userId, { username: newUsername, email: newEmail });
      toast.closeAll();
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      setIsEdit(false);
      setUsername(newUsername);
      setEmail(newEmail);
      window.location.reload(); // This is a temporary fix to update the username in the navbar
    } catch (error) {
      toast.closeAll();
      toast({
        title: "Error",
        description: "Failed to update profile",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const QuestionsStatsCard = () => {
    const [questionsAttempted, setQuestionsAttempted] = useState(0);
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [easyQuestionAttempt, setEasyQuestionAttempt] = useState(100);
    const [mediumQuestionAttempt, setMediumQuestionAttempt] = useState(0);
    const [hardQuestionAttempt, setHardQuestionAttempt] = useState(0);

    const [QuestionHistory, setQuestionHistory] = useState<QuestionHistory[]>(
      []
    );

    useEffect(() => {
      fetchQuestions().then((data) => {
        if (!data.error) {
          const quests = data.data as Question[];
          setTotalQuestions(quests.length);
        }
      });
    }, []);

    useEffect(() => {
      if (!userId) return;

      getQuestionHistory(userId).then((data) => {
        setQuestionHistory(data);
        setQuestionsAttempted(data.length);
        setEasyQuestionAttempt(
          data.filter((item) => item.questionDifficulty === "easy").length
        );
        setMediumQuestionAttempt(
          data.filter((item) => item.questionDifficulty === "medium").length
        );
        setHardQuestionAttempt(
          data.filter((item) => item.questionDifficulty === "hard").length
        );
      });
    }, [userId]);

    return (
      <Card maxHeight={"-webkit-max-content"} padding={"8px"}>
        <Box>
          <Text fontSize="md" color="GrayText">
            Questions Stats
          </Text>
          <Grid templateColumns="repeat(3, 1fr)" gap={6} margin="10px">
            <GridItem alignContent={"center"} rowSpan={1} colSpan={2}>
              <HStack justifyContent={"start"}>
                <Text fontSize="3xl" fontStyle={"bold"}>
                  {questionsAttempted}
                </Text>
                <Text fontSize="sm">/ {totalQuestions}</Text>
              </HStack>
            </GridItem>
            <GridItem rowSpan={1} colSpan={1}>
              <Grid gap={1}>
                <Tag
                  size="md"
                  key="easy-tag"
                  variant="solid"
                  colorScheme="blue"
                  justifyContent={"center"}
                >
                  <TagLabel> {easyQuestionAttempt} Easy</TagLabel>
                </Tag>
                <Tag
                  size="md"
                  key="med-tag"
                  variant="solid"
                  colorScheme="green"
                  justifyContent={"center"}
                >
                  <TagLabel>{mediumQuestionAttempt} Med</TagLabel>
                </Tag>
                <Tag
                  size="md"
                  key="hard-tag"
                  variant="solid"
                  colorScheme="orange"
                  justifyContent={"center"}
                >
                  <TagLabel> {hardQuestionAttempt} Hard</TagLabel>
                </Tag>
              </Grid>
            </GridItem>
          </Grid>
        </Box>
        <Progress
          value={questionsAttempted}
          max={totalQuestions}
          colorScheme="green"
          margin="10px"
          size="sm"
        />
      </Card>
    );
  };

  const QuestionHistoryCard = () => {
    const [history, setHistory] = useState<QuestionHistory[]>([]);
    const { userId, username, email, setUsername, setEmail } = useAuth();

    useEffect(() => {
      if (!userId) return;

      getQuestionHistory(userId).then((data) => {
        setHistory(data);
      });
    }, [userId]);

    const headers = ["Question", "Difficulty", "Collaborator", "Date"];

    return (
      <Card backgroundColor={"#FFFFFF"}>
        <TableContainer>
          <Table variant="simple">
            <Thead>
              <Tr>
                {headers.map((header, index) => (
                  <Th key={index}>{header}</Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {history.map((item, index) => (
                <Tr key={index}>
                  <Td>{item.questionTitle}</Td>
                  <Td>{item.questionDifficulty}</Td>
                  <Td>{item.collaboratorId}</Td>
                  <Td>{item.timeAttempted.toLocaleDateString()}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Card>
    );
  };

  const ProfileCard = () => {
    return (
      <Card backgroundColor={"#FFFFFF"} minWidth={320} maxWidth={360}>
        <HStack>
          <Avatar
            size="2xl"
            name={username}
            src="https://cdn-icons-png.flaticon.com/128/17446/17446833.png"
            margin="30px"
          />
          <VStack align="left" margin="10px">
            <Tag
              size="sm"
              key="username-tag"
              variant="subtle"
              colorScheme="cyan"
            >
              <TagLeftIcon as={AtSignIcon} />
              <TagLabel>{username}</TagLabel>
            </Tag>
            <Tag size="sm" key="email-tag" variant="subtle" colorScheme="cyan">
              <TagLeftIcon as={LinkIcon} />
              <TagLabel>{email}</TagLabel>
            </Tag>
          </VStack>
        </HStack>
        <Button
          backgroundColor="#38A169"
          color="#FFFFFF"
          margin="10px"
          onClick={() => setIsEdit(true)}
        >
          Edit Profile
        </Button>
        <Button
          colorScheme="red"
          margin="10px"
          onClick={() => setIsAlertOpen(true)}
        >
          Delete Profile
        </Button>

        <AlertDialog
          isOpen={isAlertOpen}
          leastDestructiveRef={cancelRef}
          onClose={() => setIsAlertOpen(false)}
          isCentered
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Delete Profile
              </AlertDialogHeader>

              <AlertDialogBody>
                Are you sure? You can't undo this action afterwards.
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={() => setIsAlertOpen(false)}>
                  Cancel
                </Button>
                <Button colorScheme="red" onClick={handleDeleteProfile} ml={3}>
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>

        <Modal isOpen={isEdit} onClose={() => setIsEdit(false)}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Edit Profile</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormControl isRequired>
                <FormLabel>Username</FormLabel>
                <Input
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                />
              </FormControl>
              <FormControl isRequired mt={4}>
                <FormLabel>Email</FormLabel>
                <Input
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={handleUpdateProfile}>
                Save
              </Button>
              <Button variant="ghost" onClick={() => setIsEdit(false)}>
                Cancel
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Card>
    );
  };

  return (
    <div className="p-8">
      <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6}>
        <GridItem colSpan={{ base: 1, md: 1 }} rowSpan={2}>
          <ProfileCard />
        </GridItem>
        <GridItem colSpan={{ base: 1, md: 2 }}>
          <QuestionsStatsCard />
        </GridItem>
        <GridItem colSpan={{ base: 1, md: 2 }}>
          <QuestionHistoryCard />
        </GridItem>
      </Grid>
    </div>
  );
}
