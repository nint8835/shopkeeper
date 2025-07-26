import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function pluralize(count: number, singular: string, plural: string) {
    return count === 1 ? singular : plural;
}

export function arraysEqual<T>(first: T[], second: T[]): boolean {
    return (
        first.length === second.length &&
        first.every((value, index) => {
            return value === second[index];
        })
    );
}
