import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default function AbsensiRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
