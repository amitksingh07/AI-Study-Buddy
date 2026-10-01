export interface Flashcard {
    id: string;
    question: string;
    answer: string;
    explanation: string;
    difficulty: "easy" | "medium" | "hard";
    topic: string;
    source_page?: number | null;
}

export interface Deck {
    id: string;
    title: string;
    cards: Flashcard[];
    stats: {
        correct: number;
        review: number;
        attempted: number;
    };
    createdAt: string;
    lastStudied: string;
}
