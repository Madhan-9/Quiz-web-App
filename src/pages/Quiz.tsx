import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, CheckCircle, Loader2, Clock } from "lucide-react";
import { toast } from "sonner";

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

// Shuffle array function
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const Quiz = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const subject = searchParams.get("subject");
  const chapter = searchParams.get("chapter");
  const difficulty = searchParams.get("difficulty");

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [quizId, setQuizId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [timerActive, setTimerActive] = useState(false);
  const [suggestions, setSuggestions] = useState<any>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [feedback, setFeedback] = useState<string>("");
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
    };
    checkUser();
  }, [navigate]);

  useEffect(() => {
    if (subject && chapter && difficulty && user) {
      fetchOrGenerateQuiz();
    }
  }, [subject, chapter, difficulty, user]);

  // Timer effect
  useEffect(() => {
    if (timerActive && timeLeft > 0 && !showResults) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResults) {
      handleSubmit();
    }
  }, [timerActive, timeLeft, showResults]);

  const fetchOrGenerateQuiz = async () => {
    setLoading(true);
    try {
      // Generate new quiz with AI (chapter-based quizzes are always fresh)
      toast.info("Generating quiz questions with AI...");
      const { data, error } = await supabase.functions.invoke('generate-quiz', {
        body: { subject, chapter, difficulty }
      });

      if (error) {
        console.error("Error generating quiz:", error);
        throw error;
      }

      if (!data?.questions) {
        throw new Error("No questions generated");
      }

      // Shuffle the newly generated questions
      const shuffledQuestions = shuffleArray(data.questions as Question[]);
      setQuestions(shuffledQuestions);
      
      // Save the generated quiz to database for future use
      const { data: savedQuiz, error: saveError } = await supabase
        .from("quizzes")
        .insert({
          subject: subject as any,
          difficulty: difficulty as any,
          questions: data.questions,
          created_by: user.id
        })
        .select()
        .single();
      
      if (saveError) {
        console.error("Error saving quiz:", saveError);
        toast.error("Failed to save quiz");
        return;
      }
      
      if (savedQuiz) {
        setQuizId(savedQuiz.id);
        setTimerActive(true);
      }
    } catch (error: any) {
      toast.error("Failed to load or generate quiz");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion]: answer,
    });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setTimerActive(false);
    try {
      // Calculate score
      let correctCount = 0;
      questions.forEach((q, index) => {
        if (selectedAnswers[index] === q.correctAnswer) {
          correctCount++;
        }
      });
      const finalScore = Math.round((correctCount / questions.length) * 100);
      setScore(finalScore);

      // Ensure we have a valid quiz ID
      if (!quizId) {
        throw new Error("Quiz ID is missing. Cannot save attempt.");
      }

      // Store answers with their corresponding questions for correct matching later
      const answersWithQuestions = questions.map((q, index) => ({
        question: q.question,
        userAnswer: selectedAnswers[index] || null,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        options: q.options
      }));

      // Generate feedback based on score
      setLoadingFeedback(true);
      let generatedFeedback = "";
      try {
        const { data: feedbackData, error: feedbackError } = await supabase.functions.invoke(
          'generate-feedback',
          {
            body: { 
              score: finalScore,
              subject,
              chapter,
              difficulty,
              totalQuestions: questions.length
            }
          }
        );

        if (!feedbackError && feedbackData) {
          generatedFeedback = feedbackData.feedback;
          setFeedback(generatedFeedback);
        }
      } catch (err) {
        console.error("Failed to generate feedback:", err);
      } finally {
        setLoadingFeedback(false);
      }

      // Save to database
      const { error } = await supabase.from("quiz_attempts").insert({
        user_id: user.id,
        quiz_id: quizId,
        score: finalScore,
        answers: answersWithQuestions,
        feedback: generatedFeedback,
      });

      if (error) {
        console.error("Submission error:", error);
        throw error;
      }

      setShowResults(true);
      toast.success("Quiz submitted successfully!");
      
      // Generate AI suggestions for wrong answers
      const wrongAnswers = questions.filter((q, index) => 
        selectedAnswers[index] !== q.correctAnswer
      ).map((q, index) => {
        const originalIndex = questions.indexOf(q);
        return {
          question: q.question,
          userAnswer: selectedAnswers[originalIndex] || null,
          correctAnswer: q.correctAnswer
        };
      });

      if (wrongAnswers.length > 0) {
        setLoadingSuggestions(true);
        try {
          const { data: suggestionsData, error: suggestionsError } = await supabase.functions.invoke(
            'generate-suggestions',
            {
              body: { 
                subject, 
                chapter,
                difficulty, 
                wrongAnswers 
              }
            }
          );

          if (suggestionsError) {
            console.error("Error generating suggestions:", suggestionsError);
          } else if (suggestionsData) {
            setSuggestions(suggestionsData);
            
            // Update the quiz attempt with suggestions
            await supabase
              .from("quiz_attempts")
              .update({ suggestions: suggestionsData })
              .eq("user_id", user.id)
              .eq("quiz_id", quizId)
              .order("completed_at", { ascending: false })
              .limit(1);
          }
        } catch (err) {
          console.error("Failed to get suggestions:", err);
        } finally {
          setLoadingSuggestions(false);
        }
      }
    } catch (error: any) {
      toast.error("Failed to submit quiz: " + error.message);
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted to-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <Card className="shadow-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-primary to-secondary rounded-full w-24 h-24 flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <CardTitle className="text-4xl font-bold mb-2">Quiz Complete!</CardTitle>
              <p className="text-muted-foreground">Great job completing the quiz</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-6xl font-bold text-primary mb-2">{score}%</p>
                <p className="text-xl text-muted-foreground">
                  You got {Math.round((score / 100) * questions.length)} out of {questions.length} correct
                </p>
              </div>

              {/* Performance Feedback */}
              {loadingFeedback ? (
                <Card className="bg-accent/10 border-accent/20">
                  <CardContent className="pt-6 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-primary mr-2" />
                    <span className="text-muted-foreground">Generating feedback...</span>
                  </CardContent>
                </Card>
              ) : feedback && (
                <Card className="bg-accent/10 border-accent/20">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-accent mt-1" />
                      <div>
                        <p className="font-semibold mb-2">Performance Feedback:</p>
                        <p className="text-sm text-muted-foreground">{feedback}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-4">
                <h3 className="text-xl font-bold">Review Answers</h3>
                {questions.map((q, index) => {
                  const userAnswer = selectedAnswers[index];
                  const isCorrect = userAnswer === q.correctAnswer;
                  return (
                    <Card key={index} className={isCorrect ? "border-success" : "border-destructive"}>
                      <CardContent className="pt-6">
                        <p className="font-semibold mb-2">Q{index + 1}: {q.question}</p>
                        <p className="text-sm mb-1">
                          Your answer: <span className={isCorrect ? "text-success" : "text-destructive"}>{userAnswer || "Not answered"}</span>
                        </p>
                        <p className="text-sm mb-2">
                          Correct answer: <span className="text-success">{q.correctAnswer}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">{q.explanation}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* AI-Powered Study Suggestions */}
              {score < 100 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">Personalized Study Suggestions</h3>
                  {loadingSuggestions ? (
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      <span className="ml-3 text-muted-foreground">Analyzing your performance...</span>
                    </div>
                  ) : suggestions ? (
                    <div className="space-y-4">
                      {suggestions.encouragement && (
                        <Card className="bg-primary/5 border-primary/20">
                          <CardContent className="pt-6">
                            <p className="text-foreground">{suggestions.encouragement}</p>
                          </CardContent>
                        </Card>
                      )}
                      {suggestions.weakTopics?.map((topic: any, index: number) => (
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
                  ) : null}
                </div>
              )}

              <div className="flex gap-4">
                <Button onClick={() => navigate("/dashboard")} variant="outline" className="flex-1">
                  Back to Dashboard
                </Button>
                <Button onClick={() => navigate("/quiz-select")} className="flex-1">
                  Take Another Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Button variant="ghost" onClick={() => navigate("/quiz-select")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card className="shadow-2xl">
          <CardHeader>
            <div className="flex justify-between items-center mb-4">
              <CardTitle className="text-2xl">
                Question {currentQuestion + 1} of {questions.length}
              </CardTitle>
              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                  timeLeft < 60 ? 'bg-destructive/20 text-destructive' : 'bg-muted'
                }`}>
                  <Clock className="w-4 h-4" />
                  <span className="font-mono font-semibold">{formatTime(timeLeft)}</span>
                </div>
                <span className="text-sm text-muted-foreground capitalize">
                  {subject} • {chapter} • {difficulty}
                </span>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </CardHeader>

          <CardContent className="space-y-6">
            <h3 className="text-xl font-semibold">{currentQ.question}</h3>

            <RadioGroup
              value={selectedAnswers[currentQuestion]}
              onValueChange={handleAnswerSelect}
              className="space-y-3"
            >
              {currentQ.options.map((option, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer hover:bg-muted ${
                    selectedAnswers[currentQuestion] === option ? "border-primary bg-primary/10" : "border-border"
                  }`}
                  onClick={() => handleAnswerSelect(option)}
                >
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <div className="flex justify-between gap-4 pt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {currentQuestion === questions.length - 1 ? (
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Quiz"
                  )}
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Quiz;
