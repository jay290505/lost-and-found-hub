'use server';

/**
 * @fileOverview AI-powered suggestions for lost item details.
 *
 * This file contains the Genkit flow to suggest item names and descriptions
 * based on a provided image. It exports:
 * - `suggestItemDetails`: The main function to trigger the flow.
 * - `SuggestItemDetailsInput`: The input type for the function.
 * - `SuggestItemDetailsOutput`: The output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestItemDetailsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo of the lost item, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' 
    ),
});
export type SuggestItemDetailsInput = z.infer<typeof SuggestItemDetailsInputSchema>;

const SuggestItemDetailsOutputSchema = z.object({
  suggestedItemName: z
    .string()
    .describe('An AI-suggested name for the lost item.'),
  suggestedItemDescription: z
    .string()
    .describe('An AI-suggested description for the lost item.'),
});
export type SuggestItemDetailsOutput = z.infer<typeof SuggestItemDetailsOutputSchema>;

export async function suggestItemDetails(
  input: SuggestItemDetailsInput
): Promise<SuggestItemDetailsOutput> {
  return suggestItemDetailsFlow(input);
}

const suggestItemDetailsPrompt = ai.definePrompt({
  name: 'suggestItemDetailsPrompt',
  input: {schema: SuggestItemDetailsInputSchema},
  output: {schema: SuggestItemDetailsOutputSchema},
  prompt: `You are an AI assistant designed to help users create listings for lost items.

  Based on the image provided, suggest a concise item name and a more detailed description.

  Photo: {{media url=photoDataUri}}
  
  Item Name: 
  Item Description:`,
});

const suggestItemDetailsFlow = ai.defineFlow(
  {
    name: 'suggestItemDetailsFlow',
    inputSchema: SuggestItemDetailsInputSchema,
    outputSchema: SuggestItemDetailsOutputSchema,
  },
  async input => {
    const {output} = await suggestItemDetailsPrompt(input);
    return output!;
  }
);
