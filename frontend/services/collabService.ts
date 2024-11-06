import axios from "axios";
import { Room } from "@/types/Room";

const baseDomain = process.env.NEXT_PUBLIC_COLLAB_SERVICE_DOMAIN || process.env.NEXT_PUBLIC_API_GATEWAY_DOMAIN || "http://localhost:8007";

export const getRoom = async (roomId: string, userId: string): Promise<Room> => {
  try {
    const response = await axios.post(`${baseDomain}/rooms/${roomId}`, { userId: userId });
    return response.data;
  } catch (error) {
    console.error("Error getting room:", error);
    throw error;
  }
};
