'use client';

import React, { useEffect, useMemo, useState, useRef } from 'react';
import * as Y from 'yjs';
import * as monaco from 'monaco-editor';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';
import Editor from '@monaco-editor/react';
import { Button, Flex, Text, Textarea, Spinner } from '@chakra-ui/react';

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

const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4'];

self.MonacoEnvironment = {
  getWorkerUrl: function (moduleId, label) {
    switch (label) {
      case 'json':
        return '_next/static/json.worker.js';
      case 'css':
      case 'scss':
      case 'less':
        return '_next/static/css.worker.js';
      case 'html':
      case 'handlebars':
      case 'razor':
        return '_next/static/html.worker.js';
      case 'typescript':
      case 'javascript':
        return '_next/static/ts.worker.js';
      default:
        return '_next/static/editor.worker.js';
    }
  }
};

interface IProps {
  userId: string;
  roomId: string;
  onConnectionChange?: (status: 'connected' | 'disconnected') => void;
}

const YjsEditor = ({ userId, roomId, onConnectionChange }: IProps) => {
  const ydoc = useMemo(() => new Y.Doc(), []);
  const [connectedToRoom, setConnectedToRoom] = useState(false);
  const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const [binding, setBinding] = useState<MonacoBinding | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<AwarenessUser[]>([]);
  const cursorsRef = useRef<Map<string, string[]>>(new Map());
  const [codeOutput, setCodeOutput] = useState<string>('');

  const currentUser = useMemo(() => ({
    id: userId,
    color: colors[Math.floor(Math.random() * colors.length)]
  }), [userId]);

  useEffect(() => {
    const provider = new WebsocketProvider(
      'ws://localhost:8007/code',
      roomId,
      ydoc,
      { maxBackoffTime: 4000, params: { userId } }
    );

    setProvider(provider);
    provider.awareness.setLocalStateField('user', currentUser);
    provider.awareness.setLocalStateField('cursor', { lineNumber: 1, column: 1 });

    const handleConnection = () => {
      console.log("Connected to room: ", roomId);
      setConnectedToRoom(true);
      onConnectionChange?.('connected');
    };

    const handleDisconnect = () => {
      console.log("Disconnected from room: ", roomId);
      setConnectedToRoom(false);
      onConnectionChange?.('disconnected');
    };

    const handleConnectError = () => {
      console.log("Error connecting to room: ", roomId);
      setConnectedToRoom(false);
      provider.shouldConnect = false;
      onConnectionChange?.('disconnected');
    };

    provider.on('status', ({ status }: { status: string }) => {
      console.log("Connection status: ", status);
      if (status === 'connected') {
        handleConnection();
      }
    });

    provider.on('connection-error', handleConnectError);

    const handleAwarenessChange = () => {
      const states = Array.from(provider.awareness.getStates().values());
      const users = states.map((state: any) => ({
        user: state.user,
        isConnected: true,
        ...state
      }));
      setConnectedUsers(users);
    };

    provider.awareness.on('change', handleAwarenessChange);
    handleAwarenessChange();

    return () => {
      provider.awareness.off('change', handleAwarenessChange);
      provider.destroy();
      ydoc.destroy();
    };
  }, [ydoc, roomId, userId, currentUser, onConnectionChange]);

  useEffect(() => {
    if (!editor || !provider) return;

    const updateCursor = () => {
      const position = editor.getPosition();
      if (position) {
        provider.awareness.setLocalStateField('cursor', {
          lineNumber: position.lineNumber,
          column: position.column
        });
      }
      provider.awareness.setLocalStateField('selection', editor.getSelection());
    };

    updateCursor();

    const cursorPositionDisposable = editor.onDidChangeCursorPosition(updateCursor);
    const cursorSelectionDisposable = editor.onDidChangeCursorSelection(updateCursor);

    const createCursorDecoration = (state: AwarenessUser) => ({
      range: new monaco.Range(
        state.cursor.lineNumber,
        state.cursor.column,
        state.cursor.lineNumber,
        state.cursor.column
      ),
      options: {
        className: `cursor-${state.user.id}`,
        hoverMessage: { value: `${state.user.id}` },
        beforeContentClassName: 'remote-caret',
        stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
      }
    });

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
    };

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
    };
  }, [editor, provider, currentUser]);

  useEffect(() => {
    if (provider == null || editor == null) return;

    const binding = new MonacoBinding(ydoc.getText(), editor.getModel()!, new Set([editor]), provider.awareness);
    setBinding(binding);

    return () => {
      binding.destroy();
    };
  }, [ydoc, provider, editor]);

  useEffect(() => {
    if (editor) {
      editor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Enter, runCode);
    }
  }, [editor]);

  const runCode = () => {
    if (editor) {
      const code = editor.getModel()?.getValue() || '';
      try {
        const log: string[] = [];
        const originalConsoleLog = console.log;
        console.log = (...args) => {
          log.push(args.join(' '));
        };
        eval(code);
        console.log = originalConsoleLog;
        setCodeOutput(log.join('\n'));
      } catch (error) {
        setCodeOutput((error as Error).toString());
      }
    }
  };

  return (
    connectedToRoom ? (
      <Flex direction="column" className='h-full'>
        <Editor
          height="100%"
          defaultValue="// some comment"
          theme='vs-dark'
          defaultLanguage="javascript"
          onMount={setEditor}
          options={{
            minimap: { enabled: false },
            automaticLayout: true
          }}
        />
        <Textarea
          flex="0 0 20%"
          backgroundColor="#f5f5f5"
          placeholder='Your code output will be shown here.'
          value={codeOutput}
          readOnly
        />
        <Flex justify="space-between" align="center" width="100%" padding="20px">
          <div className="flex flex-wrap gap-2">
            {connectedUsers.length ? connectedUsers.map(({ user }) => (
              <div
                key={user.id}
                className="flex items-center gap-2 px-3 py-1 rounded-full"
                style={{ backgroundColor: `${user.color}20`, border: `2px solid ${user.color}` }}
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
          <Button alignSelf="flex-end" margin="10px" onClick={runCode}>Run</Button>
        </Flex>
      </Flex>
    ) : (
      <div className="flex flex-col justify-center items-center h-full">
        <Spinner size='xl' m={5} />
        <Text>Connecting to room...</Text>
      </div>
    )
  );
};

export default YjsEditor;
