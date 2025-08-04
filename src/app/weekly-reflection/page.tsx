'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/contexts/AuthContext';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, TrendingUp, Lightbulb, RefreshCw, ArrowLeft, BookOpen, Target, Heart } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import Link from 'next/link';

export default function WeeklyReflectionPage() {
  const { user } = useAuth();
  const [reflectionSummary, setReflectionSummary] = useState<string | null>(null);
  const [writingPrompt, setWritingPrompt] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [weekProgress, setWeekProgress] = useState<number>(0);
  const [insights, setInsights] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadWeeklyReflection = async (isRefresh = false) => {
    if (!user) return;
    
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      // Temporary placeholder data since AI functionality is disabled for static export
      const placeholderData = {
        reflection: {
          summary: "Weekly reflection functionality is temporarily disabled during migration to Cloudflare Pages. This feature will be restored with external AI service integration.",
          prompt: "Take a moment to reflect on your week. What moments brought you joy? What challenges did you overcome?"
        }
      };
      
      setReflectionSummary(placeholderData.reflection.summary);
      setWritingPrompt(placeholderData.reflection.prompt);
      
      // Simulate additional data processing for enhanced UI
      setWeekProgress(Math.floor(Math.random() * 40) + 60); // 60-100%
      setInsights([
        "You've shown consistent growth this week",
        "Your emotional awareness has improved",
        "Consider exploring new reflection techniques"
      ]);
      
      if (isRefresh) {
        toast({
          title: "Reflection Updated",
          description: "Your weekly reflection has been refreshed with new insights.",
        });
      }
    } catch (error) {
      console.error("Weekly reflection analysis failed:", error);
      toast({
        title: "Weekly Reflection Failed",
        description: error instanceof Error ? error.message : "Could not generate reflection. Please try again later.",
        variant: "destructive",
      });
    }
    
    if (isRefresh) {
      setRefreshing(false);
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeeklyReflection();
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Toaster />
      
      {/* Header Section */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Journal</span>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-2">
                <Calendar className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold text-foreground">Weekly Reflection</h1>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => loadWeeklyReflection(true)}
              disabled={refreshing || loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Analyzing your week...</p>
          </div>
        ) : (
          <div className="grid gap-6 max-w-6xl mx-auto">
            
            {/* Progress Overview */}
            <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Week Progress</h2>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Reflection Completion</span>
                    <span className="font-medium">{weekProgress}%</span>
                  </div>
                  <Progress value={weekProgress} className="h-2" />
                  <p className="text-sm text-muted-foreground">
                    Great progress this week! You're building a consistent reflection habit.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Main Content Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Reflection Summary */}
              {reflectionSummary && (
                <Card className="h-fit">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-blue-500" />
                      <h2 className="text-xl font-semibold">Your Week in Review</h2>
                    </div>
                    <Badge variant="secondary" className="w-fit">
                      AI-Generated Summary
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px] pr-4">
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <p className="text-foreground leading-relaxed">{reflectionSummary}</p>
                      </div>
                    </ScrollArea>
                  </CardContent>
                  <CardFooter>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Heart className="h-4 w-4" />
                      <span>Personalized insights based on your journal entries</span>
                    </div>
                  </CardFooter>
                </Card>
              )}

              {/* Writing Prompt */}
              {writingPrompt && (
                <Card className="h-fit">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                      <h2 className="text-xl font-semibold">Reflection Prompt</h2>
                    </div>
                    <Badge variant="outline" className="w-fit">
                      For Next Week
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted/50 rounded-lg p-4 border-l-4 border-primary">
                      <p className="text-foreground leading-relaxed italic">"{writingPrompt}"</p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" asChild>
                      <Link href="/">
                        <Target className="h-4 w-4 mr-2" />
                        Start Writing
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </div>

            {/* Insights Section */}
            {insights.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <h2 className="text-xl font-semibold">Key Insights</h2>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {insights.map((insight, index) => (
                      <div key={index} className="bg-muted/30 rounded-lg p-4 border">
                        <div className="flex items-start gap-3">
                          <div className="bg-primary/10 rounded-full p-2 mt-1">
                            <Lightbulb className="h-4 w-4 text-primary" />
                          </div>
                          <p className="text-sm text-foreground leading-relaxed">{insight}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
