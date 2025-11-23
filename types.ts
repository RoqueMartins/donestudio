// Basic types for the landing page mock components
export enum SocialPlatform {
    INSTAGRAM = 'instagram',
    TIKTOK = 'tiktok',
    LINKEDIN = 'linkedin',
    TWITTER = 'twitter',
    FACEBOOK = 'facebook'
}

export enum PostStatus {
    DRAFT = 'draft',
    SCHEDULED = 'scheduled',
    PUBLISHED = 'published',
    FAILED = 'failed'
}

export interface Post {
    id: string;
    clientId: string;
    platforms: SocialPlatform[];
    content: string;
    scheduledFor?: Date;
    status: PostStatus;
    image?: string;
    createdAt: Date;
}

export interface Client {
    id: string;
    name: string;
    logo?: string;
    platforms: SocialPlatform[];
}

export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
}
