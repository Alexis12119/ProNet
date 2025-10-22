"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border">
          <CardHeader className="space-y-1 px-4 sm:px-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-red-100 p-3 rounded-lg">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-xl sm:text-2xl font-semibold text-red-600">
              Authentication Error
            </CardTitle>
            <CardDescription className="text-sm">
              There was a problem signing you in with GitHub. This could be due to:
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="space-y-3 text-sm text-muted-foreground mb-6">
              <ul className="list-disc list-inside space-y-1">
                <li>Invalid or expired authorization code</li>
                <li>GitHub OAuth configuration issues</li>
                <li>Network connectivity problems</li>
                <li>Browser security restrictions</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/auth/login">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Try Again
                </Link>
              </Button>

              <Button variant="outline" asChild className="w-full">
                <Link href="/auth/login">
                  Back to Login
                </Link>
              </Button>
            </div>

            <div className="mt-6 text-center text-xs text-muted-foreground">
              If this problem persists, please contact support.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}