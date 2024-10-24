'use client';

import React, { useEffect, useMemo, useState, useRef } from 'react';
import * as Y from 'yjs';
import * as monaco from 'monaco-editor'
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';
import Editor from '@monaco-editor/react';
import { Button, Flex, Textarea } from '@chakra-ui/react';
import { color } from 'framer-motion';

interface User {
  id: string;
  color: string;
}

interface AwarenessUser {
  user: User;
  isConnected: boolean;
  cursor: monaco.Position;
  selection: monaco.Selection | null;
}

const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4']

const YjsEditor = ({ userId, roomId }: { userId: string, roomId: string }) => {
  const ydoc = useMemo(() => new Y.Doc(), []);
  const [editor, setEditor] = useState<any | null>(null);
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const [binding, setBinding] = useState<MonacoBinding | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<AwarenessUser[]>([]);
  const cursorsRef = useRef<Map<string, string[]>>(new Map());

  // Generate a User for this client
  const currentUser = useMemo(() => ({
    id: userId,
    color: colors[Math.floor(Math.random() * colors.length)]
  }), []);

  // this effect manages the lifetime of the Yjs document and the provider
  useEffect(() => {
    const provider = new WebsocketProvider(
      'ws://localhost:8007/code',
      roomId,
      ydoc,
      {
        params: { userId }
      }
    );
    setProvider(provider);
    provider.awareness.setLocalStateField('user', currentUser);
    provider.awareness.setLocalStateField('cursor', {lineNumber: 1, column: 1});

    const handleAwarenessChange = () => {
      const states = Array.from(provider.awareness.getStates().values());
      const users = states.map((state: any) => ({
        user: state.user,
        isConnected: true,
        ...state
      }));
      setConnectedUsers(users);
    }

    provider.awareness.on('change', handleAwarenessChange);
    handleAwarenessChange();

    return () => {
      provider.awareness.off('change', handleAwarenessChange);
      provider?.destroy()
      ydoc.destroy()
    };
  }, [ydoc]);

  useEffect(() => {
    if (!editor || !provider) {
      console.log("Editor or provider not ready yet");
      return;
    }

    const updateCursor = () => {
      const position = editor.getPosition();
      if (position) {
        provider.awareness.setLocalStateField('cursor', {
          lineNumber: position.lineNumber,
          column: position.column
        });
      }
      provider.awareness.setLocalStateField('selection', editor.getSelection());
    }

    updateCursor();

    const cursorPositionDisposable = editor.onDidChangeCursorPosition(updateCursor);
    const cursorSelectionDisposable = editor.onDidChangeCursorSelection(updateCursor);

    const createCursorDecoration = (state: AwarenessUser) => ({
      range: new monaco.Range(
        state.cursor!.lineNumber,
        state.cursor!.column,
        state.cursor!.lineNumber,
        state.cursor!.column
      ),
      options: {
        className: `cursor-${state.user.id}`,
        hoverMessage: { value: `${state.user.id}` },
        beforeContentClassName: 'remote-caret',
        stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
      }
    });

    // Add cursor styles
    const addCursorStyle = (userId: string, color: string): void => {
      const style = document.createElement('style');
      style.textContent = `
        .cursor-${userId} {
        background-color: ${color};
        width: 2px !important;
        height: 18px !important;
        position: absolute;
        }
        .cursor-${userId}::before {
        content: '';
        width: 6px;
        height: 6px;
        background-color: ${color};
        position: absolute;
        top: -6px;
        left: -2px;
        }
      `;
      document.head.appendChild(style);
    };

    const handleAwarenessChange = () => {
      const states = Array.from(provider.awareness.getStates().values());
      const currentClients = new Set<string>();
      states.forEach((state: any) => {
        if (state.user.id !== currentUser.id) {
          currentClients.add(state.user.id);
          const cursorDecoration = createCursorDecoration(state);
          addCursorStyle(state.user.id, state.user.color);
          let decorations = cursorsRef.current.get(state.user.id) || [];
          decorations = editor.deltaDecorations(decorations, [cursorDecoration]);
          cursorsRef.current.set(state.user.id, decorations);
        }
      });
      cursorsRef.current.forEach((_, userId) => {
        if (!currentClients.has(userId)) {
          const decorations = cursorsRef.current.get(userId) || [];
          editor.deltaDecorations(decorations, []);
          cursorsRef.current.delete(userId);
        }
      });
    }

    provider.awareness.on('change', handleAwarenessChange);
    handleAwarenessChange();

    return () => {
      cursorPositionDisposable.dispose();
      cursorSelectionDisposable.dispose();
      provider.awareness.off('change', handleAwarenessChange);
      cursorsRef.current.forEach((decorations) => {
        editor.deltaDecorations(decorations, []);
      });
      cursorsRef.current.clear();
    }


  }, [editor, provider]);

  // this effect manages the lifetime of the editor binding
  useEffect(() => {
    if (provider == null || editor == null) {
      return;
    }
    const binding = new MonacoBinding(ydoc.getText(), editor.getModel()!, new Set([editor]), provider?.awareness);
    setBinding(binding);

    return () => {
      binding.destroy();
    }
  }, [ydoc, provider, editor]);

  return (
    <Flex direction="column" className='h-full'>
      <Editor
        height="100%"
        defaultValue="// some comment"
        theme='vs-dark'
        defaultLanguage="javascript"
        onMount={editor => { setEditor(editor) }}
        options={{
          minimap: { enabled: false },
          automaticLayout: true
        }}
      />
      <Textarea flex="0 0 20%" backgroundColor="#f5f5f5" placeholder='Your code output will be shown here.' readOnly />
      <Flex justify="space-between" align="center" width="100%" padding="20px">
        <div className="flex flex-wrap gap-2">
          {connectedUsers.length != 0 ? connectedUsers.map(({ user }) => (
            <div
              key={user.id}
              className="flex items-center gap-2 px-3 py-1 rounded-full"
              style={{ backgroundColor: user.color + '20', border: `2px solid ${user.color}` }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: user.color }}
              />
              <span>{user.id}</span>
            </div>
          )) : (
            <span>No connected users</span>
          )}
        </div>
        <Button alignSelf="flex-end" margin="10px">Run Code</Button>
      </Flex>
    </Flex>
  );
}

export default YjsEditor;