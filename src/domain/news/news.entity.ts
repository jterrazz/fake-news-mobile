export interface NewsAnswer {
    id: string;
    wasCorrect: boolean;
    answeredAt: string;
}

export interface NewsEntity {
    id: string;
    headline: string;
    article: string;
    isFake: boolean;
    category: string;
    answered?: NewsAnswer;
}

export class NewsError extends Error {
    constructor(
        message: string,
        public code: string,
        public status: number,
    ) {
        super(message);
        this.name = 'NewsError';
    }
}
