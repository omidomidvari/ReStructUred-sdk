import * as fs from 'fs';
import * as path from 'path';

type NodeType = 'AND' | 'OR' | 'NOT' | 'INPUT' | 'OUTPUT';

interface LogicNode {
  id: string;
  type: NodeType;
  inputs: string[];
}

export class RestructuredSDK {
  private registry: Map<string, LogicNode> = new Map();
  private state: Record<string, boolean> = {};

  // Loads the .structjs logic definition
  loadStruct(filePath: string) {
    const content = fs.readFileSync(path.resolve(filePath), 'utf-8');
    const { nodes } = JSON.parse(content);
    nodes.forEach((n: LogicNode) => this.registry.set(n.id, n));
  }

  // Sets initial input states (e.g., switches)
  setInput(id: string, value: boolean) {
    this.state[id] = value;
  }

  // Runs the logic ladder
  evaluate() {
    const results = { ...this.state };
    this.registry.forEach((node, id) => {
      if (node.type === 'INPUT') return;
      const vals = node.inputs.map(i => !!results[i]);
      
      if (node.type === 'AND') results[id] = vals.every(v => v);
      if (node.type === 'OR')  results[id] = vals.some(v => v);
      if (node.type === 'NOT') results[id] = !vals[0];
      if (node.type === 'OUTPUT') results[id] = vals[0];
    });
    return results;
  }
}

// Terminal Execution Logic
const [,, file, inputs] = process.argv;
if (file) {
  const sdk = new RestructuredSDK();
  sdk.loadStruct(file);
  if (inputs) {
    const initial = JSON.parse(inputs);
    Object.entries(initial).forEach(([k, v]) => sdk.setInput(k, !!v));
  }
  console.log("Ladder Output:", sdk.evaluate());
}
