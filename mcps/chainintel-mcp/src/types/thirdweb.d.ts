/**
 * Type declarations for Thirdweb SDK
 * Minimal types for x402 payment integration
 */

declare module 'thirdweb' {
  export interface ThirdwebClient {
    clientId: string;
    secretKey?: string;
  }

  export function createThirdwebClient(config: {
    clientId?: string;
    secretKey?: string;
  }): ThirdwebClient;

  export interface Account {
    address: string;
  }

  export interface Wallet {
    getAccount(): Account;
  }
}

declare module 'thirdweb/chains' {
  export interface Chain {
    id: number;
    name: string;
  }

  export const base: Chain;
  export const baseSepolia: Chain;
  export const ethereum: Chain;
}

declare module 'thirdweb/x402' {
  import type { ThirdwebClient, Wallet } from 'thirdweb';

  export interface PaymentData {
    paymentHeader: string;
  }

  export interface SettlePaymentParams {
    client: ThirdwebClient;
    paymentData: string;
    resourceUrl: string;
    payTo: string;
    network: string;
    price: string;
  }

  export interface SettlePaymentResult {
    success: boolean;
    status: number;
    transactionHash?: string;
    error?: string;
  }

  export function settlePayment(
    params: SettlePaymentParams
  ): Promise<SettlePaymentResult>;

  export function wrapFetchWithPayment(
    fetch: typeof globalThis.fetch,
    client: ThirdwebClient,
    wallet: Wallet
  ): typeof globalThis.fetch;
}
