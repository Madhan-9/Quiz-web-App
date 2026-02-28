import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, TrendingUp, BookOpen, Award, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

interface ChildAttempt {
  id: string;
  score: number;
  completed_at: string;
  quiz_id: string;
  answers: any;
  quizzes?: {
    subject: string;
    difficulty: string;
    questions: any;
  };
}

export const ParentDashboard = ({ userName }: { userName: string }) => {
  const [childMobile, setChildMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedAttempt, setExpandedAttempt] = useState<string | null>(null);
  const [childData, setChildData] = useState<{
    name: string;
    attempts: ChildAttempt[];
    stats: {
      totalAttempts: number;
      averageScore: number;
      bestScore: number;
    };
  } | null>(null);

  const searchChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!childMobile.trim()) {
      toast.error("Please enter a mobile number");
      return;
    }

    setLoading(true);
    try {
      // Find the child's profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, mobile_number")
        .eq("mobile_number", childMobile)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile) {
        toast.error("No student found with this mobile number");
        setChildData(null);
        return;
      }

      // Fetch child's quiz attempts
      const { data: attempts, error: attemptsError } = await supabase
        .from("quiz_attempts")
        .select(`
          id,
          score,
          completed_at,
          quiz_id,
          answers,
          quizzes (
            subject,
            difficulty,
            questions
          )
        `)
        .eq("user_id", profile.id)
        .order("completed_at", { ascending: false });

      if (attemptsError) throw attemptsError;

      // Calculate stats
      const totalAttempts = attempts?.length || 0;
      const avgScore = totalAttempts > 0
        ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / totalAttempts)
        : 0;
      const bestScore = totalAttempts > 0
        ? Math.max(...attempts.map(a => a.score))
        : 0;

      setChildData({
        name: profile.full_name,
        attempts: attempts || [],
        stats: {
          totalAttempts,
          averageScore: avgScore,
          bestScore,
        },
      });

      toast.success(`Found student: ${profile.full_name}`);
    } catch (error: any) {
      toast.error("Failed to fetch student data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Welcome, {userName}! 👨‍👩‍👧‍👦
        </h1>
        <p className="text-muted-foreground text-lg">
          Track your child's learning progress
        </p>
      </div>

      <Card className="shadow-xl mb-8">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Search className="w-6 h-6 text-primary" />
            Search Child's Progress
          </CardTitle>
          <CardDescription>Enter your child's mobile number to view their performance</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={searchChild} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="child-mobile">Child's Mobile Number</Label>
              <Input
                id="child-mobile"
                type="tel"
                placeholder="9876543210"
                value={childMobile}
                onChange={(e) => setChildMobile(e.target.value)}
                required
                pattern="[6-9][0-9]{9}"
                title="Must be 10 digits starting with 6, 7, 8, or 9"
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {childData && (
        <>
          <div className="mb-8 p-4 bg-primary/10 rounded-lg border-2 border-primary">
            <p className="text-lg font-semibold">
              Viewing results for: <span className="text-primary">{childData.name}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="hover:shadow-lg transition-all">
              <CardHeader>
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl w-fit mb-2">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Total Quizzes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{childData.stats.totalAttempts}</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all">
              <CardHeader>
                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl w-fit mb-2">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Best Score</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{childData.stats.bestScore}%</p>
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
                <p className="text-4xl font-bold">{childData.stats.averageScore}%</p>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">Quiz History</CardTitle>
              <CardDescription>Detailed view of all quiz attempts</CardDescription>
            </CardHeader>
            <CardContent>
              {childData.attempts.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No quiz attempts yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Quiz</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {childData.attempts.map((attempt) => (
                        <>
                          <TableRow key={attempt.id}>
                            <TableCell className="capitalize font-medium">
                              {attempt.quizzes ? `${attempt.quizzes.subject} - ${attempt.quizzes.difficulty}` : "N/A"}
                            </TableCell>
                            <TableCell>
                              <span className={`font-bold ${attempt.score >= 70 ? "text-success" : attempt.score >= 40 ? "text-accent" : "text-destructive"}`}>
                                {attempt.score}%
                              </span>
                            </TableCell>
                            <TableCell>{new Date(attempt.completed_at).toLocaleDateString()}</TableCell>
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
                          {expandedAttempt === attempt.id && (
                            <TableRow>
                              <TableCell colSpan={4} className="bg-muted/50">
                                <div className="p-4 space-y-4">
                                  <h4 className="font-semibold text-lg mb-3">Detailed Answers & Explanations:</h4>
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
                                                  <span className="font-medium">Student's Answer:</span>{" "}
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
                                                  <span className="font-medium">Student's Answer:</span>{" "}
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
      )}
    </>
  );
};
