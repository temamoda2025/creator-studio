export interface ResearchPost {
  id: string;
  platform: "instagram" | "tiktok" | "youtube" | "linkedin";
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
