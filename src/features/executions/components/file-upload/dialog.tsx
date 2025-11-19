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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  fileName: z.string().optional(),
  fileSize: z.number().optional(),
  fileType: z.string().optional(),
  fileContent: z.string().optional(), // Base64 encoded file content
});

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  defaultFileName?: string;
  defaultFileSize?: number;
  defaultFileType?: string;
  defaultFileContent?: string;
}

export type FormType = z.infer<typeof formSchema>;

export const FileUploadDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultFileName,
  defaultFileSize,
  defaultFileType,
  defaultFileContent,
}: Props) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<FormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fileName: defaultFileName || "",
      fileSize: defaultFileSize || 0,
      fileType: defaultFileType || "",
      fileContent: defaultFileContent || "",
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      form.setValue("fileName", file.name);
      form.setValue("fileSize", file.size);
      form.setValue("fileType", file.type);

      // Convert file to base64 for storage
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        form.setValue("fileContent", base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    if (!selectedFile && !defaultFileName) {
      form.setError("fileName", {
        type: "manual",
        message: "Please select a file to upload",
      });
      return;
    }

    console.log("File Upload Node - Submitting file data:", {
      fileName: values.fileName,
      fileSize: values.fileSize,
      fileType: values.fileType,
      hasFileContent: !!values.fileContent,
      fileContentLength: values.fileContent?.length,
    });

    onSubmit(values);
    onOpenChange(false);
  };

  useEffect(() => {
    if (open) {
      form.reset({
        fileName: defaultFileName || "",
        fileSize: defaultFileSize || 0,
        fileType: defaultFileType || "",
        fileContent: defaultFileContent || "",
      });
      setSelectedFile(null);
    }
  }, [form, open, defaultFileName, defaultFileSize, defaultFileType, defaultFileContent]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>File Upload</DialogTitle>
          <DialogDescription>
            Select a file to upload and pass to the next node in the workflow.
          </DialogDescription>
        </DialogHeader>
       <Form {...form}>
         <form
           onSubmit={form.handleSubmit(handleSubmit)}
           className="space-y-6 mt-4"
         >
           <div className="space-y-2">
             <Label htmlFor="file">Select File</Label>
             <Input
               id="file"
               type="file"
               onChange={handleFileChange}
             />
             {(selectedFile || defaultFileName) && (
               <div className="text-sm text-muted-foreground space-y-1">
                 <p>
                   <strong>Name:</strong> {selectedFile?.name || defaultFileName}
                 </p>
                 <p>
                   <strong>Size:</strong>{" "}
                   {((selectedFile?.size || defaultFileSize || 0) / 1024).toFixed(2)} KB
                 </p>
                 <p>
                   <strong>Type:</strong> {selectedFile?.type || defaultFileType || "Unknown"}
                 </p>
               </div>
             )}
           </div>

           <DialogFooter className="mt-4">
             <Button type="submit">Save</Button>
           </DialogFooter>
         </form>
       </Form>
      </DialogContent>
    </Dialog>
  );
};
