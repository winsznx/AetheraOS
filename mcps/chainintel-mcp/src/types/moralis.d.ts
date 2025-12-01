/**
 * Type declarations for Moralis SDK
 * Since @types/moralis doesn't exist, we declare basic types here
 */

declare module 'moralis' {
  export default class Moralis {
    static start(config: any): Promise<void>;
    static Core: {
      isStarted: boolean;
    };
    static EvmApi: {
      token: {
        getWalletTokenBalances(params: any): Promise<any>;
        getWalletTokenTransfers(params: any): Promise<any>;
      };
      nft: {
        getWalletNFTs(params: any): Promise<any>;
      };
      transaction: {
        getWalletTransactions(params: any): Promise<any>;
      };
      balance: {
        getNativeBalance(params: any): Promise<any>;
      };
    };
  }
}
