import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Users, BookOpen, ClipboardList, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AdminDashboardProps {
  userName: string;
}

export const AdminDashboard = ({ userName }: AdminDashboardProps) => {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [userRoles, setUserRoles] = useState<any[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      // Fetch profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;
      setProfiles(profilesData || []);

      // Fetch quizzes
      const { data: quizzesData, error: quizzesError } = await supabase
        .from("quizzes")
        .select("*")
        .order("created_at", { ascending: false });

      if (quizzesError) throw quizzesError;
      setQuizzes(quizzesData || []);

      // Fetch user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) throw rolesError;
      setUserRoles(rolesData || []);

      // Fetch quiz attempts with joined data
      const { data: attemptsData, error: attemptsError } = await supabase
        .from("quiz_attempts")
        .select(`
          *,
          quizzes (subject, difficulty)
        `)
        .order("completed_at", { ascending: false });

      if (attemptsError) throw attemptsError;
      setQuizAttempts(attemptsData || []);

    } catch (error: any) {
      console.error("Error fetching admin data:", error);
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalProfiles: profiles.length,
    totalQuizzes: quizzes.length,
    totalRoles: userRoles.length,
    totalAttempts: quizAttempts.length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Welcome, {userName}! 👑
        </h1>
        <p className="text-muted-foreground text-lg">
          Admin Dashboard - Complete System Overview
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="hover:shadow-lg transition-all">
          <CardHeader>
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl w-fit mb-2">
              <Users className="w-6 h-6 text-white" />
            </div>
            <CardTitle>Total Profiles</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{stats.totalProfiles}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <CardHeader>
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl w-fit mb-2">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <CardTitle>Total Quizzes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{stats.totalQuizzes}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <CardHeader>
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl w-fit mb-2">
              <Database className="w-6 h-6 text-white" />
            </div>
            <CardTitle>User Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{stats.totalRoles}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <CardHeader>
            <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl w-fit mb-2">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <CardTitle>Quiz Attempts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{stats.totalAttempts}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Database Tables</CardTitle>
          <CardDescription>View all data stored in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="profiles" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profiles">Profiles</TabsTrigger>
              <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
              <TabsTrigger value="roles">User Roles</TabsTrigger>
              <TabsTrigger value="attempts">Quiz Attempts</TabsTrigger>
            </TabsList>

            <TabsContent value="profiles" className="space-y-4">
              {profiles.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No profiles found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Full Name</TableHead>
                        <TableHead>Mobile Number</TableHead>
                        <TableHead>Created At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {profiles.map((profile) => (
                        <TableRow key={profile.id}>
                          <TableCell className="font-mono text-xs">{profile.id.substring(0, 8)}...</TableCell>
                          <TableCell className="font-medium">{profile.full_name}</TableCell>
                          <TableCell>{profile.mobile_number}</TableCell>
                          <TableCell>{new Date(profile.created_at).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="quizzes" className="space-y-4">
              {quizzes.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No quizzes found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Difficulty</TableHead>
                        <TableHead>Questions</TableHead>
                        <TableHead>Created At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {quizzes.map((quiz) => (
                        <TableRow key={quiz.id}>
                          <TableCell className="font-mono text-xs">{quiz.id.substring(0, 8)}...</TableCell>
                          <TableCell className="capitalize font-medium">{quiz.subject}</TableCell>
                          <TableCell className="capitalize">{quiz.difficulty}</TableCell>
                          <TableCell>{Array.isArray(quiz.questions) ? quiz.questions.length : 0}</TableCell>
                          <TableCell>{new Date(quiz.created_at).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="roles" className="space-y-4">
              {userRoles.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No user roles found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>User ID</TableHead>
                        <TableHead>Role</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userRoles.map((role) => (
                        <TableRow key={role.id}>
                          <TableCell className="font-mono text-xs">{role.id.substring(0, 8)}...</TableCell>
                          <TableCell className="font-mono text-xs">{role.user_id.substring(0, 8)}...</TableCell>
                          <TableCell className="capitalize font-medium">{role.role}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="attempts" className="space-y-4">
              {quizAttempts.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No quiz attempts found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>User ID</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Difficulty</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Completed At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {quizAttempts.map((attempt) => (
                        <TableRow key={attempt.id}>
                          <TableCell className="font-mono text-xs">{attempt.id.substring(0, 8)}...</TableCell>
                          <TableCell className="font-mono text-xs">{attempt.user_id.substring(0, 8)}...</TableCell>
                          <TableCell className="capitalize">{(attempt.quizzes as any)?.subject || "N/A"}</TableCell>
                          <TableCell className="capitalize">{(attempt.quizzes as any)?.difficulty || "N/A"}</TableCell>
                          <TableCell>
                            <span className={`font-bold ${attempt.score >= 70 ? "text-success" : attempt.score >= 40 ? "text-accent" : "text-destructive"}`}>
                              {attempt.score}%
                            </span>
                          </TableCell>
                          <TableCell>{new Date(attempt.completed_at).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
};