import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, Calculator, Cpu, Globe, Languages, Zap } from "lucide-react";

const subjects = [
  { id: "maths", name: "Mathematics", icon: Calculator, color: "from-blue-500 to-blue-600", description: "Numbers, algebra, geometry" },
  { id: "science", name: "Science", icon: Zap, color: "from-green-500 to-green-600", description: "Physics, chemistry, biology" },
  { id: "english", name: "English", icon: Languages, color: "from-purple-500 to-purple-600", description: "Grammar, literature, writing" },
  { id: "social", name: "Social Studies", icon: Globe, color: "from-orange-500 to-orange-600", description: "History, geography, civics" },
  { id: "computer", name: "Computer Science", icon: Cpu, color: "from-pink-500 to-pink-600", description: "Random basic questions" },
];

const chapters: Record<string, string[]> = {
  maths: [
    "Polynomials",
    "Quadratic Equations",
    "Triangles",
    "Circles",
    "Introduction to Trigonometry",
    "Surface Areas and Volumes",
    "Resources and Development",
    "Probability"
  ],
  science: [
    "Chemical Reactions",
    "Acids, Bases and Salts",
    "Metals and Nonmetals",
    "Carbon and its Compounds",
    "Life Processes",
    "Heredity and Evolution"
  ],
  social: [
    "Nationalism in Europe",
    "India's Freedom Struggle",
    "Resources and Development",
    "Water Resources",
    "Democracy and Federalism"
  ],
  english: [
    "A Letter to God (First Flight)",
    "Nelson Mandela: Long Walk to Freedom (First Flight)",
    "Dust of Snow (First Flight - Poem)",
    "Amanda (First Flight - Poem)",
    "A Triumph of Surgery (Footprints Without Feet)",
    "The Thief's Story (Footprints Without Feet)"
  ]
};

const difficulties = [
  { id: "easy", name: "Easy", color: "bg-success" },
  { id: "medium", name: "Medium", color: "bg-accent" },
  { id: "hard", name: "Hard", color: "bg-destructive" },
];

const QuizSelect = () => {
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

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

  const handleStartQuiz = () => {
    if (selectedSubject === "computer" && selectedDifficulty) {
      navigate(`/quiz?subject=${selectedSubject}&chapter=random&difficulty=${selectedDifficulty}`);
    } else if (selectedSubject && selectedChapter && selectedDifficulty) {
      navigate(`/quiz?subject=${selectedSubject}&chapter=${encodeURIComponent(selectedChapter)}&difficulty=${selectedDifficulty}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Choose Your Quiz
          </h1>
          <p className="text-muted-foreground text-lg">
            Select a subject and difficulty level to begin
          </p>
        </div>

        {/* Subject Selection */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            Select Subject
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((subject) => {
              const Icon = subject.icon;
              return (
                <Card
                  key={subject.id}
                  className={`cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 ${
                    selectedSubject === subject.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => {
                    setSelectedSubject(subject.id);
                    setSelectedChapter(subject.id === "computer" ? "random" : null);
                    setSelectedDifficulty(null);
                  }}
                >
                  <CardHeader>
                    <div className={`p-3 bg-gradient-to-br ${subject.color} rounded-xl w-fit mb-2`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle>{subject.name}</CardTitle>
                    <CardDescription>{subject.description}</CardDescription>
                  </CardHeader>
                  {selectedSubject === subject.id && (
                    <CardContent>
                      <Badge className="bg-primary">Selected</Badge>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        {/* Chapter Selection */}
        {selectedSubject && selectedSubject !== "computer" && (
          <div className="mb-12 animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-secondary" />
              Select Chapter
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {chapters[selectedSubject]?.map((chapter) => (
                <Card
                  key={chapter}
                  className={`cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 ${
                    selectedChapter === chapter ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedChapter(chapter)}
                >
                  <CardHeader>
                    <CardTitle className="text-base">{chapter}</CardTitle>
                  </CardHeader>
                  {selectedChapter === chapter && (
                    <CardContent>
                      <Badge className="bg-primary">Selected</Badge>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Difficulty Selection */}
        {selectedSubject && (selectedChapter || selectedSubject === "computer") && (
          <div className="mb-12 animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Zap className="w-6 h-6 text-accent" />
              Select Difficulty
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {difficulties.map((difficulty) => (
                <Card
                  key={difficulty.id}
                  className={`cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 ${
                    selectedDifficulty === difficulty.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedDifficulty(difficulty.id)}
                >
                  <CardHeader>
                    <Badge className={`${difficulty.color} w-fit mb-2`}>
                      {difficulty.name}
                    </Badge>
                    <CardTitle>{difficulty.name} Level</CardTitle>
                    <CardDescription>
                      {difficulty.id === "easy" && "Perfect for beginners"}
                      {difficulty.id === "medium" && "Balanced challenge"}
                      {difficulty.id === "hard" && "Advanced questions"}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Start Quiz Button */}
        {selectedSubject && (selectedChapter || selectedSubject === "computer") && selectedDifficulty && (
          <div className="text-center animate-fade-in">
            <Button 
              size="lg" 
              onClick={handleStartQuiz}
              className="px-12 py-6 text-lg"
            >
              Start Quiz
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizSelect;
