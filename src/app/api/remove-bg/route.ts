import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json(
        { success: false, error: "No image provided" },
        { status: 400 }
      );
    }

    const apiKey = process.env.REMOVE_BG_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "Remove.bg API key not configured" },
        { status: 500 }
      );
    }

    // Convert base64 to binary
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Create FormData for Remove.bg API
    const formData = new FormData();
    const blob = new Blob([bytes], { type: "image/png" });
    formData.append("image_file", blob, "image.png");
    formData.append("size", "auto");

    // Forward to Remove.bg
    const removeBgResponse = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
      },
      body: formData,
    });

    if (!removeBgResponse.ok) {
      const errorText = await removeBgResponse.text();
      return NextResponse.json(
        { success: false, error: `Remove.bg API error: ${errorText}` },
        { status: removeBgResponse.status }
      );
    }

    // Get the result as blob
    const resultBlob = await removeBgResponse.blob();
    const resultBuffer = await resultBlob.arrayBuffer();

    // Convert to base64
    const resultArray = Array.from(new Uint8Array(resultBuffer));
    const resultBase64 = btoa(String.fromCharCode(...resultArray));

    return NextResponse.json({
      success: true,
      result: `data:image/png;base64,${resultBase64}`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
