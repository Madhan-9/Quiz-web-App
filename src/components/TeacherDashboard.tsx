import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, TrendingUp, BookOpen, Award, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface StudentAttempt {
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
  profiles: {
    full_name: string;
    mobile_number: string;
  };
}

export const TeacherDashboard = ({ userName }: { userName: string }) => {
  const [attempts, setAttempts] = useState<StudentAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedAttempt, setExpandedAttempt] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalAttempts: 0,
    averageScore: 0,
  });

  useEffect(() => {
    fetchStudentAttempts();
  }, []);

  const fetchStudentAttempts = async () => {
    try {
      const { data, error } = await supabase
        .from("quiz_attempts")
        .select(`
          id,
          score,
          completed_at,
          quiz_id,
          user_id,
          answers,
          quizzes (
            subject,
            difficulty,
            questions
          )
        `)
        .order("completed_at", { ascending: false });

      if (error) throw error;

      // Fetch all profiles
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, full_name, mobile_number");

      // Count all registered students from user_roles
      const { data: studentRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "student");

      const totalStudents = studentRoles?.length || 0;

      // Map attempts with profile data
      const attemptsWithProfiles = (data || []).map((attempt: any) => {
        const profile = profilesData?.find((p) => p.id === attempt.user_id);
        return {
          ...attempt,
          profiles: {
            full_name: profile?.full_name || "Unknown",
            mobile_number: profile?.mobile_number || "N/A",
          },
        };
      });

      setAttempts(attemptsWithProfiles);

      // Calculate stats
      const totalAttempts = attemptsWithProfiles.length;
      const avgScore = totalAttempts > 0
        ? Math.round(attemptsWithProfiles.reduce((sum, a) => sum + a.score, 0) / totalAttempts)
        : 0;

      setStats({
        totalStudents,
        totalAttempts,
        averageScore: avgScore,
      });
    } catch (error: any) {
      toast.error("Failed to load student data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Welcome, Teacher {userName}! 👨‍🏫
        </h1>
        <p className="text-muted-foreground text-lg">
          Monitor student progress and performance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="hover:shadow-lg transition-all">
          <CardHeader>
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl w-fit mb-2">
              <Users className="w-6 h-6 text-white" />
            </div>
            <CardTitle>Active Students</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{stats.totalStudents}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <CardHeader>
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl w-fit mb-2">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <CardTitle>Total Attempts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{stats.totalAttempts}</p>
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
            <p className="text-4xl font-bold">{stats.averageScore}%</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Award className="w-6 h-6 text-primary" />
            Student Quiz Results
          </CardTitle>
          <CardDescription>View all student quiz attempts and scores</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading...</p>
          ) : attempts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No quiz attempts yet</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Mobile Number</TableHead>
                    <TableHead>Quiz</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attempts.map((attempt) => (
                    <>
                      <TableRow key={attempt.id}>
                        <TableCell className="font-medium">
                          {attempt.profiles?.full_name || "N/A"}
                        </TableCell>
                        <TableCell>{attempt.profiles?.mobile_number || "N/A"}</TableCell>
                        <TableCell className="capitalize">
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
                          <TableCell colSpan={6} className="bg-muted/50">
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
  );
};
