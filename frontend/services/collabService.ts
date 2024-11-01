import axios from "axios";
import { Room } from "@/types/Room";

export const createRoom = async (roomId: string): Promise<Room> => {
  try {
    const response = await axios.post("http://localhost:8007/create-room", {
      roomId,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating room:", error);
    throw error;
  }
};

export const getRoom = async (roomId: string): Promise<Room> => {
  try {
    const response = await axios.get(`http://localhost:8007/rooms/${roomId}`);
    return response.data;
  } catch (error) {
    console.error("Error getting room:", error);
    throw error;
  }
};
