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

const formSchema = z.object({
  variableName: z.string()
    .min(1, "Variable name is required")
    .regex(/^[a-zA-Z_$][a-zA-Z0-9_$]*$/, {
      message: "Variable name must start with a letter or underscore and contain only letters, numbers, or underscores"}),
  endpoint: z.string()
    .min(1, { message: "Please enter a valid URL" }),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
  body: z
    .string()
    .optional()
    // .refine()
});
export type OpenAgentFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  defaultValues?: Partial<OpenAgentFormValues>;
};


export const OpenAgentDialog = ({ 
  open, 
  onOpenChange,
  onSubmit,
  defaultValues = {}
}: Props) => {
  const form = useForm<OpenAgentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues.variableName || "",
      endpoint: defaultValues.endpoint || "",
      method: defaultValues.method || "GET",
      body: defaultValues.body || ""
    },
  });
  const watchVariableName = useWatch({
    control: form.control,
    name: "variableName"
  })  || "myApiCall";
  const watchMethod = useWatch({
    control: form.control,
    name: "method"
  });
  const showBodyField = ["PATCH", "POST", "PUT"].includes(watchMethod);
  
  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
    onOpenChange(false);
  };

  useEffect(() => {
    if (open) {
      form.reset({
        variableName: defaultValues.variableName || "",
        endpoint: defaultValues.endpoint || "",
        method: defaultValues.method || "GET",
        body: defaultValues.body || ""
      });
    }
  }, [form, open,defaultValues]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Http Request</DialogTitle>
          <DialogDescription>
            Configure settings for the Http Request Node.
          </DialogDescription>
        </DialogHeader>
       <Form {...form}>
         <form 
           onSubmit={form.handleSubmit(handleSubmit)}
           className="space-y-8 mt-4"
         > <FormField 
         control={form.control}
         name="variableName"
         render={({ field }) => (
           <FormItem>
             <FormLabel>Variable Name</FormLabel>
            <FormControl>
              <Input placeholder="myApiCall" 
              {...field} />
            </FormControl>
             <FormDescription>
               Use this name to reference the results in other nodes: {" "}
               {`{{${watchVariableName || "myApiCall"}.httpResponse.data}}`}
             </FormDescription>
             <FormMessage />
           </FormItem>
         )}
       />
           <FormField 
           control={form.control}
           name="method"
           render={({ field }) => (
             <FormItem>
               <FormLabel>Method</FormLabel>
               <Select
                 onValueChange={field.onChange}
                 defaultValue={field.value}
               >
                 <FormControl>
                   <SelectTrigger className="w-full">
                     <SelectValue placeholder="Select a method"/>
                   </SelectTrigger>
                 </FormControl>
                 <SelectContent>
                   <SelectItem value="GET">GET</SelectItem>
                   <SelectItem value="POST">POST</SelectItem>
                   <SelectItem value="PUT">PUT</SelectItem>
                   <SelectItem value="PATCH">PATCH</SelectItem>
                   <SelectItem value="DELETE">DELETE</SelectItem>
                 </SelectContent>
               </Select>
               <FormDescription>
                 The HTTP method to use for the request.
               </FormDescription>
               <FormMessage />
             </FormItem>
           )}
         />
         <FormField 
         control={form.control}
         name="endpoint"
         render={({ field }) => (
           <FormItem>
             <FormLabel>Endpoint</FormLabel>
            <FormControl>
              <Input placeholder="https://api.example.com/users/{{httpResponse.data.id}}" 
              {...field} />
            </FormControl>
             <FormDescription>
               Static URL or use {"{{variable}}"} for simple values or {"{{json variable}}"} to stringify objects
             </FormDescription>
             <FormMessage />
           </FormItem>
         )}
       />
       {showBodyField && (
         <FormField 
         control={form.control}
         name="body"
         render={({ field }) => (
           <FormItem>
             <FormLabel>Request Body</FormLabel>
            <FormControl>
              <Textarea 
              placeholder={
                `{\n "userId": "{{httpResponse.data.id}}",\n
                "name": "{{httpResponse.data.name}}" ,\n
                "items": "{{httpResponse.data.items}}" ,\n
                }`
              }  
              {...field} 
              className="min-h-[120px] font-mono text-sm"/>
            </FormControl>
             <FormDescription>
               JSON with template variable. Use {"{{variables}}"} for simple values or{"{{json variable}}"} to stringify objects
             </FormDescription>
             <FormMessage />
           </FormItem>
         )}
       />
       )}
       <DialogFooter className="mt-4">
         <Button type="submit">Save</Button>
       </DialogFooter>
         </form>
       </Form>
      </DialogContent>
    </Dialog>
  );
};
