import { ConvexClient } from 'convex/browser';
import { api } from '../../../convex/_generated/api';
import type {
  AddBacklogInput,
  AddJoinApplicationInput,
  AddVacationInput,
  GossipApi,
  PageData,
  UpdateRsvpInput,
} from './types';

function getConvexUrl(): string | null {
  const value = import.meta.env.PUBLIC_CONVEX_URL;
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

class MissingConfigGossipApi implements GossipApi {
  readonly configured = false;

  subscribePageData(
    _onData: (data: PageData) => void,
    onError: (error: Error) => void,
  ): () => void {
    queueMicrotask(() => {
      onError(
        new Error(
          'Convex backend is not configured. Set PUBLIC_CONVEX_URL to enable shared club data.',
        ),
      );
    });
    return () => {};
  }

  async updateRsvp(): Promise<void> {
    throw new Error('Convex backend is not configured.');
  }

  async addBacklogItem(): Promise<void> {
    throw new Error('Convex backend is not configured.');
  }

  async addVacation(): Promise<void> {
    throw new Error('Convex backend is not configured.');
  }

  async addJoinApplication(): Promise<void> {
    throw new Error('Convex backend is not configured.');
  }

  async close(): Promise<void> {
    // Nothing to close.
  }
}

class ConvexGossipApi implements GossipApi {
  readonly configured = true;
  private readonly client: ConvexClient;

  constructor(url: string) {
    this.client = new ConvexClient(url);
  }

  subscribePageData(onData: (data: PageData) => void, onError: (error: Error) => void): () => void {
    const subscription = this.client.onUpdate(
      api.club.getPageData,
      {},
      (data) => onData(data as PageData),
      (error) => onError(toError(error)),
    );

    return () => subscription.unsubscribe();
  }

  async updateRsvp(input: UpdateRsvpInput): Promise<void> {
    await this.client.mutation(api.club.updateRsvp, input);
  }

  async addBacklogItem(input: AddBacklogInput): Promise<void> {
    await this.client.mutation(api.club.addBacklogItem, input);
  }

  async addVacation(input: AddVacationInput): Promise<void> {
    await this.client.mutation(api.club.addVacation, input);
  }

  async addJoinApplication(input: AddJoinApplicationInput): Promise<void> {
    await this.client.mutation(api.club.addJoinApplication, input);
  }

  async close(): Promise<void> {
    await this.client.close();
  }
}

export function createGossipApi(): GossipApi {
  const url = getConvexUrl();
  return url ? new ConvexGossipApi(url) : new MissingConfigGossipApi();
}

export type * from './types';
