'use client';

import React, { useState, useRef, useMemo } from 'react';
import { useAppContext } from '@/store/context';
import { transformContentWithPdf } from '@/lib/gemini';
import { useRouter } from 'next/navigation';
import * as mammoth from 'mammoth';

interface UploadItem {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'image' | 'audio' | 'text';
  size: number; // bytes
  content: string; // extracted text or base64 data
  file?: File; // raw file for direct Gemini upload
  status: 'pending' | 'processing' | 'success' | 'error';
}

const IconFile = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>;
const IconX = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>;
const IconZap = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;

export default function UploadDesk() {
  const { state, dispatch } = useAppContext();
  const router = useRouter();
  const [items, setItems] = useState<UploadItem[]>([]);
  const [textInput, setTextInput] = useState('');
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Constants per PRD
  const SESSION_LIMIT_MB = 100;
  const TYPE_LIMITS = {
    pdf: { size: 20 * 1024 * 1024, count: 3 },
    docx: { size: 10 * 1024 * 1024, count: 3 },
    image: { size: 10 * 1024 * 1024, count: 5 },
    audio: { size: 25 * 1024 * 1024, count: 2 },
    text: { size: 50000, count: 10 }, // character limit
  };

  const currentUsageBytes = useMemo(() => items.reduce((acc, i) => acc + i.size, 0), [items]);
  const usagePercentage = Math.min((currentUsageBytes / (SESSION_LIMIT_MB * 1024 * 1024)) * 100, 100);

  const addFile = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    let type: UploadItem['type'] = 'text';
    
    if (ext === 'pdf') type = 'pdf';
    else if (ext === 'docx') type = 'docx';
    else if (['jpg', 'jpeg', 'png'].includes(ext || '')) type = 'image';
    else if (['mp3', 'wav', 'm4a'].includes(ext || '')) type = 'audio';
    
    // Check limits
    const existingCount = items.filter(i => i.type === type).length;
    if (existingCount >= TYPE_LIMITS[type].count) {
      setErrorMessage(`Max ${TYPE_LIMITS[type].count} ${type.toUpperCase()} files allowed.`);
      return;
    }
    if (file.size > TYPE_LIMITS[type].size) {
      setErrorMessage(`${file.name} is too large. Max ${TYPE_LIMITS[type].size / (1024 * 1024)}MB.`);
      return;
    }
    if (currentUsageBytes + file.size > SESSION_LIMIT_MB * 1024 * 1024) {
      setErrorMessage("Session limit reached (100MB).");
      return;
    }

    const newItem: UploadItem = {
      id: Math.random().toString(36).substring(7),
      name: file.name,
      type,
      size: file.size,
      content: '', // Extract after
      file: (type === 'pdf' || type === 'image' || type === 'audio') ? file : undefined,
      status: 'pending'
    };

    setItems(prev => [...prev, newItem]);
    setErrorMessage(null);

    // Extraction Logic
    try {
      if (type === 'pdf') {
        // Keep the raw PDF intact so Gemini can read text + images directly.
        updateItemContent(newItem.id, '', 'success');
      } else if (type === 'docx') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        updateItemContent(newItem.id, result.value, 'success');
      } else if (type === 'image' || type === 'audio') {
        const reader = new FileReader();
        reader.onload = (e) => updateItemContent(newItem.id, e.target?.result as string, 'success');
        reader.readAsDataURL(file);
      } else {
        const text = await file.text();
        updateItemContent(newItem.id, text, 'success');
      }
    } catch (err) {
      console.error("Extraction Failed:", err);
      updateItemContent(newItem.id, '', 'error');
    }
  };

  const addPastedText = () => {
    if (!textInput || textInput.length < 10) return;
    if (textInput.length > TYPE_LIMITS.text.size) {
      setErrorMessage("Pasted text exceeds 50,000 characters.");
      return;
    }

    const id = Math.random().toString(36).substring(7);
    setItems(prev => [...prev, {
      id,
      name: "Pasted Context",
      type: 'text',
      size: textInput.length,
      content: textInput,
      status: 'success'
    }]);
    setTextInput('');
  };

  const updateItemContent = (id: string, content: string, status: UploadItem['status']) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, content, status } : item));
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const processAll = async () => {
    if (items.filter(i => i.status === 'success').length === 0) return;
    
    setIsProcessingAll(true);
    setErrorMessage(null);

    // Roll up all success content
    const combinedText = items
      .filter(i => i.status === 'success' && (i.type === 'text' || i.type === 'docx'))
      .map(i => `[Source: ${i.name}]\n${i.content}`)
      .join('\n\n');

    const pdfFiles = items
      .filter(i => i.status === 'success' && i.type === 'pdf' && i.file)
      .map(i => i.file as File);

    const imageFiles = items
      .filter(i => i.status === 'success' && i.type === 'image' && i.file)
      .map(i => i.file as File);

    const audioFiles = items
      .filter(i => i.status === 'success' && i.type === 'audio' && i.file)
      .map(i => i.file as File);

    // Audio support is not wired into the Gemini JSON pipeline yet.
    // Reject early with a clear message instead of silently doing nothing.
    if (audioFiles.length > 0) {
      setErrorMessage("Audio uploads are not supported in this version. Please provide a text transcript instead.");
      setIsProcessingAll(false);
      return;
    }

    try {
      const result = await transformContentWithPdf(combinedText, state.neuroPrint, pdfFiles, imageFiles);
      dispatch({ type: 'SET_SESSION', payload: result });
      router.push('/study');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to synthesize material. Possible API limit.";
      setErrorMessage(message);
      setIsProcessingAll(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col pt-0 px-8 pb-8 animate-fade-in-up duration-1000 max-w-7xl mx-auto">
      <div className="mb-10 space-y-3">
         <h2 className="text-[10px] font-black tracking-[0.4em] text-primary/60 uppercase">System Launchpad</h2>
         <h1 className="text-4xl md:text-5xl font-[1000] tracking-tightest leading-none">
            Upload Workspace
         </h1>
         <p className="text-muted-foreground font-medium text-lg leading-relaxed tracking-tight max-w-2xl opacity-60">
            Feed the neural engine with your multi-modal context to synthesize an adaptive study surface.
         </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 flex-1 min-h-0">
         {/* Input Section */}
         <div className="lg:col-span-7 space-y-10">
            {/* Drag Area */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="group relative cursor-pointer"
            >
               <div className="w-full h-72 rounded-3xl border-2 border-dashed border-border/40 bg-secondary/10 flex flex-col items-center justify-center gap-8 hover:border-primary/40 hover:bg-card transition-all duration-700 relative z-10 shadow-sm overflow-hidden group/desk"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const files = Array.from(e.dataTransfer.files);
                    files.forEach(addFile);
                  }}
               >
                  <div className="w-16 h-16 rounded-2xl bg-card border border-border/40 flex items-center justify-center text-primary/60 shadow-sm group-hover/desk:scale-110 group-hover/desk:rotate-6 transition-transform duration-700">
                     <IconFile />
                  </div>
                  <div className="text-center">
                     <p className="text-xl font-bold tracking-tight">Drop Materials</p>
                     <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/30 mt-3">PDF, DOCX, IMAGES, AUDIO</p>
                  </div>
                  <input type="file" ref={fileInputRef} onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    files.forEach(addFile);
                  }} className="hidden" multiple />
                  
                  {/* Subtle Grain Overlay */}
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
               </div>
            </div>

            {/* Quick Inputs */}
            <div className="space-y-6">
               <div className="p-6 rounded-[2rem] bg-secondary/10 border border-border/20 flex flex-col gap-4 shadow-sm">
                  <textarea 
                    placeholder="Paste rapid notes or deep context context here..." 
                    className="w-full h-32 bg-transparent outline-none resize-none text-foreground font-medium text-md placeholder:text-muted-foreground/20 custom-scrollbar"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em]">Contextual Note</span>
                    <button onClick={addPastedText} className="px-8 py-3 bg-foreground text-background rounded-xl font-bold text-[10px] tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg">
                       Add to Stack
                    </button>
                  </div>
               </div>
            </div>
         </div>

         {/* Shelf & Summary Section */}
         <div className="lg:col-span-5 flex flex-col gap-8">
            <div className="flex-1 rounded-[2.5rem] bg-card/10 border border-border/20 p-10 flex flex-col gap-8 shadow-sm relative min-h-[400px] glass-silk">
               <div className="flex justify-between items-center">
                  <h3 className="text-[10px] font-black tracking-[0.4em] text-primary/40 uppercase">Inventory Cache</h3>
                  <div className="px-3 py-1 rounded-full bg-primary/10 text-[9px] font-bold text-primary tracking-widest uppercase">
                    {items.length} Units
                  </div>
               </div>

               <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                  {items.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-30 text-center gap-4">
                       <div className="w-12 h-12 rounded-full border border-dashed border-muted-foreground/40 flex items-center justify-center text-xl">🛒</div>
                       <p className="text-[10px] font-bold tracking-[0.2em] uppercase">Empty Stack</p>
                    </div>
                  ) : (
                    items.map((item) => (
                      <div key={item.id} className="group flex items-center justify-between p-4 rounded-2xl bg-secondary/10 border border-border/10 hover:border-primary/20 hover:bg-secondary/20 transition-all animate-in slide-in-from-right-4">
                        <div className="flex items-center gap-4">
                           <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm ${
                              item.status === 'processing' ? 'animate-pulse bg-primary/20 text-primary' :
                              item.status === 'error' ? 'bg-red-500/20 text-red-500' : 'bg-card text-foreground/60'
                           }`}>
                              {item.type === 'pdf' ? '📄' : item.type === 'docx' ? '📘' : item.type === 'image' ? '🖼️' : item.type === 'audio' ? '🔊' : '📝'}
                           </div>
                           <div className="space-y-0.5">
                              <p className="text-xs font-bold tracking-tight max-w-[160px] truncate">{item.name}</p>
                              <p className="text-[9px] font-medium text-muted-foreground/30 uppercase tracking-tighter">
                                {item.status === 'processing' ? 'Syncing...' : (item.size / 1024).toFixed(0) + 'KB'}
                              </p>
                           </div>
                        </div>
                        <button onClick={() => removeItem(item.id)} className="p-2 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">
                           <IconX />
                        </button>
                      </div>
                    ))
                  )}
               </div>

               <div className="pt-8 border-t border-border/10 space-y-4">
                  <div className="flex justify-between text-[9px] font-bold tracking-[0.2em] text-muted-foreground/40 uppercase">
                     <span>Load Intensity</span>
                     <span className={usagePercentage > 90 ? 'text-red-500' : 'text-primary'}>
                        {usagePercentage.toFixed(1)}% Capacity
                     </span>
                  </div>
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden p-[1px]">
                     <div 
                       className={`h-full rounded-full transition-all duration-1000 ${usagePercentage > 90 ? 'bg-red-500' : 'bg-primary'}`} 
                       style={{ width: `${usagePercentage}%` }}
                     />
                  </div>
               </div>
            </div>

            {errorMessage && (
              <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/10 text-red-500 text-[10px] font-bold tracking-tight animate-in shake">
                {errorMessage}
              </div>
            )}

            <button 
              disabled={isProcessingAll || items.filter(i => i.status === 'success').length === 0}
              onClick={processAll}
              className={`group w-full py-5 rounded-2xl font-bold text-[10px] tracking-[0.4em] flex items-center justify-center gap-6 transition-all relative overflow-hidden ${
                isProcessingAll
                  ? 'bg-primary/10 text-primary border border-primary/15 cursor-not-allowed animate-pulse'
                  : 'bg-foreground text-background hover:scale-[1.02] shadow-xl uppercase'
              }`}
            >
               {isProcessingAll ? (
                 <>
                   <div className="w-5 h-5 border-3 border-primary/35 border-t-primary rounded-full animate-spin" />
                   <span className="inline-flex items-center gap-2 tracking-[0.2em]">
                     Synthesizing Matrix
                     <span className="inline-flex items-center gap-0.5" aria-hidden>
                       <span className="text-primary/80 animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                       <span className="text-primary/80 animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                       <span className="text-primary/80 animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                     </span>
                   </span>
                 </>
               ) : (
                 <>
                    Process Matrix
                    <div className="group-hover:translate-x-1.5 group-hover:-translate-y-0.5 transition-transform duration-500">
                       <IconZap />
                    </div>
                 </>
               )}
            </button>
         </div>
      </div>
    </div>
  );
}
