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
  answered?: NewsAnswer;
}

export interface NewsScore {
  score: number;
  streak: number;
} 