import { useState } from "react";
import api from "@/lib/axiosInstance";
import { toast } from "sonner";

export const useDownload = () => {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadFile = async (url: string, filename: string) => {
    try {
      setIsDownloading(true);

      // 1. Request the file as a 'blob' (binary large object)
      const response = await api.get(url, {
        responseType: "blob", 
      });

      // 2. Create a hidden link element to trigger the download
      const href = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = href;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      
      // 3. Programmatically click it
      link.click();

      // 4. Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(href);
      
      toast.success("Download started successfully");
    } catch (error) {
      console.error("Download failed", error);
      toast.error("Failed to download file");
    } finally {
      setIsDownloading(false);
    }
  };

  return { downloadFile, isDownloading };
};