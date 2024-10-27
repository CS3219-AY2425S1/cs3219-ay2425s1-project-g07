import React, { useState, useEffect, useRef } from 'react';
import { Text, Stack, Input, Button, Flex } from '@chakra-ui/react';
import useAuth from '@/hooks/useAuth';

interface ChatBoxProps {
	users: string[];
}

interface Message {
	senderUsername: string;
	text: string;
}

export const ChatBox = ({ users }: ChatBoxProps) => {
	const username = useAuth().username;
	const [messages, setMessages] = useState<Message[]>([
		{ senderUsername: 'Eric', text: 'Hello!' },
		{ senderUsername: 'John', text: 'Hi there!' },
		{ senderUsername: 'Eric', text: 'How are you?' },
		{ senderUsername: 'John', text: 'I am good, thanks!' }
	]);
	const [newMessage, setNewMessage] = useState('');
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const handleSendMessage = () => {
		if (newMessage.trim()) {
			const message: Message = { senderUsername: username, text: newMessage };
			setMessages((prev) => [...prev, message]);
			setNewMessage('');
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			handleSendMessage();
		}
	};

	useEffect(() => {
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
		}
	}, [messages]);

	return (
		<Flex direction="column" borderTop="1px" borderColor="gray.200" p={4} h="40%" overflowY="auto">
			<Stack spacing={2} mb={3} flex="1" overflowY="auto">
				{messages.map((msg, index) => (
					<Flex key={index} justify={msg.senderUsername === username ? 'flex-end' : 'flex-start'}>
						<Text
							bg={msg.senderUsername === username ? 'blue.100' : 'gray.100'}
							borderRadius="md"
							p={2}
							maxW="80%"
						>
							{msg.text}
						</Text>
					</Flex>
				))}
				<div ref={messagesEndRef} />
			</Stack>
			<Stack direction="row" spacing={2} mt="auto">
				<Input
					value={newMessage}
					onChange={(e) => setNewMessage(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder="Type a message..."
					size="sm"
				/>
				<Button onClick={handleSendMessage} colorScheme="blue" size="sm">Send</Button>
			</Stack>
		</Flex>
	);
};