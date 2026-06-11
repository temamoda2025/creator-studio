export interface ResearchPost {
  id: string;
  platform: "instagram" | "tiktok";
  url: string;
  caption: string;
  username: string;
  likes: number;
  comments: number;
  views: number;
  shares: number;
  timestamp: string | null;
  thumbnailUrl: string | null;
  engagementScore: number;
}
