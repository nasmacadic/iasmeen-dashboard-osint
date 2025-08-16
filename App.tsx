import React, { useState, useCallback } from 'react';
import { TargetType, AnalysisResult, BedaData, FiraData } from './types';
import { getWhoisInfo, getNetworkInfo, getEmailInfo, getFiraAnalysis } from './services/geminiService';
import { useLocalization } from './hooks/useLocalization';
import { LanguageIcon, ExportIcon, NewSearchIcon } from './components/icons';
import DashboardControls from './components/DashboardControls';
import ResultsPanel from './components/ResultsPanel';

// @ts-ignore - jspdf is loaded from CDN
const { jsPDF } = window.jspdf;

const App: React.FC = () => {
  const { t, language, setLanguage } = useLocalization();
  const [targetType, setTargetType] = useState<TargetType>(TargetType.DOMAIN);
  const [inputValue, setInputValue] = useState<string>('');
  const [result, setResult] = useState<AnalysisResult>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [firaResult, setFiraResult] = useState<FiraData | null>(null);
  const [isFiraLoading, setIsFiraLoading] = useState<boolean>(false);
  const [firaError, setFiraError] = useState<string | null>(null);

  const resetAllResults = () => {
    setResult(null);
    setError(null);
    setFiraResult(null);
    setFiraError(null);
  }

  const handleSearch = useCallback(async (input: string) => {
    setIsLoading(true);
    resetAllResults();

    try {
      if (targetType === TargetType.DOMAIN) {
        const data = await getWhoisInfo(input);
        setResult({ type: 'whois', data });
      } else if (targetType === TargetType.IP) {
        const data = await getNetworkInfo(input);
        setResult({ type: 'nay', data });
      } else if (targetType === TargetType.EMAIL) {
        const data = await getEmailInfo(input);
        setResult({ type: 'email', data });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsLoading(false);
    }
  }, [targetType]);

  const handleBedaAnalyze = (data: BedaData) => {
    setIsLoading(false);
    resetAllResults();
    setResult({ type: 'beda', data });
  };
  
  const handleFiraAnalysis = useCallback(async () => {
    if (!result || result.type === 'beda') return;

    setIsFiraLoading(true);
    setFiraError(null);
    try {
        const data = await getFiraAnalysis(result.data);
        setFiraResult(data);
    } catch(e) {
        setFiraError(e instanceof Error ? e.message : String(e));
    } finally {
        setIsFiraLoading(false);
    }
  }, [result]);

  const handleNewSearch = () => {
    resetAllResults();
    setInputValue('');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'fr' ? 'en' : 'fr');
  };

  const exportToPDF = () => {
    const resultsPanel = document.getElementById('results-panel');
    if (resultsPanel) {
      // @ts-ignore - html2canvas is loaded from CDN
      html2canvas(resultsPanel, {
        backgroundColor: null, // Transparent background
        scale: 2,
      }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;
        const imgWidth = pdfWidth - 20; // with margin
        const imgHeight = imgWidth / ratio;
        
        let height = imgHeight;
        let position = 10;

        if (imgHeight > pdfHeight - 20) {
            height = pdfHeight - 20;
        }

        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, height);
        pdf.save(`iasmeen_report_${new Date().toISOString().split('T')[0]}.pdf`);
      });
    }
  };


  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-purple-900/80 to-black text-white selection:bg-purple-500/50">
      <div 
        className="absolute inset-0 bg-fixed bg-center bg-no-repeat"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\' viewBox=\'0 0 100 100\'%3E%3Cg fill=\'%23a855f7\' fill-opacity=\'0.1\'%3E%3Crect x=\'0\' y=\'0\' width=\'1\' height=\'100\'/%3E%3Crect x=\'0\' y=\'0\' width=\'100\' height=\'1\'/%3E%3C/g%3E%3C/svg%3E")' }}
      />
      <div className="relative isolate min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center">
          <div className="text-left">
            <h1 className="text-2xl font-bold tracking-widest text-white uppercase">{t('title') as string}</h1>
            <p className="text-sm text-purple-300">{t('subtitle') as string}</p>
          </div>
          <div className="flex items-center gap-4">
            {(result || error) && !isLoading && (
               <button
                onClick={handleNewSearch}
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-white/10 text-purple-200 hover:bg-white/20 hover:text-white transition-colors duration-300"
              >
                <NewSearchIcon className="w-4 h-4" />
                {t('newSearch') as string}
              </button>
            )}
            {result && !isLoading && (
              <button
                onClick={exportToPDF}
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-white/10 text-purple-200 hover:bg-white/20 hover:text-white transition-colors duration-300"
              >
                <ExportIcon className="w-4 h-4" />
                {t('exportPDF') as string}
              </button>
            )}
            <button onClick={toggleLanguage} className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-white/10 text-purple-200 hover:bg-white/20 hover:text-white transition-colors duration-300">
              <LanguageIcon className="w-5 h-5" />
              <span>{language === 'fr' ? 'EN' : 'FR'}</span>
            </button>
          </div>
        </header>
        
        <main className="w-full flex flex-col items-center pt-24 pb-16">
          <DashboardControls
            targetType={targetType}
            setTargetType={setTargetType}
            onSearch={handleSearch}
            onBedaAnalyze={handleBedaAnalyze}
            isLoading={isLoading}
            inputValue={inputValue}
            setInputValue={setInputValue}
          />
          <ResultsPanel 
            result={result} 
            isLoading={isLoading} 
            error={error}
            firaResult={firaResult}
            isFiraLoading={isFiraLoading}
            firaError={firaError}
            onFiraAnalysis={handleFiraAnalysis}
          />
        </main>

        <footer className="absolute bottom-0 w-full text-center p-4 text-xs text-gray-500">
          {t('footer') as string}
        </footer>
      </div>
    </div>
  );
};

export default App;