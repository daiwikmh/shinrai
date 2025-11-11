// import prisma from "@/lib/db";
import { inngest } from "./client";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import type { Edge, Node } from "@xyflow/react";

const google = createGoogleGenerativeAI();
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});
export const execute = inngest.createFunction(
  { id: "execute-ai" },
  { event: "execute/ai" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
   const { steps:geminiSteps } = await step.ai.wrap("gemini-generate-text",
     generateText,{
       model: google("gemini-2.5-flash-lite"),
       system:"You are a helpful assistant.",
       prompt:"Generate a short story about a cat and a dog.",
       experimental_telemetry: {
           isEnabled: true,
           recordInputs: true,
           recordOutputs: true,
         },
     })
   const { steps:openRouterSteps } = await step.ai.wrap("openrouter-generate-text",
     generateText,{
       model: openrouter("deepseek/deepseek-chat-v3.1:free"),
       system:"You are a helpful assistant.",
       prompt:"Generate a short story about a cat and a dog.",
       experimental_telemetry: {
           isEnabled: true,
           recordInputs: true,
           recordOutputs: true,
         },
     })
    return {
      geminiSteps,
      openRouterSteps
    };
  },
);

export const workflowExecution = inngest.createFunction(
  { id: "execute-workflow" },
  { event: "workflow/execute" },
  async ({ event, step }) => {
    const { nodes, edges, workflowId } = event.data;
    
    // Build execution order (topological sort)
    const executionOrder = getTopologicalOrder(nodes, edges);
    const results: Record<string, any> = {};

    // Execute nodes in order
    for (const nodeId of executionOrder) {
      const node = nodes.find((n:Node) => n.id === nodeId);
      
      // Execute each node as a step (allows retries, observability)
      const result = await step.run(`execute-${nodeId}`, async () => {
        // Update node status to running
        await step.sendEvent("node-status-update", {
          name: "workflow/node.status",
          data: { workflowId, nodeId, status: "running" }
        });

        // Get input from previous nodes
        const inputs = getNodeInputs(nodeId, edges, results);
        
        // Execute the actual node function
        const output = await executeNodeFunction(node, inputs);
        
        // Update node status to success
        await step.sendEvent("node-status-update", {
          name: "workflow/node.status",
          data: { 
            workflowId, 
            nodeId, 
            status: "success",
            result: output 
          }
        });

        return output;
      });

      results[nodeId] = result;
    }

    return { workflowId, results };
  }
);

// Helper to get topological order
function getTopologicalOrder(nodes:Node[], edges:Edge[]) {
  const adjacencyList = new Map();
  const inDegree = new Map();
  
  // Initialize
  nodes.forEach(node => {
    adjacencyList.set(node.id, []);
    inDegree.set(node.id, 0);
  });
  
  // Build graph
  edges.forEach(edge => {
    adjacencyList.get(edge.source).push(edge.target);
    inDegree.set(edge.target, inDegree.get(edge.target) + 1);
  });
  
  // Kahn's algorithm
  const queue = nodes.filter(node => inDegree.get(node.id) === 0).map(n => n.id);
  const order = [];
  
  while (queue.length > 0) {
    const nodeId = queue.shift();
    order.push(nodeId);
    
    adjacencyList.get(nodeId).forEach((neighbor) => {
      inDegree.set(neighbor, inDegree.get(neighbor) - 1);
      if (inDegree.get(neighbor) === 0) {
        queue.push(neighbor);
      }
    });
  }
  
  return order;
}

// Helper to get inputs for a node
function getNodeInputs(nodeId:string, edges:Edge[], results:Record<string,any>) {
  const inputs = {};
  const incomingEdges = edges.filter(e => e.target === nodeId);
  
  incomingEdges.forEach(edge => {
    inputs[edge.sourceHandle || 'default'] = results[edge.source];
  });
  
  return inputs;
}

// Map node types to actual functions
async function executeNodeFunction(node, inputs) {
  const nodeExecutors = {
    'httpRequest': async (config, inputs) => {
      const response = await fetch(config.url, {
        method: config.method || 'GET',
        headers: config.headers,
        body: config.body ? JSON.stringify(config.body) : undefined
      });
      return await response.json();
    },
    'dataTransform': async (config, inputs) => {
      // Apply transformation logic
      return transformData(inputs, config.transformation);
    },
    'filter': async (config, inputs) => {
      // Apply filter logic
      return inputs.data.filter(item => evaluateCondition(item, config.condition));
    },
    // Add more node type executors
  };

  const executor = nodeExecutors[node.type];
  if (!executor) {
    throw new Error(`Unknown node type: ${node.type}`);
  }

  return await executor(node.data, inputs);
}