'use client';

import Nav from './Nav';

export default function Page({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Nav />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
