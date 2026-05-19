import Link from "next/link";
import {
  Heart, Shield, Clock, Users, Star, ArrowRight,
  Activity, Calendar, FileText, Zap, Brain, Sparkles, Check
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Background Orbs */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-[120px] animate-float" style={{ animationDelay: "0s" }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/50 rounded-full blur-[120px] animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-purple-50/50 rounded-full blur-[80px] animate-float" style={{ animationDelay: "4s" }} />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-gray-100/50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight gradient-text">MedixAI</span>
            </div>
            <div className="hidden md:flex items-center gap-10">
              <a href="#features" className="text-sm font-semibold text-gray-500 hover:text-blue-600 transition-colors">Platform</a>
              <a href="#ai" className="text-sm font-semibold text-gray-500 hover:text-blue-600 transition-colors">AI Services</a>
              <a href="#reviews" className="text-sm font-semibold text-gray-500 hover:text-blue-600 transition-colors">Success Stories</a>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="hidden sm:block text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors">
                Sign In
              </Link>
              <Link href="/signup" className="bg-gray-900 text-white text-sm font-bold px-6 py-3 rounded-2xl hover:bg-black transition-all shadow-xl shadow-gray-200 active:scale-95">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-44 pb-32 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 text-[11px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-8 border border-indigo-100/50">
              <Sparkles className="w-3.5 h-3.5" />
              The Future of Healthcare is Here
            </div>
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black text-gray-900 leading-[1.05] tracking-tight mb-8">
              Intelligence that
              <br />
              <span className="gradient-text-premium">Saves Lives.</span>
            </h1>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
              Experience a clinical-grade AI platform that empowers patients and doctors with real-time insights, automated analysis, and seamless care.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
              <Link href="/signup" className="btn-premium flex items-center gap-3">
                Start Journey Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/login" className="flex items-center gap-3 text-gray-900 font-bold px-8 py-4 rounded-2xl hover:bg-gray-50 transition-all border border-gray-100">
                Explore Dashboard
              </Link>
            </div>
            
            {/* Trusted By */}
            <div className="mt-20">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-8">Trusted by Global Institutions</p>
              <div className="flex flex-wrap justify-center gap-12 grayscale opacity-40">
                <div className="text-2xl font-black italic">HEALTHCARE.CO</div>
                <div className="text-2xl font-black italic">BIOMED</div>
                <div className="text-2xl font-black italic">NEUROTECH</div>
                <div className="text-2xl font-black italic">VITALIS</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features Grid */}
      <section id="ai" className="py-32 bg-gray-50/50 px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6">AI-Driven Medical Core</h2>
            <p className="text-lg text-gray-500 font-medium max-w-2xl mx-auto">Precision diagnostics and analysis powered by advanced neural networks.</p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            {[
              { 
                icon: Brain, 
                title: "Clinical Assistant", 
                desc: "Real-time clinical decision support for physicians with differential diagnosis generation.", 
                color: "from-purple-500 to-indigo-600" 
              },
              { 
                icon: FileText, 
                title: "Report Intelligence", 
                desc: "Instant plain-language analysis of blood tests, MRI, and complex medical reports.", 
                color: "from-blue-500 to-cyan-600" 
              },
              { 
                icon: Zap, 
                title: "Predictive Screening", 
                desc: "Advanced symptom analysis with urgency detection and specialist recommendations.", 
                color: "from-amber-400 to-orange-600" 
              },
            ].map((item) => (
              <div key={item.title} className="stat-card group">
                <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-4">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed font-medium mb-6">{item.desc}</p>
                <div className="flex items-center gap-2 text-sm font-bold text-blue-600 group-hover:gap-3 transition-all">
                  Learn more <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Showcase */}
      <section id="features" className="py-32 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-600/10 rounded-[3rem] blur-3xl -rotate-6" />
              <div className="relative bg-white rounded-[3rem] border border-gray-100 shadow-2xl p-4 overflow-hidden">
                <div className="bg-gray-900 rounded-[2.5rem] p-8 min-h-[400px]">
                  <div className="flex items-center gap-3 mb-10">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  </div>
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-800 rounded-full w-3/4 animate-pulse" />
                    <div className="h-4 bg-gray-800 rounded-full w-1/2 animate-pulse" />
                    <div className="h-20 bg-blue-600/20 rounded-2xl border border-blue-500/30 flex items-center justify-center">
                      <Activity className="w-8 h-8 text-blue-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-12 bg-gray-800 rounded-xl" />
                      <div className="h-12 bg-gray-800 rounded-xl" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-8 leading-tight">Everything you need for <span className="text-blue-600">modern practice.</span></h2>
              <div className="space-y-6">
                {[
                  "Smart Appointment Management",
                  "Unified Patient History",
                  "Encrypted Digital Prescriptions",
                  "Real-time Collaboration Tools",
                  "Multi-Role Access Control"
                ].map(text => (
                  <div key={text} className="flex items-center gap-4">
                    <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-lg font-semibold text-gray-700">{text}</span>
                  </div>
                ))}
              </div>
              <div className="mt-12">
                <Link href="/signup" className="inline-flex items-center gap-2 bg-gray-900 text-white font-bold px-8 py-4 rounded-2xl hover:bg-black transition-all">
                  Get Full Access
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto relative overflow-hidden bg-gray-900 rounded-[3rem] p-16 lg:p-24 text-center">
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-blue-600/20 to-indigo-700/20 pointer-events-none" />
          <Heart className="w-16 h-16 text-blue-500 mx-auto mb-10 animate-pulse" />
          <h2 className="text-4xl sm:text-6xl font-black text-white mb-8">Ready to elevate your care?</h2>
          <p className="text-gray-400 text-xl mb-12 max-w-xl mx-auto">Join over 2,500 clinics worldwide delivering elite patient experiences with MedixAI.</p>
          <Link href="/signup" className="inline-flex items-center gap-3 bg-white text-gray-900 font-black px-10 py-5 rounded-2xl hover:bg-blue-50 transition-all active:scale-95 shadow-2xl shadow-blue-500/20">
            Join the Network
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-16 px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-gray-900">MedixAI</span>
          </div>
          <div className="flex gap-10 text-sm font-bold text-gray-400">
            <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Security</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Docs</a>
            <a href="#" className="hover:text-blue-600 transition-colors">API</a>
          </div>
          <p className="text-sm font-semibold text-gray-400">© 2025 MedixAI Global. Built for Excellence.</p>
        </div>
      </footer>
    </div>
  );
}
