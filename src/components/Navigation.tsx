'use client';

import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

import { toast } from '@/hooks/use-toast';

export function Navigation() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Success",
        description: "Signed out successfully!",
      });
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: "Error",
        description: "Failed to sign out.",
        variant: "destructive",
      });
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-primary-foreground"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-primary">Echo Journal</h1>
            </div>
            {/* Mobile Navigation - Always visible */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/" className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted">Daily</Link>
              <Link href="/weekly-reflection" className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted">Weekly</Link>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <a href="https://twitter.com/shadcn" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M22 4s-.7 2.1-2 3.4c1.6 1 2.8 3.5 3.2 6.1-1.2 1-2.5 2.2-3.7 3.4 1 1.4 2.1 2.8 3.1 4.3-1.4 1-2.8 2.1-4.1 3.1 1-1.4 2.1-2.8 3.1-4.3-1.2 1-2.5 2.2-3.7 3.4-1 1.4-2.1 2.8-3.1 4.3 1.4-1 2.8-2.1 4.1-3.1-1-1.4-2.1-2.8-3.1-4.3-1.2 1-2.5 2.2-3.7 3.4 1-1.4 2.1-2.8 3.1-4.3-1.4 1-2.8 2.1-4.1 3.1"></path>
                <path d="M22 4c0-1.1-.9-2-2-2h-2c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2V4z"></path>
              </svg>
            </a>
            {user && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}