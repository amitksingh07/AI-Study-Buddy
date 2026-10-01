export interface Flashcard {
    id: string;
    question: string;
    answer: string;
    explanation: string;
    difficulty: "easy" | "medium" | "hard";
    topic: string;
    source_page?: number | null;
}
