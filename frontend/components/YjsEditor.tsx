'use client';

import React, { useEffect, useMemo, useState } from 'react';
import * as Y from 'yjs';
import * as monaco from 'monaco-editor'
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';
import Editor from '@monaco-editor/react';
import { Button, Flex, Textarea } from '@chakra-ui/react';

interface User {
  id: string;
  color: string;
}

interface AwarenessUser {
  user: User;
  isConnected: boolean;
}

const YjsEditor = ({ userId, roomId }: { userId: string, roomId: string }) => {
  const ydoc = useMemo(() => new Y.Doc(), []);
  const [editor, setEditor] = useState<any | null>(null);
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const [binding, setBinding] = useState<MonacoBinding | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<AwarenessUser[]>([]);

  // Generate a User for this client
  const currentUser = useMemo(() => ({
    id: userId,
    color: `#${Math.floor(Math.random() * 16777215).toString(16)}`
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

    const handleAwarenessChange = () => {
      const states = Array.from(provider.awareness.getStates().values());
      const users = states.map((state: any) => ({
        user: state.user,
        isConnected: true
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