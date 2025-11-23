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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { client } from "@/app/(dashboard)/(rest)/onchain/walrus/connect";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  fileDataSource: z.string().optional(),
  epochs: z.number().min(1).max(100),
  deletable: z.boolean(),
});

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  defaultFileDataSource?: string;
  defaultEpochs?: number;
  defaultDeletable?: boolean;
  connectedFileName?: string;
  connectedFileSize?: number;
  connectedFileContent?: string;
}

export type FormType = z.infer<typeof formSchema>;

export const WalrusStorageDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultFileDataSource,
  defaultEpochs,
  defaultDeletable,
  connectedFileName,
  connectedFileSize,
  connectedFileContent,
}: Props) => {
  const [storageCostData, setStorageCostData] = useState<{
    storageCost: bigint;
    writeCost: bigint;
    totalCost: bigint;
  } | null>(null);
  const [loadingCost, setLoadingCost] = useState(false);

  const form = useForm<FormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fileDataSource: defaultFileDataSource || "",
      epochs: defaultEpochs || 5,
      deletable: defaultDeletable ?? true,
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    // When a file is connected, use the connected file name instead of manual input
    if (connectedFileName) {
      onSubmit({
        ...values,
        fileDataSource: connectedFileName,
      });
    } else {
      // When no file is connected, require manual input
      if (!values.fileDataSource) {
        form.setError("fileDataSource", {
          type: "manual",
          message: "Please connect a File Upload node or enter a file data source",
        });
        return;
      }
      onSubmit(values);
    }
    onOpenChange(false);
  };

  // Calculate storage cost when file size or epochs change
  useEffect(() => {
    const calculateCost = async () => {
      if (!connectedFileSize || !open) {
        setStorageCostData(null);
        return;
      }

      const epochs = form.watch("epochs");
      if (!epochs || epochs < 1) {
        return;
      }

      setLoadingCost(true);
      try {
        const cost = await client.walrus.storageCost(connectedFileSize, epochs);
        setStorageCostData(cost);
      } catch (error) {
        console.error("Error calculating storage cost:", error);
        setStorageCostData(null);
      } finally {
        setLoadingCost(false);
      }
    };

    calculateCost();
  }, [connectedFileSize, form.watch("epochs"), open]);

  useEffect(() => {
    if (open) {
      console.log("Walrus Dialog - Opening with data:", {
        connectedFileName,
        connectedFileSize,
        hasConnectedFileContent: !!connectedFileContent,
        isConnected: !!connectedFileName,
      });

      form.reset({
        fileDataSource: connectedFileName ? connectedFileName : (defaultFileDataSource || ""),
        epochs: defaultEpochs || 5,
        deletable: defaultDeletable ?? true,
      });
    }
  }, [form, open, defaultFileDataSource, defaultEpochs, defaultDeletable, connectedFileName, connectedFileSize, connectedFileContent]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Walrus Storage</DialogTitle>
          <DialogDescription>
            Store file data on Walrus decentralized storage network. Connect this node to a File Upload node.
          </DialogDescription>
        </DialogHeader>
       <Form {...form}>
         <form
           onSubmit={form.handleSubmit(handleSubmit)}
           className="space-y-6 mt-4"
         >
           {connectedFileName ? (
             <>
               <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
                 <p className="text-sm font-medium text-green-900 dark:text-green-100">
                   Connected File Upload Node
                 </p>
                 <div className="mt-2 text-sm text-green-700 dark:text-green-300 space-y-1">
                   <p><strong>File:</strong> {connectedFileName}</p>
                   <p><strong>Size:</strong> {((connectedFileSize || 0) / 1024).toFixed(2)} KB</p>
                 </div>
               </div>

               {/* Storage Cost Display */}
               {loadingCost ? (
                 <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md">
                   <div className="flex items-center gap-2">
                     <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                     <p className="text-sm text-blue-900 dark:text-blue-100">Calculating storage cost...</p>
                   </div>
                 </div>
               ) : storageCostData ? (
                 <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md">
                   <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                     Estimated Storage Cost
                   </p>
                   <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                     <p><strong>Storage Cost:</strong> {(Number(storageCostData.storageCost) / 1_000_000_000).toFixed(9)} WAL</p>
                     <p><strong>Write Cost:</strong> {(Number(storageCostData.writeCost) / 1_000_000_000).toFixed(9)} WAL</p>
                     <p className="pt-1 border-t border-blue-200 dark:border-blue-800">
                       <strong>Total Cost:</strong> {(Number(storageCostData.totalCost) / 1_000_000_000).toFixed(9)} WAL
                     </p>
                   </div>
                 </div>
               ) : null}
             </>
           ) : (
             <FormField
               control={form.control}
               name="fileDataSource"
               render={({ field }) => (
                 <FormItem>
                   <FormLabel>File Data Source</FormLabel>
                   <FormControl>
                     <Input
                       placeholder="Connect a File Upload node above"
                       {...field}
                     />
                   </FormControl>
                   <FormDescription>
                     Please connect a File Upload node to this Walrus Storage node to automatically use the uploaded file.
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
