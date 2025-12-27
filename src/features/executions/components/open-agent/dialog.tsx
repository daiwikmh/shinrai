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

import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AVAILABLE_MODELS } from "../open-router-node/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { useCredentialByType } from "@/features/credentials/hooks/use-credentials";
import { CredentialType } from "@/generated/prisma/enums";

// Available Sui Blockchain Tools
export const AvailableToolsArray = [
  {
    value: "transferObjects",
    label: "Transfer Objects",
    description: "Transfer SUI coins or objects to recipients",
    category: "Transactions",
  },
  {
    value: "splitCoins",
    label: "Split Coins",
    description: "Split coins into smaller amounts",
    category: "Transactions",
  },
  {
    value: "mergeCoins",
    label: "Merge Coins",
    description: "Merge multiple coins into one",
    category: "Transactions",
  },
  {
    value: "moveCall",
    label: "Move Call",
    description: "Execute Move smart contract functions",
    category: "Transactions",
  },
  {
    value: "batchTransfer",
    label: "Batch Transfer",
    description: "Transfer to multiple recipients at once",
    category: "Transactions",
  },
  {
    value: "queryAddress",
    label: "Query Address",
    description: "Get address information and balances",
    category: "Queries",
  },
  {
    value: "queryObject",
    label: "Query Object",
    description: "Get object details by ID",
    category: "Queries",
  },
  {
    value: "queryCoinBalance",
    label: "Query Coin Balance",
    description: "Check specific coin type balances",
    category: "Queries",
  },
  {
    value: "queryTransaction",
    label: "Query Transaction",
    description: "Get transaction details via GraphQL",
    category: "Queries",
  },
  {
    value: "queryEvents",
    label: "Query Events",
    description: "Search blockchain events",
    category: "Queries",
  },
  {
    value: "customGraphQLQuery",
    label: "Custom GraphQL",
    description: "Execute custom GraphQL queries",
    category: "Queries",
  },
] as const;

const formSchema = z.object({
  variableName: z
    .string()
    .min(1, "Variable name is required")
    .regex(/^[a-zA-Z_$][a-zA-Z0-9_$]*$/, {
      message:
        "Variable name must start with a letter or underscore and contain only letters, numbers, or underscores",
    }),
  credentialId: z.string().min(1, "Credential ID is required"),
  model: z.enum(AVAILABLE_MODELS),
  prompt: z.string().min(1, { message: "Prompt is required" }),
  enableSuiTools: z.boolean(),
  systemPrompt: z.string().optional(),
  maxRetries: z.number().min(1).max(20),
  maxTokens: z.number().min(256).max(8192),
});

export type OpenAgentFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  defaultValues?: Partial<OpenAgentFormValues>;
}

export const OpenAgentDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const { data: credentials, isLoading: isLoadingCredentials } =
    useCredentialByType(CredentialType.OPENROUTER);
  const form = useForm<OpenAgentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues.variableName ?? "",
      prompt: defaultValues.prompt ?? "",
      model: defaultValues.model ?? "",
      credentialId: defaultValues.credentialId ?? "",
      enableSuiTools: defaultValues.enableSuiTools ?? false,
      systemPrompt: defaultValues.systemPrompt ?? "",
      maxRetries: defaultValues.maxRetries ?? 5,
      maxTokens: defaultValues.maxTokens ?? 4096,
    },
  });

  const watchVariableName =
    useWatch({
      control: form.control,
      name: "variableName",
    }) || "aiAgent";

  const watchEnableSuiTools = useWatch({
    control: form.control,
    name: "enableSuiTools",
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
    onOpenChange(false);
  };

  useEffect(() => {
    if (open) {
      form.reset({
        variableName: defaultValues.variableName ?? "",
        prompt: defaultValues.prompt ?? "",
        model: defaultValues.model ?? "",
        credentialId: defaultValues.credentialId ?? "",
        enableSuiTools: defaultValues.enableSuiTools ?? false,
        systemPrompt: defaultValues.systemPrompt ?? "",
        maxRetries: defaultValues.maxRetries ?? 5,
        maxTokens: defaultValues.maxTokens ?? 4096,
      });
    }
  }, [form, open, defaultValues]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>AI Agent Configuration (DeepSeek)</DialogTitle>
          <DialogDescription>
            Configure an AI agent powered by DeepSeek with access to Sui
            blockchain tools. The agent can analyze context and execute
            transactions.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6 mt-4"
          >
            {/* Variable Name */}
            <FormField
              control={form.control}
              name="variableName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variable Name</FormLabel>
                  <FormControl>
                    <Input placeholder="aiAgent" {...field} />
                  </FormControl>
                  <FormDescription>
                    Reference the agent&apos;s response:{" "}
                    {`{{${watchVariableName || "aiAgent"}.agentResponse.text}}`}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Credential Selection Field */}
            <FormField
              control={form.control}
              name="credentialId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>AI Model</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoadingCredentials || !credentials?.length}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select an OpenRouter credential" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {Array.isArray(credentials) && credentials.length > 0 ? (
                          credentials.map((credential: any) => (
                            <SelectItem key={credential.id} value={credential.id}>
                              <div className="flex items-center gap-2">
                                <Image
                                  src={"/logo/openrouter.png"}
                                  alt={credential.name}
                                  width={16}
                                  height={16}
                                />
                                {credential.name}
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem key="no-credentials" value="" disabled>
                            No OpenRouter credentials found
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  <FormDescription>
                    The credential will be accessed for the OpenRouter service.
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
                        <SelectValue placeholder="Select an OpenRouter model" />
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

            {/* Prompt */}
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prompt / Task</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Transfer 1 SUI to 0x742d35cc6634c0532925a3b844bc9e7202e0b3e3 and confirm the transaction"
                      {...field}
                      className="min-h-[100px] font-mono text-sm"
                    />
                  </FormControl>
                  <FormDescription>
                    Describe the task for the AI agent. Can reference previous
                    steps with {`{{variableName}}`}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Enable Sui Tools */}
            <FormField
              control={form.control}
              name="enableSuiTools"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Enable Sui Blockchain Tools
                    </FormLabel>
                    <FormDescription>
                      <div>
                        Allow the agent to execute transactions and query the Sui
                        blockchain
                      </div>
                      {watchEnableSuiTools && (
                        <div className="mt-2 text-xs">
                          <span className="font-semibold">
                            Available tools:
                          </span>{" "}
                          Transfer, Split/Merge Coins, Query Balances, Events,
                          and more ({AvailableToolsArray.length} tools)
                        </div>
                      )}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* System Prompt (Optional) */}
            <FormField
              control={form.control}
              name="systemPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>System Prompt (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="You are a helpful crypto trading assistant. Always verify balances before transfers..."
                      {...field}
                      className="min-h-20 font-mono text-sm"
                    />
                  </FormControl>
                  <FormDescription>
                    Custom instructions for the AI agent&apos;s behavior. Leave
                    empty for default.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Max Steps */}
            <FormField
              control={form.control}
              name="maxRetries"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Agentic Steps</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={20}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Maximum number of reasoning steps the agent can take (1-20).
                    Higher values allow more complex tasks.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Max Tokens */}
            <FormField
              control={form.control}
              name="maxTokens"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Tokens</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={256}
                      max={8192}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Maximum tokens for the response (256-8192). Lower values
                    reduce cost.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Agent</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
