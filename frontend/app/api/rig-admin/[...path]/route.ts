import { NextRequest, NextResponse } from "next/server";
import { rigAdminServerAxios } from "@/server/api";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

async function proxy(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  const body = request.method === "GET" || request.method === "HEAD" ? undefined : await request.text();

  try {
    const response = await rigAdminServerAxios.request({
      url: `/${path.join("/")}${request.nextUrl.search}`,
      method: request.method,
      headers: {
        "Content-Type": request.headers.get("content-type") ?? "application/json",
      },
      data: body,
      responseType: "text",
    });

    const text = typeof response.data === "string" ? response.data : JSON.stringify(response.data);
    return new NextResponse(text, {
      status: response.status,
      headers: {
        "Content-Type": String(response.headers["content-type"] ?? "application/json"),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Rig admin server unavailable";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export const GET = proxy;
export const POST = proxy;

export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      Allow: "GET, POST, OPTIONS",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
