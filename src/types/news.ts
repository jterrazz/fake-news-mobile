export interface NewsAnswer {
  id: string;
  wasCorrect: boolean;
  answeredAt: string;
}

export interface NewsItem {
  id: string;
  headline: string;
  article: string;
  isFake: boolean;
  category: string;
  answered?: {
    wasCorrect: boolean;
  };
}

export interface NewsScore {
  score: number;
  streak: number;
}

export interface NewsArticleResponse {
  articles: NewsItem[];
  version: string;
}

export interface NewsArticleError {
  code: string;
  message: string;
  status: number;
} 