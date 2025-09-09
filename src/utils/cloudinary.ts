// src/utils/cloudinary.ts
import axios from "axios";

// Your Cloudinary cloud name and unsigned upload preset
const CLOUD_NAME = "dijbiwcbo";
const UPLOAD_PRESET = "react_upload";

export interface CloudinaryUploadResponse {
  asset_id: string;
  public_id: string;
  secure_url: string;
  url: string;
  [key: string]: any;
}

export const uploadToCloudinary = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<CloudinaryUploadResponse | null> => {
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  try {
    const response = await axios.post(url, formData, {
      headers: { "X-Requested-With": "XMLHttpRequest" },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log("Upload successful!", response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Cloudinary upload failed:", error.response?.data || error.message);
    } else {
      console.error("Unexpected error during upload:", error);
    }
    return null;
  }
};
