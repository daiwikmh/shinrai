/**
 * Sui Blockchain Tools for Vercel AI SDK
 *
 * This module exports AI-compatible tools for interacting with the Sui blockchain.
 * Tools are designed to work with workflow executors that have access to a signer/keypair.
 *
 * @module sui-tools
 */

// Transaction Tools
export {
  transferObjectsTool,
  splitCoinsTool,
  mergeCoinsTool,
  moveCallTool,
  batchTransferTool,
  getTransactionTool,
} from './sui-transaction';

// GraphQL Query Tools
export {
  queryAddressTool,
  queryObjectTool,
  queryTransactionTool,
  queryCoinBalanceTool,
  queryEventsTool,
  getChainIdentifierTool,
  customGraphQLQueryTool,
} from './sui-graphql';

/**
 * All Sui tools combined
 * Use this to provide all tools to an AI agent at once
 */
import {
  transferObjectsTool,
  splitCoinsTool,
  mergeCoinsTool,
  moveCallTool,
  batchTransferTool,
  getTransactionTool,
} from './sui-transaction';

import {
  queryAddressTool,
  queryObjectTool,
  queryTransactionTool,
  queryCoinBalanceTool,
  queryEventsTool,
  getChainIdentifierTool,
  customGraphQLQueryTool,
} from './sui-graphql';

export const allSuiTools = {
  // Transaction tools
  transferObjects: transferObjectsTool,
  splitCoins: splitCoinsTool,
  mergeCoins: mergeCoinsTool,
  moveCall: moveCallTool,
  batchTransfer: batchTransferTool,
  getTransaction: getTransactionTool,

  // GraphQL query tools
  queryAddress: queryAddressTool,
  queryObject: queryObjectTool,
  queryTransaction: queryTransactionTool,
  queryCoinBalance: queryCoinBalanceTool,
  queryEvents: queryEventsTool,
  getChainIdentifier: getChainIdentifierTool,
  customGraphQLQuery: customGraphQLQueryTool,
};

export type SuiTools = typeof allSuiTools;
