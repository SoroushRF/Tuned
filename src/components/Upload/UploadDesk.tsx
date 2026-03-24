'use client';

import React, { useState, useRef } from 'react';
import { useAppContext } from '@/store/context';
import { transformContent } from '@/lib/gemini';
import { useRouter } from 'next/navigation';

const IconCloud = () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19a5.5 5.5 0 0 0 0-11h-1.5a7 7 0 1 0-13.5 1.5A4.5 4.5 0 0 0 7 18h10.5Z"/><path d="M12 12v6"/><path d="m9 15 3-3 3 3"/></svg>;
const IconCheck = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;

export default function UploadDesk() {
  const { state, dispatch } = useAppContext();
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const simulateProcessing = async (text: string) => {
    setIsUploading(true);
    setCurrentStatus('Extracting content streams...');
    await new Promise(r => setTimeout(r, 1500));
    
    setCurrentStatus('Calibrating to your NeuroPrint...');
    await new Promise(r => setTimeout(r, 1500));

    try {
      const output = await transformContent(text, state.neuroPrint);
      dispatch({ type: 'SET_SESSION', payload: output });
      setCurrentStatus('Success! Rerouting to Surface...');
      await new Promise(r => setTimeout(r, 1000));
      router.push('/study');
    } catch (err) {
      console.error(err);
      dispatch({ type: 'SET_ERROR', payload: 'Neural Extraction failed. Check API key.' });
      setIsUploading(false);
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (re) => {
        const text = re.target?.result as string;
        simulateProcessing(text);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-12 animate-fade-in-up duration-1000">
      <div className="w-full max-w-2xl flex flex-col items-center gap-12 text-center">
        <div className="space-y-4">
           <h2 className="text-4xl font-black tracking-tightest uppercase">Upload Workspace</h2>
           <p className="text-muted-foreground font-bold text-lg opacity-60 uppercase tracking-widest leading-relaxed">
             Drop your syllabus, notes, or deep-text material to calibrate your session.
           </p>
        </div>

        {!isUploading ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full group relative cursor-pointer"
          >
            <div className="absolute inset-x-0 -bottom-3 inset-y-0 bg-primary/20 rounded-[4rem] blur-3xl opacity-0 group-hover:opacity-60 transition-opacity" />
            <div className="w-full aspect-[4/3] rounded-[4rem] border-4 border-dashed border-border/60 bg-secondary/30 flex flex-col items-center justify-center gap-10 hover:border-primary/40 hover:bg-card transition-all duration-700 relative z-10 shadow-2xl overflow-hidden group/desk">
               <div className="w-24 h-24 rounded-[2.5rem] bg-card border border-border flex items-center justify-center text-primary shadow-inner group-hover/desk:rotate-12 transition-transform duration-700">
                  <IconCloud />
               </div>
               <div className="space-y-3">
                  <p className="text-2xl font-black uppercase tracking-tightest">Drag & Drop Documents</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Supported: .TXT, .MD, .JSON</p>
               </div>
               <input 
                 type="file" 
                 ref={fileInputRef} 
                 onChange={handleFile} 
                 className="hidden" 
                 accept=".txt,.md,.json" 
               />
            </div>
          </div>
        ) : (
          <div className="w-full aspect-[4/3] rounded-[4rem] bg-foreground text-background flex flex-col items-center justify-center gap-12 p-16 animate-in zoom-in-95 duration-700 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]">
             <div className="relative">
                <div className="w-24 h-24 rounded-[2.5rem] bg-primary/20 flex items-center justify-center text-4xl animate-bounce">
                  ✨
                </div>
                <div className="absolute inset-0 border-4 border-primary/40 rounded-[2.5rem] animate-ping" />
             </div>
             
             <div className="space-y-4">
                <p className="text-3xl font-black tracking-tightest uppercase animate-pulse">{currentStatus}</p>
                <div className="h-1 w-64 bg-background/20 rounded-full overflow-hidden mx-auto p-[1px]">
                   <div className="h-full bg-primary rounded-full animate-marquee" />
                </div>
             </div>

             <div className="grid grid-cols-1 gap-3 opacity-40">
                <p className="text-[9px] font-black uppercase tracking-[0.4em]">Multimodal Synthesis Path</p>
                <p className="text-[9px] font-black uppercase tracking-[0.4em]">Neural Vector Mapping</p>
             </div>
          </div>
        )}

        <div className="flex justify-center flex-wrap gap-8 opacity-20 py-10 border-t border-border/10">
           {['Syncing Core', 'Gemini Pipeline', 'Core Logic'].map((l, i) => (
             <span key={i} className="text-[10px] font-black uppercase tracking-[0.4em]">{l}</span>
           ))}
        </div>
      </div>
    </div>
  );
}
