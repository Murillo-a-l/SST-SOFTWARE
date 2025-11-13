import { useState } from 'react';
import { GeminiError, summarizeText as geminiSummarize, suggestExams as geminiSuggest } from '../services/geminiService';

export function useGemini() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<GeminiError | null>(null);

    const summarize = async (input: string): Promise<string | null> => {
        if (isLoading) return null;
        setIsLoading(true);
        setError(null);
        try {
            const result = await geminiSummarize(input);
            return result;
        } catch (err: any) {
            setError(err);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const suggest = async (employee: any): Promise<string | null> => {
        if (isLoading) return null;
        setIsLoading(true);
        setError(null);
        try {
            const result = await geminiSuggest(employee);
            return result;
        } catch (err: any) {
            setError(err);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { isLoading, error, summarize, suggest };
}
