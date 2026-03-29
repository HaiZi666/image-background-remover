"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";

// API URL - replace with your deployed Worker URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://your-worker.workers.dev/api/remove-bg";

type ProcessingState = "idle" | "loading" | "success" | "error";

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [result, setResult] = useState<string | null>(null);
  const [state, setState] = useState<ProcessingState>("idle");
  const [error, setError] = useState<string>("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Please upload a JPG, PNG, or WebP image.");
      setState("error");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB.");
      setState("error");
      return;
    }

    setFileName(file.name);
    setError("");
    setResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
      setState("idle");
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const processImage = useCallback(async () => {
    if (!image) return;

    setState("loading");
    setError("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.result);
        setState("success");
      } else {
        setError(data.error || "Failed to remove background.");
        setState("error");
      }
    } catch {
      setError("Network error. Please check your connection.");
      setState("error");
    }
  }, [image]);

  const reset = useCallback(() => {
    setImage(null);
    setResult(null);
    setFileName("");
    setError("");
    setState("idle");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const downloadResult = useCallback(() => {
    if (!result) return;
    const link = document.createElement("a");
    link.href = result;
    link.download = `removed-bg-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [result]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm py-6">
        <h1 className="text-2xl font-bold text-center text-gray-800">
          Image Background Remover
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        {/* Upload Area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            border-2 border-dashed rounded-xl p-12 text-center cursor-pointer 
            transition-all mb-6
            ${isDragOver 
              ? "border-blue-400 bg-blue-50" 
              : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileInput}
            className="hidden"
          />

          {!image ? (
            <div>
              <div className="text-5xl mb-4">🖼️</div>
              <p className="text-gray-600 mb-2">
                Drag & drop an image here, or click to upload
              </p>
              <p className="text-sm text-gray-400">Supports JPG, PNG, WebP (max 10MB)</p>
            </div>
          ) : (
            <div>
              <div className="bg-white rounded-lg p-2 inline-block">
                <div className="checkerboard rounded-lg overflow-hidden">
                  <Image
                    src={image}
                    alt="Preview"
                    width={256}
                    height={256}
                    className="max-h-64 w-auto object-contain"
                    style={{ imageRendering: "pixelated" }}
                  />
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500">{fileName}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={processImage}
            disabled={!image || state === "loading"}
            className={`
              flex-1 font-semibold py-3 px-6 rounded-lg transition-colors
              ${!image || state === "loading"
                ? "bg-gray-300 cursor-not-allowed text-gray-500"
                : "bg-blue-500 hover:bg-blue-600 text-white"
              }
            `}
          >
            {state === "loading" ? "Processing..." : "Remove Background"}
          </button>

          <button
            onClick={reset}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Loading State */}
        {state === "loading" && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin text-4xl mb-4">⏳</div>
            <p className="text-gray-600">Removing background...</p>
          </div>
        )}

        {/* Error State */}
        {state === "error" && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600 text-center">{error}</p>
            <button
              onClick={processImage}
              className="mt-3 w-full bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2 px-4 rounded transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Result Area */}
        {state === "success" && result && (
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-3 text-center">
              Result
            </h2>
            <div className="bg-white rounded-xl shadow-md p-4 mb-4">
              <div className="checkerboard rounded-lg p-2">
                <Image
                  src={result}
                  alt="Result"
                  width={512}
                  height={512}
                  className="max-h-80 w-auto mx-auto rounded object-contain"
                  style={{ imageRendering: "pixelated" }}
                />
              </div>
            </div>
            <button
              onClick={downloadResult}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              ⬇️ Download Result
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-sm text-gray-400">
        Powered by{" "}
        <a
          href="https://www.remove.bg"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          Remove.bg
        </a>
      </footer>
    </div>
  );
}
