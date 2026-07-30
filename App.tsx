import React, { useState, useEffect } from 'react';
import { 
  Wind, 
  Watch, 
  ShieldCheck, 
  Zap, 
  BarChart3, 
  CheckCircle2, 
  Menu, 
  X,
  Download,
  Play,
  Info,
  Lock,
  FileText,
  HelpCircle,
  ArrowRight,
  Heart
} from 'lucide-react';

// --- Types ---
type ViewState = 'home' | 'about' | 'press' | 'apple-watch' | 'private-breathing-app' | 'no-subscription' | 'breathing-techniques' | 'breathwork-app' | 'mindfulness-app' | 'meditation-app' | 'privacy' | 'terms' | 'support';
type Technique = 'box' | 'fourSevenEight' | 'coherent';

const APP_STORE_BADGE_SRC = "/app-store-badge.svg";
const APP_ICON_SRC = "/app-icon.png";
const HOME_SCREENSHOT_SRC = "/screenshots/home.jpg";
const SESSION_SCREENSHOT_SRC = "/screenshots/box-breathing.jpg";
const SUMMARY_SCREENSHOT_SRC = "/screenshots/session-complete.jpg";
const PROGRESS_SCREENSHOT_SRC = "/screenshots/progress.jpg";
const SUPPORT_EMAIL = "aloe.08.slaenge@icloud.com";
const APP_STORE_URL = "https://apps.apple.com/app/id6754709063";

const VIEW_PATHS: Record<ViewState, string> = {
  home: '/',
  about: '/about/',
  press: '/press/',
  'apple-watch': '/apple-watch-breathing-app/',
  'private-breathing-app': '/private-breathing-app/',
  'no-subscription': '/breathing-app-without-subscription/',
  'breathing-techniques': '/breathing-techniques/',
  'breathwork-app': '/breathwork-app/',
  'mindfulness-app': '/mindfulness-breathing-app/',
  'meditation-app': '/breathing-meditation-app/',
  privacy: '/privacy/',
  terms: '/terms/',
  support: '/support/'
};

const PATH_VIEWS = Object.entries(VIEW_PATHS).reduce<Record<string, ViewState>>((acc, [view, path]) => {
  acc[path] = view as ViewState;
  acc[path.replace(/\/$/, '') || '/'] = view as ViewState;
  return acc;
}, {});

const getViewFromPath = (pathname: string): ViewState => PATH_VIEWS[pathname.replace(/\/$/, '') || '/'] ?? 'home';

const VIEW_META: Record<ViewState, { title: string; description: string }> = {
  home: {
    title: "YourBreath - Private breathing app for iPhone and Apple Watch",
    description: "Start a calm breath on iPhone or Apple Watch before the day gets loud. No account. No ads. No analytics."
  },
  about: {
    title: "About YourBreath - Private breathing app by Jan H. Clausen",
    description: "YourBreath is built independently by Danish general practitioner and app developer Jan H. Clausen."
  },
  press: {
    title: "Press - YourBreath",
    description: "Press information and key facts for YourBreath, a private breathing app for iPhone and Apple Watch."
  },
  'apple-watch': {
    title: "Breathing app for Apple Watch - YourBreath",
    description: "Start short breathing sessions from your Apple Watch with calm visual cues, sound and haptics."
  },
  'private-breathing-app': {
    title: "Private breathing app with no account, ads or analytics - YourBreath",
    description: "YourBreath is a private breathing app with no account, no ads and no analytics."
  },
  'no-subscription': {
    title: "Breathing App Without a Subscription | Free Forever Exercises",
    description: "Box Breathing and 4-7-8 Breathing stay free forever on iPhone and Apple Watch. No account, ads or analytics. Premium is a one-time unlock."
  },
  'breathing-techniques': {
    title: "Guided Breathing Techniques for iPhone & Apple Watch | YourBreath",
    description: "Follow Box Breathing, 4-7-8 Breathing and more with clear visual, sound and haptic cues on iPhone and Apple Watch."
  },
  'breathwork-app': {
    title: "Breathwork App for iPhone & Apple Watch | YourBreath",
    description: "A private breathwork app with guided Box Breathing, 4-7-8 Breathing and Apple Watch haptics. Core exercises stay free forever."
  },
  'mindfulness-app': {
    title: "Mindfulness Breathing App Without Ads | YourBreath",
    description: "Take a quiet mindful pause with guided breathing on iPhone and Apple Watch. No account, no ads and no analytics."
  },
  'meditation-app': {
    title: "Simple Breathing Meditation App | YourBreath",
    description: "Use short guided breathing sessions as a simple meditation practice on iPhone and Apple Watch. Start without an account or subscription."
  },
  privacy: {
    title: "Privacy Policy - YourBreath",
    description: "YourBreath works without accounts, ads or third-party analytics. Read the privacy policy."
  },
  terms: {
    title: "Terms of Service - YourBreath",
    description: "Terms of Service for the YourBreath iPhone and Apple Watch app."
  },
  support: {
    title: "Support - YourBreath",
    description: "Support for YourBreath, Premium, refunds, HealthKit and Apple Watch."
  }
};

// --- Components ---

const AppStoreCTA = ({
  children,
  className,
  ariaLabel
}: {
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}) => (
  <a
    href={APP_STORE_URL}
    target="_blank"
    rel="noopener noreferrer"
    className={className}
    aria-label={ariaLabel}
  >
    {children}
  </a>
);

const ProductHuntBadge = () => (
  <a
    href="https://www.producthunt.com/products/yourbreath?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-yourbreath"
    target="_blank"
    rel="noopener noreferrer"
    className="inline-block transition-opacity hover:opacity-90"
  >
    <img
      alt="YourBreath - Calm breathing on iPhone and Apple Watch | Product Hunt"
      width="250"
      height="54"
      src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1146992&theme=dark&t=1778772218524"
    />
  </a>
);

const LearnMoreModal = ({
  open,
  onClose
}: {
  open: boolean;
  onClose: () => void;
}) => {
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
    fourSevenEight: {
      title: "4-7-8 Breathing",
      subtitle: "Sleep & Relaxation",
      description: "A slow breathing pattern often used for relaxation and winding down.",
      steps: ["Inhale for 4s", "Hold for 7s", "Exhale for 8s", "Repeat cycle"],
      color: "blue",
      animationClass: "animate-box", // Reuse box animation for its hold phases
      shapeClass: "rounded-full"
    },
    coherent: {
      title: "Coherent (Premium)",
      subtitle: "Balance & HRV",
      description: "Also known as Resonant Breathing. This rate (usually 5-6 breaths per minute) supports a slow, steady rhythm often associated with relaxation and HRV-focused breathing practice. Unlocks with Premium alongside Periodic Sighing, Voluntary Hyperventilation, and Wim Hof.",
      steps: ["Inhale for 6s", "Exhale for 6s", "Continuous flow", "No pauses"],
      color: "purple",
      animationClass: "animate-coherent",
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
                {activeTab === 'box' && (
                  <>
                    <span className="absolute text-white/90 font-bold text-lg tracking-widest uppercase animate-text-box-inhale">Inhale</span>
                    <span className="absolute text-white/90 font-bold text-lg tracking-widest uppercase animate-text-box-hold1">Hold</span>
                    <span className="absolute text-white/90 font-bold text-lg tracking-widest uppercase animate-text-box-exhale">Exhale</span>
                    <span className="absolute text-white/90 font-bold text-lg tracking-widest uppercase animate-text-box-hold2">Hold</span>
                  </>
                )}
                {activeTab === 'coherent' && (
                  <>
                    <span className="absolute text-white/90 font-bold text-lg tracking-widest uppercase animate-text-coherent-inhale">Inhale</span>
                    <span className="absolute text-white/90 font-bold text-lg tracking-widest uppercase animate-text-coherent-exhale">Exhale</span>
                  </>
                )}
                {activeTab === 'fourSevenEight' && (
                  <>
                    <span className="absolute text-white/90 font-bold text-lg tracking-widest uppercase animate-text-box-inhale">Inhale</span>
                    <span className="absolute text-white/90 font-bold text-lg tracking-widest uppercase animate-text-box-hold1">Hold</span>
                    <span className="absolute text-white/90 font-bold text-lg tracking-widest uppercase animate-text-box-exhale">Exhale</span>
                  </>
                )}
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
              <AppStoreCTA
                className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-${current.color}-600 hover:bg-${current.color}-500 text-white font-semibold transition-colors shadow-lg shadow-${current.color}-500/20 text-center`}
              >
                Start Session
              </AppStoreCTA>
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
  onChangeView: (view: ViewState) => void;
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
            onClick={() => onChangeView('about')} 
            className={`text-sm font-medium transition-colors ${currentView === 'about' ? 'text-white' : 'text-slate-400 hover:text-white'}`}
          >
            About
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
          <button 
            onClick={() => onChangeView('support')} 
            className={`text-sm font-medium transition-colors ${currentView === 'support' ? 'text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Support
          </button>
          <AppStoreCTA
            className="bg-white text-dark-bg px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-brand-50 transition-colors shadow-lg shadow-white/5"
          >
            Download App
          </AppStoreCTA>
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
            onClick={() => { onChangeView('about'); setMobileMenuOpen(false); }}
            className="text-left text-slate-300 hover:text-white py-2"
          >
            About
          </button>
          <button 
            onClick={() => { onChangeView('press'); setMobileMenuOpen(false); }}
            className="text-left text-slate-300 hover:text-white py-2"
          >
            Press
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
          <button 
             onClick={() => { onChangeView('support'); setMobileMenuOpen(false); }}
            className="text-left text-slate-300 hover:text-white py-2"
          >
            Support
          </button>
          <AppStoreCTA
            className="bg-brand-600 text-white text-center py-3 rounded-lg font-semibold"
          >
            Download for iOS
          </AppStoreCTA>
        </div>
      )}
    </nav>
  );
};

const Footer = ({
  onChangeView
}: {
  onChangeView: (view: ViewState) => void;
}) => (
  <footer className="bg-dark-bg border-t border-white/5 pt-16 pb-8">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-12">
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-brand-500 to-purple-500 flex items-center justify-center text-white">
              <Wind size={14} />
            </div>
            <span className="font-bold text-lg text-white">YourBreath</span>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed">
            Build a calmer breathing routine with quick, accessible sessions on iPhone and Apple Watch.
          </p>
        </div>
        
        <div>
          <h4 className="text-white font-semibold mb-4">Product</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><button onClick={() => onChangeView('home')} className="hover:text-brand-400">Features</button></li>
            <li><button onClick={() => onChangeView('apple-watch')} className="hover:text-brand-400">Apple Watch</button></li>
            <li><button onClick={() => onChangeView('breathing-techniques')} className="hover:text-brand-400">Breathing Techniques</button></li>
            <li><button onClick={() => onChangeView('breathwork-app')} className="hover:text-brand-400">Breathwork App</button></li>
            <li><button onClick={() => onChangeView('home')} className="hover:text-brand-400">Premium</button></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Company</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><button onClick={() => onChangeView('about')} className="hover:text-brand-400">About</button></li>
            <li><button onClick={() => onChangeView('press')} className="hover:text-brand-400">Press</button></li>
            <li><button onClick={() => onChangeView('private-breathing-app')} className="hover:text-brand-400">Private Breathing App</button></li>
            <li><button onClick={() => onChangeView('no-subscription')} className="hover:text-brand-400">No Subscription</button></li>
            <li><button onClick={() => onChangeView('mindfulness-app')} className="hover:text-brand-400">Mindfulness</button></li>
            <li><button onClick={() => onChangeView('meditation-app')} className="hover:text-brand-400">Breathing Meditation</button></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Legal & Help</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><button onClick={() => onChangeView('privacy')} className="hover:text-brand-400">Privacy Policy</button></li>
            <li><button onClick={() => onChangeView('terms')} className="hover:text-brand-400">Terms of Service</button></li>
            <li><button onClick={() => onChangeView('support')} className="hover:text-brand-400">Support</button></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Download</h4>
          <AppStoreCTA
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors border border-white/5"
          >
            <Download size={16} />
            <span className="text-sm">App Store</span>
          </AppStoreCTA>
        </div>
      </div>
      
      <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-slate-500 text-sm">
          Copyright 2026 by Jan H. Clausen
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

const Hero = ({
  onOpenLearnMore
}: {
  onOpenLearnMore: () => void;
}) => (
  <section className="relative min-h-[92vh] pt-28 pb-20 md:pt-36 overflow-hidden flex items-center hero-grid">
    <div className="max-w-7xl mx-auto px-6 relative z-10 w-full grid lg:grid-cols-[1.05fr_.95fr] gap-12 lg:gap-20 items-center">
      <div className="max-w-2xl">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-[-0.045em] text-white mb-6 leading-[0.98]">
          A calmer breath,
          <span className="block text-brand-300">right when you need it.</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-300 max-w-xl mb-4 leading-relaxed">
          Guided breathing on iPhone and Apple Watch. Box Breathing and 4-7-8 Breathing stay free forever.
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center gap-5 mt-8">
          <AppStoreCTA
            className="inline-block shadow-xl shadow-brand-500/10"
            ariaLabel="Download YourBreath on the App Store"
          >
            <img
              src={APP_STORE_BADGE_SRC}
              alt="Download on the App Store"
              className="h-[64px] w-auto"
            />
          </AppStoreCTA>
          <button
            onClick={onOpenLearnMore}
            className="inline-flex items-center gap-2 text-brand-300 font-semibold hover:text-brand-200 transition-colors"
          >
            See how it looks <ArrowRight size={18} />
          </button>
        </div>

        <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-400">
          <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-brand-300" /> No account</span>
          <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-brand-300" /> No ads</span>
          <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-brand-300" /> No analytics</span>
          <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-brand-300" /> No subscription required</span>
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-[520px] min-h-[570px] md:min-h-[680px]" aria-label="Real YourBreath app screenshots">
        <div className="phone-shot absolute left-0 top-4 w-[62%] rotate-[-4deg]">
          <img src={HOME_SCREENSHOT_SRC} alt="YourBreath home screen with Quick Box Breathing" />
        </div>
        <div className="phone-shot absolute right-0 bottom-0 w-[58%] rotate-[4deg]">
          <img src={SESSION_SCREENSHOT_SRC} alt="Active Box Breathing session in YourBreath" />
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
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Free features that work right away</h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          YourBreath is built for the first breath, not the first setup flow.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FeatureCard 
          icon={Zap} 
          title="One tap to calm" 
          description="Start a 30-second Box Breathing session directly from the home screen."
          color="brand"
        />
        <FeatureCard 
          icon={Wind} 
          title="Gentle routines" 
          description="Box Breathing and 4-7-8 breathing with calm visual cues, sound, or haptics."
          color="purple"
        />
        <FeatureCard 
          icon={BarChart3} 
          title="Mindful progress" 
          description="See soft streaks, badges, and short reflections without guilt or gamification."
          color="green"
        />
        <FeatureCard 
          icon={Watch} 
          title="Apple Watch" 
          description="Start short sessions from your watch and use haptic cues without looking at the screen."
          color="brand"
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
          Well-known breathing patterns for calm, focus and everyday pauses.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Box Breathing */}
        <div className="bg-dark-card border border-white/5 rounded-3xl p-8 flex flex-col items-center text-center group hover:border-brand-500/30 transition-colors relative overflow-hidden">
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
            Inhale, hold, exhale, hold. Equal duration for focus, stress reduction, and mental clarity. Free to use.
          </p>
          <span className="text-brand-400 text-xs font-bold uppercase tracking-wider border border-brand-500/20 px-3 py-1 rounded-full">Free</span>
        </div>

        {/* 4-7-8 Breathing */}
        <div className="bg-dark-card border border-white/5 rounded-3xl p-8 flex flex-col items-center text-center group hover:border-purple-500/30 transition-colors relative overflow-hidden">
          <div className="w-48 h-48 mb-8 relative flex items-center justify-center bg-dark-bg rounded-2xl border border-white/5 overflow-hidden">
             {/* 4-7-8 Visual */}
             <div className="w-24 h-24 bg-purple-500 rounded-lg animate-box opacity-80"></div>
             <div className="absolute inset-0 flex flex-col justify-between p-4 opacity-40">
               <div className="flex justify-center text-xs font-mono uppercase tracking-widest">Hold 7s</div>
               <div className="flex justify-between w-full text-xs font-mono uppercase tracking-widest px-2">
                 <span className="-rotate-90">In 4s</span>
                 <span className="rotate-90">Ex 8s</span>
               </div>
               <div className="flex justify-center text-xs font-mono uppercase tracking-widest">Wait</div>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">4-7-8 Breathing</h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Inhale for 4s, hold for 7s, exhale for 8s. A slow breathing pattern often used for relaxation and winding down. Free to use.
          </p>
          <span className="text-purple-400 text-xs font-bold uppercase tracking-wider border border-purple-500/20 px-3 py-1 rounded-full">Free</span>
        </div>

        {/* Periodic Sighing */}
        <div className="bg-dark-card border border-white/5 rounded-3xl p-8 flex flex-col items-center text-center group hover:border-blue-500/30 transition-colors relative overflow-hidden">
          <div className="absolute top-4 right-4 bg-brand-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1"><Lock size={10} /> Premium</div>
          <div className="w-48 h-48 mb-8 relative flex items-center justify-center bg-dark-bg rounded-2xl border border-white/5 overflow-hidden">
            <div className="w-24 h-24 bg-blue-500 rounded-full animate-cyclic opacity-80"></div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Periodic Sighing</h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Double inhale, long exhale. A pattern inspired by the physiological sigh, often used as a quick reset.
          </p>
          <span className="text-blue-400 text-xs font-bold uppercase tracking-wider border border-blue-500/20 px-3 py-1 rounded-full">Premium</span>
        </div>

        {/* Coherent Breathing */}
        <div className="bg-dark-card border border-white/5 rounded-3xl p-8 flex flex-col items-center text-center group hover:border-violet-500/30 transition-colors relative overflow-hidden">
          <div className="absolute top-4 right-4 bg-brand-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1"><Lock size={10} /> Premium</div>
          <div className="w-48 h-48 mb-8 relative flex items-center justify-center bg-dark-bg rounded-2xl border border-white/5 overflow-hidden">
            <div className="w-24 h-24 bg-violet-500 rounded-full animate-coherent opacity-80 blur-md"></div>
            <div className="w-24 h-24 bg-violet-400 rounded-full animate-coherent opacity-40 absolute"></div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Coherent Breathing</h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Smooth, continuous breaths. Supports a steady rhythm often associated with relaxation and HRV-focused breathing practice. Unlocked in Premium.
          </p>
          <span className="text-violet-400 text-xs font-bold uppercase tracking-wider border border-violet-500/20 px-3 py-1 rounded-full">Premium</span>
        </div>

        {/* Voluntary Hyperventilation */}
        <div className="bg-dark-card border border-white/5 rounded-3xl p-8 flex flex-col items-center text-center group hover:border-orange-500/30 transition-colors relative overflow-hidden">
          <div className="absolute top-4 right-4 bg-brand-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1"><Lock size={10} /> Premium</div>
          <div className="w-48 h-48 mb-8 relative flex items-center justify-center bg-dark-bg rounded-2xl border border-white/5 overflow-hidden">
            <div className="w-24 h-24 bg-orange-500 rounded-lg animate-pulse opacity-80 scale-110"></div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Voluntary Hyperventilation</h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            A guided rapid-breathing routine for experienced users who want a more active practice.
          </p>
          <span className="text-orange-400 text-xs font-bold uppercase tracking-wider border border-orange-500/20 px-3 py-1 rounded-full">Premium</span>
        </div>

        {/* Wim Hof Method */}
        <div className="bg-dark-card border border-white/5 rounded-3xl p-8 flex flex-col items-center text-center group hover:border-cyan-500/30 transition-colors relative overflow-hidden">
          <div className="absolute top-4 right-4 bg-brand-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1"><Lock size={10} /> Premium</div>
          <div className="w-48 h-48 mb-8 relative flex items-center justify-center bg-dark-bg rounded-2xl border border-white/5 overflow-hidden">
            <div className="w-16 h-16 bg-cyan-500 rounded-full animate-ping opacity-80 absolute"></div>
            <div className="w-24 h-24 bg-cyan-400 rounded-full opacity-40"></div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Wim Hof Method</h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            A structured routine with active breathing and breath holds for users familiar with this style of practice.
          </p>
          <span className="text-cyan-400 text-xs font-bold uppercase tracking-wider border border-cyan-500/20 px-3 py-1 rounded-full">Premium</span>
        </div>
      </div>
    </div>
  </section>
);

const WatchShowcase = () => (
  <section className="py-24 bg-dark-card border-y border-white/5 overflow-hidden">
    <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-16">
      <div className="lg:w-1/2 relative flex justify-center gap-5 items-end">
        <div className="phone-shot w-[44%] -rotate-3">
          <img src={SESSION_SCREENSHOT_SRC} alt="YourBreath guided Box Breathing session" loading="lazy" />
        </div>
        <div className="phone-shot w-[44%] rotate-3 translate-y-8">
          <img src={SUMMARY_SCREENSHOT_SRC} alt="YourBreath completed breathing session summary" loading="lazy" />
        </div>
      </div>
      
      <div className="lg:w-1/2">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">iPhone and Apple Watch work quietly together</h2>
        <p className="text-slate-400 text-lg mb-8 leading-relaxed">
           Install the watchOS app alongside the iPhone app. Routines, Premium status, and haptic settings stay in sync, so you can start breathing from your watch when your phone is away.
        </p>
        <AppStoreCTA
          className="inline-block"
          ariaLabel="Download YourBreath on the App Store"
        >
          <img
            src={APP_STORE_BADGE_SRC}
            alt="Download on the App Store"
            className="h-[56px] w-auto"
          />
        </AppStoreCTA>
      </div>
    </div>
  </section>
);

const Premium = () => (
  <section id="premium" className="py-24 relative">
    <div className="absolute inset-0 bg-gradient-to-b from-dark-bg to-dark-card pointer-events-none"></div>
    <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
      <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Premium unlocks the deeper tools</h2>
      <p className="text-slate-400 text-lg mb-12 max-w-2xl mx-auto">
        A one-time unlock gives access to advanced techniques, longer routines, structured programs, and personal insights based on your local data.
      </p>

      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="text-left space-y-6">
            <h3 className="text-2xl font-bold text-white">Premium Features</h3>
            <ul className="space-y-4">
                {[
                    "Periodic Sighing, Coherent Breathing",
                    "Voluntary Hyperventilation, Wim Hof Method",
                    "14-day programs for calm, energy, and resilience",
                    "HRV and resting heart rate insights",
                    "Personal insights and gentle nudges",
                    "No external data transfer"
                ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-300">
                        <CheckCircle2 className="text-purple-400 mt-1 flex-shrink-0" size={20} />
                        <span>{item}</span>
                    </li>
                ))}
            </ul>
          </div>
          
          <div className="bg-white/5 rounded-2xl p-8 border border-white/5 flex flex-col items-center">
             <span className="text-slate-400 text-sm uppercase tracking-widest mb-2">One-Time Payment</span>
             <div className="text-5xl font-bold text-white mb-2">Unlock</div>
             <span className="text-purple-400 text-sm font-medium mb-6">Buy once and keep Premium for version 1.x.</span>
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

const PrivacyFeature = ({ onChangeView }: { onChangeView: (view: ViewState) => void }) => (
  <section className="py-24 bg-dark-bg border-t border-white/5">
    <div className="max-w-4xl mx-auto px-6 text-center">
      <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Privacy is a product feature</h2>
      <p className="text-slate-400 text-lg mb-8 leading-relaxed">
        Your sessions, reminders, reflections, and progress insights are stored locally on iPhone and Apple Watch. HealthKit is optional. iCloud sync is controlled by your Apple ID account, and the developer cannot see your data.
      </p>
      <button 
        onClick={() => { onChangeView('privacy'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        className="inline-flex items-center gap-2 text-brand-400 font-semibold hover:text-brand-300 transition-colors"
      >
        Read Privacy Policy
      </button>
    </div>
  </section>
);

const DownloadCTA = () => (
  <section id="download" className="py-24 bg-gradient-to-b from-dark-card to-dark-bg border-t border-white/5">
    <div className="max-w-4xl mx-auto px-6 text-center">
      <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">Download YourBreath on the App Store</h2>
      <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
        Start calm breathing sessions on iPhone and Apple Watch with no account, no ads, and no analytics.
      </p>
      
      <div className="flex flex-col items-center justify-center gap-5">
        <AppStoreCTA
          className="inline-block"
          ariaLabel="Download on the App Store"
        >
          <img 
            src={APP_STORE_BADGE_SRC}
            alt="Download on the App Store" 
            className="h-[64px] w-auto"
          />
        </AppStoreCTA>
      </div>
      <p className="mt-8 text-sm text-slate-500">Requires iOS 26.0 or later and watchOS 26.0 or later.</p>
    </div>
  </section>
);

const CommunityCTA = () => (
  <section id="community" className="py-20 bg-dark-card border-y border-white/5">
    <div className="max-w-4xl mx-auto px-6 text-center">
      <p className="text-brand-300 font-semibold uppercase tracking-[0.18em] text-xs mb-4">Help shape what’s next</p>
      <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">YourBreath Community</h2>
      <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto mb-8">
        Suggest features, vote on ideas and follow the public roadmap. Community is a separate feedback space; your breathing sessions and HealthKit data stay out of it.
      </p>
      <a
        href="https://feedback.yourbreath.app"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-brand-300 font-semibold hover:text-brand-200 transition-colors"
      >
        Visit YourBreath Community <ArrowRight size={18} />
      </a>
    </div>
  </section>
);

const FAQ = ({ onChangeView }: { onChangeView: (view: ViewState) => void }) => (
  <section className="py-24 bg-dark-bg border-t border-white/5">
    <div className="max-w-4xl mx-auto px-6">
      <div className="flex items-center gap-3 mb-10">
        <HelpCircle className="text-brand-400" size={28} />
        <h2 className="text-3xl md:text-4xl font-bold text-white">FAQ</h2>
      </div>
      <div className="grid gap-4">
        {[
          ["Does YourBreath require an account?", "No. YourBreath does not require account creation."],
          ["Does YourBreath use ads or analytics?", "No. The app does not show ads and does not use third-party analytics."],
          ["Is Premium a subscription?", "No. Premium is offered as a one-time unlock for version 1.x."],
          ["Does YourBreath replace healthcare?", "No. YourBreath is a simple wellness tool for guided breathing and everyday pauses. It is not a medical treatment and does not replace professional healthcare."]
        ].map(([question, answer]) => (
          <div key={question} className="bg-dark-card border border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-2">{question}</h3>
            <p className="text-slate-400 leading-relaxed">{answer}</p>
          </div>
        ))}
      </div>
      <button
        onClick={() => onChangeView('support')}
        className="mt-8 inline-flex items-center gap-2 text-brand-400 font-semibold hover:text-brand-300 transition-colors"
      >
        More support questions
      </button>
    </div>
  </section>
);

const PageShell = ({ children, maxWidth = "max-w-4xl" }: { children: React.ReactNode; maxWidth?: string }) => (
  <main className={`pt-32 pb-20 ${maxWidth} mx-auto px-6 animate-in fade-in duration-500`}>
    {children}
  </main>
);

const ProseSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-8 bg-dark-card p-6 rounded-2xl border border-white/5">
    <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
    <div className="text-slate-400 leading-relaxed space-y-4">{children}</div>
  </section>
);

const AboutView = ({ onChangeView }: { onChangeView: (view: ViewState) => void }) => (
  <PageShell>
    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">About YourBreath</h1>
    <p className="text-xl text-slate-300 leading-relaxed mb-10">
      YourBreath is a private breathing app for iPhone and Apple Watch. One tap starts a calm session before the day gets loud. No account. No ads. No analytics. Built independently by Danish general practitioner and app developer Jan H. Clausen.
    </p>

    <ProseSection title="Why I built it">
      <p>Many wellness apps have become more complicated than they need to be. They ask users to create accounts, accept tracking, follow streaks, manage dashboards or sign up for another subscription.</p>
      <p>YourBreath takes the opposite approach. It is designed to be quiet, immediate and private. One tap starts a breathing session on iPhone or Apple Watch. Your sessions stay with you.</p>
    </ProseSection>

    <ProseSection title="A privacy-first breathing app">
      <ul className="space-y-2">
        <li>YourBreath does not require an account.</li>
        <li>YourBreath does not show ads.</li>
        <li>YourBreath does not use analytics.</li>
        <li>YourBreath does not sell or share personal data.</li>
      </ul>
      <p>A breathing app should help you pause, not become another source of digital noise.</p>
    </ProseSection>

    <ProseSection title="Built for iPhone and Apple Watch">
      <p>Breathing exercises work best when they are easy to start. The Watch experience makes it possible to begin a short breathing session from your wrist, using visual cues, sound or haptics.</p>
    </ProseSection>

    <ProseSection title="Independent and human-made">
      <p>YourBreath is an independent app created by a Danish doctor and software developer. The app is not a medical treatment and does not replace professional healthcare. It is a simple tool for calm, guided breathing and everyday pauses.</p>
    </ProseSection>

    <button
      onClick={() => onChangeView('press')}
      className="inline-flex items-center gap-2 bg-white text-dark-bg px-5 py-3 rounded-xl font-semibold hover:bg-brand-50 transition-colors"
    >
      <FileText size={18} />
      Press information
    </button>
  </PageShell>
);

const PressView = () => (
  <PageShell>
    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Press</h1>
    <p className="text-xl text-slate-300 leading-relaxed mb-10">
      Press-friendly descriptions and key facts for YourBreath.
    </p>

    <ProseSection title="Short description">
      <p>YourBreath is a private breathing app for iPhone and Apple Watch. One tap starts a calm breathing session before the day gets loud. No account. No ads. No analytics.</p>
    </ProseSection>

    <ProseSection title="Long description">
      <p>YourBreath is a privacy-first breathing app for iPhone and Apple Watch, built independently by Danish general practitioner and app developer Jan H. Clausen.</p>
      <p>The app is designed around a simple idea: a calm breathing session should be easy to start, especially when life gets noisy. YourBreath offers guided breathing sessions with calm visual cues, sound and haptics, including Box Breathing and 4-7-8 breathing.</p>
      <p>Unlike many wellness apps, YourBreath does not require an account, does not show ads and does not use analytics. Premium is offered as a one-time unlock rather than a subscription.</p>
    </ProseSection>

    <ProseSection title="Key facts">
      <dl className="grid sm:grid-cols-2 gap-4">
        {[
          ["App name", "YourBreath"],
          ["Platforms", "iPhone and Apple Watch"],
          ["Category", "Health & Fitness / Wellness / Breathing"],
          ["Privacy", "No account, no ads, no analytics"],
          ["Business model", "Free with one-time Premium unlock"],
          ["Maker", "Jan H. Clausen, Danish general practitioner and independent app developer"]
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="text-white font-semibold">{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </ProseSection>
  </PageShell>
);

type SEOViewProps = {
  title: string;
  intro: string;
  sections: Array<{ title: string; body: string }>;
  freeItems?: string[];
  premiumItems?: string[];
  faq?: Array<[string, string]>;
  heroScreenshot?: string;
};

const SEOView = ({
  title,
  intro,
  sections,
  freeItems = ["Box Breathing", "4-7-8 Breathing", "iPhone and Apple Watch access", "Visual, sound and haptic guidance"],
  premiumItems = ["Advanced breathing techniques", "Longer routines and programs", "Progress and personal insights", "One-time unlock for version 1.x"],
  faq = [],
  heroScreenshot = HOME_SCREENSHOT_SRC
}: SEOViewProps) => (
  <main className="animate-in fade-in duration-500">
    <section className="pt-32 pb-20 md:pt-40 md:pb-28 hero-grid overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-[1.05fr_.95fr] gap-14 items-center">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-[-0.04em] leading-[1.02] text-white mb-6">{title}</h1>
          <p className="text-xl text-slate-300 leading-relaxed mb-8">{intro}</p>
          <AppStoreCTA className="inline-block" ariaLabel="Download YourBreath on the App Store">
            <img src={APP_STORE_BADGE_SRC} alt="Download on the App Store" className="h-[64px] w-auto" />
          </AppStoreCTA>
          <p className="mt-5 text-sm text-slate-400">
            Box Breathing and 4-7-8 Breathing stay free forever. No account, ads or analytics.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {["Free forever essentials", "iPhone + Apple Watch", "Private by design"].map((item) => (
              <span key={item} className="seo-proof"><CheckCircle2 size={15} /> {item}</span>
            ))}
          </div>
        </div>

        <div className="relative min-h-[560px] md:min-h-[660px] max-w-[500px] w-full mx-auto">
          <div className="absolute inset-8 rounded-full bg-brand-400/10 blur-3xl" aria-hidden="true"></div>
          <div className="phone-shot absolute left-[8%] top-0 w-[60%] -rotate-3">
            <img src={heroScreenshot} alt="Real YourBreath app screen" />
          </div>
          <div className="phone-shot absolute right-[2%] bottom-0 w-[48%] rotate-6">
            <img src={SESSION_SCREENSHOT_SRC} alt="Real guided Box Breathing session in YourBreath" />
          </div>
        </div>
      </div>
    </section>

    <section className="py-20 border-y border-white/5 bg-[#111c32]">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 md:gap-20">
        <div>
          <div className="flex items-center gap-3 mb-5 text-brand-300">
            <Heart size={22} />
            <h2 className="text-3xl font-bold text-white">Free forever</h2>
          </div>
          <p className="text-slate-400 mb-7">The everyday breathing tools remain useful without starting a trial or entering payment details.</p>
          <ul className="space-y-4">
            {freeItems.map((item) => (
              <li key={item} className="flex gap-3 text-slate-200"><CheckCircle2 className="text-brand-300 shrink-0 mt-0.5" size={20} /> {item}</li>
            ))}
          </ul>
        </div>
        <div className="md:border-l md:border-white/10 md:pl-16">
          <div className="flex items-center gap-3 mb-5 text-purple-300">
            <Zap size={22} />
            <h2 className="text-3xl font-bold text-white">One-time Premium</h2>
          </div>
          <p className="text-slate-400 mb-7">Go deeper when you choose. Premium is an optional one-time unlock for version 1.x, not a recurring subscription.</p>
          <ul className="space-y-4">
            {premiumItems.map((item) => (
              <li key={item} className="flex gap-3 text-slate-200"><CheckCircle2 className="text-purple-300 shrink-0 mt-0.5" size={20} /> {item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>

    <section className="py-24 bg-dark-bg">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-3xl mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-5">See the real app</h2>
          <p className="text-lg text-slate-400">These are genuine simulator captures from YourBreath, not generated product mockups.</p>
        </div>
        <div className="screenshot-rail">
          {[
            [HOME_SCREENSHOT_SRC, "YourBreath home screen"],
            [SESSION_SCREENSHOT_SRC, "Active Box Breathing session"],
            [SUMMARY_SCREENSHOT_SRC, "Completed session summary"],
            [PROGRESS_SCREENSHOT_SRC, "Private progress overview"]
          ].map(([src, alt]) => (
            <div className="phone-shot" key={src}>
              <img src={src} alt={alt} loading="lazy" />
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="py-24 bg-dark-card border-y border-white/5">
      <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-x-16 gap-y-10">
        {sections.map((section) => (
          <article key={section.title}>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">{section.title}</h2>
            <p className="text-slate-400 leading-relaxed">{section.body}</p>
          </article>
        ))}
      </div>
    </section>

    {faq.length > 0 && (
      <section className="py-24 bg-dark-bg">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-10">Questions people ask</h2>
          <div className="divide-y divide-white/10">
            {faq.map(([question, answer]) => (
              <article key={question} className="py-6">
                <h3 className="text-xl font-semibold text-white mb-2">{question}</h3>
                <p className="text-slate-400 leading-relaxed">{answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    )}

    <section className="py-24 bg-gradient-to-b from-[#111c32] to-dark-bg text-center">
      <div className="max-w-3xl mx-auto px-6">
        <img src={APP_ICON_SRC} alt="" className="w-20 h-20 rounded-[22%] mx-auto mb-7 shadow-xl" />
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Take one quiet minute.</h2>
        <p className="text-lg text-slate-400 mb-9">Start with the free breathing exercises on iPhone or Apple Watch.</p>
        <AppStoreCTA className="inline-block" ariaLabel="Download YourBreath on the App Store">
          <img src={APP_STORE_BADGE_SRC} alt="Download on the App Store" className="h-[64px] w-auto" />
        </AppStoreCTA>
      </div>
    </section>
  </main>
);

// --- Privacy Policy Component (Provided Text) ---
const PrivacyPolicyView = () => (
  <div className="pt-32 pb-20 max-w-3xl mx-auto px-6 animate-in fade-in duration-500">
    <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
    
    <div className="prose prose-invert prose-slate max-w-none">
      <div className="bg-dark-card p-6 rounded-2xl border border-white/10 mb-8">
        <p className="font-semibold text-white">Effective date: <span className="text-slate-400 font-normal">1.5.2026</span></p>
      </div>

      <section className="mb-8 bg-dark-card p-6 rounded-2xl border border-white/5">
        <h2 className="text-xl font-bold text-white mb-3">About YourBreath</h2>
        <p className="text-slate-400 leading-relaxed">
          YourBreath is a wellness app that guides breathing exercises on iPhone and Apple Watch. The app works on-device, without accounts, advertising SDKs, or third-party analytics.
        </p>
      </section>

      <section className="mb-8 bg-dark-card p-6 rounded-2xl border border-white/5">
        <h2 className="text-xl font-bold text-white mb-3">Data The App Collects and How It Is Used</h2>
        <ul className="list-disc pl-5 space-y-4 text-slate-400">
          <li>
            <strong className="text-white">Breathing sessions and progress:</strong> Session timestamps, duration, exercise type, completion status, and progress metrics stay on your device to power streaks, recommendations, and history views.
          </li>
          <li>
            <strong className="text-white">Heart-related metrics, optional:</strong> If you opt in, the app reads and writes HealthKit data such as mindful sessions, heart rate, resting heart rate, and heart rate variability to show trends and log sessions. Health data never leaves your device and is only visible to you in the Health app and within YourBreath.
          </li>
          <li>
            <strong className="text-white">Notification preferences:</strong> Reminder identifiers and scheduling choices are stored locally to deliver optional practice reminders and weekly reflections.
          </li>
        </ul>
      </section>

      <section className="mb-8 bg-dark-card p-6 rounded-2xl border border-white/5">
        <h2 className="text-xl font-bold text-white mb-3">Storage and Sync</h2>
        <p className="text-slate-400 leading-relaxed">
          Session history, settings, and notification schedules are stored locally using Core Data and UserDefaults. If you enable iCloud for YourBreath, Core Data can mirror records through Apple CloudKit under your Apple ID. The developer cannot access those records.
        </p>
      </section>

      <section className="mb-8 bg-dark-card p-6 rounded-2xl border border-white/5">
        <h2 className="text-xl font-bold text-white mb-3">Data Sharing</h2>
        <p className="text-slate-400 leading-relaxed">
          YourBreath does not transmit, sell, or share personal data with developers or third parties. HealthKit data remains within HealthKit and your device. Optional iCloud sync is handled by Apple under your Apple ID.
        </p>
      </section>

      <section className="mb-8 bg-dark-card p-6 rounded-2xl border border-white/5">
        <h2 className="text-xl font-bold text-white mb-3">Permissions</h2>
        <ul className="list-disc pl-5 space-y-2 text-slate-400">
          <li>HealthKit is requested only for mindful sessions and selected heart metrics.</li>
          <li>Notifications are requested for optional reminders and weekly reflections.</li>
          <li>iCloud sync is controlled in iOS settings.</li>
        </ul>
      </section>

      <section className="mb-8 bg-dark-card p-6 rounded-2xl border border-white/5">
        <h2 className="text-xl font-bold text-white mb-3">Your Choices</h2>
        <ul className="list-disc pl-5 space-y-2 text-slate-400">
          <li>Manage Health permissions in iOS Settings {"->"} Health {"->"} Data Access & Devices.</li>
          <li>Manage notifications in Settings {"->"} Notifications {"->"} YourBreath.</li>
          <li>Disable iCloud sync in Settings {"->"} [your name] {"->"} iCloud {"->"} Show All {"->"} YourBreath.</li>
          <li>Delete app data by deleting the app and removing related Health records or iCloud data if enabled.</li>
        </ul>
      </section>

      <section className="mb-8 bg-dark-card p-6 rounded-2xl border border-white/5">
        <h2 className="text-xl font-bold text-white mb-3">Contact</h2>
        <p className="text-slate-400 leading-relaxed">
          For privacy questions, access or deletion requests, or support, contact <a href={`mailto:${SUPPORT_EMAIL}`} className="text-brand-400 hover:text-brand-300">{SUPPORT_EMAIL}</a>.
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
          If you have any questions about these Terms, please contact us at: <a href={`mailto:${SUPPORT_EMAIL}`} className="text-brand-400 hover:text-brand-300">{SUPPORT_EMAIL}</a>
        </p>
      </section>
    </div>
  </div>
);

const SupportView = () => (
  <div className="pt-32 pb-20 max-w-3xl mx-auto px-6 animate-in fade-in duration-500">
    <h1 className="text-4xl font-bold text-white mb-8">Support</h1>
    
    <div className="prose prose-invert prose-slate max-w-none">
      <p className="text-slate-400 mb-8 leading-relaxed text-lg">
        Find help with YourBreath, Premium, refunds, HealthKit, and Apple Watch.
      </p>

      <section className="mb-8 bg-dark-card p-6 rounded-2xl border border-white/5">
        <h2 className="text-xl font-bold text-white mb-3">Get started quickly</h2>
        <p className="text-slate-400 leading-relaxed">
          Tap Breathe now to start a 30-second Box Breathing session. Long-press to choose routines, duration, and cycles.
        </p>
      </section>

      <section className="mb-8 bg-dark-card p-6 rounded-2xl border border-white/5">
        <h2 className="text-xl font-bold text-white mb-3">What is free?</h2>
        <p className="text-slate-400 leading-relaxed">
          The free version includes quick breathing, core routines, gentle cues, streaks, badges, and local progress.
        </p>
      </section>

      <section className="mb-8 bg-dark-card p-6 rounded-2xl border border-white/5">
        <h2 className="text-xl font-bold text-white mb-3">What does Premium unlock?</h2>
        <p className="text-slate-400 leading-relaxed">
          Premium unlocks advanced techniques, longer routines, 14-day programs, HRV and resting heart rate insights, and YourBreath Advisor. It is a one-time unlock for version 1.x.
        </p>
      </section>

      <section className="mb-8 bg-dark-card p-6 rounded-2xl border border-white/5">
        <h2 className="text-xl font-bold text-white mb-3">How do I restore Premium?</h2>
        <p className="text-slate-400 leading-relaxed">
          Open the Premium screen in the app and tap Restore Purchases. Use the same Apple ID that made the purchase.
        </p>
      </section>

      <section className="mb-8 bg-dark-card p-6 rounded-2xl border border-white/5">
        <h2 className="text-xl font-bold text-white mb-3">How do I request a refund?</h2>
        <p className="text-slate-400 leading-relaxed">
          Apple handles App Store refunds. Go to <a href="https://reportaproblem.apple.com/" target="_blank" rel="noreferrer" className="text-brand-400 hover:text-brand-300">reportaproblem.apple.com</a>, sign in with your Apple ID, and select the YourBreath purchase.
        </p>
      </section>

      <section className="mb-8 bg-dark-card p-6 rounded-2xl border border-white/5">
        <h2 className="text-xl font-bold text-white mb-3">How does Apple Watch work?</h2>
        <p className="text-slate-400 leading-relaxed">
          Install YourBreath on Apple Watch from the Watch app on iPhone. Open the watch app at least once. Premium status, routines, and haptic settings sync automatically when the devices are nearby.
        </p>
      </section>

      <section className="mb-8 bg-dark-card p-6 rounded-2xl border border-white/5">
        <h2 className="text-xl font-bold text-white mb-3">HealthKit and HRV</h2>
        <p className="text-slate-400 leading-relaxed">
          Health access is optional. If you allow it, YourBreath can read and write mindful sessions, heart rate, resting heart rate, and HRV to show your own trends.
        </p>
      </section>

      <section className="mb-8 bg-dark-card p-6 rounded-2xl border border-white/5">
        <h2 className="text-xl font-bold text-white mb-3">My data</h2>
        <p className="text-slate-400 leading-relaxed">
          YourBreath does not use accounts, ads, or analytics. Sessions and settings are stored locally, and optional iCloud sync is controlled by Apple.
        </p>
      </section>

      <section className="mb-8 bg-dark-card p-6 rounded-2xl border border-white/5">
        <h2 className="text-xl font-bold text-white mb-3">Contact support</h2>
        <p className="text-slate-400 leading-relaxed">
          Fill out the form. The form uses your email app.
        </p>
        <form action={`mailto:${SUPPORT_EMAIL}`} method="post" encType="text/plain" className="mt-6 flex flex-col gap-4">
          <input type="text" name="name" placeholder="Your Name" className="bg-dark-bg border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-500" required />
          <input type="email" name="email" placeholder="Your Email" className="bg-dark-bg border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-500" required />
          <textarea name="message" placeholder="Your Message" rows={4} className="bg-dark-bg border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-500" required></textarea>
          <button type="submit" className="bg-brand-600 hover:bg-brand-500 text-white font-semibold py-2 px-6 rounded-lg self-start transition-colors">
            Send Message
          </button>
        </form>
      </section>
    </div>
  </div>
);

// --- Main App Component ---

const App = () => {
  const [currentView, setCurrentView] = useState<ViewState>(() => getViewFromPath(window.location.pathname));
  const [showLearnMore, setShowLearnMore] = useState(false);

  useEffect(() => {
    const handlePopState = () => setCurrentView(getViewFromPath(window.location.pathname));
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const meta = VIEW_META[currentView];
    const canonical = `https://yourbreath.app${VIEW_PATHS[currentView]}`;
    document.title = meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', meta.description);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', meta.title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', meta.description);
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', canonical);
    document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', meta.title);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', meta.description);
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', canonical);
  }, [currentView]);

  const navigateTo = (view: ViewState) => {
    const nextPath = VIEW_PATHS[view];
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-dark-bg text-slate-50 selection:bg-brand-500/30 font-sans">
      <Navigation
        currentView={currentView}
        onChangeView={navigateTo}
      />
      
      {currentView === 'home' && (
        <main className="animate-in fade-in duration-500">
          <Hero
            onOpenLearnMore={() => setShowLearnMore(true)}
          />
          <Features />
          <BreathingTechniques />
          <WatchShowcase />
          <Premium />
          <PrivacyFeature onChangeView={navigateTo} />
          <CommunityCTA />
          <FAQ onChangeView={navigateTo} />
          <DownloadCTA />
        </main>
      )}

      {currentView === 'about' && <AboutView onChangeView={navigateTo} />}

      {currentView === 'press' && <PressView />}

      {currentView === 'apple-watch' && (
        <SEOView
          title="Breathing app for Apple Watch"
          intro="YourBreath lets you start short breathing sessions directly from your Apple Watch."
          sections={[
            {
              title: "Start from your wrist",
              body: "The Watch is ideal for breathing practice because it is already on your wrist. You do not need to unlock your phone, open a distracting feed or create an account."
            },
            {
              title: "Visual cues, sound and haptics",
              body: "With YourBreath, you can follow calm visual cues, sound or haptics and begin a short breathing session when you need a pause."
            }
          ]}
        />
      )}

      {currentView === 'private-breathing-app' && (
        <SEOView
          title="A private breathing app with no account, no ads and no analytics"
          intro="YourBreath was designed with privacy at the center."
          sections={[
            {
              title: "Private by design",
              body: "You do not need to create an account. You do not see ads. Your app usage is not tracked with analytics. Your breathing sessions stay with you."
            },
            {
              title: "Respectful breathing practice",
              body: "A breathing app should be calm and respectful by design, without turning a quiet pause into another tracked digital habit."
            }
          ]}
        />
      )}

      {currentView === 'no-subscription' && (
        <SEOView
          title="A breathing app that stays free where it matters"
          intro="Box Breathing and 4-7-8 Breathing are free forever on iPhone and Apple Watch. You can use the core app without starting a trial, creating an account or paying every month."
          sections={[
            {
              title: "Not a short free trial",
              body: "Free means ongoing access to the core breathing experience. Box Breathing and 4-7-8 Breathing remain available after the first day, week and month."
            },
            {
              title: "No recurring charge",
              body: "Premium is optional. It unlocks additional techniques, programs and insights through a one-time purchase for version 1.x rather than a monthly or annual subscription."
            },
            {
              title: "Free on Apple Watch too",
              body: "The free breathing exercises are available on both iPhone and Apple Watch, including calm visual guidance and haptic cues from your wrist."
            },
            {
              title: "Private from the first breath",
              body: "YourBreath does not require an account, show ads or use third-party analytics. The app is designed to help you pause without creating another data profile."
            }
          ]}
          faq={[
            ["Is YourBreath really free?", "Yes. Box Breathing and 4-7-8 Breathing stay free forever on iPhone and Apple Watch."],
            ["Does the free version expire?", "No. The core free exercises are not a time-limited trial."],
            ["Is Premium a subscription?", "No. Premium is an optional one-time unlock for version 1.x."],
            ["Do I need an account?", "No. You can use YourBreath without creating an account."]
          ]}
        />
      )}

      {currentView === 'breathing-techniques' && (
        <SEOView
          title="Breathing techniques in YourBreath"
          intro="YourBreath includes simple guided breathing patterns such as Box Breathing and 4-7-8 breathing."
          sections={[
            {
              title: "Core routines",
              body: "The app uses calm visual cues, sound and haptics to make each session easy to follow on iPhone and Apple Watch."
            },
            {
              title: "Premium variety",
              body: "Premium unlocks additional breathing routines for users who want more variety and a deeper breathing practice."
            }
          ]}
          heroScreenshot={SESSION_SCREENSHOT_SRC}
          faq={[
            ["Is Box Breathing free?", "Yes. Box Breathing stays free on iPhone and Apple Watch."],
            ["Is 4-7-8 Breathing free?", "Yes. 4-7-8 Breathing is part of the free core experience."],
            ["Can Apple Watch guide a session?", "Yes. YourBreath can use visual cues and haptics on Apple Watch."]
          ]}
        />
      )}

      {currentView === 'breathwork-app' && (
        <SEOView
          title="A breathwork app built for the moment you need it"
          intro="Start guided breathwork without an account, a feed or a monthly subscription. YourBreath brings simple sessions to iPhone and Apple Watch."
          sections={[
            {
              title: "Breathwork without setup",
              body: "Open the app and begin a short session. Clear visual timing, sound and optional haptics guide the inhale, hold and exhale phases."
            },
            {
              title: "Start with familiar techniques",
              body: "Box Breathing and 4-7-8 Breathing stay free forever. Premium adds more techniques and structured programs when you want a broader practice."
            },
            {
              title: "Made for iPhone and Apple Watch",
              body: "Use the larger iPhone display at home or follow discreet haptic guidance from your wrist when looking at a screen is inconvenient."
            },
            {
              title: "No attention economy",
              body: "There are no ads, social feeds or third-party analytics. YourBreath is designed to be opened, used and put away."
            }
          ]}
          heroScreenshot={SESSION_SCREENSHOT_SRC}
          faq={[
            ["What is a breathwork app?", "A breathwork app guides timed breathing patterns so you can follow a session without counting each phase yourself."],
            ["Can I use YourBreath for free?", "Yes. Box Breathing and 4-7-8 Breathing stay free forever."],
            ["Does it work on Apple Watch?", "Yes. YourBreath includes an Apple Watch experience with visual and haptic guidance."]
          ]}
        />
      )}

      {currentView === 'mindfulness-app' && (
        <SEOView
          title="A mindfulness breathing app without the noise"
          intro="Use a short guided breath as a simple mindful pause. No account, no ads and no analytics competing for your attention."
          sections={[
            {
              title: "A practical mindful pause",
              body: "YourBreath focuses on one small action: following the next inhale and exhale. Sessions can be short enough to fit between everyday tasks."
            },
            {
              title: "Gentle, not demanding",
              body: "The app supports calm routines and private progress without a social feed or pressure to perform for anyone else."
            },
            {
              title: "Private by design",
              body: "YourBreath works without an account or advertising profile. Optional HealthKit and iCloud features stay under your Apple settings."
            },
            {
              title: "On your wrist when useful",
              body: "Apple Watch haptics can guide a breathing rhythm when you prefer not to keep looking at your phone."
            }
          ]}
          faq={[
            ["Can breathing be a mindfulness practice?", "A guided breathing session can provide a simple point of attention for a short mindful pause."],
            ["Does YourBreath have ads?", "No. YourBreath does not show ads or use third-party analytics."],
            ["Do I need to subscribe?", "No. Core exercises stay free, and Premium is an optional one-time unlock."]
          ]}
        />
      )}

      {currentView === 'meditation-app' && (
        <SEOView
          title="Simple breathing meditation on iPhone and Apple Watch"
          intro="When a long meditation feels like too much, start with one guided breathing session. YourBreath keeps the experience focused and private."
          sections={[
            {
              title: "Begin with the breath",
              body: "A timed breathing pattern gives your attention a clear rhythm. Follow the visual cue, sound or haptics instead of watching a clock."
            },
            {
              title: "Short sessions count",
              body: "YourBreath supports quick everyday pauses as well as longer routines, so a breathing meditation can fit the time you actually have."
            },
            {
              title: "Free practices that remain free",
              body: "Box Breathing and 4-7-8 Breathing stay free forever on iPhone and Apple Watch."
            },
            {
              title: "A quiet app, not a content feed",
              body: "No account, advertising or third-party analytics are required. Open the app for a session, then return to your day."
            }
          ]}
          heroScreenshot={SESSION_SCREENSHOT_SRC}
          faq={[
            ["Is YourBreath a meditation app?", "YourBreath is a guided breathing app that can support a simple breath-focused meditation practice."],
            ["How long is a session?", "You can start with a quick session and adjust routines and duration in the app."],
            ["Is there a free breathing meditation?", "Yes. Box Breathing and 4-7-8 Breathing stay free forever."]
          ]}
        />
      )}
      
      {currentView === 'privacy' && <PrivacyPolicyView />}
      
      {currentView === 'terms' && <TermsOfServiceView />}
      
      {currentView === 'support' && <SupportView />}

      <LearnMoreModal
        open={showLearnMore}
        onClose={() => setShowLearnMore(false)}
      />
      
      <Footer
        onChangeView={navigateTo}
      />
    </div>
  );
};

export default App;
