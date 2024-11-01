import React from 'react';
import { marked } from 'marked';
import { Stack, Text } from '@chakra-ui/react';
import { Room } from '@/types/Room';
import { QuestionComplexity } from '@/types/Question';
import { difficultyText, topicText } from '@/app/utils';

type QuestionProps = {
  question: Room['question'];
};

export const Question = ({ question }: QuestionProps) => {
  if (!question) return null;

  return (
    <Stack spacing={4} p={8} h="85vh" overflowY="auto" borderTop="1px" borderLeft="1px" borderRight="1px" borderColor="gray.200" borderRadius="md">
      <Text fontSize="xl" fontWeight="bold">{question.title}</Text>
      <div>{difficultyText(question.complexity as QuestionComplexity)}</div>
      <div className='mb-3'>
        {question.topics.map((topic, idx) => topicText(topic, idx))}
      </div>
      <div className='max-h-fit' dangerouslySetInnerHTML={{ __html: marked(question.description || '') }}></div>
    </Stack>
  );
};
