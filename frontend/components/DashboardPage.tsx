import { useEffect, useState } from 'react';
import { TrendingUp, Brain, Target, Clock, Sunrise, Sunset } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { analyticsAPI } from '../services/api';

interface TopicProgress {
  name: string;
  progress: number;
  streak: number;
  lastActivity: string;
  timeOfDay: 'twilight' | 'dawn' | 'morning' | 'day';
}

const getTimeOfDayGradient = (timeOfDay: string) => {
  switch (timeOfDay) {
    case 'twilight':
      return 'from-indigo-900 via-purple-900 to-slate-900';
    case 'dawn':
      return 'from-orange-300 via-pink-300 to-purple-400';
    case 'morning':
      return 'from-yellow-200 via-orange-200 to-pink-200';
    case 'day':
      return 'from-blue-200 via-cyan-200 to-blue-300';
    default:
      return 'from-slate-200 to-slate-300';
  }
};

const getTimeOfDayIcon = (timeOfDay: string) => {
  switch (timeOfDay) {
    case 'twilight':
      return <Sunset className="w-5 h-5 text-purple-300" />;
    case 'dawn':
    case 'morning':
      return <Sunrise className="w-5 h-5 text-orange-400" />;
    case 'day':
      return <Sunrise className="w-5 h-5 text-yellow-500" />;
    default:
      return null;
  }
};

const getTimeOfDayLabel = (timeOfDay: string) => {
  switch (timeOfDay) {
    case 'twilight':
      return 'Just Starting';
    case 'dawn':
      return 'Knowledge Dawning';
    case 'morning':
      return 'Making Progress';
    case 'day':
      return 'Well Understood';
    default:
      return 'Unknown';
  }
};

export function DashboardPage() {
  const [topicProgress, setTopicProgress] = useState<TopicProgress[]>([]);
  const [weeklyStats, setWeeklyStats] = useState({
    totalCards: 0,
    quizzesCompleted: 0,
    tutoringSessions: 0,
    averageConfidence: 0,
  });
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUserId = localStorage.getItem('userId');
        if (!storedUserId) {
          console.error('No user ID found in localStorage');
          return;
        }

        const userId = parseInt(storedUserId, 10);
        setUserId(userId);
        console.log(userId)

        const [weeklyStatsData, topicProgressData] = await Promise.all([
          analyticsAPI.getWeeklyStats(userId),
          analyticsAPI.getTopicProgress(userId)
        ]);

        setWeeklyStats(weeklyStatsData);
        setTopicProgress(topicProgressData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-slate-900 mb-2">Dashboard</h1>
          <p className="text-slate-600">Track your learning progress across all topics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Cards Reviewed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-900">{weeklyStats.totalCards}</p>
                  <p className="text-slate-500 text-sm">This week</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Quizzes Completed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-900">{weeklyStats.quizzesCompleted}</p>
                  <p className="text-slate-500 text-sm">This week</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Tutoring Sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-900">{weeklyStats.tutoringSessions}</p>
                  <p className="text-slate-500 text-sm">This week</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Avg. Confidence</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-900">{weeklyStats.averageConfidence}/4</p>
                  <p className="text-slate-500 text-sm">This week</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Topic Progress</CardTitle>
            <CardDescription>
              Your learning journey visualized through the time of day motif
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {topicProgress.map((topic) => (
                <div key={topic.name} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h3 className="text-slate-900">{topic.name}</h3>
                      <Badge variant="outline" className="gap-1.5">
                        {getTimeOfDayIcon(topic.timeOfDay)}
                        {getTimeOfDayLabel(topic.timeOfDay)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-slate-600">{topic.progress}% complete</span>
                      <span className="text-slate-500">{topic.streak} day streak</span>
                    </div>
                  </div>
                  
                  <div className="relative h-16 rounded-xl overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-r ${getTimeOfDayGradient(topic.timeOfDay)}`} />
                    <div 
                      className="absolute inset-0 bg-white transition-all duration-500"
                      style={{ 
                        width: `${100 - topic.progress}%`,
                        marginLeft: `${topic.progress}%`
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-between px-4">
                      <span className="text-white text-sm drop-shadow-lg">
                        {topic.timeOfDay === 'twilight' && 'Beginning to learn...'}
                        {topic.timeOfDay === 'dawn' && 'Knowledge dawning...'}
                        {topic.timeOfDay === 'morning' && 'Understanding brightening...'}
                        {topic.timeOfDay === 'day' && 'Fully illuminated!'}
                      </span>
                      <span className="text-white text-xs drop-shadow-lg">
                        Last activity: {topic.lastActivity}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Digest</CardTitle>
            <CardDescription>Your learning highlights from the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-green-900">Strong Progress in Spanish Vocabulary</p>
                  <p className="text-green-700 text-sm mt-1">
                    You've maintained a 28-day streak and achieved 90% mastery. Keep it up!
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-blue-900">Machine Learning Milestone</p>
                  <p className="text-blue-700 text-sm mt-1">
                    You've completed 75% of your Machine Learning materials. Knowledge is dawning!
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-orange-900">Focus Opportunity</p>
                  <p className="text-orange-700 text-sm mt-1">
                    Art History needs attention. Try reviewing some flashcards to keep your momentum.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
