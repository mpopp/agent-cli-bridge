# Interface Contracts: Connection Configuration (IPC)

## IPC: `connection-config`

Exposes configuration and server management to the renderer process.

### Commands

#### `getConfig(): Promise<ServerConfig>`
- **Arguments**: None.
- **Returns**: The current `ServerConfig`.

#### `saveNetworkConfig(config: NetworkConfig): Promise<boolean>`
- **Arguments**:
  - `address`: '127.0.0.1' or '0.0.0.0'
  - `port`: number
- **Returns**: `true` on success. Throws error if port is in use or invalid.

#### `regenerateApiKey(): Promise<string>`
- **Arguments**: None.
- **Returns**: The newly generated API key.

#### `getServerStatus(): Promise<ServerStatus>`
- **Arguments**: None.
- **Returns**: Object containing `{ status: 'running' | 'stopped' | 'error' }`.

### Types

```typescript
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
```

## UI/Component Contract

- **Sidebar Navigation**:
  - Link: `Connection` (Route: `/connection`)
- **API Key Field**:
  - Automatically hides after 30 seconds of being shown.
- **Address Dropdown**:
  - Triggers a red MUI `Alert` if `0.0.0.0` is selected.