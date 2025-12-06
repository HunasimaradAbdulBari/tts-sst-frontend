import { WhiteboardProvider } from './context/WhiteboardContext';
import GlobalVoiceCommandListener from './hooks/useGlobalVoiceCommands';
import WhiteboardOverlay from './components/Whiteboard/WhiteboardOverlay';

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ErrorBoundary>
          <ThemeProvider>
            <LanguageProvider>
              <WhiteboardProvider>
                {/* Global voice command listener */}
                <GlobalVoiceCommandListener currentLanguage="en" />
                
                {/* Whiteboard overlay */}
                <WhiteboardOverlay />
                
                <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
                  {children}
                  <Footer />
                </div>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: '#1e293b',
                    color: '#f1f5f9',
                    border: '1px solid #334155',
                    borderRadius: '0.75rem',
                    padding: '1rem',
                  },
                  success: {
                    iconTheme: {
                      primary: '#10b981',
                      secondary: '#ffffff',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#ffffff',
                    },
                  },
                }}
              />
           </WhiteboardProvider>
            </LanguageProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}