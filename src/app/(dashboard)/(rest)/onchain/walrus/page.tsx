"use client";

import { useState, useEffect } from "react";
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { WalrusFile } from "@mysten/walrus";
import { client } from "@/config/connect";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Upload, CheckCircle2, AlertCircle, Copy, ExternalLink } from "lucide-react";

interface UploadResult {
  blobId: string;
  url: string;
  cost?: string;
}

// WAL token type on testnet (full type path required)
const WAL_TOKEN_TYPE = "0x8270feb7375eee355e64fdb69c50abb6b5f9393a722883c1cf45f8e26048810a::wal::WAL";

export default function WalrusUploadPage() {
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [epochs, setEpochs] = useState<number>(5);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [walBalance, setWalBalance] = useState<string | null>(null);
  const [checkingBalance, setCheckingBalance] = useState(false);

  // Check WAL token balance
  useEffect(() => {
    const checkWalBalance = async () => {
      if (!currentAccount?.address) {
        setWalBalance(null);
        return;
      }

      setCheckingBalance(true);
      try {
        const balance = await suiClient.getBalance({
          owner: currentAccount.address,
          coinType: WAL_TOKEN_TYPE,
        });
        console.log("WAL balance:", balance);

        const walAmount = (Number(balance.totalBalance) / 1_000).toFixed(4);
        setWalBalance(walAmount);
      } catch (err) {
        console.error("Error checking WAL balance:", err);
        setWalBalance("0");
      } finally {
        setCheckingBalance(false);
      }
    };

    checkWalBalance();
  }, [currentAccount, suiClient]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    if (!currentAccount) {
      setError("Please connect your wallet first");
      return;
    }

    setUploading(true);
    setError(null);
    setUploadResult(null);
    setUploadStatus("");

    try {
      // Step 1: Read file and create flow
      setUploadStatus("Reading file...");
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      setUploadStatus("Creating and encoding flow...");
      const flow = client.walrus.writeFilesFlow({
        files: [
          WalrusFile.from({
            contents: uint8Array,
            identifier: file.name,
          }),
        ],
      });

      await flow.encode();

      // Step 2: Register the blob
      setUploadStatus("Registering blob on Sui blockchain...");
      const registerTx = flow.register({
        epochs,
        owner: currentAccount.address,
        deletable: true,
      });

      const registerResult = await new Promise<{ digest: string }>((resolve, reject) => {
        signAndExecuteTransaction(
          { transaction: registerTx },
          {
            onSuccess: (result) => {
              resolve({ digest: result.digest });
            },
            onError: (error) => {
              reject(error);
            },
          }
        );
      });

      // Step 3: Upload to storage nodes
      setUploadStatus("Uploading to Walrus storage nodes...");
      await flow.upload({ digest: registerResult.digest });

      // Step 4: Certify the blob
      setUploadStatus("Certifying blob...");
      const certifyTx = flow.certify();

      await new Promise<void>((resolve, reject) => {
        signAndExecuteTransaction(
          { transaction: certifyTx },
          {
            onSuccess: () => {
              resolve();
            },
            onError: (error) => {
              reject(error);
            },
          }
        );
      });

      // Step 5: Get the uploaded files
      setUploadStatus("Retrieving file information...");
      const files = await flow.listFiles();

      if (files && files.length > 0) {
        const uploadedFile = files[0];
        setUploadResult({
          blobId: uploadedFile.blobId,
          url: `https://aggregator.walrus-testnet.walrus.space/v1/${uploadedFile.blobId}`,
        });
        setUploadStatus("Upload complete!");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Failed to upload file");
      setUploadStatus("");
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Walrus Storage</h1>
        <p className="text-muted-foreground mt-2">
          Upload and store files on Walrus decentralized storage network
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload File</CardTitle>
          <CardDescription>
            Select a file to upload to Walrus. Your file will be stored on the decentralized network.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!currentAccount && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please connect your Sui wallet from the sidebar to upload files
              </AlertDescription>
            </Alert>
          )}

          {currentAccount && (
            <Alert className={walBalance && Number(walBalance) === 0 ? "border-orange-500 bg-orange-50 dark:bg-orange-950" : ""}>
              <AlertCircle className={`h-4 w-4 ${walBalance && Number(walBalance) === 0 ? "text-orange-600" : ""}`} />
              <AlertDescription>
                <div className="space-y-2">
                  <p>
                    <strong>WAL Balance:</strong>{" "}
                    {checkingBalance ? (
                      <span className="inline-flex items-center">
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        Checking...
                      </span>
                    ) : (
                      <span className={walBalance && Number(walBalance) === 0 ? "text-orange-700 dark:text-orange-400 font-semibold" : ""}>
                        {walBalance || "0"} WAL
                      </span>
                    )}
                  </p>
                  {walBalance && Number(walBalance) === 0 && (
                    <p className="text-sm">
                      You need WAL tokens to pay for storage.{" "}
                      <a
                        href="https://faucet.walrus.site/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                      >
                        Get WAL from faucet
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </p>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="file">Select File</Label>
            <Input
              id="file"
              type="file"
              onChange={handleFileChange}
              disabled={uploading || !currentAccount}
            />
            {file && (
              <p className="text-sm text-muted-foreground">
                Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="epochs">Storage Duration (Epochs)</Label>
            <Input
              id="epochs"
              type="number"
              min={1}
              max={100}
              value={epochs}
              onChange={(e) => setEpochs(parseInt(e.target.value) || 5)}
              disabled={uploading}
            />
            <p className="text-sm text-muted-foreground">
              Number of epochs to store the file (1 epoch ≈ 24 hours on testnet)
            </p>
          </div>

          <Button
            onClick={handleUpload}
            disabled={!file || uploading || !currentAccount}
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload to Walrus
              </>
            )}
          </Button>

          {uploadStatus && uploading && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>{uploadStatus}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {uploadResult && (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="space-y-3">
                <div>
                  <p className="font-semibold text-green-800 dark:text-green-200 mb-2">
                    Upload Successful!
                  </p>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Blob ID:</p>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-background px-2 py-1 rounded font-mono break-all">
                          {uploadResult.blobId}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(uploadResult.blobId)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Access URL:</p>
                      <div className="flex items-center gap-2">
                        <a
                          href={uploadResult.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline break-all"
                        >
                          {uploadResult.url}
                        </a>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(uploadResult.url)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    {uploadResult.cost && (
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Cost: {uploadResult.cost} SUI
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>About Walrus Storage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Walrus is a decentralized storage network built on Sui. It provides:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>High availability and durability</li>
            <li>Efficient encoding with erasure coding</li>
            <li>Cost-effective storage on testnet</li>
            <li>Integration with Sui blockchain</li>
          </ul>
          <p className="mt-4">
            Connected to: <span className="font-mono">Walrus Testnet</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
