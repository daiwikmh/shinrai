"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  botToken: z.string().min(1).max(100),
});

export type TelegramFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  defaultValues?: Partial<TelegramFormValues>;
}

export const TelegramTriggerDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
}: Props) => {
  const params = useParams();
  const workflowId = params.workflowId as string;
  const form = useForm<TelegramFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      botToken: defaultValues?.botToken || "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // You need to create this API route later
      const response = await fetch("/api/integrations/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflowId, botToken: values.botToken }),
      });

      if (!response.ok) toast.error("Failed to connect bot");

      toast.success("Telegram Bot Connected!", {
        description: "Send a message to your bot to test the trigger.",
      });
      onSubmit(values);
      onOpenChange(false);
    } catch (error: any) {
      toast.error(
        "Could not connect to Telegram. Check your token.",
        error.message,
      );
    }
   
  };

  useEffect(() => {
    if (open) {
      form.reset({
        botToken: defaultValues?.botToken || "",
      });
    }
  }, [form, open, defaultValues]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Telegram Bot</DialogTitle>
          <DialogDescription>
            Enter your Bot Token to automatically link it to this workflow.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-8 mt-4"
            >
              {" "}
              <FormField
                control={form.control}
                name="botToken"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Variable Name</FormLabel>
                    <FormControl>
                      <Input placeholder="TelegramBot Token" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter your Telegram Bot Token to automatically link it to this workflow.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <p className="text-[0.8rem] text-muted-foreground">
                Obtained from{" "}
                <a
                  href="https://t.me/botfather"
                  target="_blank"
                  className="underline text-primary hover:text-primary/80"
                >
                  @BotFather
                </a>
              </p>
              <div className="rounded-lg bg-muted p-4 space-y-2">
                <h4 className="font-medium text-sm">How to get a token:</h4>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>
                    Open Telegram and search for <strong>@BotFather</strong>
                  </li>
                  <li>
                    Send the command{" "}
                    <code className="bg-background px-1 rounded">/newbot</code>
                  </li>
                  <li>Follow the instructions to name your bot</li>
                  <li>
                    Copy the <strong>HTTP API Token</strong> provided
                  </li>
                  <li>Paste it above and click Connect</li>
                </ol>
              </div>
              <div className="rounded-lg bg-muted p-4 space-y-2">
                <h4 className="font-medium text-sm">Available Variables</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>
                    <code className="bg-background px-1 py-0.5 rounded">
                      {"{{telegram.content}}"}
                    </code>
                    - The message text
                  </li>
                  <li>
                    <code className="bg-background px-1 py-0.5 rounded">
                      {"{{telegram.username}}"}
                    </code>
                    - Sender&apos;s username
                  </li>
                  <li>
                    <code className="bg-background px-1 py-0.5 rounded">
                      {"{{telegram.chatId}}"}
                    </code>
                    - Used to reply back
                  </li>
                </ul>
              </div>
              <DialogFooter className="mt-4">
                <Button type="submit" disabled={form.formState.isSubmitting}>Save</Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
