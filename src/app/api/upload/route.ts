import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { existsSync, mkdirSync } from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const file = data.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a unique filename to avoid conflicts
    const timestamp = Date.now();
    const fileExtension = path.extname(file.name);
    const fileName = `${timestamp}-${file.name}`;
    
    const filePath = path.join(process.cwd(), "public", "uploads", fileName);
    
    // Ensure the uploads directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    try {
      await writeFile(filePath, buffer);
    } catch (error) {
      // If directory doesn't exist, create it
      if (!existsSync(uploadsDir)) {
        mkdirSync(uploadsDir, { recursive: true });
      }
      await writeFile(filePath, buffer);
    }

    return NextResponse.json({ url: `/uploads/${fileName}` });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
