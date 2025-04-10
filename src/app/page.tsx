"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { analyzeSentiment } from "@/ai/flows/analyze-sentiment";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

interface JournalEntry {
  id: string;
  text: string;
  timestamp: string;
  sentimentSummary?: string;
}

const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

export default function Home() {
  const [entryText, setEntryText] = useState("");
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);

  useEffect(() => {
    // Load entries from local storage on mount
    const savedEntries = localStorage.getItem("journalEntries");
    if (savedEntries) {
      setJournalEntries(JSON.parse(savedEntries));
    }
  }, []);

  useEffect(() => {
    // Save entries to local storage whenever journalEntries changes
    localStorage.setItem("journalEntries", JSON.stringify(journalEntries));
  }, [journalEntries]);


  const handleSaveEntry = async () => {
    if (entryText.trim() === "") {
      toast({
        title: "Error",
        description: "Journal entry cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    const newEntryId = generateId();
    const timestamp = new Date().toLocaleString();
    let sentimentSummary: string | undefined;

    try {
      const sentimentAnalysis = await analyzeSentiment({ journalEntry: entryText });
      sentimentSummary = sentimentAnalysis.summary;
    } catch (error) {
      console.error("Sentiment analysis failed:", error);
      toast({
        title: "Sentiment Analysis Failed",
        description: "Could not analyze sentiment. Please try again later.",
        variant: "destructive",
      });
    }

    const newEntry: JournalEntry = {
      id: newEntryId,
      text: entryText,
      timestamp: timestamp,
      sentimentSummary: sentimentSummary,
    };

    setJournalEntries((prevEntries) => [newEntry, ...prevEntries]);
    setEntryText(""); // Clear the textarea after saving
    toast({
      title: "Success",
      description: "Journal entry saved!",
    });
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-muted">
      <Toaster />
      <h1 className="text-3xl font-bold mb-4 text-primary">Echo Journal</h1>
      <Card className="w-full max-w-2xl p-4">
        <CardHeader>
          <Label htmlFor="entryText">New Entry</Label>
        </CardHeader>
        <CardContent>
          <Textarea
            id="entryText"
            placeholder="Write about your day..."
            value={entryText}
            onChange={(e) => setEntryText(e.target.value)}
            className="mb-2"
          />
        </CardContent>
        <CardFooter className="justify-end">
          <Button onClick={handleSaveEntry} className="bg-accent text-accent-foreground">
            Save Entry
          </Button>
        </CardFooter>
      </Card>

      <div className="w-full max-w-2xl mt-6">
        <h2 className="text-2xl font-semibold mb-3 text-primary">
          Recent Entries
        </h2>
        <ScrollArea className="rounded-md border h-[400px] w-full">
          <div className="flex flex-col gap-4 p-4">
            {journalEntries.map((entry) => (
              <Card key={entry.id} className="mb-4 shadow-md rounded-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <p className="text-sm text-muted-foreground">{entry.timestamp}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-800">{entry.text}</p>
                  {entry.sentimentSummary && (
                    <div className="mt-2">
                      <Label className="text-sm text-muted-foreground">
                        Sentiment Summary:
                      </Label>
                      <p className="text-gray-700">{entry.sentimentSummary}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {journalEntries.length === 0 && (
              <p className="text-muted-foreground">No entries yet. Start writing!</p>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
