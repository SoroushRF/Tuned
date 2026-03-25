'use client';

import React, { useState, useRef, useMemo } from 'react';
import { useAppContext } from '@/store/context';
import { transformContent } from '@/lib/gemini';
import { useRouter } from 'next/navigation';
import * as mammoth from 'mammoth';

// PDF.js worker setup is usually done in a separate file or via CDN in Next.js
// For the sake of the demo, we assume pdfjs is available or shimmed in simple terms
// Real-world: window.pdfjsLib.getDocument(...)

interface UploadItem {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'image' | 'audio' | 'text' | 'link';
  size: number; // bytes
  content: string; // extracted text or base64 data
  status: 'pending' | 'processing' | 'success' | 'error';
}

const IconLink = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
const IconFile = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>;
const IconX = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>;
const IconZap = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;

export default function UploadDesk() {
  const { state, dispatch } = useAppContext();
  const router = useRouter();
  const [items, setItems] = useState<UploadItem[]>([]);
  const [urlInput, setUrlInput] = useState('');
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
    link: { size: 0, count: 5 } // link count
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
      status: 'pending'
    };

    setItems(prev => [...prev, newItem]);
    setErrorMessage(null);

    // Extraction Logic
    try {
      if (type === 'docx') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        updateItemContent(newItem.id, result.value, 'success');
      } else if (type === 'pdf') {
        // Simple mock for pdf.js integration - in production use getDocument
        const reader = new FileReader();
        reader.onload = (e) => updateItemContent(newItem.id, "[PDF Content Extracted: " + file.name + "]", 'success');
        reader.readAsText(file);
      } else if (type === 'image' || type === 'audio') {
        // Base64 storage for visual/audio parts
        const reader = new FileReader();
        reader.onload = (e) => updateItemContent(newItem.id, e.target?.result as string, 'success');
        reader.readAsDataURL(file);
      } else {
        const text = await file.text();
        updateItemContent(newItem.id, text, 'success');
      }
    } catch (err) {
      updateItemContent(newItem.id, '', 'error');
    }
  };

  const addLink = async () => {
    if (!urlInput) return;
    const existingCount = items.filter(i => i.type === 'link').length;
    if (existingCount >= TYPE_LIMITS.link.count) {
      setErrorMessage("Max 5 links per session.");
      return;
    }

    const id = Math.random().toString(36).substring(7);
    const newItem: UploadItem = { id, name: urlInput, type: 'link', size: 0, content: '', status: 'processing' };
    setItems(prev => [...prev, newItem]);
    setUrlInput('');

    try {
      const res = await fetch('/api/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      updateItemContent(id, data.text, 'success');
    } catch (err: any) {
      updateItemContent(id, '', 'error');
      setErrorMessage(err.message || "Failed to fetch link.");
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
      .filter(i => i.status === 'success' && (i.type === 'text' || i.type === 'link' || i.type === 'pdf' || i.type === 'docx'))
      .map(i => `[Source: ${i.name}]\n${i.content}`)
      .join('\n\n');

    try {
      const result = await transformContent(combinedText, state.neuroPrint);
      dispatch({ type: 'SET_SESSION', payload: result });
      router.push('/study');
    } catch (err) {
      setErrorMessage("Failed to synthesize material. Possible API limit.");
      setIsProcessingAll(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col pt-0 px-12 pb-12 animate-fade-in-up duration-1000 max-w-7xl mx-auto">
      <div className="mb-8 space-y-4">
         <h2 className="text-4xl font-black tracking-tightest uppercase">Upload Workspace</h2>
         <p className="text-muted-foreground font-bold text-lg opacity-40 uppercase tracking-widest leading-relaxed">
           Bring your multi-modal context to life.
         </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 flex-1 min-h-0">
         {/* Input Section */}
         <div className="space-y-12">
            {/* Drag Area */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="group relative cursor-pointer"
            >
               <div className="w-full h-80 rounded-[4rem] border-4 border-dashed border-border/60 bg-secondary/30 flex flex-col items-center justify-center gap-10 hover:border-primary/40 hover:bg-card transition-all duration-700 relative z-10 shadow-2xl overflow-hidden group/desk"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const files = Array.from(e.dataTransfer.files);
                    files.forEach(addFile);
                  }}
               >
                  <div className="w-20 h-20 rounded-[2rem] bg-card border border-border flex items-center justify-center text-primary shadow-inner group-hover/desk:rotate-12 transition-transform duration-700">
                     <IconFile />
                  </div>
                  <div className="text-center">
                     <p className="text-2xl font-black tracking-tightest">Drop Materials</p>
                     <p className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 mt-3">PDF, DOCX, IMAGES, AUDIO</p>
                  </div>
                  <input type="file" ref={fileInputRef} onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    files.forEach(addFile);
                  }} className="hidden" multiple />
               </div>
            </div>

            {/* Quick Inputs */}
            <div className="grid grid-cols-1 gap-6">
               <div className="flex gap-4 p-2 bg-secondary/40 rounded-[2.5rem] border border-border/60 shadow-inner group">
                  <input 
                    type="text" 
                    placeholder="Drop external link (https://...)" 
                    className="flex-1 bg-transparent px-8 py-4 outline-none text-foreground font-bold placeholder:text-muted-foreground/30"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addLink()}
                  />
                  <button onClick={addLink} className="p-4 rounded-[2rem] bg-foreground text-background hover:bg-primary hover:text-white transition-all">
                     <IconLink />
                  </button>
               </div>
               
               <div className="p-8 rounded-[3.5rem] bg-secondary/30 border border-border/60 flex flex-col gap-6">
                  <textarea 
                    placeholder="Paste rapid notes or deep context here..." 
                    className="w-full h-32 bg-transparent outline-none resize-none text-foreground font-medium text-lg placeholder:text-muted-foreground/30"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                  />
                  <button onClick={addPastedText} className="self-end px-10 py-5 bg-foreground text-background rounded-full font-black text-[10px] tracking-widest hover:scale-105 active:scale-95 transition-all outline-none">
                     Add Note
                  </button>
               </div>
            </div>
         </div>

         {/* Shelf & Summary Section */}
         <div className="flex flex-col gap-10">
            <div className="flex-1 rounded-[4rem] bg-card/40 border border-border/60 p-12 flex flex-col gap-8 shadow-2xl relative min-h-[400px]">
               <div className="flex justify-between items-center">
                  <h3 className="text-[10px] font-black tracking-[0.4em] text-muted-foreground/30 uppercase">Current Inventory</h3>
                  <span className="text-[10px] font-black text-primary">{items.length} Items</span>
               </div>

               <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
                  {items.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 text-center gap-6">
                       <p className="text-sm font-bold">Your shelf is empty.</p>
                       <p className="text-[10px] font-black tracking-[0.2em]">Add files to begin.</p>
                    </div>
                  ) : (
                    items.map((item) => (
                      <div key={item.id} className="group flex items-center justify-between p-6 rounded-[2.5rem] bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-all animate-in slide-in-from-right-8 duration-500">
                        <div className="flex items-center gap-6">
                           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-lg ${
                              item.status === 'processing' ? 'animate-pulse bg-primary/20 text-primary' :
                              item.status === 'error' ? 'bg-red-500/20 text-red-500' : 'bg-card text-foreground'
                           }`}>
                              {item.type === 'pdf' ? '📄' : item.type === 'docx' ? '📘' : item.type === 'image' ? '🖼️' : item.type === 'audio' ? '🔊' : item.type === 'link' ? '🔗' : '📝'}
                           </div>
                           <div className="space-y-1">
                              <p className="text-sm font-black tracking-tight max-w-[200px] truncate">{item.name}</p>
                              <p className="text-[9px] font-bold text-muted-foreground/40">{item.status === 'processing' ? 'Syncing...' : (item.size / 1024).toFixed(0) + 'KB'}</p>
                           </div>
                        </div>
                        <button onClick={() => removeItem(item.id)} className="p-3 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">
                           <IconX />
                        </button>
                      </div>
                    ))
                  )}
               </div>

               <div className="pt-8 border-t border-border/30 space-y-5">
                  <div className="flex justify-between text-[10px] font-black tracking-widest">
                     <span className="text-muted-foreground/40">SESSION USAGE</span>
                     <span className={usagePercentage > 90 ? 'text-red-500' : 'text-primary'}>
                        {(currentUsageBytes / (1024 * 1024)).toFixed(1)}MB / {SESSION_LIMIT_MB}MB
                     </span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden p-[1px] shadow-inner">
                     <div 
                       className={`h-full rounded-full transition-all duration-1000 ${usagePercentage > 90 ? 'bg-red-500' : 'bg-primary'}`} 
                       style={{ width: `${usagePercentage}%` }}
                     />
                  </div>
               </div>
            </div>

            {errorMessage && (
              <div className="p-6 rounded-[2rem] bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold animate-in shake duration-500">
                {errorMessage}
              </div>
            )}

            <button 
              disabled={isProcessingAll || items.filter(i => i.status === 'success').length === 0}
              onClick={processAll}
              className={`group w-full py-5 rounded-[2.5rem] font-black text-xs tracking-[0.3em] flex items-center justify-center gap-6 transition-all relative overflow-hidden ${
                isProcessingAll ? 'bg-secondary text-muted-foreground cursor-not-allowed' : 'bg-foreground text-background hover:scale-[1.02] shadow-premium uppercase'
              }`}
            >
               {isProcessingAll ? (
                 <>
                   <div className="w-6 h-6 border-4 border-muted-foreground border-t-transparent rounded-full animate-spin" />
                   Neural Processing Active...
                 </>
               ) : (
                 <>
                    Process Matrix
                    <div className="group-hover:translate-x-2 transition-transform duration-500">
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
