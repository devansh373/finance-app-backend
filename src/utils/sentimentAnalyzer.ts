import * as Sentiment from 'sentiment';

// Initialize the sentiment analyzer
const SentimentConstructor = (Sentiment as any).default || Sentiment;

const sentiment = new SentimentConstructor();

/**
 * Analyzes the sentiment of a given text.
 * @param text The string of text to analyze.
 * @returns An object containing the score and comparative score.
 */
export function analyzeSentiment(text: string) {
    if (!text) {
        return { score: 0, comparative: 0, sentimentLabel: 'NEUTRAL' };
    }

    const result = sentiment.analyze(text);
    
    // Determine the label based on the score
    let sentimentLabel: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
    if (result.score > 2) {
        sentimentLabel = 'POSITIVE';
    } else if (result.score < -2) {
        sentimentLabel = 'NEGATIVE';
    } else {
        sentimentLabel = 'NEUTRAL';
    }

    return {
        score: result.score,
        comparative: result.comparative,
        sentimentLabel,
        tokens: result.tokens, // The words found
    };
}