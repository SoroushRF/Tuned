import { Patrick_Hand } from 'next/font/google';
import Link from 'next/link';

const IconArrowRight = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>;

const handwriting = Patrick_Hand({
  subsets: ['latin'],
  weight: ['400'],
});

export default function Home() {
  return (
    <main className="min-h-screen relative p-8 md:p-12 overflow-hidden bg-background">
      {/* Background Mesh */}
      <div className="absolute inset-0 z-0 opacity-50">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/10 blur-[140px] rounded-full animate-float" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[140px] rounded-full animate-float-delayed" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-8 left-8 right-8 z-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-foreground text-background flex items-center justify-center text-xl shadow-premium">✨</div>
          <span className="text-xl font-bold tracking-tighter">Tuned</span>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Dark mode toggle removed */}
        </div>
      </nav>

      <section className="relative z-10 w-full max-w-6xl mx-auto pt-24 min-h-[calc(100vh-160px)] flex items-center animate-fade-in-up">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-24 items-center">
          {/* Left hero */}
          <div className="md:col-span-7 space-y-10 text-left">
            <h1 className="text-[14vw] md:text-[160px] font-[1000] tracking-tightest leading-[0.8] text-foreground select-none">
              Tuned
            </h1>

            <div className="space-y-6 max-w-2xl">
              <p
                className={`${handwriting.className} text-3xl md:text-5xl font-semibold tracking-tight text-foreground/88 lg:leading-[1.05] selection:bg-primary/15`}
              >
                Study smarter.
                <br className="hidden md:block" />
                Stay Tuned.
              </p>

              <p className="text-lg md:text-xl font-medium text-muted-foreground/70 leading-relaxed tracking-tight max-w-xl italic">
                One place to focus, learn, and move faster.
              </p>
            </div>
          </div>

          {/* Right CTA */}
          <div className="md:col-span-5 flex justify-end">
            <div className="flex flex-col items-start gap-10">
              <Link
                href="/onboarding"
                className="group w-full md:w-[340px] py-7 px-10 rounded-2xl bg-foreground text-background font-bold text-xl shadow-[0_12px_24px_rgba(0,0,0,0.08)] hover:shadow-[0_16px_28px_rgba(0,0,0,0.12)] active:translate-y-[1px] transition-all flex items-center justify-center gap-4 relative overflow-hidden"
              >
                <span className="relative z-10">Get Started</span>
                <div className="relative z-10">
                  <IconArrowRight />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Decorative Blobs */}
      <div className="fixed bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/3 blur-[100px] rounded-full pointer-events-none" />
      <div className="fixed top-[20%] right-[-5%] w-[30%] h-[30%] bg-primary/6 blur-[100px] rounded-full pointer-events-none" />
    </main>
  );
}
