// vibecoded, claude 3.7 sonnet (not thinking)
declare module 'rcon' {
  interface RconOptions {
    /** Use TCP protocol if true, UDP if false */
    tcp: boolean;
    /** Whether to use challenge-response authentication */
    challenge: boolean;
  }

  /** Events emitted by the RCON client */
  type RconEvent = 'auth' | 'response' | 'error' | 'end';

  class Rcon {
    /**
     * Creates a new RCON client
     * @param host The hostname or IP address of the server
     * @param port The port number of the RCON server
     * @param password The password to authenticate with
     * @param options Configuration options for the RCON connection
     */
    constructor(host: string, port: number, password: string, options: RconOptions);

    /**
     * Connects to the RCON server
     */
    connect(): void;

    /**
     * Disconnects from the RCON server
     */
    disconnect(): void;

    /**
     * Sends a command to the RCON server
     * @param command The command to send
     */
    send(command: string): void;

    /**
     * Register an event listener
     * @param event The event to listen for
     * @param listener The callback function to execute when the event occurs
     */
    on(event: RconEvent, listener: (data: string) => void): this;

    /**
     * Register a one-time event listener
     * @param event The event to listen for
     * @param listener The callback function to execute when the event occurs
     */
    once(event: RconEvent, listener: (data: string) => void): this;

    /**
     * Remove an event listener
     * @param event The event to stop listening for
     * @param listener The callback function to remove
     */
    removeListener(event: RconEvent, listener: (data: string) => void): this;
  }

  export default Rcon;
}