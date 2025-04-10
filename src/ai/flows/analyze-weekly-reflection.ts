'use server';

/**
 * @fileOverview Weekly reflection AI agent for summarizing journal entries and generating writing prompts.
 *
 * - analyzeWeeklyReflection - A function that analyzes the sentiment of the last 7 journal entries and provides a summary and writing prompt.
 * - AnalyzeWeeklyReflectionInput - The input type for the analyzeWeeklyReflection function.
 * - AnalyzeWeeklyReflectionOutput - The return type for the analyzeWeeklyReflection function.
 */

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';

const AnalyzeWeeklyReflectionInputSchema = z.object({
  journalEntries: z.string().describe('The journal entries to analyze, concatenated into a single string.'),
});
export type AnalyzeWeeklyReflectionInput = z.infer<typeof AnalyzeWeeklyReflectionInputSchema>;

const AnalyzeWeeklyReflectionOutputSchema = z.object({
  summary: z.string().describe('A summary of the overall sentiment and themes in the journal entries.'),
  prompt: z.string().describe('A writing prompt based on the mood reflected in the journal entries.'),
});
export type AnalyzeWeeklyReflectionOutput = z.infer<typeof AnalyzeWeeklyReflectionOutputSchema>;

export async function analyzeWeeklyReflection(input: AnalyzeWeeklyReflectionInput): Promise<AnalyzeWeeklyReflectionOutput> {
  return analyzeWeeklyReflectionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeWeeklyReflectionPrompt',
  input: {
    schema: z.object({
      journalEntries: z.string().describe('The journal entries to analyze.'),
    }),
  },
  output: {
    schema: z.object({
      summary: z.string().describe('A summary of the overall sentiment and themes in the journal entries.'),
      prompt: z.string().describe('A writing prompt based on the mood reflected in the journal entries.'),
    }),
  },
  prompt: `You are an AI journaling assistant. Analyze the following journal entries and provide a summary of the overall sentiment and themes, and then generate a writing prompt based on the mood reflected in the entries.
  
  Journal Entries:
  {{{journalEntries}}}
  
  Summary:
  Prompt:`,
});

const analyzeWeeklyReflectionFlow = ai.defineFlow<
  typeof AnalyzeWeeklyReflectionInputSchema,
  typeof AnalyzeWeeklyReflectionOutputSchema
>({
  name: 'analyzeWeeklyReflectionFlow',
  inputSchema: AnalyzeWeeklyReflectionInputSchema,
  outputSchema: AnalyzeWeeklyReflectionOutputSchema,
},
async input => {
  const { output } = await prompt(input);
  return output!;
});
