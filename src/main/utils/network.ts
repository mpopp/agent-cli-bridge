import net from 'net';

/**
 * Checks if a given port is available on the specified address.
 * @param port The port to check.
 * @param address The address to bind to (default: '0.0.0.0').
 * @returns A promise that resolves to true if the port is available, false otherwise.
 */
export function checkPortAvailable(port: number, address: string = '0.0.0.0'): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      } else {
        // For other errors, it might be permission issues or something else,
        // but we'll assume it's not available for our safe binding.
        resolve(false);
      }
    });

    server.once('listening', () => {
      // The port is available, close the server and resolve true.
      server.close(() => {
        resolve(true);
      });
    });

    server.listen(port, address);
  });
}
