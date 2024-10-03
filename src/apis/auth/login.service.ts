import axios, { AxiosResponse } from "axios";
import { AuthResponseDto } from "./types/AuthResponse.dto";
import { ApiResponse } from "../../types/api-response.dto";

const env: ImportMetaEnv = import.meta.env;
const API_URL: string = `${env.VITE_BACKEND_URL}/${env.VITE_BACKEND_API_PREFIX}/${env.VITE_BACKEND_API_VERSION}/auth/login`;

export async function Login(
  email: string,
  password: string
): Promise<ApiResponse<AuthResponseDto>> {
  try {
    const response: AxiosResponse<ApiResponse<AuthResponseDto>> =
      await axios.post(API_URL, {
        email,
        password,
      });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
}