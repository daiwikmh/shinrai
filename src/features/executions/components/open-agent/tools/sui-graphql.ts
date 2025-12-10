import { tool } from 'ai';
import { z } from 'zod';
import { SuiGraphQLClient } from '@mysten/sui/graphql';
import { graphql } from '@mysten/sui/graphql/schemas/latest';

// Initialize GraphQL client for Sui testnet
const gqlClient = new SuiGraphQLClient({
  url: 'https://sui-testnet.mystenlabs.com/graphql',
});

/**
 * Query address information including balance and objects
 */
export const queryAddressTool = tool({
  description: 'Query detailed information about a Sui address including balances, objects, and domain name',
  inputSchema: z.object({
    address: z.string().describe('The Sui address to query (0x...)'),
  }),
  execute: async ({ address }) => {
    try {
      const query = graphql(`
        query getAddressInfo($address: SuiAddress!) {
          address(address: $address) {
            defaultSuinsName
            balance {
              totalBalance
            }
            objects {
              edges {
                node {
                  objectId
                  version
                  digest
                }
              }
            }
          }
        }
      `);

      const result = await gqlClient.query({
        query,
        variables: { address },
      });

      return {
        success: true as const,
        data: result.data?.address ?? null,
      };
    } catch (error) {
      return {
        success: false as const,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});

/**
 * Query object details by object ID
 */
export const queryObjectTool = tool({
  description: 'Get detailed information about a specific object on Sui',
  inputSchema: z.object({
    objectId: z.string().describe('The object ID to query'),
  }),
  execute: async ({ objectId }) => {
    try {
      const query = graphql(`
        query getObject($objectId: SuiAddress!) {
          object(address: $objectId) {
            objectId
            version
            digest
            owner {
              __typename
              ... on AddressOwner {
                owner {
                  address
                }
              }
            }
            storageRebate
            previousTransactionBlock {
              digest
            }
          }
        }
      `);

      const result = await gqlClient.query({
        query,
        variables: { objectId },
      });

      return {
        success: true as const,
        data: result.data?.object ?? null,
      };
    } catch (error) {
      return {
        success: false as const,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});

/**
 * Query transaction details by digest
 */
export const queryTransactionTool = tool({
  description: 'Get detailed information about a transaction by its digest',
  inputSchema: z.object({
    digest: z.string().describe('The transaction digest'),
  }),
  execute: async ({ digest }) => {
    try {
      const query = graphql(`
        query getTransaction($digest: String!) {
          transactionBlock(digest: $digest) {
            digest
            sender {
              address
            }
            gasInput {
              gasSponsor {
                address
              }
              gasPrice
              gasBudget
            }
            effects {
              status
              gasEffects {
                gasObject {
                  version
                }
                gasSummary {
                  computationCost
                  storageCost
                  storageRebate
                }
              }
            }
          }
        }
      `);

      const result = await gqlClient.query({
        query,
        variables: { digest },
      });

      return {
        success: true as const,
        data: result.data?.transactionBlock ?? null,
      };
    } catch (error) {
      return {
        success: false as const,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});

/**
 * Query coin balance for a specific coin type
 */
export const queryCoinBalanceTool = tool({
  description: 'Query the balance of a specific coin type for an address',
  inputSchema: z.object({
    address: z.string().describe('The Sui address to query'),
    coinType: z.string().optional().describe('The coin type (e.g., 0x2::sui::SUI). Defaults to SUI.'),
  }),
  execute: async ({ address, coinType }) => {
    try {
      const query = graphql(`
        query getCoinBalance($address: SuiAddress!, $coinType: String) {
          address(address: $address) {
            balance(type: $coinType) {
              totalBalance
              coinObjectCount
            }
            coins(type: $coinType) {
              edges {
                node {
                  coinObjectId
                  balance
                }
              }
            }
          }
        }
      `);

      const result = await gqlClient.query({
        query,
        variables: { address, coinType: coinType || '0x2::sui::SUI' },
      });

      return {
        success: true as const,
        data: result.data?.address ?? null,
      };
    } catch (error) {
      return {
        success: false as const,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});

/**
 * Query events by event type
 */
export const queryEventsTool = tool({
  description: 'Query events by event type or sender',
  inputSchema: z.object({
    eventType: z.string().optional().describe('The event type to filter (e.g., 0x2::sui::Transfer)'),
    sender: z.string().optional().describe('Filter by sender address'),
    limit: z.number().optional().default(10).describe('Maximum number of events to return'),
  }),
  execute: async ({ eventType, sender, limit = 10 }) => {
    try {
      const query = graphql(`
        query getEvents($eventType: String, $sender: SuiAddress, $limit: Int) {
          events(
            filter: {
              eventType: $eventType
              sender: $sender
            }
            first: $limit
          ) {
            edges {
              node {
                sendingModule {
                  package {
                    address
                  }
                  name
                }
                type {
                  repr
                }
                sender {
                  address
                }
                timestamp
                json
              }
            }
          }
        }
      `);

      const result = await gqlClient.query({
        query,
        variables: { eventType, sender, limit },
      });

      return {
        success: true as const,
        data: result.data?.events ?? null,
      };
    } catch (error) {
      return {
        success: false as const,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});

/**
 * Get chain identifier
 */
export const getChainIdentifierTool = tool({
  description: 'Get the Sui network chain identifier',
  inputSchema: z.object({}),
  execute: async () => {
    try {
      const query = graphql(`
        query {
          chainIdentifier
        }
      `);

      const result = await gqlClient.query({
        query,
      });

      return {
        success: true as const,
        chainIdentifier: result.data?.chainIdentifier ?? null,
      };
    } catch (error) {
      return {
        success: false as const,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});

/**
 * Execute custom GraphQL query
 */
export const customGraphQLQueryTool = tool({
  description: 'Execute a custom GraphQL query against the Sui network',
  inputSchema: z.object({
    query: z.string().describe('The GraphQL query string'),
    variables: z.record(z.any(),z.any()).optional().describe('Variables for the query (key-value pairs)'),
  }),
  execute: async ({ query: queryString, variables }) => {
    try {
      // Note: This uses a workaround for custom queries
      // In production, you'd want to properly parse and validate the query
      const response = await fetch(gqlClient.network, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: queryString,
          variables: variables || {},
        }),
      });

      const result = await response.json();

      if (result.errors) {
        return {
          success: false as const,
          errors: result.errors,
        };
      }

      return {
        success: true as const,
        data: result.data ?? null,
      };
    } catch (error) {
      return {
        success: false as const,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});
