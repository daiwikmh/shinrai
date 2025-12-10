"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export const AVAILABLE_MODELS = [
  "gpt-3.5-turbo", 
  "gpt-4"];

// Re-using the schema definition from the section above
const openRouterSchema = z.object({
  variableName: z.string()
    .min(1, "Variable name is required")
    .regex(/^[a-zA-Z_$][a-zA-Z0-9_$]*$/, {
      message: "Must be a valid variable name (e.g., 'ai_result_1')"}),
  model: z.enum(AVAILABLE_MODELS),
  systemPrompt: z.string()
    .min(10, "The prompt must be at least 10 characters.")
    .max(4096, "Prompt cannot exceed 4096 characters."),
  userPrompt: z.string()
    .min(10, "The prompt must be at least 10 characters.")
    .max(4096, "Prompt cannot exceed 4096 characters.")
});

export type OpenRouterFormValues = z.infer<typeof openRouterSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: OpenRouterFormValues) => void;
  defaultValues?: Partial<OpenRouterFormValues>;
};


export const OpenRouterDialog = ({ 
  open, 
  onOpenChange,
  onSubmit,
  defaultValues = {}
}: Props) => {
  const form = useForm<OpenRouterFormValues>({
    resolver: zodResolver(openRouterSchema),
    defaultValues: {
      variableName: defaultValues.variableName || "aiResult",
      model: defaultValues.model || AVAILABLE_MODELS[0],
      systemPrompt: defaultValues.systemPrompt || "",
      userPrompt: defaultValues.userPrompt || ""
    },
  });
  
  const watchVariableName = useWatch({
    control: form.control,
    name: "variableName"
  }) || "aiResult";

  const handleSubmit = (values: OpenRouterFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  useEffect(() => {
    if (open) {
      form.reset({
        variableName: defaultValues.variableName || "aiResult",
        model: defaultValues.model || AVAILABLE_MODELS[0],
        systemPrompt: defaultValues.systemPrompt || "",
        userPrompt: defaultValues.userPrompt || ""
      });
    }
  }, [form, open, defaultValues]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>AI Text Generation (OpenRouter)</DialogTitle>
          <DialogDescription>
            Configure the prompt and model for the text generation node using OpenRouter via Vercel AI SDK.
          </DialogDescription>
        </DialogHeader>
       <Form {...form}>
         <form 
           onSubmit={form.handleSubmit(handleSubmit)}
           className="space-y-6 mt-4"
         > 
          
          {/* Variable Name Field */}
          <FormField 
            control={form.control}
            name="variableName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Output Variable Name</FormLabel>
                <FormControl>
                  <Input placeholder="aiResult" 
                  {...field} />
                </FormControl>
                <FormDescription>
                  Reference the generated text in other nodes using: {" "}
                  **{`{{${watchVariableName}.text}}`}**
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Model Selection Field */}
          <FormField 
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>AI Model</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an OpenRouter model"/>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {AVAILABLE_MODELS.map((model) => (
                      <SelectItem key={model} value={model}>
                      {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  The model will be accessed via the OpenRouter service.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Prompt Field */}
          <FormField 
            control={form.control}
            name="systemPrompt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>System Prompt</FormLabel>
                <FormControl>
                  <Textarea 
                  placeholder="Summarize the data from the previous node: {{previousNode.data.report}}" 
                  {...field} 
                  className="min-h-[150px] font-sans text-sm"/>
                </FormControl>
                <FormDescription>
                  The instructions for the AI. Use **{`{{variable}}`}** to inject data from other workflow nodes.
                  Or give custom instructions for the AI.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Prompt Field */}
          <FormField 
            control={form.control}
            name="userPrompt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>User Prompt</FormLabel>
                <FormControl>
                  <Textarea 
                  placeholder="custom user message for the model" 
                  {...field} 
                  className="min-h-[150px] font-sans text-sm"/>
                </FormControl>
                <FormDescription>
                  The user message for the model. Use **{`{{variable}}`}** to inject data from other workflow nodes.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter className="pt-4">
            <Button type="submit">Save Configuration</Button>
          </DialogFooter>
         </form>
       </Form>
      </DialogContent>
    </Dialog>
  );
};