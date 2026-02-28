import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, TrendingUp, BookOpen, Trophy, ChevronDown, ChevronUp, AlertCircle, Lightbulb, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface StudentDashboardProps {
  userName: string;
}

interface Stats {
  totalQuizzes: number;
  bestScore: number;
  averageScore: number;
  subjectsCovered: number;
}

interface QuizAttempt {
  id: string;
  score: number;
  completed_at: string;
  quiz_id: string;
  answers: any;
  suggestions?: any;
  feedback?: string;
  quizzes?: {
    subject: string;
    difficulty: string;
    questions: any;
  };
}

export const StudentDashboard = ({ userName }: StudentDashboardProps) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    totalQuizzes: 0,
    bestScore: 0,
    averageScore: 0,
    subjectsCovered: 0,
  });
  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [expandedAttempt, setExpandedAttempt] = useState<string | null>(null);

  useEffect(() => {
    fetchStudentStats();
  }, []);

  const fetchStudentStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch quiz attempts with quiz details
      const { data: attemptsData, error } = await supabase
        .from("quiz_attempts")
        .select(`
          id,
          score,
          quiz_id,
          completed_at,
          answers,
          suggestions,
          feedback,
          quizzes (
            subject,
            difficulty,
            questions
          )
        `)
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false });

      if (error) throw error;

      if (attemptsData && attemptsData.length > 0) {
        setAttempts(attemptsData);
        const attempts = attemptsData;
        const totalQuizzes = attempts.length;
        const bestScore = Math.max(...attempts.map(a => a.score));
        const averageScore = Math.round(
          attempts.reduce((sum, a) => sum + a.score, 0) / totalQuizzes
        );
        const uniqueSubjects = new Set(
          attempts
            .filter(a => a.quizzes)
            .map(a => (a.quizzes as any).subject)
        );
        const subjectsCovered = uniqueSubjects.size;

        setStats({
          totalQuizzes,
          bestScore,
          averageScore,
          subjectsCovered,
        });
      }
    } catch (error: any) {
      console.error("Error fetching stats:", error);
      toast.error("Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Welcome back, {userName}! 🎓
        </h1>
        <p className="text-muted-foreground text-lg">
          Ready to learn something new today?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="hover:shadow-lg transition-all">
          <CardHeader>
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl w-fit mb-2">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <CardTitle>Total Quizzes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{loading ? "..." : stats.totalQuizzes}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <CardHeader>
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl w-fit mb-2">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <CardTitle>Best Score</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{loading ? "..." : `${stats.bestScore}%`}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <CardHeader>
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl w-fit mb-2">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <CardTitle>Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{loading ? "..." : `${stats.averageScore}%`}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <CardHeader>
            <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl w-fit mb-2">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <CardTitle>Subjects Covered</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{loading ? "..." : stats.subjectsCovered}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-xl mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">Start Learning</CardTitle>
          <CardDescription>Choose your subject and difficulty level</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            size="lg" 
            onClick={() => navigate("/quiz-select")}
            className="w-full md:w-auto"
          >
            <BookOpen className="w-5 h-5 mr-2" />
            Take a Quiz
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Quiz History</CardTitle>
          <CardDescription>Review your past quizzes with answers and explanations</CardDescription>
        </CardHeader>
        <CardContent>
          {attempts.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No quiz attempts yet. Take your first quiz!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Suggestions</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attempts.map((attempt) => (
                    <>
                      <TableRow key={attempt.id}>
                        <TableCell className="capitalize font-medium">
                          {attempt.quizzes?.subject || "N/A"}
                        </TableCell>
                        <TableCell className="capitalize">
                          {attempt.quizzes?.difficulty || "N/A"}
                        </TableCell>
                        <TableCell>
                          <span className={`font-bold ${attempt.score >= 70 ? "text-success" : attempt.score >= 40 ? "text-accent" : "text-destructive"}`}>
                            {attempt.score}%
                          </span>
                        </TableCell>
                        <TableCell>{new Date(attempt.completed_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {attempt.suggestions && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setExpandedAttempt(expandedAttempt === `suggestions-${attempt.id}` ? null : `suggestions-${attempt.id}`)}
                            >
                              <Lightbulb className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedAttempt(expandedAttempt === attempt.id ? null : attempt.id)}
                          >
                            {expandedAttempt === attempt.id ? <ChevronUp /> : <ChevronDown />}
                          </Button>
                        </TableCell>
                      </TableRow>
                      {expandedAttempt === `suggestions-${attempt.id}` && attempt.suggestions && (
                        <TableRow>
                          <TableCell colSpan={6} className="bg-muted/50">
                            <div className="p-4 space-y-4">
                              <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                <Lightbulb className="w-5 h-5 text-primary" />
                                Study Suggestions
                              </h4>
                              {attempt.suggestions.encouragement && (
                                <Card className="bg-primary/5 border-primary/20">
                                  <CardContent className="pt-6">
                                    <p className="text-foreground">{attempt.suggestions.encouragement}</p>
                                  </CardContent>
                                </Card>
                              )}
                              {attempt.suggestions.weakTopics?.map((topic: any, index: number) => (
                                <Card key={index} className="border-l-4 border-l-warning">
                                  <CardContent className="pt-6 space-y-3">
                                    <h4 className="font-bold text-lg">{topic.topic}</h4>
                                    <p className="text-sm text-muted-foreground">{topic.explanation}</p>
                                    
                                    <div>
                                      <p className="font-semibold text-sm mb-2">Study Techniques:</p>
                                      <ul className="list-disc list-inside space-y-1">
                                        {topic.techniques?.map((technique: string, idx: number) => (
                                          <li key={idx} className="text-sm">{technique}</li>
                                        ))}
                                      </ul>
                                    </div>
                                    
                                    <div>
                                      <p className="font-semibold text-sm mb-2">Recommended Resources:</p>
                                      <ul className="list-disc list-inside space-y-1">
                                        {topic.resources?.map((resource: string, idx: number) => (
                                          <li key={idx} className="text-sm">{resource}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                      {expandedAttempt === attempt.id && (
                        <TableRow>
                          <TableCell colSpan={6} className="bg-muted/50">
                            <div className="p-4 space-y-4">
                              <h4 className="font-semibold text-lg mb-3">Detailed Answers & Explanations:</h4>
                              {attempt.feedback && (
                                <Card className="bg-accent/10 border-accent/20 mb-4">
                                  <CardContent className="pt-6">
                                    <div className="flex items-start gap-2">
                                      <Target className="w-5 h-5 text-accent mt-1" />
                                      <div>
                                        <p className="font-semibold mb-2">Performance Feedback:</p>
                                        <p className="text-sm text-muted-foreground">{attempt.feedback}</p>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              )}
                              {attempt.answers && (
                                <div className="space-y-3">
                                  {/* Handle new format (array of objects) */}
                                  {Array.isArray(attempt.answers) && attempt.answers.length > 0 && typeof attempt.answers[0] === 'object' && attempt.answers[0].question ? (
                                    attempt.answers.map((answerData: any, idx: number) => {
                                      const isCorrect = answerData.userAnswer === answerData.correctAnswer;
                                      return (
                                        <div key={idx} className="border rounded-lg p-3 bg-background">
                                          <p className="font-medium mb-2">Q{idx + 1}: {answerData.question}</p>
                                          <div className="ml-4 space-y-1 text-sm">
                                            <p>
                                              <span className="font-medium">Your Answer:</span>{" "}
                                              <span className={isCorrect ? "text-success" : "text-destructive"}>
                                                {answerData.userAnswer || "Not answered"}
                                              </span>
                                            </p>
                                            <p>
                                              <span className="font-medium">Correct Answer:</span>{" "}
                                              <span className="text-success">{answerData.correctAnswer}</span>
                                            </p>
                                            {answerData.explanation && (
                                              <p className="text-muted-foreground mt-2">
                                                <span className="font-medium">Explanation:</span> {answerData.explanation}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })
                                  ) : (
                                    /* Handle old format (object with numeric keys) */
                                    attempt.quizzes?.questions && Object.keys(attempt.answers).map((key: string, idx: number) => {
                                      const question = attempt.quizzes.questions[parseInt(key)];
                                      const userAnswer = attempt.answers[key];
                                      const isCorrect = userAnswer === question?.correctAnswer;
                                      return (
                                        <div key={idx} className="border rounded-lg p-3 bg-background">
                                          <p className="font-medium mb-2">Q{idx + 1}: {question?.question || "Question not available"}</p>
                                          <div className="ml-4 space-y-1 text-sm">
                                            <p>
                                              <span className="font-medium">Your Answer:</span>{" "}
                                              <span className={isCorrect ? "text-success" : "text-destructive"}>
                                                {userAnswer || "Not answered"}
                                              </span>
                                            </p>
                                            <p>
                                              <span className="font-medium">Correct Answer:</span>{" "}
                                              <span className="text-success">{question?.correctAnswer || "N/A"}</span>
                                            </p>
                                            {question?.explanation && (
                                              <p className="text-muted-foreground mt-2">
                                                <span className="font-medium">Explanation:</span> {question.explanation}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })
                                  )}
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};
