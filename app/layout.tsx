import type { Metadata } from 'next';
import './globals.css';
import LoadingScreen from './components/LoadingScreen';
import SmoothScroll from './components/SmoothScroll';
import PageTransition from './components/PageTransition';
import FloatingSocial from './components/FloatingSocial';

export const metadata: Metadata = {
  title: 'F.QUAD — Architecture & Interior Design Studio',
  description:
    'Architecture and interior design studio based in Hyderabad, working across homes, workplaces, and hospitality spaces.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <LoadingScreen />
        <SmoothScroll>
          <PageTransition>{children}</PageTransition>
          <FloatingSocial />
        </SmoothScroll>
      </body>
    </html>
  );
}
