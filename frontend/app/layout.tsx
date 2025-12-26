import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Retail AI Dashboard',
  description: 'Revenue & Inventory with n8n automations',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
