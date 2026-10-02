import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Counts words by whitespace-splitting, ignoring leading/trailing/collapsed whitespace.
export function countWords(text: string): number {
    const trimmed = text.trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
}

// Truncates text to at most `maxWords` words, used to hard-cap a textarea's onChange so
// typing (or pasting) past the limit is simply clipped rather than silently accepted.
export function limitWords(text: string, maxWords: number): string {
    const words = text.split(/(\s+)/); // keep separators so trailing whitespace while typing isn't eaten
    let wordCount = 0;
    let result = '';
    for (const chunk of words) {
        if (chunk.trim() === '') {
            result += chunk;
            continue;
        }
        if (wordCount >= maxWords) break;
        result += chunk;
        wordCount++;
    }
    return result;
}
