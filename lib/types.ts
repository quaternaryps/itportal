export interface NodeConfig {
  url: string;
}

export interface AppConfig {
  nodes: Record<string, NodeConfig>;
}
