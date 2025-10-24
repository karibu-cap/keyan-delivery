import { sendMessage } from "@/lib/actions/server/admin/messaging";

export const POST = async (req: Request) => {
    const body = await req.json();

    try {
        const result = await sendMessage(body);
        return new Response(JSON.stringify(result));
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: "Failed to send message " + error }), { status: 500 });
    }
}
