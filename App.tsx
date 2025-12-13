import React, { useState, useEffect } from 'react';
import { 
  Wind, 
  Watch, 
  Heart, 
  ShieldCheck, 
  Zap, 
  BarChart3, 
  CheckCircle2, 
  Menu, 
  X,
  Download,
  Play,
  Info
} from 'lucide-react';

// --- Types ---
type ViewState = 'home' | 'privacy' | 'terms';
type Technique = 'box' | 'coherent' | 'cyclic';

// --- Components ---

const LearnMoreModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [activeTab, setActiveTab] = useState<Technique>('box');

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  if (!open) return null;

  const techniques = {
    box: {
      title: "Box Breathing",
      subtitle: "Focus & Performance",
      description: "A technique used by Navy SEALs to heighten performance and concentration while suppressing the body's stress response. It follows a simple 4-part rhythm.",
      steps: ["Inhale for 4s", "Hold for 4s", "Exhale for 4s", "Hold for 4s"],
      color: "brand",
      animationClass: "animate-box",
      shapeClass: "rounded-xl"
    },
    coherent: {
      title: "Coherent Breathing",
      subtitle: "Balance & HRV",
      description: "Also known as Resonant Breathing. This rate (usually 5-6 breaths per minute) maximizes Heart Rate Variability (HRV) and balances the autonomic nervous system.",
      steps: ["Inhale for 6s", "Exhale for 6s", "Continuous flow", "No pauses"],
      color: "purple",
      animationClass: "animate-coherent",
      shapeClass: "rounded-full"
    },
    cyclic: {
      title: "Cyclic Sigh",
      subtitle: "Instant Relief",
      description: "A pattern that emphasizes a double inhale followed by a long exhale. It physically pops open collapsed alveoli in the lungs to offload CO2 efficiently.",
      steps: ["Inhale deeply", "Second short inhale", "Long exhale", "Repeat"],
      color: "blue",
      animationClass: "animate-cyclic",
      shapeClass: "rounded-full"
    }
  };

  const current = techniques[activeTab];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      <div className="relative w-full max-w-4xl bg-dark-card border border-white/10 rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden max-h-[85vh] md:max-h-[600px] animate-in fade-in zoom-in-95 duration-300">
        
        {/* Close Button Mobile */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-black/20 rounded-full md:hidden text-white/70 hover:text-white"
        >
          <X size={20} />
        </button>

        {/* Visual Side */}
        <div className="w-full md:w-1/2 bg-dark-bg/50 relative flex items-center justify-center p-12 min-h-[300px] border-b md:border-b-0 md:border-r border-white/5">
          {/* Background Glow */}
          <div className={`absolute inset-0 bg-${current.color}-500/10 transition-colors duration-500`}></div>
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-${current.color}-500/20 rounded-full blur-[60px] transition-colors duration-500`}></div>
          
          {/* Animation Container */}
          <div className="relative z-10 w-48 h-48 flex items-center justify-center">
             <div className={`w-32 h-32 bg-gradient-to-tr from-${current.color}-500 to-${current.color}-400 ${current.shapeClass} ${current.animationClass} shadow-[0_0_40px_rgba(0,0,0,0.3)] flex items-center justify-center`}>
                <span className="text-white/90 font-bold text-lg tracking-widest uppercase opacity-0 animate-pulse">Breathe</span>
             </div>
             
             {/* Circular Guides for Coherent/Cyclic */}
             {activeTab !== 'box' && (
               <div className={`absolute inset-0 border border-${current.color}-500/20 rounded-full scale-125`}></div>
             )}
             {/* Box Guides for Box */}
             {activeTab === 'box' && (
               <div className="absolute inset-[-20px] border border-brand-500/20 rounded-2xl"></div>
             )}
          </div>
        </div>

        {/* Content Side */}
        <div className="w-full md:w-1/2 flex flex-col bg-dark-card">
          {/* Tabs */}
          <div className="flex border-b border-white/5 overflow-x-auto no-scrollbar">
            {(Object.keys(techniques) as Technique[]).map((tech) => (
              <button
                key={tech}
                onClick={() => setActiveTab(tech)}
                className={`flex-1 px-4 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tech 
                    ? `text-white border-b-2 border-${techniques[tech].color}-500 bg-white/5` 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                {techniques[tech].title}
              </button>
            ))}
          </div>

          {/* Text Content */}
          <div className="flex-1 p-8 overflow-y-auto">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-${current.color}-500/10 text-${current.color}-400 text-xs font-bold uppercase tracking-wider mb-4`}>
              {current.subtitle}
            </div>
            
            <h3 className="text-3xl font-bold text-white mb-4">{current.title}</h3>
            
            <p className="text-slate-400 leading-relaxed mb-8">
              {current.description}
            </p>

            <div className="space-y-4 mb-8">
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider">The Pattern</h4>
              <div className="grid grid-cols-2 gap-3">
                {current.steps.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-dark-bg p-3 rounded-lg border border-white/5">
                    <div className={`w-6 h-6 rounded-full bg-${current.color}-500/20 text-${current.color}-400 flex items-center justify-center text-xs font-bold`}>
                      {idx + 1}
                    </div>
                    <span className="text-slate-300 text-sm">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="p-6 border-t border-white/5 bg-dark-bg/30 flex justify-between items-center">
            <span className="text-slate-500 text-sm hidden sm:inline-block">Try this in the app</span>
            <div className="flex gap-3 w-full sm:w-auto">
              <button 
                onClick={onClose}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-slate-300 font-medium hover:text-white hover:bg-white/5 transition-colors"
              >
                Close
              </button>
              <a 
                href="#download"
                onClick={onClose} 
                className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-${current.color}-600 hover:bg-${current.color}-500 text-white font-semibold transition-colors shadow-lg shadow-${current.color}-500/20 text-center`}
              >
                Start Session
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Navigation = ({ 
  currentView, 
  onChangeView 
}: { 
  currentView: ViewState; 
  onChangeView: (view: ViewState) => void 
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navClasses = `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
    isScrolled ? 'bg-dark-bg/80 backdrop-blur-md border-b border-white/5 py-4' : 'bg-transparent py-6'
  }`;

  return (
    <nav className={navClasses}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <div 
          className="flex items-center gap-2 cursor-pointer group" 
          onClick={() => onChangeView('home')}
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <Wind size={18} />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">YourBreath</span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <button 
            onClick={() => onChangeView('home')} 
            className={`text-sm font-medium transition-colors ${currentView === 'home' ? 'text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Features
          </button>
          <button 
            onClick={() => onChangeView('privacy')} 
            className={`text-sm font-medium transition-colors ${currentView === 'privacy' ? 'text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Privacy
          </button>
          <button 
            onClick={() => onChangeView('terms')} 
            className={`text-sm font-medium transition-colors ${currentView === 'terms' ? 'text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Terms
          </button>
          <a 
            href="#download" 
            className="bg-white text-dark-bg px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-brand-50 transition-colors shadow-lg shadow-white/5"
          >
            Download App
          </a>
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white">
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-dark-card border-b border-white/5 p-6 md:hidden flex flex-col gap-4 animate-in slide-in-from-top-5">
          <button 
            onClick={() => { onChangeView('home'); setMobileMenuOpen(false); }}
            className="text-left text-slate-300 hover:text-white py-2"
          >
            Home
          </button>
          <button 
             onClick={() => { onChangeView('privacy'); setMobileMenuOpen(false); }}
            className="text-left text-slate-300 hover:text-white py-2"
          >
            Privacy Policy
          </button>
          <button 
             onClick={() => { onChangeView('terms'); setMobileMenuOpen(false); }}
            className="text-left text-slate-300 hover:text-white py-2"
          >
            Terms of Service
          </button>
          <a href="#download" className="bg-brand-600 text-white text-center py-3 rounded-lg font-semibold">
            Download for iOS
          </a>
        </div>
      )}
    </nav>
  );
};

const Footer = ({ onChangeView }: { onChangeView: (view: ViewState) => void }) => (
  <footer className="bg-dark-bg border-t border-white/5 pt-16 pb-8">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-brand-500 to-purple-500 flex items-center justify-center text-white">
              <Wind size={14} />
            </div>
            <span className="font-bold text-lg text-white">YourBreath</span>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed">
            Master your nervous system with quick, accessible breathing sessions on iPhone and Apple Watch.
          </p>
        </div>
        
        <div>
          <h4 className="text-white font-semibold mb-4">Product</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><button onClick={() => onChangeView('home')} className="hover:text-brand-400">Features</button></li>
            <li><button onClick={() => onChangeView('home')} className="hover:text-brand-400">Apple Watch</button></li>
            <li><button onClick={() => onChangeView('home')} className="hover:text-brand-400">Premium</button></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Legal</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><button onClick={() => onChangeView('privacy')} className="hover:text-brand-400">Privacy Policy</button></li>
            <li><button onClick={() => onChangeView('terms')} className="hover:text-brand-400">Terms of Service</button></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Download</h4>
          <a href="#download" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors border border-white/5">
            <Download size={16} />
            <span className="text-sm">App Store</span>
          </a>
        </div>
      </div>
      
      <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-slate-500 text-sm">
          Copyright 2025 by Jan H. Clausen
        </p>
        <div className="flex gap-4">
          <div className="w-2 h-2 rounded-full bg-slate-700"></div>
          <div className="w-2 h-2 rounded-full bg-slate-700"></div>
          <div className="w-2 h-2 rounded-full bg-slate-700"></div>
        </div>
      </div>
    </div>
  </footer>
);

const Hero = ({ onOpenLearnMore }: { onOpenLearnMore: () => void }) => (
  <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
    {/* Background Elements */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
      <div className="absolute top-20 left-10 w-96 h-96 bg-brand-500/20 rounded-full blur-[100px] animate-float"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500/20 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }}></div>
    </div>

    <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center text-center">
      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight max-w-4xl">
        Instant Calm, <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-brand-400 to-purple-400">
          One Tap Away.
        </span>
      </h1>

      <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed">
        Start Box, Coherent, Cyclic Sigh and more sessions instantly. 
        Guided by gentle visuals, sound, or haptics across iPhone and Apple Watch.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto mt-4">
        <a 
          href="#" 
          className="inline-block transition-all hover:scale-105 hover:opacity-90 shadow-xl shadow-brand-500/10"
          aria-label="Download on the App Store"
        >
          <img 
            src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" 
            alt="Download on the App Store" 
            className="h-[60px] w-auto"
          />
        </a>
        <button 
          onClick={onOpenLearnMore}
          className="w-full sm:w-auto px-8 h-[60px] bg-white/5 text-white rounded-xl font-bold text-lg hover:bg-white/10 transition-all border border-white/10 backdrop-blur-md flex items-center justify-center"
        >
          Learn More
        </button>
      </div>

      {/* Abstract Breathing Visual */}
      <div className="mt-20 relative w-64 h-64 flex items-center justify-center">
        <div className="absolute inset-0 bg-brand-500/20 rounded-full blur-xl animate-breathe"></div>
        <div className="absolute inset-4 bg-gradient-to-tr from-brand-500/30 to-purple-500/30 rounded-full blur-md animate-breathe" style={{ animationDelay: '1s' }}></div>
        <div className="w-32 h-32 bg-gradient-to-br from-brand-400 to-purple-500 rounded-full shadow-2xl shadow-brand-500/50 flex items-center justify-center relative z-10">
           <span className="text-white font-medium text-sm tracking-widest uppercase">Inhale</span>
        </div>
      </div>
    </div>
  </section>
);

const FeatureCard = ({ icon: Icon, title, description, color }: { icon: any, title: string, description: string, color: string }) => (
  <div className="group p-8 rounded-3xl bg-dark-card border border-white/5 hover:border-white/10 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
    <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-${color}-500/20 transition-colors`}></div>
    <div className={`w-12 h-12 rounded-2xl bg-dark-bg border border-white/5 flex items-center justify-center text-${color}-400 mb-6 group-hover:scale-110 transition-transform`}>
      <Icon size={24} />
    </div>
    <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
    <p className="text-slate-400 leading-relaxed text-sm">
      {description}
    </p>
  </div>
);

const Features = () => (
  <section id="features" className="py-24 bg-dark-bg relative">
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Breathing Made Simple</h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          YourBreath strips away the complexity. No accounts, no clutter—just effective techniques to help you reset.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FeatureCard 
          icon={Wind} 
          title="Instant Sessions" 
          description="Start Box, Coherent, or Cyclic Sigh breathing in one tap. Customizable rhythms to match your lung capacity."
          color="brand"
        />
        <FeatureCard 
          icon={Watch} 
          title="Apple Watch First" 
          description="Enjoy fully featured sessions on your wrist. Quick 30-second resets launched directly from complications."
          color="purple"
        />
        <FeatureCard 
          icon={ShieldCheck} 
          title="Privacy by Default" 
          description="No accounts, no tracking. Your health data stays on your device. We believe peace of mind starts with privacy."
          color="green"
        />
        <FeatureCard 
          icon={Zap} 
          title="Haptic Guidance" 
          description="Close your eyes and follow the gentle taps. Perfect for discreet calming moments in public or at work."
          color="yellow"
        />
        <FeatureCard 
          icon={BarChart3} 
          title="Track Progress" 
          description="Visualize your journey with mindful streak badges and session history. Stay motivated without the pressure."
          color="brand"
        />
        <FeatureCard 
          icon={Heart} 
          title="Health Integration" 
          description="Seamlessly syncs mindful minutes and heart rate data with Apple Health to complete your wellness picture."
          color="red"
        />
      </div>
    </div>
  </section>
);

const BreathingTechniques = () => (
  <section className="py-24 bg-dark-bg border-t border-white/5">
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Core Techniques</h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Scientifically backed breathing patterns to shift your state in minutes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Box Breathing */}
        <div className="bg-dark-card border border-white/5 rounded-3xl p-8 flex flex-col items-center text-center group hover:border-brand-500/30 transition-colors">
          <div className="w-48 h-48 mb-8 relative flex items-center justify-center bg-dark-bg rounded-2xl border border-white/5 overflow-hidden">
             {/* Box Visual */}
            <div className="w-24 h-24 bg-brand-500 rounded-lg animate-box opacity-80"></div>
             {/* Guides */}
            <div className="absolute inset-0 flex flex-col justify-between p-4 opacity-40">
               <div className="flex justify-center text-xs font-mono uppercase tracking-widest">Hold</div>
               <div className="flex justify-between w-full text-xs font-mono uppercase tracking-widest px-2">
                 <span className="-rotate-90">In</span>
                 <span className="rotate-90">Ex</span>
               </div>
               <div className="flex justify-center text-xs font-mono uppercase tracking-widest">Hold</div>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Box Breathing</h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Inhale, hold, exhale, hold. Equal duration for focus, stress reduction, and mental clarity. Used by elite performers.
          </p>
          <span className="text-brand-400 text-xs font-bold uppercase tracking-wider border border-brand-500/20 px-3 py-1 rounded-full">Focus</span>
        </div>

        {/* Coherent Breathing */}
        <div className="bg-dark-card border border-white/5 rounded-3xl p-8 flex flex-col items-center text-center group hover:border-purple-500/30 transition-colors">
          <div className="w-48 h-48 mb-8 relative flex items-center justify-center bg-dark-bg rounded-2xl border border-white/5 overflow-hidden">
            <div className="w-24 h-24 bg-purple-500 rounded-full animate-coherent opacity-80 blur-md"></div>
            <div className="w-24 h-24 bg-purple-400 rounded-full animate-coherent opacity-40 absolute"></div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Coherent</h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Smooth, continuous breaths. Balances the autonomic nervous system and synchronizes heart rate variability (HRV).
          </p>
          <span className="text-purple-400 text-xs font-bold uppercase tracking-wider border border-purple-500/20 px-3 py-1 rounded-full">Balance</span>
        </div>

        {/* Cyclic Sigh */}
        <div className="bg-dark-card border border-white/5 rounded-3xl p-8 flex flex-col items-center text-center group hover:border-blue-500/30 transition-colors">
          <div className="w-48 h-48 mb-8 relative flex items-center justify-center bg-dark-bg rounded-2xl border border-white/5 overflow-hidden">
            <div className="w-24 h-24 bg-blue-500 rounded-full animate-cyclic opacity-80"></div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Cyclic Sigh</h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Double inhale, long exhale. The physiological sigh offloads CO2 and instantly reduces arousal and anxiety.
          </p>
          <span className="text-blue-400 text-xs font-bold uppercase tracking-wider border border-blue-500/20 px-3 py-1 rounded-full">Relief</span>
        </div>
      </div>
    </div>
  </section>
);

const WatchShowcase = () => (
  <section className="py-24 bg-dark-card border-y border-white/5 overflow-hidden">
    <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-16">
      <div className="lg:w-1/2 relative">
         {/* Abstract Watch CSS Mockup */}
         <div className="relative mx-auto w-[280px] h-[350px] bg-slate-800 rounded-[3rem] border-8 border-slate-700 shadow-2xl flex items-center justify-center">
            {/* Screen */}
            <div className="w-[92%] h-[92%] bg-black rounded-[2.5rem] flex flex-col items-center justify-center p-4 relative overflow-hidden">
                {/* Breathing Circle on Watch */}
                <div className="w-32 h-32 rounded-full border-4 border-brand-500/30 flex items-center justify-center relative mb-4">
                     <div className="w-24 h-24 bg-brand-500 rounded-full animate-breathe opacity-90"></div>
                </div>
                <div className="text-white font-semibold text-lg">Breathe In</div>
                <div className="text-brand-400 text-sm mt-1">00:04</div>
                
                {/* Top status */}
                <div className="absolute top-4 w-full flex justify-between px-6 text-[10px] text-slate-500">
                    <span>10:09</span>
                    <Heart size={10} className="text-red-500" />
                </div>
            </div>
            {/* Button */}
            <div className="absolute right-[-12px] top-24 w-3 h-16 bg-slate-600 rounded-r-md"></div>
         </div>
      </div>
      
      <div className="lg:w-1/2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 text-xs font-bold uppercase tracking-wider mb-6">
          On Your Wrist
        </div>
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Leave the phone behind.</h2>
        <p className="text-slate-400 text-lg mb-8 leading-relaxed">
           YourBreath is designed to be fully functional on Apple Watch. Whether you're in a meeting or on a run, calm is just a complication tap away.
        </p>
        <ul className="space-y-4">
            {[
                "Standalone functionality - no phone needed nearby",
                "Haptic feedback for eyes-closed practice",
                "Heart rate monitoring during sessions",
                "Syncs automatically when back in range"
            ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 flex-shrink-0">
                        <CheckCircle2 size={12} />
                    </div>
                    <span className="text-slate-300">{item}</span>
                </li>
            ))}
        </ul>
      </div>
    </div>
  </section>
);

const Premium = () => (
  <section className="py-24 relative">
    <div className="absolute inset-0 bg-gradient-to-b from-dark-bg to-dark-card pointer-events-none"></div>
    <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
      <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Unlock Lifetime Premium</h2>
      <p className="text-slate-400 text-lg mb-12 max-w-2xl mx-auto">
        No subscriptions. No recurring charges. A single one-time payment unlocks advanced features forever.
      </p>

      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="text-left space-y-6">
            <h3 className="text-2xl font-bold text-white">Premium Features</h3>
            <ul className="space-y-4">
                {[
                    "Advanced techniques (Tummo, 4-7-8)",
                    "Structured 14-day programs",
                    "Coaching-style insights",
                    "Extended session durations",
                    "Custom routines builder"
                ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-300">
                        <CheckCircle2 className="text-purple-400" size={20} />
                        {item}
                    </li>
                ))}
            </ul>
          </div>
          
          <div className="bg-white/5 rounded-2xl p-8 border border-white/5 flex flex-col items-center">
             <span className="text-slate-400 text-sm uppercase tracking-widest mb-2">One-Time Payment</span>
             <div className="text-5xl font-bold text-white mb-2">$7.99</div>
             <span className="text-purple-400 text-sm font-medium mb-6">Lifetime Access to ver. 1x</span>
             <div className="flex flex-col items-center gap-1 mt-4">
                <span className="text-white font-bold text-lg">In-app purchase.</span>
                <span className="text-brand-400 font-bold text-lg">Free 7-day trial</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const DownloadCTA = () => (
  <section id="download" className="py-24 bg-gradient-to-b from-dark-card to-dark-bg border-t border-white/5">
    <div className="max-w-4xl mx-auto px-6 text-center">
      <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">Start Breathing Better Today</h2>
      <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
        Join thousands who have found their calm. One simple app for your pocket and your wrist.
      </p>
      
      <div className="flex justify-center items-center gap-6">
        <a 
          href="#" 
          className="inline-block transition-all hover:scale-105 hover:opacity-90"
          aria-label="Download on the App Store"
        >
          <img 
            src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" 
            alt="Download on the App Store" 
            className="h-[60px] w-auto"
          />
        </a>
      </div>
      <p className="mt-8 text-sm text-slate-500">Requires iOS 26.0 or later and watchOS 26.0 or later.</p>
    </div>
  </section>
);

// --- Privacy Policy Component (Provided Text) ---
const PrivacyPolicyView = () => (
  <div className="pt-32 pb-20 max-w-3xl mx-auto px-6 animate-in fade-in duration-500">
    <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy — YourBreath</h1>
    
    <div className="prose prose-invert prose-slate max-w-none">
      <div className="bg-dark-card p-6 rounded-2xl border border-white/10 mb-8">
        <p className="font-semibold text-white">Effective date: <span className="text-slate-400 font-normal">December 1, 2025</span></p>
      </div>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">1. About YourBreath</h2>
        <p className="text-slate-400 leading-relaxed">
          YourBreath is a wellness app that guides breathing exercises on iPhone and Apple Watch. The app works entirely on-device, without accounts, analytics, or external services.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">2. Data We Collect and How It’s Used</h2>
        <ul className="list-disc pl-5 space-y-4 text-slate-400">
          <li>
            <strong className="text-white">Breathing sessions and progress:</strong> Session timestamps, duration, exercise type, completion status, and progress metrics stay on your device to power streaks, recommendations, and history views.
          </li>
          <li>
            <strong className="text-white">Heart-related metrics (optional):</strong> If you opt in, the app reads and writes HealthKit data such as mindful sessions, heart rate, resting heart rate, and heart rate variability to show trends and log sessions. Metadata may include exercise type, duration, cycles completed, and biometrics recorded during a session. Health data never leaves your device and is only visible to you in the Health app and within YourBreath.
          </li>
          <li>
            <strong className="text-white">Notification preferences:</strong> Reminder identifiers and scheduling choices are stored locally to deliver optional practice reminders and weekly reflections.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">3. Sources of Data</h2>
        <ul className="list-disc pl-5 space-y-4 text-slate-400">
          <li>
            <strong className="text-white">Information you generate in the app:</strong> Breathing sessions, preferences, and progress history are created by your use of the app and stored locally (with optional iCloud sync you control at the OS level).
          </li>
          <li>
            <strong className="text-white">Health data (only with permission):</strong> HealthKit data is accessed or written only after you grant permission and is limited to mindful sessions, heart rate, resting heart rate, and heart rate variability.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">4. Data Storage and Sync</h2>
        <ul className="list-disc pl-5 space-y-4 text-slate-400">
          <li>
            <strong className="text-white">On-device storage:</strong> Session history, settings, and notification schedules are stored locally using Core Data and UserDefaults.
          </li>
          <li>
            <strong className="text-white">iCloud (optional):</strong> If you enable iCloud for YourBreath, Core Data can mirror to your iCloud account via CloudKit so your history stays available across devices. This uses Apple’s iCloud container <code>iCloud.jhc.YourBreath</code>; you can disable iCloud syncing in iOS settings. Data remains encrypted and under your Apple ID—YourBreath’s developers cannot access it.
          </li>
          <li>
            <strong className="text-white">Health app:</strong> HealthKit writes and reads are stored in your Health app per Apple’s rules and are under your control.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">5. Data Sharing</h2>
        <ul className="list-disc pl-5 space-y-4 text-slate-400">
          <li>
            <strong className="text-white">No sharing with developers or third parties:</strong> YourBreath does not transmit, sell, or share any personal data. Developers cannot access your on-device data or iCloud records.
          </li>
          <li>
            <strong className="text-white">Health data:</strong> Remains within HealthKit and your device; no transmission to external services.
          </li>
          <li>
            <strong className="text-white">iCloud:</strong> If enabled, Apple’s iCloud service transports and stores your Core Data records under Apple’s privacy and security protections; no one else—including the developer—can access your records.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">6. Permissions</h2>
        <ul className="list-disc pl-5 space-y-4 text-slate-400">
          <li>
            <strong className="text-white">HealthKit:</strong> Requested to read/write mindful sessions and heart metrics to log and display your progress. Access is limited to the specific data types you approve.
          </li>
          <li>
            <strong className="text-white">Notifications:</strong> Requested to send optional daily reminders, weekly reflections, and gentle nudges; you can change this anytime in Settings.
          </li>
          <li>
            <strong className="text-white">iCloud:</strong> Uses your Apple ID for CloudKit sync if you enable iCloud for the app; otherwise all data stays on-device.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">7. Children’s Privacy</h2>
        <p className="text-slate-400 leading-relaxed">
          YourBreath is intended for general audiences and is not directed to children under 13. If you are a parent or guardian and believe a child has provided data, contact us to request deletion.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">8. Security</h2>
        <p className="text-slate-400 leading-relaxed">
          Data is protected using Apple’s platform security. HealthKit data stays within the Health store; Core Data records are stored locally with optional iCloud encryption handled by Apple. We minimize collection to what is needed for breathing guidance and progress features.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">9. Your Choices and Controls</h2>
        <p className="text-slate-400 leading-relaxed">
          Manage Health permissions in iOS Settings → Health → Data Access
        </p>
      </section>
    </div>
  </div>
);

// --- Terms of Service Component ---

const TermsOfServiceView = () => (
  <div className="pt-32 pb-20 max-w-3xl mx-auto px-6 animate-in fade-in duration-500">
    <h1 className="text-4xl font-bold text-white mb-8">Terms of Service — YourBreath</h1>
    
    <div className="prose prose-invert prose-slate max-w-none">
      <div className="bg-dark-card p-6 rounded-2xl border border-white/10 mb-8">
        <p className="font-semibold text-white">Last updated: <span className="text-slate-400 font-normal">December 1, 2025</span></p>
      </div>

      <p className="text-slate-400 mb-6">
        Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the YourBreath mobile application (the "Service") operated by Jan H. Clausen ("us", "we", or "our").
      </p>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
        <p className="text-slate-400 leading-relaxed">
          By downloading, accessing, or using the YourBreath app, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the Service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">2. Medical Disclaimer</h2>
        <p className="text-slate-400 leading-relaxed">
          YourBreath is designed for relaxation, mindfulness, and wellness purposes only. It is <strong>not</strong> a medical device and does not provide medical advice, diagnosis, or treatment. 
        </p>
        <p className="text-slate-400 leading-relaxed mt-4">
          Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay in seeking it because of something you have read on this app. If you feel dizzy, faint, or uncomfortable during any breathing exercise, stop immediately and consult a medical professional.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">3. Use License</h2>
        <p className="text-slate-400 leading-relaxed mb-4">
          Permission is granted to temporarily download one copy of the YourBreath app for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license, you may not:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-slate-400">
          <li>Modify or copy the materials;</li>
          <li>Use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
          <li>Attempt to decompile or reverse engineer any software contained in the YourBreath app;</li>
          <li>Remove any copyright or other proprietary notations from the materials; or</li>
          <li>Transfer the materials to another person or "mirror" the materials on any other server.</li>
        </ul>
        <p className="text-slate-400 leading-relaxed mt-4">
          This license shall automatically terminate if you violate any of these restrictions and may be terminated by us at any time.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">4. Privacy Policy</h2>
        <p className="text-slate-400 leading-relaxed">
          Your use of the Service is also governed by our Privacy Policy. Please review our Privacy Policy to understand our practices regarding your data and how we prioritize on-device storage and privacy.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">5. In-App Purchases</h2>
        <p className="text-slate-400 leading-relaxed">
          The app offers "Premium" features available for purchase. This is a one-time payment for lifetime access to the specified version's features. We reserve the right to change our pricing at any time. Transactions are handled by the Apple App Store and are subject to their terms and conditions.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">6. Limitation of Liability</h2>
        <p className="text-slate-400 leading-relaxed">
          In no event shall Jan H. Clausen or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on YourBreath, even if we have been notified orally or in writing of the possibility of such damage.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">7. Governing Law</h2>
        <p className="text-slate-400 leading-relaxed">
          These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which the developer resides, and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">8. Changes to Terms</h2>
        <p className="text-slate-400 leading-relaxed">
          We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">9. Contact Us</h2>
        <p className="text-slate-400 leading-relaxed">
          If you have any questions about these Terms, please contact us at: <a href="mailto:support@yourbreath.example" className="text-brand-400 hover:text-brand-300">support@yourbreath.example</a>
        </p>
      </section>
    </div>
  </div>
);

// --- Main App Component ---

const App = () => {
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [showLearnMore, setShowLearnMore] = useState(false);

  return (
    <div className="min-h-screen bg-dark-bg text-slate-50 selection:bg-brand-500/30 font-sans">
      <Navigation currentView={currentView} onChangeView={setCurrentView} />
      
      {currentView === 'home' && (
        <main className="animate-in fade-in duration-500">
          <Hero onOpenLearnMore={() => setShowLearnMore(true)} />
          <Features />
          <BreathingTechniques />
          <WatchShowcase />
          <Premium />
          <DownloadCTA />
        </main>
      )}
      
      {currentView === 'privacy' && <PrivacyPolicyView />}
      
      {currentView === 'terms' && <TermsOfServiceView />}
      
      <LearnMoreModal open={showLearnMore} onClose={() => setShowLearnMore(false)} />
      
      <Footer onChangeView={setCurrentView} />
    </div>
  );
};

export default App;