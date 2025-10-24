import type { MessageData } from "@/types/messaging";


export const sendMessage = async (payload: MessageData) => {
    const result = await fetch(`/api/v1/admin/messaging`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    })
    const data = await result.json();
    return data;
}

export const getMessageTemplates = async () => {
    const result = await fetch(`/api/v1/admin/messaging/templates`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
    const data = await result.json();
    return data;
}
