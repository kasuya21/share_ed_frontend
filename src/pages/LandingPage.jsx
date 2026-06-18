import React from 'react';
import { BookOpen, Users, Award, Shield, Sparkles } from 'lucide-react';
import { Link } from 'react-router';
import useAuthStore from '../store/useAuthStore';

export default function LandingPage() {
  const { signInWithGoogle } = useAuthStore();

  return (
    <div className="flex flex-col gap-16 pb-20 w-full max-w-5xl mx-auto">
      
      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center text-center pt-20 pb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-sm mb-6">
          <Sparkles size={16} />
          <span>The #1 Social Learning Platform</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl text-foreground">
          Learn Together. <br/>
          <span className="text-gradient">Succeed Together.</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl">
          Share study notes, ask questions, and earn rewards while helping others. Join thousands of students already learning on ShareEd.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button onClick={signInWithGoogle} className="btn-premium btn-primary-custom h-14 px-8 text-lg w-full sm:w-auto">
            Get Started Free
          </button>
          <Link to="/explore" className="btn-premium bg-transparent border border-border text-foreground hover:bg-secondary h-14 px-8 text-lg font-bold w-full sm:w-auto rounded-2xl flex items-center justify-center">
            Explore Resources
          </Link>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-3 gap-6 mt-10">
        <div className="card-premium p-8 bg-gradient-to-br from-card to-primary/5 flex flex-col items-center text-center border-border">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
            <BookOpen size={32} />
          </div>
          <h3 className="text-xl font-bold mb-3 text-foreground">Share Study Notes</h3>
          <p className="text-muted-foreground">Upload your PDFs and summaries. Help others while reinforcing your own learning.</p>
        </div>
        
        <div className="card-premium p-8 bg-gradient-to-br from-card to-yellow-500/5 flex flex-col items-center text-center border-border">
          <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center mb-6">
            <Award size={32} />
          </div>
          <h3 className="text-xl font-bold mb-3 text-foreground">Achieve Milestones</h3>
          <p className="text-muted-foreground">Complete quests, achieve milestones, and unlock premium themes for your profile.</p>
        </div>

        <div className="card-premium p-8 bg-gradient-to-br from-card to-emerald-500/5 flex flex-col items-center text-center border-border">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6">
            <Users size={32} />
          </div>
          <h3 className="text-xl font-bold mb-3 text-foreground">Connect with Peers</h3>
          <p className="text-muted-foreground">Follow top contributors from different schools and discuss subjects together.</p>
        </div>
      </div>

      {/* Social Proof */}
      <div className="card-premium p-10 bg-primary text-primary-foreground text-center flex flex-col items-center border-border">
        <Shield size={48} className="mb-4 opacity-80" />
        <h2 className="text-3xl font-extrabold mb-4">Ready to boost your grades?</h2>
        <p className="text-primary-foreground/80 max-w-xl mb-8">
          ShareEd is completely free for all students. Create an account today and start accessing high-quality resources instantly.
        </p>
        <button onClick={signInWithGoogle} className="btn-premium bg-background text-primary hover:bg-secondary px-10 h-14 text-lg font-bold">
          Join ShareEd Now
        </button>
      </div>

    </div>
  );
}
