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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  inputMode: z.enum(["file", "variable", "url"]),
  fileSource: z.string().optional(),
  fileName: z.string().optional(),
  fileSize: z.number().optional(),
  epochs: z.number().min(1).max(100).default(5),
  deletable: z.boolean().default(true),
});

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  defaultInputMode?: "file" | "variable" | "url";
  defaultFileSource?: string;
  defaultFileName?: string;
  defaultFileSize?: number;
  defaultEpochs?: number;
  defaultDeletable?: boolean;
}

export type FormType = z.infer<typeof formSchema>;

export const WalrusStorageDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultInputMode,
  defaultFileSource,
  defaultFileName,
  defaultFileSize,
  defaultEpochs,
  defaultDeletable,
}: Props) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<FormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      inputMode: defaultInputMode || "file",
      fileSource: defaultFileSource || "",
      fileName: defaultFileName || "",
      fileSize: defaultFileSize || 0,
      epochs: defaultEpochs || 5,
      deletable: defaultDeletable ?? true,
    },
  });

  const watchInputMode = form.watch("inputMode");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      form.setValue("fileName", file.name);
      form.setValue("fileSize", file.size);
      // Store file reference or convert to base64 for workflow storage
      form.setValue("fileSource", `file://${file.name}`);
    }
  };

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    // Validate based on input mode
    if (values.inputMode === "file" && !selectedFile && !defaultFileName) {
      form.setError("fileSource", {
        type: "manual",
        message: "Please select a file to upload",
      });
      return;
    }
    if ((values.inputMode === "variable" || values.inputMode === "url") && !values.fileSource) {
      form.setError("fileSource", {
        type: "manual",
        message: "Please provide a file source",
      });
      return;
    }

    onSubmit(values);
    onOpenChange(false);
  };

  useEffect(() => {
    if (open) {
      form.reset({
        inputMode: defaultInputMode || "file",
        fileSource: defaultFileSource || "",
        fileName: defaultFileName || "",
        fileSize: defaultFileSize || 0,
        epochs: defaultEpochs || 5,
        deletable: defaultDeletable ?? true,
      });
      setSelectedFile(null);
    }
  }, [form, open, defaultInputMode, defaultFileSource, defaultFileName, defaultFileSize, defaultEpochs, defaultDeletable]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Walrus Storage</DialogTitle>
          <DialogDescription>
            Configure settings for the Walrus Storage Node.
          </DialogDescription>
        </DialogHeader>
       <Form {...form}>
         <form
           onSubmit={form.handleSubmit(handleSubmit)}
           className="space-y-6 mt-4"
         >
           <FormField
             control={form.control}
             name="inputMode"
             render={({ field }) => (
               <FormItem>
                 <FormLabel>Input Mode</FormLabel>
                 <Select
                   onValueChange={field.onChange}
                   defaultValue={field.value}
                 >
                   <FormControl>
                     <SelectTrigger className="w-full">
                       <SelectValue placeholder="Select input mode"/>
                     </SelectTrigger>
                   </FormControl>
                   <SelectContent>
                     <SelectItem value="file">Upload File</SelectItem>
                     <SelectItem value="variable">From Previous Node</SelectItem>
                     <SelectItem value="url">From URL</SelectItem>
                   </SelectContent>
                 </Select>
                 <FormDescription>
                   Choose how to provide the file for storage
                 </FormDescription>
                 <FormMessage />
               </FormItem>
             )}
           />

           {watchInputMode === "file" && (
             <div className="space-y-2">
               <Label htmlFor="file">Select File</Label>
               <Input
                 id="file"
                 type="file"
                 onChange={handleFileChange}
               />
               {(selectedFile || defaultFileName) && (
                 <p className="text-sm text-muted-foreground">
                   Selected: {selectedFile?.name || defaultFileName}
                   {(selectedFile?.size || defaultFileSize) &&
                     ` (${((selectedFile?.size || defaultFileSize || 0) / 1024).toFixed(2)} KB)`
                   }
                 </p>
               )}
             </div>
           )}

           {watchInputMode === "variable" && (
             <FormField
               control={form.control}
               name="fileSource"
               render={({ field }) => (
                 <FormItem>
                   <FormLabel>Variable Reference</FormLabel>
                   <FormControl>
                     <Input
                       placeholder="{{previousNode.fileData}}"
                       {...field}
                     />
                   </FormControl>
                   <FormDescription>
                     Use {"{{variable}}"} to reference file data from previous nodes
                   </FormDescription>
                   <FormMessage />
                 </FormItem>
               )}
             />
           )}

           {watchInputMode === "url" && (
             <FormField
               control={form.control}
               name="fileSource"
               render={({ field }) => (
                 <FormItem>
                   <FormLabel>File URL</FormLabel>
                   <FormControl>
                     <Input
                       placeholder="https://example.com/file.pdf"
                       {...field}
                     />
                   </FormControl>
                   <FormDescription>
                     Provide a URL to fetch the file from
                   </FormDescription>
                   <FormMessage />
                 </FormItem>
               )}
             />
           )}

           <FormField
             control={form.control}
             name="epochs"
             render={({ field }) => (
               <FormItem>
                 <FormLabel>Storage Duration (Epochs)</FormLabel>
                 <FormControl>
                   <Input
                     type="number"
                     min={1}
                     max={100}
                     {...field}
                     onChange={(e) => field.onChange(parseInt(e.target.value) || 5)}
                   />
                 </FormControl>
                 <FormDescription>
                   Number of epochs to store the file (1 epoch ≈ 24 hours on testnet)
                 </FormDescription>
                 <FormMessage />
               </FormItem>
             )}
           />

           <DialogFooter className="mt-4">
             <Button type="submit">Save</Button>
           </DialogFooter>
         </form>
       </Form>
      </DialogContent>
    </Dialog>
  );
};
