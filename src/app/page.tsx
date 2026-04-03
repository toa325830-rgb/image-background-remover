"use client";

import { useState, useRef, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import Header from "@/components/Header";

type ProcessingState = "idle" | "uploading" | "processing" | "done" | "error";

interface ApiResponse {
  success: boolean;
  data?: {
    result: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

function LoginPrompt({ onSignIn }: { onSignIn: () => void }) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="text-6xl mb-6">🔐</div>
        <h2 className="text-2xl font-bold mb-3">需要登录才能使用</h2>
        <p className="text-slate-400 mb-8">
          为了保护服务，请先使用 Google 账号登录后再使用图片背景移除功能。
        </p>
        <button
          onClick={onSignIn}
          className="px-8 py-3 bg-white hover:bg-gray-100 text-gray-800 rounded-xl font-medium transition-all duration-200 shadow-lg inline-flex items-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          使用 Google 账号登录
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const { user, loading, signIn } = useAuth();
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [processingState, setProcessingState] = useState<ProcessingState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMessage("请选择图片文件");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("图片大小不能超过 10MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalImage(e.target?.result as string);
      setResultImage(null);
      setProcessingState("idle");
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleRemoveBackground = async () => {
    if (!originalImage) return;
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setProcessingState("uploading");
    setErrorMessage(null);

    const formData = new FormData();
    formData.append("image", file);

    try {
      setProcessingState("processing");
      const response = await fetch("/api/remove-background", {
        method: "POST",
        body: formData,
      });
      const data: ApiResponse = await response.json();

      if (!data.success || !data.data?.result) {
        setErrorMessage(data.error?.message || "处理失败");
        setProcessingState("error");
        return;
      }
      setResultImage(data.data.result);
      setProcessingState("done");
    } catch {
      setErrorMessage("网络错误，请重试");
      setProcessingState("error");
    }
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement("a");
    link.href = resultImage;
    link.download = "removed-background.png";
    link.click();
  };

  const handleReset = () => {
    setOriginalImage(null);
    setResultImage(null);
    setProcessingState("idle");
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSignIn = async () => {
    try {
      await signIn();
    } catch (error: any) {
      alert("登录失败，请重试: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 pb-12 w-full">
        {!user && !loading ? (
          <LoginPrompt onSignIn={handleSignIn} />
        ) : !originalImage ? (
          <div
            className={`
              border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
              transition-all duration-200
              ${isDragging ? "border-blue-500 bg-blue-500/10 scale-105" : "border-slate-600 hover:border-slate-500 hover:bg-slate-800/50"}
            `}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="text-6xl mb-4">📤</div>
            <p className="text-xl font-medium mb-2">拖拽图片到这里，或点击上传</p>
            <p className="text-slate-500 text-sm">支持 JPG、PNG、WebP，最大 10MB</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 rounded-2xl p-4">
                <h3 className="text-sm font-medium text-slate-400 mb-3">原图</h3>
                <div className="relative rounded-xl overflow-hidden bg-slate-700 aspect-square flex items-center justify-center">
                  <img src={originalImage!} alt="Original" className="max-w-full max-h-full object-contain" />
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-2xl p-4">
                <h3 className="text-sm font-medium text-slate-400 mb-3">结果</h3>
                <div className="relative rounded-xl overflow-hidden bg-slate-700 aspect-square flex items-center justify-center">
                  {resultImage ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <div className="absolute inset-0 opacity-30"
                        style={{
                          backgroundImage: "linear-gradient(45deg, #666 25%, transparent 25%), linear-gradient(-45deg, #666 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #666 75%), linear-gradient(-45deg, transparent 75%, #666 75%)",
                          backgroundSize: "16px 16px",
                          backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
                        }}
                      />
                      <img src={resultImage!} alt="Result" className="relative max-w-full max-h-full object-contain z-10" />
                    </div>
                  ) : (
                    <div className="text-slate-500 text-center">
                      <div className="text-4xl mb-2">🖼️</div>
                      <p className="text-sm">点击&quot;移除背景&quot;开始处理</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-center">
                {errorMessage}
              </div>
            )}

            <div className="flex flex-wrap gap-4 justify-center">
              {processingState === "idle" || processingState === "error" ? (
                <>
                  <button onClick={handleRemoveBackground} className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl font-medium transition-all duration-200 shadow-lg shadow-blue-500/25">
                    移除背景
                  </button>
                  <button onClick={handleReset} className="px-8 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium transition-all duration-200">
                    重新上传
                  </button>
                </>
              ) : processingState === "uploading" || processingState === "processing" ? (
                <div className="flex items-center gap-3 text-blue-400">
                  <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  <span>{processingState === "uploading" ? "上传中..." : "处理中..."}</span>
                </div>
              ) : processingState === "done" ? (
                <>
                  <button onClick={handleDownload} className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl font-medium transition-all duration-200 shadow-lg shadow-green-500/25">
                    下载结果
                  </button>
                  <button onClick={handleReset} className="px-8 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium transition-all duration-200">
                    处理下一张
                  </button>
                </>
              ) : null}
            </div>
          </div>
        )}
      </main>

      <footer className="py-6 text-center text-slate-500 text-sm">
        <p>
          Powered by{" "}
          <a href="https://www.remove.bg" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">Remove.bg</a>
          {" + "}
          <a href="https://cloudflare.com" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300">Cloudflare</a>
        </p>
      </footer>
    </div>
  );
}
