import axios from "axios";
import { io, Socket } from 'socket.io-client';
import {
  MatchRequest,
  MatchRequestResponse,
  MatchFoundResponse, MatchResult,
} from '../types/Match';

const axiosInstance = axios.create({
  baseURL: "http://localhost:8002",
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  }, // can be used to sent auth token as well
});

export const testSend = async () => {
  try {
    const response = await axiosInstance.get("/test-send");
    return response.data;
  } catch (error) {
    console.error("Error sending test message:", error);
    throw error;
  }
};

export const getMatchSocket = () => {
  return io(`ws://localhost:${process.env.MATCHING_WEBSOCKET_SERVICE_PORT ?? 8008}`, {
    reconnection: false,
    timeout: 3000,
  });
}

export const makeMatchRequest = async (
  socket: Socket,
  matchRequest: MatchRequest,
  onRequestMade: (response: MatchRequestResponse) => void,
): Promise<MatchResult> => {
  try {
    const matchFoundResponse = new Promise<MatchResult>((resolve) => {
      socket.once("matchRequestResponse", (response: MatchRequestResponse) => {
        onRequestMade(response);
        if (response.error) {
          resolve({ result: 'error', error: response.error });
        }
      });
      socket.once("noMatchFound", () => {
        resolve({ result: 'timeout' });
      });
      socket.once("matchFound", (res: MatchFoundResponse) => {
        resolve({ result: 'success', matchFound: res });
      });
    });
    socket.emit("matchRequest", matchRequest);
    console.log("Sent match request:", matchRequest);
    return matchFoundResponse;
  } catch (error) {
    console.error("Error sending match request:", error);
    throw error;
  }
};

export const cancelMatchRequest = (
  socket: Socket
) => {
  socket.disconnect();
  console.log("Cancelled match request");
};
