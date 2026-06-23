/* eslint-disable */
import { Injectable, Logger } from '@nestjs/common';

export interface ExternalApiResponse<T> {
  status: number;
  headers: Record<string, string>;
  data?: T;
}

@Injectable()
export class ExternalApiClient {
  private readonly baseUrl = 'http://localhost:8080';
  private readonly logger = new Logger(ExternalApiClient.name);

  // Outbound Sync call to external API
  async fetchAllLists(): Promise<any[]> {
    const res = await fetch(`${this.baseUrl}/todolists`);
    if (!res.ok) throw new Error(`External API List error: ${res.statusText}`);
    return res.json();
  }

  async createTodoList(payload: { name: string }): Promise<any> {
    const res = await fetch(`${this.baseUrl}/todolists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Failed to push list creation`);
    return res.json();
  }

  async updateTodoList(
    externalId: string,
    payload: { name: string },
  ): Promise<void> {
    const res = await fetch(`${this.baseUrl}/todolists/${externalId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Failed to update external list`);
  }

  async deleteTodoList(externalId: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/todolists/${externalId}`, {
      method: 'DELETE',
    });
    if (!res.ok && res.status !== 404)
      throw new Error(`Failed to delete external list`);
  }

  async updateTodoItem(
    externalListId: string,
    externalItemId: string,
    payload: { name: string; done: boolean },
  ): Promise<void> {
    const res = await fetch(
      `${this.baseUrl}/todolists/${externalListId}/todoitems/${externalItemId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
    );
    if (!res.ok) throw new Error(`Failed to update external item`);
  }

  // Inbound Sync call to external API
  async getTodoLists(options?: {
    ifNoneMatch?: string;
  }): Promise<ExternalApiResponse<any>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (options?.ifNoneMatch) {
      headers['If-None-Match'] = options.ifNoneMatch;
    }

    const response = await fetch(`${this.baseUrl}/todolists`, {
      method: 'GET',
      headers,
    });

    // Extract headers into a plain key-value object for the service
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key.toLowerCase()] = value;
    });

    // If it's a 304 Not Modified, there is no body payload to parse
    if (response.status === 304) {
      return {
        status: response.status,
        headers: responseHeaders,
      };
    }

    // For a successful 200 OK response, parse the JSON body payload
    const data = await response.json();

    return {
      status: response.status,
      headers: responseHeaders,
      data,
    };
  }
}
