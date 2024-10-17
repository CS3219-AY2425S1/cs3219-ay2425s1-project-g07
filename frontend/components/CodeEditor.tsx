"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as monaco from 'monaco-editor';
import { Box, Button, Flex, Textarea } from '@chakra-ui/react';

self.MonacoEnvironment = {
  getWorkerUrl: function (moduleId, label) {
    if (label === 'json') {
      return '_next/static/json.worker.js';
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return '_next/static/css.worker.js';
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return '_next/static/html.worker.js';
    }
    if (label === 'typescript' || label === 'javascript') {
      return '_next/static/ts.worker.js';
    }
    return '_next/static/editor.worker.js';
  }
};

type PageParams = {
  params: {
    id: string;
  };
  editorRef: React.RefObject<HTMLDivElement>;
};

export default function CodeEditor({ params, editorRef }: PageParams) {
  const { id } = params;
  const [output, setOutput] = useState<string>('');
  const editorInstanceRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (editorRef.current) {
      editorInstanceRef.current = monaco.editor.create(editorRef.current, {
        value: [
          `// Content based on id: ${id}`,
          'function main() {',
          '\tconsole.log("hello world");',
          '}',
          'main();'
        ].join('\n'),
        language: 'javascript',
        theme: 'vs-dark',
      });

      editorInstanceRef.current.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => {
        runCode();
      });

      const handleResize = () => {
        editorInstanceRef.current?.layout();
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        editorInstanceRef.current?.dispose();
      };
    }
  }, [id, editorRef]);

  const runCode = () => {
    if (editorRef.current) {
      const code = monaco.editor.getModels()[0].getValue();
      try {
        const log: string[] = [];
        const originalConsoleLog = console.log;
        console.log = (...args) => {
          log.push(args.join(' '));
        };
        eval(code);
        console.log = originalConsoleLog;
        setOutput(log.join('\n'));
      } catch (error) {
        setOutput((error as Error).toString());
      }
    }
  };

  return (
    <Flex direction="column" height="100%">
      <Box ref={editorRef} flex="1" />
      <Textarea flex="0 0 20%" backgroundColor="#f5f5f5" value={output} readOnly />
      <Button onClick={runCode} alignSelf="flex-end" margin="10px">Run Code</Button>
    </Flex>
  );
}