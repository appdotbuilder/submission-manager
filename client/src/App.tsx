
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import type { Submission, CreateSubmissionInput, UpdateSubmissionInput } from '../../server/src/schema';

function App() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Form state for creating submissions
  const [createFormData, setCreateFormData] = useState<CreateSubmissionInput>({
    title: '',
    description: ''
  });

  // Form state for editing submissions
  const [editFormData, setEditFormData] = useState<UpdateSubmissionInput>({
    id: 0,
    title: '',
    description: ''
  });

  // Load submissions from API
  const loadSubmissions = useCallback(async () => {
    try {
      const result = await trpc.getSubmissions.query();
      setSubmissions(result);
    } catch (error) {
      console.error('Failed to load submissions:', error);
    }
  }, []);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  // Handle creating a new submission
  const handleCreateSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await trpc.createSubmission.mutate(createFormData);
      setSubmissions((prev: Submission[]) => [response, ...prev]);
      setCreateFormData({ title: '', description: '' });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create submission:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle editing a submission
  const handleEditSubmission = (submission: Submission) => {
    setEditFormData({
      id: submission.id,
      title: submission.title,
      description: submission.description
    });
    setIsEditDialogOpen(true);
  };

  // Handle updating a submission
  const handleUpdateSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await trpc.updateSubmission.mutate(editFormData);
      setSubmissions((prev: Submission[]) =>
        prev.map((submission: Submission) =>
          submission.id === response.id ? response : submission
        )
      );
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Failed to update submission:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle deleting a submission
  const handleDeleteSubmission = async (id: number) => {
    setIsLoading(true);
    try {
      await trpc.deleteSubmission.mutate({ id });
      setSubmissions((prev: Submission[]) =>
        prev.filter((submission: Submission) => submission.id !== id)
      );
    } catch (error) {
      console.error('Failed to delete submission:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📝 Submissions Portal</h1>
          <p className="text-gray-600">Discover and manage community submissions</p>
        </header>

        <Tabs defaultValue="homepage" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="homepage">🏠 Homepage</TabsTrigger>
            <TabsTrigger value="admin">⚙️ Admin Panel</TabsTrigger>
          </TabsList>

          {/* Homepage - Public View */}
          <TabsContent value="homepage" className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Latest Submissions</h2>
              <Badge variant="secondary" className="mb-6">
                {submissions.length} submission{submissions.length !== 1 ? 's' : ''} total
              </Badge>
            </div>

            {submissions.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="text-6xl mb-4">🎯</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No submissions yet</h3>
                  <p className="text-gray-500">Be the first to create a submission!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {submissions.map((submission: Submission) => (
                  <Card key={submission.id} className="hover:shadow-lg transition-shadow duration-200">
                    <CardHeader>
                      <CardTitle className="text-lg">{submission.title}</CardTitle>
                      <CardDescription>
                        📅 {submission.created_at.toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 line-clamp-3">{submission.description}</p>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Badge variant="outline" className="text-xs">
                        ID: {submission.id}
                      </Badge>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Admin Panel */}
          <TabsContent value="admin" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-800">Admin Panel</h2>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700">
                    ➕ Create New Submission
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Create New Submission</DialogTitle>
                    <DialogDescription>
                      Add a new submission to the platform. Fill in the required information below.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateSubmission} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="create-title">Title</Label>
                      <Input
                        id="create-title"
                        placeholder="Enter submission title"
                        value={createFormData.title}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setCreateFormData((prev: CreateSubmissionInput) => ({ 
                            ...prev, 
                            title: e.target.value 
                          }))
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="create-description">Description</Label>
                      <Textarea
                        id="create-description"
                        placeholder="Enter submission description"
                        value={createFormData.description}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          setCreateFormData((prev: CreateSubmissionInput) => ({ 
                            ...prev, 
                            description: e.target.value 
                          }))
                        }
                        rows={4}
                        required
                      />
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Creating...' : 'Create Submission'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Admin View of Submissions */}
            <div className="space-y-4">
              {submissions.length === 0 ? (
                <Card className="text-center py-8">
                  <CardContent>
                    <div className="text-4xl mb-4">📋</div>
                    <p className="text-gray-500">No submissions to manage yet.</p>
                  </CardContent>
                </Card>
              ) : (
                submissions.map((submission: Submission) => (
                  <Card key={submission.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{submission.title}</CardTitle>
                          <CardDescription>
                            Created: {submission.created_at.toLocaleDateString()} • 
                            Updated: {submission.updated_at.toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary">ID: {submission.id}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">{submission.description}</p>
                    </CardContent>
                    <CardFooter className="gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditSubmission(submission)}
                      >
                        ✏️ Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            🗑️ Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the submission
                              "{submission.title}" from the database.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteSubmission(submission.id)}
                              disabled={isLoading}
                            >
                              {isLoading ? 'Deleting...' : 'Delete'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Submission</DialogTitle>
              <DialogDescription>
                Make changes to the submission. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateSubmission} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editFormData.title || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditFormData((prev: UpdateSubmissionInput) => ({ 
                      ...prev, 
                      title: e.target.value 
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editFormData.description || ''}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setEditFormData((prev: UpdateSubmissionInput) => ({ 
                      ...prev, 
                      description: e.target.value 
                    }))
                  }
                  rows={4}
                  required
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default App;
