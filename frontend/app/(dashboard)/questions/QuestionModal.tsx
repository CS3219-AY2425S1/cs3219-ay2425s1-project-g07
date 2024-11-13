import React from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    useDisclosure
} from '@chakra-ui/react'

import { marked } from 'marked';
import { Question } from '@/types/Question';
import { difficultyText, topicText } from '../../utils';

export default function QuestionModal(question: Question) {
    const { isOpen, onOpen, onClose } = useDisclosure()
    return (
        <>
        <span style={{ cursor: 'pointer'}} onClick={onOpen}>{question.title}</span>

        <Modal isOpen={isOpen} onClose={onClose} size='xl' scrollBehavior='inside'>
            <ModalOverlay />
            <ModalContent>
            <ModalHeader>{question.title}</ModalHeader>
            <ModalCloseButton />
            <div className='ml-6'>
                {difficultyText(question.complexity)}
            </div>
            <div className='ml-3 my-4 mb-6'>
                {question.topics.map((topic, idx) => (topicText(topic, idx)))}
            </div>
            <ModalBody>
                <div dangerouslySetInnerHTML={{ __html: marked(question.description) }}></div>
            </ModalBody>
            <ModalFooter>
                <Button colorScheme='blue' mr={3} onClick={onClose}>
                Close
                </Button>
            </ModalFooter>
            </ModalContent>
        </Modal>
        </>
    );
}