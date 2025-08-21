
'use server';
/**
 * @fileOverview An AI flow to generate formal explanation letters for employees.
 *
 * - generateExplanationLetter - A function that handles the letter generation process.
 * - GenerateLetterInput - The input type for the generateExplanationLetter function.
 * - GenerateLetterOutput - The return type for the generateExplanationLetter function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateLetterInputSchema = z.object({
  employeeName: z.string().describe('The full name of the employee.'),
  employeeDesignation: z.string().describe('The designation of the employee.'),
  reason: z.string().describe('The reason or misconduct for which the explanation is required.'),
});
export type GenerateLetterInput = z.infer<typeof GenerateLetterInputSchema>;

const GenerateLetterOutputSchema = z.object({
  letter: z.string().describe('The full, professionally formatted explanation letter.'),
});
export type GenerateLetterOutput = z.infer<typeof GenerateLetterOutputSchema>;

export async function generateExplanationLetter(input: GenerateLetterInput): Promise<GenerateLetterOutput> {
  return generateLetterFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateExplanationLetterPrompt',
  input: { schema: GenerateLetterInputSchema },
  output: { schema: GenerateLetterOutputSchema },
  prompt: `You are an HR Manager. Your task is to draft a formal "Explanation Letter" to an employee.

The letter should be addressed to the employee, state their designation, and clearly mention the reason for which their explanation is sought. It must ask the employee to submit a written explanation within a specific timeframe (e.g., 3 working days). The tone should be formal and professional.

Employee Name: {{{employeeName}}}
Employee Designation: {{{employeeDesignation}}}
Reason for Letter: {{{reason}}}

Generate the complete letter now.
`,
});

const generateLetterFlow = ai.defineFlow(
  {
    name: 'generateLetterFlow',
    inputSchema: GenerateLetterInputSchema,
    outputSchema: GenerateLetterOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
