import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: { code: "NO_FILE", message: "请上传图片" } },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_FORMAT", message: "仅支持 JPG/PNG/WebP 格式" } },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: { code: "FILE_TOO_LARGE", message: "图片大小不能超过 10MB" } },
        { status: 400 }
      );
    }

    const apiKey = process.env.REMOVE_BG_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: { code: "API_KEY_MISSING", message: "服务器未配置 API Key" } },
        { status: 500 }
      );
    }

    // Convert file to base64 for Remove.bg API
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString("base64");
    const dataUri = `data:${file.type};base64,${base64Image}`;

    // Call Remove.bg API
    const removeBgResponse = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
      },
      body: JSON.stringify({
        image_file_b64: base64Image,
        size: "auto",
        output_format: "png",
      }),
    });

    if (!removeBgResponse.ok) {
      const errorText = await removeBgResponse.text();
      console.error("Remove.bg API error:", errorText);
      return NextResponse.json(
        { success: false, error: { code: "API_ERROR", message: "Remove.bg API 调用失败" } },
        { status: 500 }
      );
    }

    const resultBuffer = await removeBgResponse.arrayBuffer();
    const resultBase64 = Buffer.from(resultBuffer).toString("base64");
    const dataUriResult = `data:image/png;base64,${resultBase64}`;

    return NextResponse.json({
      success: true,
      data: {
        result: dataUriResult,
        originalSize: file.size,
        resultSize: resultBuffer.byteLength,
      },
    });
  } catch (error) {
    console.error("Remove background error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "服务器内部错误" } },
      { status: 500 }
    );
  }
}
