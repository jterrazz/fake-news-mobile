export interface NewsApiArticle {
    contentWithAnnotations: string;
    category: string;
    createdAt: string;
    headline: string;
    id: string;
    isFake: boolean;
    fakeReason: string | null;
}

export interface NewsApiResponse {
    items: NewsApiArticle[];
    nextCursor: string | null;
    total: number;
} 