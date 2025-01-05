import { formatDistanceToNow } from 'date-fns';

export function formatTimeAgo(date?: string): string {
    if (!date) return '';
    
    try {
        return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch (error) {
        return '';
    }
} 