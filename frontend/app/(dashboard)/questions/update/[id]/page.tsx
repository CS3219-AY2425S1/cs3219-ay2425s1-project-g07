"use client";

import { useEffect, useState } from "react";
import { Box, Button, FormControl, FormLabel, Input, Select, Textarea, Flex, useToast, Spinner } from "@chakra-ui/react";
import { getQuestionById, updateQuestion } from "@/services/questionService";
import { Question, QuestionComplexity, QuestionTopic } from "@/types/Question";
import { marked } from "marked";
import { topicText } from "@/app/utils";
import { useRouter } from 'next/navigation';
import useAuth from "@/hooks/useAuth";
import Editor from '@monaco-editor/react';

export default function Page({ params }: { params: { id: string } }) {
  const { isAdmin, isLoading } = useAuth();
  const id = params.id;
  const router = useRouter();
  const toast = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [topics, setTopics] = useState<Set<QuestionTopic>>(new Set());
  const [complexity, setComplexity] = useState<QuestionComplexity | "">("");
  const [link, setLink] = useState("");
  const [solution, setSolution] = useState("");

  useEffect(() => {
    async function fetchQuestion() {
      const question = await getQuestionById(id);
      if (question) {
        setTitle(question.title);
        setDescription(question.description);
        setTopics(new Set(question.topics));
        setComplexity(question.complexity);
        setLink(question.link);
        setSolution(question.solution);
      }
    }

    fetchQuestion();
  }, [id]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value);
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value);
  const handleTopicsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTopic = e.target.value as QuestionTopic;
    setTopics((prevTopics) => new Set(prevTopics).add(selectedTopic));
  };
  const handleComplexityChange = (e: React.ChangeEvent<HTMLSelectElement>) => setComplexity(e.target.value as QuestionComplexity);
  const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => setLink(e.target.value);

  const handleSubmit = async () => {
    if (!title || !description || topics.size === 0 || !complexity || !link || !solution) {
      toast.closeAll();
      toast({
        title: "All fields are required.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    const updatedQuestion: Question = {
      _id: id,
      title,
      description,
      topics: Array.from(topics),
      complexity: complexity as QuestionComplexity,
      link,
      solution,
    };

    try {
      await updateQuestion(id, updatedQuestion);
      router.push('/questions');
    } catch (error: any) {
      if (error.response && error.response.status === 409) {
        toast.closeAll();
        toast({
          title: "A question with this title already exists.",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      } else {
        toast.closeAll();
        toast({
          title: "Failed to update question. Please try again.",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      }
    }
  };

  // Prevent non-admin users from accessing the page
  if (!isLoading && !isAdmin) {
    router.push('/questions');
  }

  return (
    <Box p={8} h="100%">
      <FormControl id="title" mb={4} isRequired>
        <FormLabel>Title</FormLabel>
        <Input name="title" value={title} onChange={handleTitleChange} />
      </FormControl>

      <Flex direction={{ base: 'column', md: 'row' }} gap={4} mb={4}>
        <FormControl id="description" isRequired flex="1">
          <FormLabel>Description</FormLabel>
          <Textarea
            name="description"
            value={description}
            onChange={handleDescriptionChange}
            minHeight={200} // some weird bug where setting height={200} = height 200+ idk why
            maxHeight={200}
            resize={"none"}
          />
        </FormControl>

        <Box display="flex" flexDirection="column" flex="1">
          <FormLabel>Preview</FormLabel>
          <Box p={4} border="1px" borderColor="gray.200" borderRadius="md" flex="1" overflow="auto" minHeight={200} maxHeight={200}>
            <div dangerouslySetInnerHTML={{ __html: marked(description) }}></div>
          </Box>
        </Box>
      </Flex>

      <FormControl id="topics" mb={4} isRequired>
        <FormLabel>Topics</FormLabel>
        <Select name="topics" value="" onChange={handleTopicsChange}>
          <option value="" disabled>Select a topic</option>
          {Object.values(QuestionTopic).map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </Select>
        <Box mt={4}>
          {topics.size > 0 ? (
            Array.from(topics).map((topic: QuestionTopic, idx: number) => (
              topicText(topic, idx, () => {
                const updatedTopics = new Set(topics);
                updatedTopics.delete(topic);
                setTopics(updatedTopics);
              })
            ))
          ) : (
            <Box>No topics selected</Box>
          )}
        </Box>
      </FormControl>

      <FormControl id="complexity" mb={4} isRequired>
        <FormLabel>Complexity</FormLabel>
        <Select name="complexity" value={complexity || ""} onChange={handleComplexityChange}>
          <option value="" disabled>Select complexity</option>
          <option value={QuestionComplexity.EASY}>Easy</option>
          <option value={QuestionComplexity.MEDIUM}>Medium</option>
          <option value={QuestionComplexity.HARD}>Hard</option>
        </Select>
      </FormControl>

      <FormControl id="link" mb={4} isRequired>
        <FormLabel>Link</FormLabel>
        <Input name="link" value={link} onChange={handleLinkChange} />
      </FormControl>

      <FormControl id="solution" mb={4} isRequired>
        <FormLabel>Solution (Python)</FormLabel>
        <Box height="400px" border="1px" borderColor="gray.200" borderRadius="md">
          <Editor
            height="100%"
            value={solution}
            onChange={(value) => setSolution(value || "")}
            theme='vs-dark'
            defaultLanguage="python"
            options={{
              minimap: { enabled: false },
              automaticLayout: true
            }}
          />
        </Box>
      </FormControl>

      {isAdmin && (
        <Flex alignItems="center" gap={4} pb={4}>
          <Button colorScheme="teal" onClick={handleSubmit}>
            Update
          </Button>
          <Button colorScheme="red" onClick={() => router.push('/questions')}>
            Cancel
          </Button>
        </Flex>
      )}
    </Box>
  );
}
