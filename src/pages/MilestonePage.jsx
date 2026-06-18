import React, { useEffect } from 'react';
import useMilestoneStore from '../store/useMilestoneStore';
import { Trophy, CheckCircle, Award, Star } from 'lucide-react';
import clsx from 'clsx';

export default function MilestonePage() {
  const { milestones, loading, fetchMilestones, claimReward } = useMilestoneStore();

  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);

  if (loading) {
    return (
      <div className="flex-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/80 to-accent rounded-3xl p-8 md:p-12 mb-10 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-20 pointer-events-none">
          <Trophy className="w-64 h-64 text-white" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <Award className="w-10 h-10 text-white" />
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-extrabold text-primary-foreground mb-2 tracking-tight">Milestones</h1>
            <p className="text-primary-foreground/80 text-lg max-w-xl">
              ทำภารกิจให้สำเร็จเพื่อสะสมความสำเร็จและรับของรางวัลสุดพิเศษ (Themes & Frames)
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Milestones */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {milestones.length === 0 ? (
          <div className="col-span-full py-20 text-center text-muted-foreground bg-card rounded-3xl border border-border shadow-sm">
            <Star className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-lg">ยังไม่มี Milestone ในขณะนี้</p>
          </div>
        ) : (
          milestones.map((m) => {
            const isCompleted = m.is_completed;
            const isClaimed = m.claimed_at !== null;
            const progressPercent = Math.min((m.current_progress / m.target_value) * 100, 100);

            return (
              <div 
                key={m.id} 
                className={clsx(
                  "relative p-6 rounded-3xl border transition-all duration-300 flex flex-col",
                  isClaimed 
                    ? "bg-secondary border-border" 
                    : "bg-card border-border shadow-xl shadow-border/40 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10"
                )}
              >
                
                {isClaimed && (
                  <div className="absolute top-4 right-4 text-accent bg-accent/10 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> รับแล้ว
                  </div>
                )}

                <h3 className={clsx("text-xl font-bold mb-1 pr-16", isClaimed ? "text-muted-foreground" : "text-foreground")}>
                  {m.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-6 flex-1 line-clamp-2">{m.description}</p>
                
                {m.reward_item && (
                  <div className="mb-6 p-3 bg-primary/5 rounded-xl border border-primary/20 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Star className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-primary uppercase tracking-wider">ของรางวัล</p>
                      <p className="text-sm font-medium text-foreground">{m.reward_item.item_name}</p>
                    </div>
                  </div>
                )}

                <div className="mt-auto">
                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span className={isClaimed ? "text-muted-foreground/60" : "text-primary"}>
                      ความคืบหน้า
                    </span>
                    <span className="text-muted-foreground">{m.current_progress} / {m.target_value}</span>
                  </div>
                  
                  <div className="h-3 w-full bg-secondary rounded-full overflow-hidden mb-4">
                    <div 
                      className={clsx(
                        "h-full rounded-full transition-all duration-1000",
                        isClaimed ? "bg-muted-foreground/30" : (isCompleted ? "bg-accent" : "bg-gradient-to-r from-primary to-primary/60")
                      )}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  {!isClaimed && (
                    <button
                      onClick={() => claimReward(m.id)}
                      disabled={!isCompleted}
                      className={clsx(
                        "w-full py-3 px-4 rounded-xl font-semibold transition-all shadow-sm active:scale-[0.98]",
                        isCompleted 
                          ? "bg-accent text-accent-foreground hover:bg-accent/90 shadow-accent/25 hover:shadow-lg" 
                          : "bg-secondary text-muted-foreground cursor-not-allowed"
                      )}
                    >
                      {isCompleted ? 'รับรางวัลเลย!' : 'ยังไม่สำเร็จ'}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
