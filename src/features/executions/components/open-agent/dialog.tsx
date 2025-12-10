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
import { Checkbox } from "@/components/ui/checkbox"; // Added Checkbox import
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AVAILABLE_MODELS } from "../open-router-node/dialog";

// Re-using the schema definition from the section above
export const AVAILABLE_TOOLS = [
  "send_email",
  "query_prisma",
  "fetch_data",
  "schedule_inngest_function",
] as const;

const agentNodeSchema = z.object({
  variableName: z.string()
    .min(1, "Variable name is required")
    .regex(/^[a-zA-Z_$][a-zA-Z0-9_$]*$/, {
      message: "Must be a valid variable name (e.g., 'agent_analysis')"}),
  model: z.enum(AVAILABLE_MODELS),
  systemPrompt: z.string()
    .min(10, "The system prompt must be at least 10 characters.")
    .max(8192, "System prompt is too long."),
  userPrompt: z.string()
    .min(10, "The user prompt must be at least 10 characters.")
    .max(8192, "User prompt is too long."),
  tools: z.array(z.enum(AVAILABLE_TOOLS))
    .min(0, { message: "Select at least one tool or keep it empty." })
    .default([]),
});

export type OpenAgentFormValues = z.infer<typeof agentNodeSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: OpenAgentFormValues) => void;
  defaultValues: Partial<OpenAgentFormValues>;
};


export const OpenAgentDialog = ({ 
  open, 
  onOpenChange,
  onSubmit,
  defaultValues = {}
}: Props) => {
  const form = useForm<OpenAgentFormValues>({
    resolver: zodResolver(agentNodeSchema),
    defaultValues: {
      variableName: defaultValues.variableName || "agentResult",
      model: defaultValues.model || AVAILABLE_MODELS[0],
      systemPrompt: defaultValues.systemPrompt || "",
      userPrompt: defaultValues.userPrompt || "",
      tools: defaultValues.tools || [],
    },
  });
  
  const watchVariableName = useWatch({
    control: form.control,
    name: "variableName"
  }) || "agentResult";

  const handleSubmit = (values: OpenAgentFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  useEffect(() => {
    if (open) {
      form.reset({
        variableName: defaultValues.variableName || "agentResult",
        model: defaultValues.model || AVAILABLE_MODELS[0],
        systemPrompt: defaultValues.systemPrompt || "",
        userPrompt: defaultValues.userPrompt || "",
        tools: defaultValues.tools || [],
      });
    }
  }, [form, open, defaultValues]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>AI Agent Node (Tools Enabled)</DialogTitle>
          <DialogDescription>
            Configure the Agent&apos;s role, model, and available tools for advanced reasoning and action.
          </DialogDescription>
        </DialogHeader>
       <Form {...form}>
         <form 
           onSubmit={form.handleSubmit(handleSubmit)}
           className="space-y-6 mt-4"
         > 
          
          {/* Output Variable Name Field */}
          <FormField 
            control={form.control}
            name="variableName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Output Variable Name</FormLabel>
                <FormControl>
                  <Input placeholder="agentResult" 
                  {...field} />
                </FormControl>
                <FormDescription>
                  Reference the Agent's final output in other nodes using: **{`{{${watchVariableName}.result}}`}**
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
                      <SelectItem key={model} value={model}>{model}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  GPT-4 and similar models are recommended for reliable tool usage.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* System Prompt Field */}
          <FormField 
            control={form.control}
            name="systemPrompt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>System Prompt (Agent Role)</FormLabel>
                <FormControl>
                  <Textarea 
                  placeholder="You are an expert workflow agent..." 
                  {...field} 
                  className="min-h-[120px] font-sans text-sm"/>
                </FormControl>
                <FormDescription>
                  Define the Agent's persona, capabilities, and strict rules of operation.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* User Prompt Field */}
          <FormField 
            control={form.control}
            name="userPrompt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>User Prompt (Task)</FormLabel>
                <FormControl>
                  <Textarea 
                  placeholder="Generate a summary report for the new user {{newUser.id}} and send an email using the tool." 
                  {...field} 
                  className="min-h-[120px] font-sans text-sm"/>
                </FormControl>
                <FormDescription>
                  The specific task for the Agent. Use **{`{{variable}}`}** to inject workflow data.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Tools Checkbox Group */}
          <FormField
            control={form.control}
            name="tools"
            render={({field}) => (
              <FormItem>
                <FormLabel className="text-base">Available Tools</FormLabel>
                <FormControl>
                <div className="flex flex-wrap gap-4 pt-2">
                  {AVAILABLE_TOOLS.map((tool) => {
                                     const selected = (field.value ?? []).includes(tool);
                                     return (
                                       <label key={tool} className="flex items-center gap-2">
                                         <Checkbox
                                           checked={selected}
                                           onCheckedChange={(checked) => {
                                             const current = field.value ?? [];
                                             if (checked) {
                                               field.onChange([...current, tool]);
                                             } else {
                                               field.onChange(current.filter((v) => v !== tool));
                                             }
                                           }}
                                         />
                                         <span className="capitalize">{tool.replace(/_/g, " ")}</span>
                                       </label>
                                     );
                                   })}
                </div>
                </FormControl>
                <FormDescription>
                  Select the tools the Agent is allowed to use to complete the task.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter className="pt-4">
            <Button type="submit">Save Agent Configuration</Button>
          </DialogFooter>
         </form>
       </Form>
      </DialogContent>
    </Dialog>
  );
};