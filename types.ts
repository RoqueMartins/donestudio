export type PostStatus = 'pending' | 'approved';

export interface ScheduledPost {
  id: string;
  caption: string;
  aiCaption?: string;
  scheduledAt: string;
  platforms: string[];
  status: PostStatus;
  createdAt?: string;
  approvedAt?: string;
  owner?: string;
}

export interface InboxMessage {
  id: string;
  channel: 'Instagram' | 'TikTok' | 'Twitter' | 'LinkedIn';
  author: string;
  preview: string;
  timeAgo: string;
  priority?: 'alta' | 'normal';
}

export interface MetricCard {
  label: string;
  value: string;
  change: string;
}

export interface CompetitorInsight {
  competitor: string;
  highlight: string;
  delta: string;
}
