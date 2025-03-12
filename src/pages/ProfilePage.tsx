
import { useState } from "react";
import { Camera, Mail, Phone, Edit2, CheckCircle, XCircle, User, Bell, Shield, LogOut } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";

// Define user profile data structure
interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  jobTitle?: string;
  company?: string;
  status: "online" | "away" | "busy" | "offline";
}

// Mock data
const mockUserProfile: UserProfile = {
  id: "1",
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+1 (555) 123-4567",
  avatar: "",
  jobTitle: "Software Engineer",
  company: "Acme Corporation",
  status: "online",
};

const ProfilePage = () => {
  const [userProfile, setUserProfile] = useState<UserProfile>(mockUserProfile);
  const [editMode, setEditMode] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile>(mockUserProfile);
  const { toast } = useToast();

  const handleSaveProfile = () => {
    setUserProfile(editedProfile);
    setEditMode(false);
    
    toast({
      title: "Profile Updated",
      description: "Your profile information has been updated successfully.",
    });
  };

  const handleCancelEdit = () => {
    setEditedProfile(userProfile);
    setEditMode(false);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">My Profile</h1>
        </div>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="mt-0 space-y-6">
            <Card className="glass-card">
              <CardHeader className="relative pb-2">
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details here.</CardDescription>
                {!editMode && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-6 top-6"
                    onClick={() => setEditMode(true)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
                      <AvatarFallback className="bg-primary/10 text-primary text-4xl">
                        {userProfile.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    {editMode && (
                      <Button variant="secondary" size="icon" className="absolute bottom-0 right-0 h-8 w-8 rounded-full">
                        <Camera className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  {editMode ? (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                        <XCircle className="h-4 w-4 mr-2" />
                        <span>Cancel</span>
                      </Button>
                      <Button size="sm" onClick={handleSaveProfile}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        <span>Save Changes</span>
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <h2 className="text-xl font-semibold">{userProfile.name}</h2>
                      <p className="text-sm text-muted-foreground">{userProfile.jobTitle} at {userProfile.company}</p>
                    </div>
                  )}
                </div>
                
                <div className="grid gap-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      {editMode ? (
                        <Input 
                          id="name" 
                          value={editedProfile.name} 
                          onChange={(e) => setEditedProfile({...editedProfile, name: e.target.value})}
                        />
                      ) : (
                        <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2">
                          {userProfile.name}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      {editMode ? (
                        <div className="flex">
                          <Input 
                            id="email" 
                            value={editedProfile.email}
                            onChange={(e) => setEditedProfile({...editedProfile, email: e.target.value})}
                          />
                        </div>
                      ) : (
                        <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2">
                          {userProfile.email}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      {editMode ? (
                        <Input 
                          id="phone" 
                          value={editedProfile.phone || ""}
                          onChange={(e) => setEditedProfile({...editedProfile, phone: e.target.value})}
                        />
                      ) : (
                        <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2">
                          {userProfile.phone || "Not provided"}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="jobTitle">Job Title</Label>
                      {editMode ? (
                        <Input 
                          id="jobTitle" 
                          value={editedProfile.jobTitle || ""}
                          onChange={(e) => setEditedProfile({...editedProfile, jobTitle: e.target.value})}
                        />
                      ) : (
                        <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2">
                          {userProfile.jobTitle || "Not provided"}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      {editMode ? (
                        <Input 
                          id="company" 
                          value={editedProfile.company || ""}
                          onChange={(e) => setEditedProfile({...editedProfile, company: e.target.value})}
                        />
                      ) : (
                        <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2">
                          {userProfile.company || "Not provided"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Account Status</CardTitle>
                <CardDescription>Manage your availability and online status.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="online-status"
                      checked={userProfile.status === "online"}
                      onCheckedChange={(checked) => 
                        setUserProfile({...userProfile, status: checked ? "online" : "offline"})
                      }
                    />
                    <Label htmlFor="online-status">Show as Online</Label>
                  </div>
                  
                  <div className="ml-auto flex items-center gap-2">
                    <Label className="text-sm text-muted-foreground">Current Status:</Label>
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${
                        userProfile.status === "online" ? "bg-emerald-500" :
                        userProfile.status === "busy" ? "bg-red-500" :
                        userProfile.status === "away" ? "bg-amber-500" : "bg-gray-400"
                      }`}></span>
                      <span className="capitalize">{userProfile.status}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="mt-0 space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Configure how and when you receive notifications.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Call Notifications</h3>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <Label htmlFor="incoming-call-notification">Incoming calls</Label>
                      </div>
                      <Switch id="incoming-call-notification" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <Label htmlFor="missed-call-notification">Missed calls</Label>
                      </div>
                      <Switch id="missed-call-notification" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        <Label htmlFor="call-reminder-notification">Call reminders</Label>
                      </div>
                      <Switch id="call-reminder-notification" defaultChecked />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Message Notifications</h3>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <Label htmlFor="new-message-notification">New messages</Label>
                      </div>
                      <Switch id="new-message-notification" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <Label htmlFor="user-active-notification">User active status</Label>
                      </div>
                      <Switch id="user-active-notification" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security" className="mt-0 space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your account security and privacy.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Account Security</h3>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          <Label htmlFor="two-factor-auth">Two-factor authentication</Label>
                        </div>
                        <span className="text-xs text-muted-foreground ml-6">Secure your account with 2FA</span>
                      </div>
                      <Switch id="two-factor-auth" />
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10">
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Sign Out</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ProfilePage;
