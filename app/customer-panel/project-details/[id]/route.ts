import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "./db";
import Project from "../models/Project";
import { verifyToken } from "./auth";

// ✅ DELETE handler — Next.js 15 compatible
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ Await the params Promise (Next.js 15 change)
    const { id } = await context.params;

    // ✅ Authorization check
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // ✅ Connect to database
    await connectToDB();

    // ✅ Delete the project
    const deletedProject = await Project.findByIdAndDelete(id);
    if (!deletedProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // ✅ Success response
    return NextResponse.json(
      { message: "Project deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ DELETE /project error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
