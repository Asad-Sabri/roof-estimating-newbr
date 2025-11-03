import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "./db";
import Project from "../models/Project";
import { verifyToken } from "./auth";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{}> }
) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const authHeader = req.headers.get("authorization");
    if (!authHeader)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split(" ")[1];
    const user = await verifyToken(token);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDB();

    const deleted = await Project.findByIdAndDelete(id);
    if (!deleted)
      return NextResponse.json({ error: "Project not found" }, { status: 404 });

    return NextResponse.json({ message: "Project deleted successfully" }, { status: 200 });
  } catch (err) {
    console.error("DELETE Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
