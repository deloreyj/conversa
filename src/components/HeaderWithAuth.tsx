"use client";

import { UserMenu } from "./UserMenu";

export function HeaderWithAuth() {
  return (
    <div className="flex-shrink-0 p-4 pt-8">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <span>🥬</span> Alfacinha
          </h1>
          <UserMenu />
        </div>
        <div className="text-center">
          <p className="text-gray-600">
            Learn the Portuguese you need when you need it
          </p>
        </div>
      </div>
    </div>
  );
}
