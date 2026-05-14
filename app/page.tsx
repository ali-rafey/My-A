import Home from '@/sections/home/Home';

// Revalidate hourly — kept for parity with the previous multi-section page.
export const revalidate = 3600;

export default function HomePage() {
  return <Home />;
}
