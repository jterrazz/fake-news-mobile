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
    fakeReason: string | null;
    answered?: NewsAnswer;
}

export class NewsError extends Error {
    constructor(
        message: string,
        public code: 'FETCH_ERROR' | 'NO_CONTENT' | 'NETWORK_ERROR',
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
