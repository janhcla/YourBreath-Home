export interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
  APPLE_TEAM_ID?: string;
  APPLE_KEY_ID?: string;
  APPLE_CLIENT_ID?: string;
  APPLE_PRIVATE_KEY?: string;
  COMMUNITY_ADMIN_APPLE_SUBJECT?: string;
}

export interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

export interface Profile {
  id: string;
  displayName: string | null;
  email: string | null;
  role: "user" | "admin";
  appleSubject: string | null;
}

export interface Identity {
  profile: Profile | null;
  anonymousId: string | null;
  anonymousCookieValue: string | null;
  sessionToken: string | null;
  setAnonymousCookie: boolean;
}

export interface SuggestionInput {
  title: string;
  description: string;
  category: string;
}

export interface SuggestionRecord {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  votes: number;
  comments: number;
  submitted: string;
  author: string;
  developerResponse: string | null;
  isPinned: boolean;
  isShipped: boolean;
  version: string | null;
  availability: string | null;
  viewerVoted: boolean;
  viewerFollowed: boolean;
}
