import { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import User from '@/models/User';
import { connectDB } from '@/lib/mongodb';

export const metadata: Metadata = {
  title: 'Admin Dashboard | CareerQuest',
  description: 'Administrative dashboard for CareerQuest',
};

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  
  // Connect to database
  await connectDB();
  
  // Get user statistics
  const totalUsers = await User.countDocuments();
  const studentCount = await User.countDocuments({ role: 'Student' });
  const lecturerCount = await User.countDocuments({ role: 'Lecturer' });
  const adminCount = await User.countDocuments({ role: 'Admin' });
  const activeUsers = await User.countDocuments({ status: 'Active' });
  
  // Get recent users
  const recentUsers = await User.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select('-password');

  return (
    <div className="space-y-6 px-18">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name}!
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Users</CardTitle>
            <CardDescription>All registered users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalUsers}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {activeUsers} active users
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Students</CardTitle>
            <CardDescription>Student accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{studentCount}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {Math.round((studentCount / totalUsers) * 100)}% of users
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Lecturers</CardTitle>
            <CardDescription>Lecturer accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{lecturerCount}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {Math.round((lecturerCount / totalUsers) * 100)}% of users
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Admins</CardTitle>
            <CardDescription>Admin accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{adminCount}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {Math.round((adminCount / totalUsers) * 100)}% of users
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Manage user accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <span className="text-sm">Manage all user accounts</span>
              <a 
                href="/admin/users" 
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
              >
                Manage Users
              </a>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1 md:col-span-1">
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>Latest user registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers.map((user: { _id: string, name: string, email: string, createdAt: string }) => (
                <div key={user._id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
