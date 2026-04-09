import './globals.css';
import AnalysisProvider from '../components/analysis-provider';
import SiteNav from '../components/site-nav';

export const metadata = {
  title: 'OCC Honor Society Checker',
  description: 'Upload a text-based transcript PDF and see which honor societies you currently qualify for.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AnalysisProvider>
          <div className="site-root">
            <SiteNav />
            <div className="site-main">{children}</div>
          </div>
        </AnalysisProvider>
      </body>
    </html>
  );
}
