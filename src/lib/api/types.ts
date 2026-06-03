export type RsvpStatus = 'yes' | 'no' | 'maybe' | 'unknown';

export interface Member {
  id: string;
  slug: string;
  name: string;
  nickname: string;
  role: string;
  funFact: string;
  canLetIn: boolean;
  avatar: string;
  color: string;
}

export interface RsvpEntry {
  id: string | null;
  memberSlug: string;
  status: RsvpStatus;
  comment: string;
  canLetIn: boolean;
  updatedAt: number;
}

export interface BacklogItem {
  id: string;
  title: string;
  author: string;
  anonymous: boolean;
  createdAt: number;
}

export interface VacationItem {
  id: string;
  memberSlug: string;
  from: string;
  to: string;
  reason: string;
  createdAt: number;
}

export interface Report {
  id: string;
  title: string;
  date: string;
  summary: string;
  outcomes: string[];
}

export interface GalleryEvent {
  id: string;
  title: string;
  date: string;
  photos: string[];
}

export interface PageData {
  members: Member[];
  rsvps: Record<string, RsvpEntry>;
  backlogItems: BacklogItem[];
  vacations: VacationItem[];
  reports: Report[];
  galleryEvents: GalleryEvent[];
}

export interface UpdateRsvpInput {
  memberSlug: string;
  status: RsvpStatus;
  canLetIn: boolean;
  comment: string;
}

export interface AddBacklogInput {
  title: string;
  author: string;
  anonymous: boolean;
}

export interface AddVacationInput {
  memberSlug: string;
  from: string;
  to: string;
  reason: string;
}

export interface AddJoinApplicationInput {
  name: string;
  invitedBy: string;
  reason: string;
}

export interface GossipApi {
  readonly configured: boolean;
  subscribePageData(onData: (data: PageData) => void, onError: (error: Error) => void): () => void;
  updateRsvp(input: UpdateRsvpInput): Promise<void>;
  addBacklogItem(input: AddBacklogInput): Promise<void>;
  addVacation(input: AddVacationInput): Promise<void>;
  addJoinApplication(input: AddJoinApplicationInput): Promise<void>;
  close(): Promise<void>;
}
