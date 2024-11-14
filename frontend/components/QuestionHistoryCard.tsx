"use client";

import { useState, useEffect } from "react";
import {
  Card,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Flex,
  Tooltip,
  Icon,
  Text,
} from "@chakra-ui/react";
import useAuth from "@/hooks/useAuth";
import { getQuestionHistory } from "@/services/historyService";
import { QuestionHistory } from "@/types/History";
import { QuestionComplexity } from "@/types/Question";
import { difficultyText } from "@/app/utils";
import { useRouter } from "next/navigation";
import { RxOpenInNewWindow } from "react-icons/rx";

export const QuestionHistoryCard = () => {
  const [history, setHistory] = useState<QuestionHistory[]>([]);
  const { userId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!userId) return;

    getQuestionHistory(userId).then((data) => {
      setHistory(data);
    });
  }, [userId]);

  const headers = ["Question", "Difficulty", "Collaborator", "Date", "Action"];

  const handleClick = (item: QuestionHistory) => {
    router.push(`/attempts/${item.roomId}`);
  };

  return (
    <Card backgroundColor={"#FFFFFF"}>
      <Flex justifyContent="center" padding="4">
        <Text fontWeight="bold">Recent Sessions</Text>
      </Flex>
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
                <Td>
                  {difficultyText(
                    item.questionDifficulty as QuestionComplexity
                  )}
                </Td>
                <Td>{item.collaboratorId}</Td>
                <Td>{item.timeAttempted.toLocaleDateString()}</Td>
                <Td>
                  <Flex className="justify-center">
                    <Tooltip content="See Details" aria-label="See Details">
                      <Icon
                        onClick={() => handleClick(item)}
                        fontSize="20px"
                        color="gray"
                        cursor="pointer"
                      >
                        <RxOpenInNewWindow />
                      </Icon>
                    </Tooltip>
                  </Flex>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Card>
  );
};
