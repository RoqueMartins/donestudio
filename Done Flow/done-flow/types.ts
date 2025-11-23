
export enum SocialPlatform {
  INSTAGRAM = 'Instagram',
  FACEBOOK = 'Facebook',
  LINKEDIN = 'LinkedIn',
  TWITTER = 'X (Twitter)',
  YOUTUBE = 'YouTube'
}

export enum PostStatus {
  DRAFT = 'Rascunho',
  REVIEW = 'Em Aprovação',
  APPROVED = 'Aprovado',
  SCHEDULED = 'Agendado',
  PUBLISHED = 'Publicado'
}

export interface Post {
  id: string;
  clientId: string;
  title: string;
  content: string;
  image?: string;
  platforms: SocialPlatform[];
  scheduledDate: Date;
  status: PostStatus;
  author: string;
}

export interface MetricData {
  name: string;
  value: number;
  previousValue: number;
}

export interface ChartDataPoint {
  name: string;
  followers: number;
  engagement: number;
  reach: number;
}

export interface InboxMessage {
  id: string;
  platform: SocialPlatform;
  user: string;
  avatar: string;
  content: string;
  timestamp: Date;
  read: boolean;
  type: 'comment' | 'dm';
}

export interface ChatHistoryItem {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export type ChatHistories = Record<string, ChatHistoryItem[]>;

export type Plan = 'Trial' | 'Starter' | 'Pro' | 'Agency';

export interface User {
  id?: string;
  name: string;
  role: string;
  agencyName: string;
  email: string;
  avatar: string;
  plan: Plan;
  subscriptionStatus: 'active' | 'inactive' | 'trial';
  isAdmin?: boolean;
  lastLogin?: Date;
  timezone?: string;
  location?: string;
}

// Expanded Client Interface for "Brand DNA"
export interface Client {
  id: string;
  name: string;
  industry: string;
  logo: string;
  active: boolean;
  connectedPlatforms: SocialPlatform[];
  nextPost?: Date;
  // Contact & Links
  website?: string;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    youtube?: string;
    twitter?: string;
  };
  // Visual Identity
  brandColor?: string; 
  brandColorSecondary?: string; 
  brandColorTertiary?: string; 
  brandStyle?: string;
  brandFont?: string;
  brandbook?: string;
  brandbookName?: string;
  
  // AI Context / Brand DNA
  description?: string; // Short bio of the company
  targetAudience?: string; // Who are they talking to?
  toneOfVoice?: string; // e.g. "Witty", "Formal", "Friendly"
  contentPillars?: string[]; // e.g. ["Education", "Sales", "Lifestyle"]
  avoidTerms?: string; // Things the AI should not say
  customHashtags?: string; // Specific hashtags to always mix in
}
