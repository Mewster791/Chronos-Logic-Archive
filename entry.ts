import { secrets } from "base44:runtime";

export default async function(req: Request): Promise<Response> {
  try {
    const body = await req.json().catch(() => ({}));
    const code = body?.code;
    const valid = secrets.get("EDITOR_ACCESS_CODE") === String(code);
    return Response.json({ valid });
  } catch (error) {
    return Response.json({ valid: false, error: error.message }, { status: 500 });
  }
}
