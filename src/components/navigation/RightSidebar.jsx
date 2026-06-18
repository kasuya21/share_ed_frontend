import React from 'react';
import { TrendingUp, Target, Award, ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import useGamificationStore from '../../store/useGamificationStore';
import { fetchMostLikedPosts, fetchTrendingPosts } from '../../services/endpoints';

export default function RightSidebar() {
  const { quests, milestonesCompleted, fetchQuests } = useGamificationStore();

  React.useEffect(() => {
    fetchQuests();
  }, [fetchQuests]);

  const { data: trending = [] } = useQuery({
    queryKey: ['sidebar-trending'],
    queryFn: fetchTrendingPosts,
  });

  const { data: mostLiked = [] } = useQuery({
    queryKey: ['sidebar-liked'],
    queryFn: fetchMostLikedPosts,
  });

  const level = (milestonesCompleted || 0) + 1;

  const sidebarPosts = [...(trending || []).slice(0, 2), ...(mostLiked || []).slice(0, 1)];

  return (
    <div className="flex flex-col h-full gap-6 pb-8">
      <div className="card-premium p-5 bg-card/80 backdrop-blur-md relative overflow-hidden">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <Award className="text-primary" size={20} />
            Level {level}
          </h3>
          <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-md">
            Milestones: {milestonesCompleted || 0}
          </span>
        </div>
      </div>

      <div className="card-premium p-5 bg-card/80 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold flex items-center gap-2 text-foreground">
            <Target className="text-yellow-500" size={20} />
            Quests
          </h3>
          <Link to="/quests" className="text-muted-foreground hover:text-primary transition-colors">
            <ChevronRight size={18} />
          </Link>
        </div>
        <div className="flex flex-col gap-4">
          {quests?.slice(0, 2).map((quest) => (
            <div key={quest.id} className="flex flex-col gap-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-foreground">{quest.quest_name}</span>
                <span className="text-xs font-bold text-muted-foreground">{quest.current_progress}/{quest.target_value}</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-1.5 rounded-full transition-all ${
                    quest.current_progress >= quest.target_value ? 'bg-accent' : 'bg-primary'
                  }`}
                  style={{
                    width: `${Math.min((quest.current_progress / quest.target_value) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
          {(!quests || quests.length === 0) && (
            <p className="text-sm text-muted-foreground">No active quests.</p>
          )}
        </div>
      </div>

      <div className="card-premium p-5 bg-card/80 backdrop-blur-md">
        <h3 className="font-bold flex items-center gap-2 mb-4 text-foreground">
          <TrendingUp className="text-accent" size={20} />
          Trending posts
        </h3>
        <div className="flex flex-col gap-3">
          {sidebarPosts.length > 0 ? (
            sidebarPosts.map((post) => (
              <Link
                key={post.id}
                to={`/posts/${post.id}`}
                className="text-sm font-medium text-foreground hover:text-primary line-clamp-2 transition-colors"
              >
                {post.title}
              </Link>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No trending posts yet.</p>
          )}
          <Link to="/trending" className="text-xs font-bold text-primary hover:underline mt-1">
            See all trending →
          </Link>
        </div>
      </div>
    </div>
  );
}
