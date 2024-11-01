import axios from "axios";
import { io, Socket } from 'socket.io-client';
import {
  MatchRequest,
  MatchRequestResponse,
  MatchFoundResponse, MatchResult,
} from '../types/Match';

// Go directly to matching websockets
const baseDomain = process.env.NEXT_PUBLIC_MATCHING_WEBSOCKET_SERVICE_DOMAIN || process.env.NEXT_PUBLIC_API_GATEWAY_DOMAIN || "http://localhost:8008";

const axiosInstance = axios.create({
  baseURL: baseDomain,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  }, // can be used to sent auth token as well
});

export const getMatchSocket = () => {
  return io(baseDomain, {
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
