// app/layout.tsx
import { Providers } from './providers';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/footer';
import './globals.css';

export const metadata = {
  title: 'LinguaTest - Language Learning Platform',
  description: 'Learn languages with interactive exams and courses',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa">
      <body>
        <Providers>
          <Header />
          <main className="min-h-screen bg-gray-50">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}