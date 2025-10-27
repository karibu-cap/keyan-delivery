import { DialogFooter, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useT } from "@/hooks/use-inline-translation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAction } from "next-safe-action/hooks";
import { senNotificationToMerchant } from "@/lib/actions/server/admin/merchants";
import { toast } from "@/hooks/use-toast";



export const MessageDialog = (props: { merchantId: string, triggerButton: React.ReactNode }) => {
    const t = useT();
    const [messageDialog, setMessageDialog] = useState(false);
    const [message, setMessage] = useState("");

    console.log(messageDialog);

    const {
        execute: sendNotification,
        isExecuting: isSendingNotification,
    } = useAction(senNotificationToMerchant, {
        onSuccess: () => {
            toast({
                title: t("Message sent"),
                description: t("Notification has been sent to the merchant."),
            });
            setMessageDialog(false);
            setMessage("");
        },
        onError: ({ error }) => {
            if (error.serverError) {
                toast({
                    title: t("Cannot send message"),
                    description: error.serverError,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: t("Error"),
                    description: t("Failed to send message"),
                    variant: "destructive",
                });
            }
        },
    });

    return (
        <>
            <Dialog open={messageDialog} onOpenChange={setMessageDialog}>
                <DialogTrigger asChild>
                    {props.triggerButton}
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("Send Message to {merchant.businessName}")}</DialogTitle>
                        <DialogDescription>
                            {t("This notification will be sent to the merchant via push notification and email.")}
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        placeholder="Enter your message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={5}
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setMessageDialog(false)}>
                            {t("Cancel")}
                        </Button>
                        <Button onClick={() => sendNotification({ merchantId: props.merchantId, message })} disabled={!message.trim() || isSendingNotification}>
                            {isSendingNotification ? t("Sending...") : t("Send Message")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}