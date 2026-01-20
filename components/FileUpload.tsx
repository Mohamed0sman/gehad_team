"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useSupabase } from "@/lib/supabase/SupabaseProvider";
import { Upload, FileText, X, Download } from "lucide-react";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";

interface FileAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

interface FileUploadProps {
  taskId: string;
  attachments: FileAttachment[];
  onAttachmentAdded: (attachment: FileAttachment) => void;
  onAttachmentRemoved: (attachmentId: string) => void;
}

export default function FileUpload({
  taskId,
  attachments,
  onAttachmentAdded,
  onAttachmentRemoved,
}: FileUploadProps) {
  const { supabase } = useSupabase();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !supabase) return;

    try {
      setUploading(true);
      setError(null);

      for (const file of Array.from(files)) {
        const fileName = `${taskId}/${Date.now()}-${file.name}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("task-attachments")
          .upload(fileName, file);

        if (uploadError) {
          setError("Storage bucket 'task-attachments' not found. Run supabase-storage.sql in Supabase.");
          continue;
        }

        const { data: urlData } = supabase.storage
          .from("task-attachments")
          .getPublicUrl(uploadData.path);

        onAttachmentAdded({
          id: uploadData.id,
          name: file.name,
          url: urlData.publicUrl,
          type: file.type || "unknown",
          size: file.size,
        });
      }
    } catch {
      setError("Failed to upload file. Storage may not be configured.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDownload = (url: string, name: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.click();
  };

  const handleRemove = (attachmentId: string) => {
    if (confirm("Are you sure you want to remove this file?")) {
      onAttachmentRemoved(attachmentId);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-3"
      >
        <Label className="text-sm font-medium text-slate-300">Files</Label>
        <div className="p-4 rounded-lg bg-slate-700/20 border border-slate-700/50 text-center">
          <p className="text-sm text-slate-400 mb-2">{error}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-3"
    >
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm font-medium"
        >
          <Upload className="h-4 w-4" />
          {uploading ? "Uploading..." : "Attach Files"}
        </label>
      </div>

      {attachments.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-400">Attachments</h4>
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between p-3 bg-slate-700/20 rounded-lg border border-slate-700/50 hover:bg-slate-700/30 transition-colors"
            >
              <div
                className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                onClick={() => handleDownload(attachment.url, attachment.name)}
              >
                <div className="text-purple-400 flex-shrink-0">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {attachment.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatFileSize(attachment.size)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(attachment.url, attachment.name)}
                  className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(attachment.id)}
                  className="h-8 w-8 p-0 text-slate-400 hover:text-red-400"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
