declare module 'd3' {
  export interface SimulationNodeDatum {
    id?: string;
    x?: number;
    y?: number;
    vx?: number;
    vy?: number;
    fx?: number | null;
    fy?: number | null;
    [key: string]: any;
  }

  export interface SimulationLinkDatum<NodeDatum extends SimulationNodeDatum> {
    source: string | NodeDatum;
    target: string | NodeDatum;
    [key: string]: any;
  }

  export interface Simulation<NodeDatum extends SimulationNodeDatum, LinkDatum extends SimulationLinkDatum<NodeDatum>> {
    nodes(): NodeDatum[];
    nodes(nodes: NodeDatum[]): this;
    force(name: string): any;
    force(name: string, force: any): this;
    alpha(): number;
    alpha(alpha: number): this;
    restart(): this;
    stop(): this;
    on(typenames: string, listener?: any): this;
  }

  export function forceSimulation<NodeDatum extends SimulationNodeDatum>(nodes?: NodeDatum[]): Simulation<NodeDatum, SimulationLinkDatum<NodeDatum>>;
  export function forceLink<NodeDatum extends SimulationNodeDatum, LinkDatum extends SimulationLinkDatum<NodeDatum>>(links?: LinkDatum[]): any;
  export function forceManyBody(): any;
  export function forceCenter(x?: number, y?: number): any;
  export function forceCollide(radius?: number | ((node: any) => number)): any;
  export function drag(): any;
  export function select(selector: string): any;
  export function selectAll(selector: string): any;
}