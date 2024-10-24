// "use client";

// import React, { useRef } from 'react';
// import CodeEditor from '@/components/CodeEditor';
// import { SimpleGrid, Stack, Text } from '@chakra-ui/react';
// import { questionData } from '../page';

// type PageParams = {
//   params: {
//     id: string;
//   };
// };

// export default function Page({ params }: PageParams) {
//   const editorRef = useRef<HTMLDivElement | null>(null);
//   const id = Number(params.id);

//   return (
//     <SimpleGrid columns={2} flex="1" className='m-8' spacing={8}>
//       <Stack className='p-8' spacing={4} border="1px" borderColor="gray.200" borderRadius="md">
//         <Text fontSize="xl" fontWeight="bold">{id + 1}. {questionData[id]["title"]}</Text>
//         <Text>{questionData[id]["description"]}</Text>
//       </Stack>
//       <Stack border="1px" borderColor="gray.200" borderRadius="md">
//         <CodeEditor editorRef={editorRef} params={params} />
//       </Stack>
//     </SimpleGrid>
//   );
// }
