import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { API_CONFIG } from '@/constants';
import { AnalysisRequest, ApiResponse, Prediction } from '@/types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        console.log(`Making API request to: ${config.url}`);
        return config;
      },
      (error) => {
        console.error('API request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => {
        console.log(`API response from: ${response.config.url}`, response.status);
        return response;
      },
      (error) => {
        console.error('API response error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Analyze image
  async analyzeImage(request: AnalysisRequest): Promise<ApiResponse> {
    try {
      const formData = new FormData();
      
      // Convert base64 to blob for upload
      const response = await fetch(request.file);
      const blob = await response.blob();
      
      formData.append('file', blob as any, 'image.jpg');
      formData.append('detect_type', request.detect_type);
      formData.append('target_prompt', request.target_prompt);
      formData.append('segmentation_language', request.segmentation_language);
      formData.append('temperature', request.temperature.toString());
      
      if (request.label_prompt) {
        formData.append('label_prompt', request.label_prompt);
      }

      const response_data: AxiosResponse<ApiResponse> = await this.api.post(
        API_CONFIG.ENDPOINTS.ANALYZE,
        formData
      );

      return response_data.data;
    } catch (error) {
      console.error('Error analyzing image:', error);
      throw this.handleError(error);
    }
  }

  // Get prediction history
  async getHistory(limit: number = 50, detectType?: string): Promise<ApiResponse<Prediction[]>> {
    try {
      const params: any = { limit };
      if (detectType) {
        params.detect_type = detectType;
      }

      const response: AxiosResponse<ApiResponse<Prediction[]>> = await this.api.get(
        API_CONFIG.ENDPOINTS.HISTORY,
        { params }
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching history:', error);
      throw this.handleError(error);
    }
  }

  // Get specific prediction
  async getPrediction(id: number): Promise<ApiResponse<Prediction>> {
    try {
      const response: AxiosResponse<ApiResponse<Prediction>> = await this.api.get(
        `${API_CONFIG.ENDPOINTS.PREDICTION}/${id}`
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching prediction:', error);
      throw this.handleError(error);
    }
  }

  // Delete prediction
  async deletePrediction(id: number): Promise<ApiResponse> {
    try {
      const response: AxiosResponse<ApiResponse> = await this.api.delete(
        `${API_CONFIG.ENDPOINTS.PREDICTION}/${id}`
      );

      return response.data;
    } catch (error) {
      console.error('Error deleting prediction:', error);
      throw this.handleError(error);
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.api.get('/');
      return response.status === 200;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  private handleError(error: any): Error {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.error || error.response.statusText || 'Server error';
      return new Error(`API Error: ${message}`);
    } else if (error.request) {
      // Request was made but no response received
      return new Error('Network error: Unable to connect to server');
    } else {
      // Something else happened
      return new Error(`Request error: ${error.message}`);
    }
  }
}

// Export singleton instance
export const apiService = new ApiService(); 