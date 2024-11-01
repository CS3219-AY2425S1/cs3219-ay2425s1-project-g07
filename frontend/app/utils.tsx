import { QuestionComplexity, QuestionTopic } from '@/types/Question';
import { Text } from '@chakra-ui/react';
import React from 'react';

export const difficultyText = (complexity: QuestionComplexity) => {
  return (
    <Text color={
      complexity === QuestionComplexity.EASY ? 'green.500' :
      complexity === QuestionComplexity.MEDIUM ? 'yellow.500' :
      complexity === QuestionComplexity.HARD ? 'red.500' : 'gray.500'
    } className='font-medium'>
      {complexity.charAt(0).toUpperCase() + complexity.slice(1)}
    </Text>
  )
}

export const topicText = (topic: QuestionTopic, idx: number, onClick?: () => void) => {
  return (
    <span
      key={idx}
      className={`mx-2 bg-gray-200 px-3 py-2 rounded-2xl font-medium ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {topic
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      }
    </span>
  )
}
