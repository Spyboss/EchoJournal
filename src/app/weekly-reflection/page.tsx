'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { analyzeWeeklyReflection } from "@/ai/flows/analyze-weekly-reflection";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

export default function WeeklyReflectionPage() {
  const [reflectionSummary, setReflectionSummary] = useState<string | null>(null);
  const [writingPrompt, setWritingPrompt] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadWeeklyReflection = async () => {
      setLoading(true);
      // Load journal entries from local storage
      const savedEntries = localStorage.getItem("journalEntries");
      if (savedEntries) {
        const journalEntries = JSON.parse(savedEntries)
          .slice(0, 7) // Limit to last 7 entries
          .map((entry: { text: any; }) => entry.text); // Extract text from entries

        if (journalEntries.length > 0) {
          try {
            const reflection = await analyzeWeeklyReflection({ journalEntries: journalEntries.join('\n') });
            setReflectionSummary(reflection.summary);
            setWritingPrompt(reflection.prompt);
          } catch (error) {
            console.error("Weekly reflection analysis failed:", error);
            toast({
              title: "Weekly Reflection Failed",
              description: "Could not generate reflection. Please try again later.",
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "No Journal Entries",
            description: "Write some journal entries this week and come back!",
          });
        }
      }
      setLoading(false);
    };

    loadWeeklyReflection();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-muted">
      <Toaster />
      <h1 className="text-3xl font-bold mb-4 text-primary">Weekly Reflection</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {reflectionSummary && (
            <Card className="w-full max-w-2xl p-4 mb-4">
              <CardHeader>
                <Label>Reflection Summary</Label>
              </CardHeader>
              <CardContent>
                <p>{reflectionSummary}</p>
              </CardContent>
            </Card>
          )}
          {writingPrompt && (
            <Card className="w-full max-w-2xl p-4">
              <CardHeader>
                <Label>Writing Prompt</Label>
              </CardHeader>
              <CardContent>
                <p>{writingPrompt}</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
      <Button onClick={() => window.location.href = '/'}>Back to Journal</Button>
    </div>
  );
}
