"use client";

import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

export default function AppBar() {
  return (
    <div className="flex justify-between items-center p-4">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">DePin Uptime</h1>
      </div>
      <div className="flex items-center gap-2">
        <SignedOut>
          <SignInButton />
          <SignUpButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </div>
  );
}

