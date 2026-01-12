
import React, { useState, useCallback } from 'react';
import FileUpload from './components/FileUpload';
import TransactionTable from './components/TransactionTable';
import { extractStatementData } from './services/geminiService';
import { Transaction, AppStatus, OCRResult } from './types';
import { downloadCSV } from './utils/csvHelper';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [result, setResult] = useState<OCRResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    setError(null);
    setResult(null);
    setStatus(AppStatus.PROCESSING);
    
    // Create preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result?.toString().split(',')[1];
        if (!base64Data) {
          throw new Error("Failed to read file data");
        }

        try {
          const extracted = await extractStatementData(base64Data, file.type);
          setResult(extracted);
          setStatus(AppStatus.SUCCESS);
        } catch (err: any) {
          console.error(err);
          setError(err.message || "Failed to extract data. Please check your image clarity and try again.");
          setStatus(AppStatus.ERROR);
        }
      };
      reader.onerror = () => {
        setError("File reading failed.");
        setStatus(AppStatus.ERROR);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
      setStatus(AppStatus.ERROR);
    }
  }, []);

  const handleUpdateTransaction = (index: number, updated: Transaction) => {
    if (!result) return;
    const newTransactions = [...result.transactions];
    newTransactions[index] = updated;
    setResult({
      ...result,
      transactions: newTransactions
    });
  };

  const handleExport = () => {
    if (result?.transactions) {
      const filename = `statement_${result.bankName?.replace(/\s+/g, '_') || 'export'}_${new Date().toISOString().slice(0, 10)}.csv`;
      downloadCSV(result.transactions, filename);
    }
  };

  return (
    <div className="min-h-screen pb-20 text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl">
              <i className="fa-solid fa-money-bill-transfer"></i>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">StatementScanner <span className="text-blue-600">Pro</span></h1>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-500">
            <span className="hover:text-blue-600 cursor-pointer transition-colors">Docs</span>
            <span className="hover:text-blue-600 cursor-pointer transition-colors">Security</span>
            <div className="h-4 w-px bg-slate-200"></div>
            <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded uppercase font-bold tracking-tighter">Powered by Gemini 3</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Input & Info */}
          <div className="lg:col-span-5 space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Automate Bank Statement Entry</h2>
              <p className="text-slate-500 mb-8">
                Upload scans or photos of your financial statements. Our AI detects banks, dates, and every single transaction automatically.
              </p>
              
              <FileUpload 
                onFileSelect={handleFileSelect} 
                isLoading={status === AppStatus.PROCESSING} 
              />
            </section>

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <i className="fa-solid fa-circle-exclamation text-rose-500 mt-1"></i>
                <div>
                  <h4 className="font-bold text-rose-800 text-sm">Extraction Error</h4>
                  <p className="text-rose-700 text-sm">{error}</p>
                </div>
              </div>
            )}

            {previewUrl && (
              <div className="mt-8">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Source Preview</h4>
                <div className="rounded-xl overflow-hidden border border-slate-200 shadow-lg bg-white relative group">
                  <img 
                    src={previewUrl} 
                    alt="Statement Preview" 
                    className="w-full h-auto max-h-[400px] object-contain"
                  />
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <span className="px-3 py-1 bg-white/90 rounded-full text-xs font-bold text-slate-700 shadow-sm">Previewing Document</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-7">
            {status === AppStatus.IDLE && (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-200 rounded-3xl p-10">
                <i className="fa-solid fa-table-list text-6xl mb-4"></i>
                <p className="text-lg font-medium">Ready to parse your statement</p>
                <p className="text-sm text-center mt-2 max-w-xs">Once you upload a file, the structured transaction list will appear here.</p>
              </div>
            )}

            {status === AppStatus.PROCESSING && (
              <div className="space-y-4">
                <div className="h-12 bg-slate-200 animate-pulse rounded-lg w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-slate-100 animate-pulse rounded w-full"></div>
                  <div className="h-4 bg-slate-100 animate-pulse rounded w-full"></div>
                  <div className="h-4 bg-slate-100 animate-pulse rounded w-5/6"></div>
                </div>
                <div className="h-64 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <i className="fa-solid fa-brain text-blue-500 text-4xl mb-3 animate-bounce"></i>
                    <p className="text-slate-600 font-medium">Gemini is analyzing visual layout...</p>
                  </div>
                </div>
              </div>
            )}

            {status === AppStatus.SUCCESS && result && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-md">
                    <p className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-1">Detected Institution</p>
                    <h3 className="text-2xl font-bold truncate">{result.bankName || "Unknown Bank"}</h3>
                  </div>
                  <div className="bg-slate-800 rounded-2xl p-6 text-white shadow-md">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Statement Period</p>
                    <h3 className="text-2xl font-bold truncate">{result.period || "N/A"}</h3>
                  </div>
                </div>

                <TransactionTable 
                  transactions={result.transactions} 
                  onExport={handleExport}
                  onUpdateTransaction={handleUpdateTransaction}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Persistent CTA / Status Footer */}
      {status === AppStatus.SUCCESS && result && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur shadow-2xl border border-slate-200 px-6 py-4 rounded-full flex items-center gap-8 animate-in slide-in-from-bottom-8 duration-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <i className="fa-solid fa-check"></i>
            </div>
            <span className="font-semibold text-slate-800">{result.transactions.length} Transactions Found</span>
          </div>
          <button
            onClick={handleExport}
            className="px-6 py-2 bg-slate-900 text-white rounded-full font-bold hover:bg-black transition-all shadow-md active:scale-95 flex items-center gap-2"
          >
            <i className="fa-solid fa-download"></i>
            Download CSV
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
