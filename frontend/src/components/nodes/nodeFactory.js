import { nodeTypes } from '../../constants/nodeTypes';

// Function to create a node based on its type
export const createNode = (type, id, position, additionalData = {}) => {
  // Find the node type definition from nodeTypes.js
  const nodeType = Object.values(nodeTypes).flat().find(node => node.name === type);

  if (!nodeType) {
    throw new Error(`Node type ${type} not found in nodeTypes.js`);
  }

  // Create the node data, including acronym and color
  const nodeData = {
    ...additionalData,
    title: nodeType.name,
    acronym: nodeType.acronym,
    color: nodeType.color,
    config: nodeType.config,
    userconfig: {},
    input: nodeType.input,
    output: nodeType.output,
  };

  return {
    id,
    type,
    data: nodeData,
    position,
  };
};
