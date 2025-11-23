import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

const WALLET_STORAGE_KEY = 'sui_wallet_keypair';

export interface WalletData {
  privateKey: string; // Bech32 encoded private key
  publicKey: string; // Base64 encoded public key
  address: string; // Sui address
  createdAt: number;
}

/**
 * Creates a new wallet and stores it in localStorage
 * @returns Wallet data including private key, public key, and address
 */
export function createAndStoreWallet(): WalletData {
  // Generate new keypair
  const keypair = new Ed25519Keypair();

  // Get private key (Bech32 encoded)
  const privateKey = keypair.getSecretKey();

  // Get public key
  const publicKey = keypair.getPublicKey();
  const publicKeyBase64 = publicKey.toBase64();

  // Get Sui address
  const address = keypair.toSuiAddress();

  const walletData: WalletData = {
    privateKey,
    publicKey: publicKeyBase64,
    address,
    createdAt: Date.now()
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(walletData));
  }

  return walletData;
}

/**
 * Retrieves stored wallet data from localStorage
 * @returns Wallet data or null if not found
 */
export function getStoredWallet(): WalletData | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const stored = localStorage.getItem(WALLET_STORAGE_KEY);
  if (!stored) {
    return null;
  }

  return JSON.parse(stored) as WalletData;
}


export function restoreWalletKeypair(): Ed25519Keypair | null {
  const walletData = getStoredWallet();
  if (!walletData) {
    return null;
  }

  // Restore keypair from private key
  const keypair = Ed25519Keypair.fromSecretKey(walletData.privateKey);
  return keypair;
}


export function hasStoredWallet(): boolean {
  return getStoredWallet() !== null;
}

/**
 * Removes wallet from localStorage
 */
export function clearStoredWallet(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(WALLET_STORAGE_KEY);
  }
}

/**
 * Gets the Sui address of the stored wallet
 * @returns Sui address or null if no wallet found
 */
export function getWalletAddress(): string | null {
  const walletData = getStoredWallet();
  return walletData?.address || null;
}

/**
 * Gets the public key of the stored wallet
 * @returns Public key (base64) or null if no wallet found
 */
export function getWalletPublicKey(): string | null {
  const walletData = getStoredWallet();
  return walletData?.publicKey || null;
}

/**
 * Legacy function - creates a wallet without storing
 * @deprecated Use createAndStoreWallet instead
 */
export function createWallet(): Ed25519Keypair {
  const keypair = new Ed25519Keypair();
  return keypair;
}