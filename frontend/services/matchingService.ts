import axios from "axios";
import {
  MatchRequest,
  MatchResponse,
  CheckMatchResponse,
  CheckMatchResponseError,
} from "../types/Match";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_GATEWAY_DOMAIN || process.env.NEXT_PUBLIC_MATCHING_SERVICE_DOMAIN || "http://localhost:8002",
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

export const makeMatchRequest = async (
  matchRequest: MatchRequest
): Promise<MatchResponse> => {
  try {
    const response = await axiosInstance.post("/match", matchRequest);
    return response.data as MatchResponse;
  } catch (error) {
    console.error("Error sending match request:", error);
    throw error;
  }
};

export const cancelMatchRequest = async (
  matchRequest: MatchRequest
): Promise<MatchResponse> => {
  try {
    const response = await axiosInstance.post("/cancel-match", matchRequest);
    return response.data as MatchResponse;
  } catch (error) {
    console.error("Error sending cancel match request:", error);
    throw error;
  }
};

export const checkMatch = async (
  userId: string
): Promise<CheckMatchResponse | CheckMatchResponseError> => {
  try {
    const response = await axiosInstance.get(`/check-match?userId=${userId}`);

    return response.data as CheckMatchResponse | CheckMatchResponseError;
  } catch (error) {
    console.error("Error checking match:", error);
    throw error;
  }
};
