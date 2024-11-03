"use client";

import { useState, useEffect } from "react";
import {
	Card,
	HStack,
	Tag,
	TagLabel,
	Text,
	Progress,
	Box,
	Grid,
	GridItem,
} from "@chakra-ui/react";
import useAuth from "@/hooks/useAuth";

import { getQuestionHistory } from "@/services/historyService";
import { fetchQuestions } from "@/services/questionService";
import { Question } from "@/types/Question";

export const QuestionsStatsCard = () => {
	const [questionsAttempted, setQuestionsAttempted] = useState(0);
	const [totalQuestions, setTotalQuestions] = useState(0);
	const [easyQuestionAttempt, setEasyQuestionAttempt] = useState(0);
	const [mediumQuestionAttempt, setMediumQuestionAttempt] = useState(0);
	const [hardQuestionAttempt, setHardQuestionAttempt] = useState(0);

	const { userId } = useAuth();

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
						</HStack>
					</GridItem>
					<GridItem rowSpan={1} colSpan={1}>
						<Grid gap={1}>
							<Tag
								size="md"
								key="easy-tag"
								variant="solid"
								colorScheme="green"
								justifyContent={"center"}
							>
								<TagLabel> {easyQuestionAttempt} Easy</TagLabel>
							</Tag>
							<Tag
								size="md"
								key="med-tag"
								variant="solid"
								colorScheme="yellow"
								justifyContent={"center"}
							>
								<TagLabel>{mediumQuestionAttempt} Med</TagLabel>
							</Tag>
							<Tag
								size="md"
								key="hard-tag"
								variant="solid"
								colorScheme="red"
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