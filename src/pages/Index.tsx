import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Brain, BookOpen, BarChart3, Calendar, Trophy, Sparkles, ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-secondary to-accent py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center text-white animate-fade-in">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-3xl animate-bounce-subtle">
                <Brain className="w-16 h-16 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 drop-shadow-lg">
              SmartQuiz Portal
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto">
              AI-Powered Learning Platform for School Students
            </p>
            <p className="text-lg mb-10 text-white/80">
              Master your subjects with intelligent quizzes powered by AI • Classes 8-10
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate("/auth")}
                className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 shadow-2xl"
              >
                Get Started <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate("/auth")}
                className="bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20 text-lg px-8 py-6"
              >
                Login
              </Button>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 opacity-20">
          <Sparkles className="w-20 h-20 text-white animate-pulse" />
        </div>
        <div className="absolute bottom-20 right-10 opacity-20">
          <Sparkles className="w-16 h-16 text-white animate-pulse" style={{ animationDelay: "1s" }} />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Why SmartQuiz?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to excel in your studies, powered by cutting-edge AI
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:shadow-xl transition-all hover:-translate-y-2 bg-gradient-to-br from-white to-primary/5">
              <CardHeader>
                <div className="p-3 bg-primary/10 rounded-xl w-fit mb-2">
                  <Brain className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">AI-Generated Quizzes</CardTitle>
                <CardDescription>
                  Fresh, unique questions every time powered by advanced AI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Adaptive difficulty levels</li>
                  <li>• Subject-specific questions</li>
                  <li>• Detailed explanations</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-xl transition-all hover:-translate-y-2 bg-gradient-to-br from-white to-secondary/5">
              <CardHeader>
                <div className="p-3 bg-secondary/10 rounded-xl w-fit mb-2">
                  <BookOpen className="w-8 h-8 text-secondary" />
                </div>
                <CardTitle className="text-2xl">5 Core Subjects</CardTitle>
                <CardDescription>
                  Complete coverage for Classes 8, 9, and 10
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Mathematics</li>
                  <li>• Science</li>
                  <li>• English</li>
                  <li>• Social Studies</li>
                  <li>• Computer Science</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-xl transition-all hover:-translate-y-2 bg-gradient-to-br from-white to-success/5">
              <CardHeader>
                <div className="p-3 bg-success/10 rounded-xl w-fit mb-2">
                  <BarChart3 className="w-8 h-8 text-success" />
                </div>
                <CardTitle className="text-2xl">Track Progress</CardTitle>
                <CardDescription>
                  Detailed analytics and performance insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Score tracking</li>
                  <li>• Subject-wise analysis</li>
                  <li>• Improvement graphs</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-xl transition-all hover:-translate-y-2 bg-gradient-to-br from-white to-accent/5">
              <CardHeader>
                <div className="p-3 bg-accent/10 rounded-xl w-fit mb-2">
                  <Calendar className="w-8 h-8 text-accent" />
                </div>
                <CardTitle className="text-2xl">Quiz Calendar</CardTitle>
                <CardDescription>
                  Never miss a quiz with our interactive calendar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Sunday quiz highlights</li>
                  <li>• Quiz history</li>
                  <li>• Score tracking</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-xl transition-all hover:-translate-y-2 bg-gradient-to-br from-white to-primary/5">
              <CardHeader>
                <div className="p-3 bg-primary/10 rounded-xl w-fit mb-2">
                  <Trophy className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Gamified Learning</CardTitle>
                <CardDescription>
                  Earn badges and track achievements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Achievement badges</li>
                  <li>• Motivational feedback</li>
                  <li>• Personal best records</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-xl transition-all hover:-translate-y-2 bg-gradient-to-br from-white to-secondary/5">
              <CardHeader>
                <div className="p-3 bg-secondary/10 rounded-xl w-fit mb-2">
                  <BookOpen className="w-8 h-8 text-secondary" />
                </div>
                <CardTitle className="text-2xl">Parent Access</CardTitle>
                <CardDescription>
                  Parents and teachers can monitor progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Student performance view</li>
                  <li>• Subject-wise reports</li>
                  <li>• Improvement tracking</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary via-secondary to-accent">
        <div className="container mx-auto max-w-4xl text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Start Learning?
          </h2>
          <p className="text-xl mb-10 text-white/90">
            Join thousands of students improving their grades with AI-powered quizzes
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate("/auth")}
            className="bg-white text-primary hover:bg-white/90 text-lg px-10 py-7 shadow-2xl"
          >
            Create Free Account <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card py-8 px-4 border-t">
        <div className="container mx-auto max-w-6xl text-center text-muted-foreground">
          <p className="text-sm">
            © 2025 SmartQuiz Portal. AI-Powered Learning for the Future.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
