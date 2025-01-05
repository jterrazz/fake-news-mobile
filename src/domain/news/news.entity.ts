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
    createdAt: string;
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

interface NewsAnswered {
    answeredAt: number;
    id: string;
    wasCorrect: boolean;
    selectedFake: boolean;
}
