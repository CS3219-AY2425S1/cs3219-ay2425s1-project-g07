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
} from "@chakra-ui/react";
import useAuth from "@/hooks/useAuth";
import { getQuestionHistory } from "@/services/historyService";
import { QuestionHistory } from "@/types/History";
import { QuestionComplexity } from "@/types/Question";
import { difficultyText } from "@/app/utils";
import { useRouter } from "next/navigation";

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

  const headers = ["Question", "Difficulty", "Collaborator", "Date"];

  const handleClick = (item: QuestionHistory) => {
    router.push(`/attempts/${item.roomId}`);
  };

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
              <Tr key={index} onClick={() => handleClick(item)}>
                <Td>{item.questionTitle}</Td>
                <Td>
                  {difficultyText(
                    item.questionDifficulty as QuestionComplexity
                  )}
                </Td>
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
