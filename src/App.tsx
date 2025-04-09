import { useState } from 'react';
import { GithubIcon, Search, Users, Star, GitFork, Code, ExternalLink, Calendar } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Repository {
  id: number;
  name: string;
  description: string;
  stargazers_count: number;
  language: string;
  html_url: string;
  forks_count: number;
  created_at: string;
  updated_at: string;
}

interface UserProfile {
  avatar_url: string;
  name: string;
  login: string;
  bio: string;
  followers: number;
  following: number;
  public_repos: number;
  created_at: string;
}

interface CommitData {
  date: string;
  count: number;
}

interface LanguageStats {
  name: string;
  count: number;
}

function App() {
  const [username, setUsername] = useState('');
  const [repos, setRepos] = useState<Repository[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [commitData, setCommitData] = useState<CommitData[]>([]);
  const [languageStats, setLanguageStats] = useState<LanguageStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchGitHubData = async () => {
    if (!username) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Fetch user profile
      const profileResponse = await fetch(`https://api.github.com/users/${username}`);
      if (!profileResponse.ok) throw new Error('User not found or API limit exceeded');
      const profileData = await profileResponse.json();
      setProfile(profileData);

      // Fetch repositories
      const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`);
      if (!reposResponse.ok) throw new Error('Failed to fetch repositories');
      const reposData = await reposResponse.json();
      setRepos(reposData);

      // Calculate language statistics
      const langMap = reposData.reduce((acc: Record<string, number>, repo: Repository) => {
        if (repo.language) {
          acc[repo.language] = (acc[repo.language] || 0) + 1;
        }
        return acc;
      }, {});
      
      const langStats = Object.entries(langMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
      setLanguageStats(langStats);

      // Fetch commit activity
      const commitsResponse = await fetch(`https://api.github.com/users/${username}/events`);
      if (!commitsResponse.ok) throw new Error('Failed to fetch commit data');
      const eventsData = await commitsResponse.json();
      
      const commitsByDate = eventsData
        .filter((event: any) => event.type === 'PushEvent')
        .reduce((acc: any, event: any) => {
          const date = new Date(event.created_at).toLocaleDateString();
          acc[date] = (acc[date] || 0) + event.payload.size;
          return acc;
        }, {});

      const processedCommitData = Object.entries(commitsByDate)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setCommitData(processedCommitData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setProfile(null);
      setRepos([]);
      setCommitData([]);
      setLanguageStats([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-2">
            <GithubIcon className="w-8 h-8" />
            <h1 className="text-3xl font-bold">GitHub Profile Analyzer</h1>
          </div>
          <div className="flex w-full max-w-md space-x-2">
            <Input
              placeholder="Enter GitHub username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchGitHubData()}
            />
            <Button onClick={fetchGitHubData} disabled={loading}>
              {loading ? 'Loading...' : <Search className="w-4 h-4" />}
            </Button>
          </div>
          {error && <p className="text-destructive">{error}</p>}
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        ) : profile && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile.avatar_url} alt={profile.name} />
                    <AvatarFallback>{profile.login.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold">{profile.name}</h2>
                    <p className="text-muted-foreground">@{profile.login}</p>
                    {profile.bio && <p className="text-sm">{profile.bio}</p>}
                    <div className="flex space-x-4 text-sm">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {profile.followers} followers
                      </div>
                      <div>·</div>
                      <div>{profile.following} following</div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Joined {formatDate(profile.created_at)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Repository Languages</CardTitle>
                <CardDescription>Distribution of programming languages</CardDescription>
              </CardHeader>
              <CardContent className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={languageStats}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {profile && (
          <Tabs defaultValue="activity" className="space-y-4">
            <TabsList>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="repositories">Repositories</TabsTrigger>
            </TabsList>

            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Commit Activity</CardTitle>
                  <CardDescription>Daily commit frequency over time</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={commitData}>
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="count" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="repositories">
              <Card>
                <CardHeader>
                  <CardTitle>Repositories</CardTitle>
                  <CardDescription>List of public repositories ({repos.length})</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px] w-full">
                    <div className="space-y-4">
                      {repos.map((repo) => (
                        <Card key={repo.id}>
                          <CardContent className="pt-6">
                            <div className="space-y-3">
                              <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-2">
                                    <a
                                      href={repo.html_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-lg font-semibold hover:underline inline-flex items-center"
                                    >
                                      {repo.name}
                                      <ExternalLink className="w-4 h-4 ml-1" />
                                    </a>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {repo.description || 'No description available'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2 items-center text-sm">
                                {repo.language && (
                                  <Badge variant="secondary">
                                    <Code className="w-3 h-3 mr-1" />
                                    {repo.language}
                                  </Badge>
                                )}
                                <Badge variant="outline">
                                  <Star className="w-3 h-3 mr-1" />
                                  {repo.stargazers_count}
                                </Badge>
                                <Badge variant="outline">
                                  <GitFork className="w-3 h-3 mr-1" />
                                  {repo.forks_count}
                                </Badge>
                                <span className="text-muted-foreground">
                                  Updated {formatDate(repo.updated_at)}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

export default App;