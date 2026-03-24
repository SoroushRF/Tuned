import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-indigo-500/30 overflow-hidden relative">
      {/* Animated Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/20 rounded-full blur-[120px] animate-pulse delay-700" />
      
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-16 flex flex-col items-center text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-indigo-300 mb-8 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
          GDG UTSC AI Case Competition 2026
        </div>

        {/* Hero Section */}
        <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
          Study with <span className="text-indigo-400">Nuro</span>
        </h1>
        
        <p className="text-lg md:text-xl text-white/60 max-w-2xl mb-10 text-balance leading-relaxed">
          The adaptive study companion that builds your <span className="text-white font-medium">NeuroPrint</span>. 
          Transform academic content into personalized audio, gamified cards, or simplified text.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 mb-20">
          <Link
            href="/study"
            className="px-8 py-4 bg-white text-black font-semibold rounded-2xl hover:bg-white/90 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          >
            Start Studying
          </Link>
          <button
            className="px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold rounded-2xl hover:bg-white/10 transition-all backdrop-blur-md"
          >
            Watch Demo
          </button>
        </div>

        {/* Features Preview (Glass Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
          {[
            {
              title: "NeuroPrint Engine",
              desc: "Deep behavioral learner profiling that adapts content to your unique style.",
              icon: "🧠",
              color: "from-blue-500/20 to-indigo-500/20"
            },
            {
              title: "Adaptive Surface",
              desc: "Switch between Podcast, Sprint Cards, and Scholar text seamlessly.",
              icon: "✨",
              color: "from-indigo-500/20 to-violet-500/20"
            },
            {
              title: "Gemini Power",
              desc: "Driven by Google Gemini Flash for lightning-fast content transformation.",
              icon: "⚡",
              color: "from-violet-500/20 to-purple-500/20"
            }
          ].map((feature, i) => (
            <div 
              key={i}
              className={`p-8 rounded-3xl bg-gradient-to-br ${feature.color} border border-white/10 backdrop-blur-xl text-left hover:border-white/20 transition-all group`}
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform inline-block">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer Decoration */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}
