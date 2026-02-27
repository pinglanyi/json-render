import { getWidgets, createWidget } from "@/lib/db/store";

export async function GET() {
  try {
    const widgetList = await getWidgets();
    return Response.json({ data: widgetList, total: widgetList.length });
  } catch {
    return Response.json({ data: [], total: 0 });
  }
}

export async function POST(req: Request) {
  const body = await req.json();

  if (!body.prompt || !body.spec) {
    return Response.json(
      { error: "prompt and spec are required" },
      { status: 400 },
    );
  }

  try {
    const widget = await createWidget({
      prompt: body.prompt,
      spec: body.spec,
    });
    return Response.json(widget, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to save widget";
    return Response.json({ error: message }, { status: 500 });
  }
}
