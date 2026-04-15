"use client";

import { cn } from "@/lib/utils";
import { Upload, X, FileImage } from "lucide-react";
import { useCallback, useState, type ChangeEvent } from "react";

interface FileUploadProps {
  label?: string;
  accept?: string;
  multiple?: boolean;
  maxSizeMB?: number;
  error?: string;
  value?: File[];
  onChange: (files: File[]) => void;
  preview?: boolean;
}

export function FileUpload({
  label,
  accept = "image/*",
  multiple = false,
  maxSizeMB = 5,
  error,
  value = [],
  onChange,
  preview = true,
}: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      const files = Array.from(fileList).filter(
        (f) => f.size <= maxSizeMB * 1024 * 1024
      );
      if (multiple) {
        onChange([...value, ...files]);
      } else {
        onChange(files.slice(0, 1));
      }
    },
    [maxSizeMB, multiple, onChange, value]
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-neutral-700">
          {label}
        </label>
      )}
      <div
        className={cn(
          "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors cursor-pointer",
          dragOver
            ? "border-brand-500 bg-brand-50"
            : "border-neutral-300 hover:border-brand-400 hover:bg-neutral-50",
          error && "border-red-500"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <Upload className="h-8 w-8 text-neutral-400 mb-2" />
        <p className="text-sm text-neutral-600">
          Arraste arquivos ou <span className="text-brand-500 font-medium">clique para selecionar</span>
        </p>
        <p className="text-xs text-neutral-400 mt-1">
          Max {maxSizeMB}MB por arquivo
        </p>
      </div>

      {preview && value.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {value.map((file, i) => (
            <div
              key={`${file.name}-${i}`}
              className="relative group flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2"
            >
              <FileImage className="h-4 w-4 text-neutral-500" />
              <span className="text-xs text-neutral-700 max-w-[150px] truncate">
                {file.name}
              </span>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="text-neutral-400 hover:text-red-500"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
