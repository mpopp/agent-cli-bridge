export interface ExecutionLogEntry {
  id: number;
  timestamp: string; // ISO-8601
  command: string;
  cwd: string;
  exitCode: number | null;
  duration: number | null;
  status: 'executed' | 'blocked' | 'running';
  blockReason: string | null;
  stdoutPreview: string | null;
  stderrPreview: string | null;
}

export interface ExecutionFilter {
  limit?: number;
  offset?: number;
  status?: 'all' | 'executed' | 'blocked';
}

export interface ServerConfig {
  address: string;
  port: number;
  apiKey: string;
}

export interface NetworkConfig {
  address: string;
  port: number;
}

export interface ServerStatus {
  status: 'running' | 'stopped' | 'error';
}
