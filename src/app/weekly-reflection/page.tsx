'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/contexts/AuthContext';

export default function WeeklyReflectionPage() {
  const { user } = useAuth();
  const [reflectionSummary, setReflectionSummary] = useState<string | null>(null);
  const [writingPrompt, setWritingPrompt] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadWeeklyReflection = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const response = await fetch('/api/weekly-reflection', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
          },
          body: JSON.stringify({ userId: user.uid }),
        });
        
        console.log('Weekly reflection response status:', response.status);

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to generate weekly reflection');
        }

        const data = await response.json();
        setReflectionSummary(data.reflection.summary);
        setWritingPrompt(data.reflection.prompt);
      } catch (error) {
        console.error("Weekly reflection analysis failed:", error);
        toast({
          title: "Weekly Reflection Failed",
          description: error instanceof Error ? error.message : "Could not generate reflection. Please try again later.",
          variant: "destructive",
        });
      }
      setLoading(false);
    };

    loadWeeklyReflection();
  }, [user]);

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
