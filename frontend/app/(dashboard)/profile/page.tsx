'use client';

import { useState, useRef, useEffect } from "react";
import { 
  Avatar, 
  Button, 
  Card, 
  HStack, 
  AlertDialog, 
  AlertDialogBody, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogContent, 
  AlertDialogOverlay,
  Stack, 
  Tag, 
  TagLabel, 
  TagLeftIcon, 
  VStack, 
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input
} from "@chakra-ui/react";
import { AtSignIcon, LinkIcon } from "@chakra-ui/icons";
import { deleteUser, updateUser, logout } from "@/services/userService";
import useAuth from "@/hooks/useAuth";

export default function ProfilePage() {
  const toast = useToast();
  const { userId, username, email, setUsername, setEmail } = useAuth();
  const [isEdit, setIsEdit] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setNewUsername(username);
    setNewEmail(email);
  }, [username, email]);

  const handleDeleteProfile = () => {
    try {
      deleteUser(userId);
    } catch (error) {
      toast.closeAll();
      toast({ 
        title: 'Error', 
        description: 'Failed to delete profile', 
        status: 'error', 
        duration: 3000, 
        isClosable: true,
        position: 'top'
      });
    }
  };

  const handleUpdateProfile = async () => {
    if (!newUsername || !newEmail) {
      toast.closeAll();
      toast({
        title: 'Error',
        description: 'All fields are required',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top'
      });
      return;
    }

    try {
      await updateUser(userId, { username: newUsername, email: newEmail });
      toast.closeAll();
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top'
      });
      setIsEdit(false);
      setUsername(newUsername);
      setEmail(newEmail);
      window.location.reload(); // This is a temporary fix to update the username in the navbar
    } catch (error: any) {
      if (error.response.status === 409) {
        toast.closeAll();
        toast({
          title: 'Error',
          description: 'Username or email may already exists',
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top'
        });
        return;
      }
      toast.closeAll();
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top'
      });
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="p-8">
      <Stack spacing={20} direction={'row'}>
        <Card>
          <HStack>
            <Avatar size='2xl' name={username} src='https://cdn-icons-png.flaticon.com/128/17446/17446833.png' margin='30px' />
            <VStack align='left' margin='10px'>
              <Tag size='sm' key='username-tag' variant='subtle' colorScheme='cyan'>
                <TagLeftIcon as={AtSignIcon} />
                <TagLabel>{username}</TagLabel>
              </Tag>
              <Tag size='sm' key='email-tag' variant='subtle' colorScheme='cyan'>
                <TagLeftIcon as={LinkIcon} />
                <TagLabel>{email}</TagLabel>
              </Tag>
            </VStack>
          </HStack>
          <Button backgroundColor='#38A169' color='#FFFFFF' margin='10px' onClick={() => setIsEdit(true)}>Edit Profile</Button>
          <Button colorScheme="red" margin='10px' onClick={() => setIsAlertOpen(true)}>Delete Profile</Button>
          <Button colorScheme="blue" margin='10px' onClick={handleLogout}>Logout</Button>

          <AlertDialog
            isOpen={isAlertOpen}
            leastDestructiveRef={cancelRef}
            onClose={() => setIsAlertOpen(false)}
            isCentered
          >
            <AlertDialogOverlay>
              <AlertDialogContent>
                <AlertDialogHeader fontSize="lg" fontWeight="bold">
                  Delete Profile
                </AlertDialogHeader>

                <AlertDialogBody>
                  Are you sure? You can't undo this action afterwards.
                </AlertDialogBody>

                <AlertDialogFooter>
                  <Button ref={cancelRef} onClick={() => setIsAlertOpen(false)}>
                    Cancel
                  </Button>
                  <Button colorScheme="red" onClick={handleDeleteProfile} ml={3}>
                    Delete
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialogOverlay>
          </AlertDialog>

          <Modal isOpen={isEdit} onClose={() => setIsEdit(false)}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Edit Profile</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <FormControl isRequired>
                  <FormLabel>Username</FormLabel>
                  <Input value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
                </FormControl>
                <FormControl isRequired mt={4}>
                  <FormLabel>Email</FormLabel>
                  <Input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
                </FormControl>
              </ModalBody>
              <ModalFooter>
                <Button colorScheme="blue" mr={3} onClick={handleUpdateProfile}>
                  Save
                </Button>
                <Button variant="ghost" onClick={() => setIsEdit(false)}>Cancel</Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </Card>

        {/* <Card width='800px' height='395px'>
          Display Content... Mb for Recent Activities (questions attempted)
        </Card> */}
      </Stack>
    </div>
  );
}
