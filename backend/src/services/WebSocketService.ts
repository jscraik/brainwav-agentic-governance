/**
 * WebSocketService - Real-time event streaming for governance dashboard
 * Broadcasts governance state changes, accountability events, test execution
 * This is a KEY DIFFERENTIATOR from MCAF which lacks real-time monitoring
 */

import { WebSocketServer, WebSocket } from 'ws';
import type { IncomingMessage } from 'http';
import { EventEmitter } from 'events';

export type EventType =
  | 'governance:change'
  | 'governance:drift'
  | 'skill:change'
  | 'task:change'
  | 'accountability:signoff'
  | 'accountability:blocked'
  | 'accountability:unblocked'
  | 'ai:mode:change'
  | 'test:layer:complete'
  | 'index:complete'
  | 'cache:invalidate';

export interface GovernanceEvent {
  type: EventType;
  data: any;
  timestamp: number;
  source?: string;
}

export class WebSocketService extends EventEmitter {
  private wss: WebSocketServer | null;
  private port: number;
  private clients: Set<WebSocket>;
  private isEnabled: boolean;

  constructor(port: number = 3001) {
    super();
    this.port = port;
    this.wss = null;
    this.clients = new Set();
    this.isEnabled = false;
  }

  /**
   * Start WebSocket server
   */
  start(): void {
    if (this.isEnabled) {
      return;
    }

    console.log(`📡 Starting WebSocket server on port ${this.port}...`);

    this.wss = new WebSocketServer({ port: this.port });

    this.wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
      this.handleConnection(ws, req);
    });

    this.wss.on('error', (error) => {
      console.error('WebSocket server error:', error);
    });

    this.isEnabled = true;
    console.log(`✅ WebSocket server started on ws://localhost:${this.port}`);
  }

  /**
   * Stop WebSocket server
   */
  stop(): void {
    if (!this.isEnabled) {
      return;
    }

    console.log('🛑 Stopping WebSocket server...');

    // Close all connections
    for (const client of this.clients) {
      client.close();
    }
    this.clients.clear();

    // Close server
    if (this.wss) {
      this.wss.close();
      this.wss = null;
    }

    this.isEnabled = false;
    console.log('✅ WebSocket server stopped');
  }

  /**
   * Handle new WebSocket connection
   */
  private handleConnection(ws: WebSocket, req: IncomingMessage): void {
    const clientId = this.generateClientId();
    this.clients.add(ws);

    console.log(`📱 Client connected: ${clientId} (total: ${this.clients.size})`);

    // Send welcome message
    this.sendToClient(ws, {
      type: 'system:connected',
      data: {
        clientId,
        timestamp: Date.now(),
        server: 'AMYGA Governance Backend'
      }
    });

    // Handle client messages
    ws.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        this.handleClientMessage(ws, clientId, message);
      } catch (error) {
        console.error(`Invalid message from ${clientId}:`, error);
      }
    });

    // Handle disconnection
    ws.on('close', () => {
      this.clients.delete(ws);
      console.log(`📴 Client disconnected: ${clientId} (total: ${this.clients.size})`);
    });

    // Handle errors
    ws.on('error', (error) => {
      console.error(`WebSocket error for ${clientId}:`, error);
      this.clients.delete(ws);
    });

    // Emit connection event
    this.emit('client:connected', { clientId, ws });
  }

  /**
   * Handle client message
   */
  private handleClientMessage(
    ws: WebSocket,
    clientId: string,
    message: any
  ): void {
    const { type, data } = message;

    switch (type) {
      case 'ping':
        this.sendToClient(ws, { type: 'pong', data: { timestamp: Date.now() } });
        break;

      case 'subscribe':
        // Client wants to subscribe to specific event types
        console.log(`Client ${clientId} subscribed to:`, data?.events);
        break;

      case 'unsubscribe':
        console.log(`Client ${clientId} unsubscribed from:`, data?.events);
        break;

      default:
        console.warn(`Unknown message type from ${clientId}:`, type);
    }
  }

  /**
   * Broadcast event to all connected clients
   */
  broadcast(type: EventType, data: any, source?: string): void {
    if (!this.isEnabled || this.clients.size === 0) {
      return;
    }

    const event: GovernanceEvent = {
      type,
      data,
      timestamp: Date.now(),
      source
    };

    const message = JSON.stringify(event);
    let sent = 0;

    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(message);
          sent++;
        } catch (error) {
          console.error('Failed to send to client:', error);
        }
      }
    }

    if (sent > 0) {
      console.log(`📢 Broadcast: ${type} to ${sent}/${this.clients.size} clients`);
    }

    // Also emit for internal handling
    this.emit(type, event);
  }

  /**
   * Send event to specific client
   */
  sendToClient(ws: WebSocket, event: any): void {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(event));
      } catch (error) {
        console.error('Failed to send to client:', error);
      }
    }
  }

  /**
   * Governance document changed
   */
  broadcastGovernanceChange(docName: string, change: 'add' | 'change' | 'unlink'): void {
    this.broadcast('governance:change', {
      docName,
      change,
      message: `Governance document ${change}: ${docName}`
    }, 'governance');
  }

  /**
   * Governance drift detected
   */
  broadcastGovernanceDrift(driftedDocuments: any[]): void {
    this.broadcast('governance:drift', {
      count: driftedDocuments.length,
      documents: driftedDocuments,
      message: `Hash drift detected in ${driftedDocuments.length} documents`
    }, 'governance');
  }

  /**
   * Skill file changed
   */
  broadcastSkillChange(skillId: string, change: 'add' | 'change' | 'unlink'): void {
    this.broadcast('skill:change', {
      skillId,
      change,
      message: `Skill ${change}: ${skillId}`
    }, 'skills');
  }

  /**
   * Task accountability changed
   */
  broadcastAccountabilitySignoff(
    taskId: string,
    perspective: string,
    decision: string,
    canProceed: boolean
  ): void {
    this.broadcast('accountability:signoff', {
      taskId,
      perspective,
      decision,
      canProceed,
      message: `${perspective} ${decision} task ${taskId}`
    }, 'accountability');
  }

  /**
   * Task blocked
   */
  broadcastTaskBlocked(taskId: string, blockedBy: string, reason: string): void {
    this.broadcast('accountability:blocked', {
      taskId,
      blockedBy,
      reason,
      message: `Task ${taskId} blocked by ${blockedBy}: ${reason}`
    }, 'accountability');
  }

  /**
   * Task unblocked
   */
  broadcastTaskUnblocked(taskId: string): void {
    this.broadcast('accountability:unblocked', {
      taskId,
      message: `Task ${taskId} unblocked - can proceed`
    }, 'accountability');
  }

  /**
   * AI mode changed
   */
  broadcastAIModeChange(
    taskId: string,
    from: string,
    to: string,
    reason: string
  ): void {
    this.broadcast('ai:mode:change', {
      taskId,
      from,
      to,
      reason,
      message: `AI mode for ${taskId}: ${from} → ${to}`
    }, 'ai');
  }

  /**
   * Test layer completed
   */
  broadcastTestLayerComplete(
    taskId: string,
    layer: string,
    passed: number,
    failed: number,
    duration: number
  ): void {
    this.broadcast('test:layer:complete', {
      taskId,
      layer,
      passed,
      failed,
      duration,
      message: `Test layer ${layer} complete: ${passed} passed, ${failed} failed`
    }, 'tests');
  }

  /**
   * Index operation complete
   */
  broadcastIndexComplete(
    indexType: 'skills' | 'governance' | 'tasks',
    indexed: number,
    duration: number
  ): void {
    this.broadcast('index:complete', {
      indexType,
      indexed,
      duration,
      message: `Indexed ${indexed} ${indexType} in ${duration}ms`
    }, 'index');
  }

  /**
   * Cache invalidated
   */
  broadcastCacheInvalidated(cacheType: 'skills' | 'governance' | 'all', keys: string[]): void {
    this.broadcast('cache:invalidate', {
      cacheType,
      count: keys.length,
      keys,
      message: `Cache invalidated: ${cacheType} (${keys.length} keys)`
    }, 'cache');
  }

  /**
   * Generate unique client ID
   */
  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get server status
   */
  getStatus(): {
    enabled: boolean;
    port: number;
    clients: number;
  } {
    return {
      enabled: this.isEnabled,
      port: this.port,
      clients: this.clients.size
    };
  }

  /**
   * Get connected client count
   */
  getClientCount(): number {
    return this.clients.size;
  }
}
