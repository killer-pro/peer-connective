import { useState, useEffect } from "react";
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
import { userService, UserProfile, UserProfileUpdate } from "@/services/userService";

const ProfilePage = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);
  const [imageLoading, setImageLoading] = useState(true);
  const { toast } = useToast();

  // Fetch user profile on component mount
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setLoading(true);
        const profile = await userService.getUserProfile();
        if (profile.profile_image) {
          profile.profile_image = `${profile.profile_image}?t=${new Date().getTime()}`;
        }
        setUserProfile(profile);
        setEditedProfile(profile);
      } catch (err) {
        setError("Failed to load profile data");
        toast({
          title: "Error",
          description: "Could not load profile data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [toast]);

  const handleSaveProfile = async () => {
    if (!editedProfile) return;

    try {
      const updateData: UserProfileUpdate = {
        first_name: editedProfile.first_name,
        last_name: editedProfile.last_name,
        email: editedProfile.email,
        phone_number: editedProfile.phone_number,
      };

      const updatedProfile = await userService.updateProfile(updateData);
      setUserProfile(updatedProfile);
      setEditMode(false);

      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
      });
    } catch (err) {
      toast({
        title: "Update Failed",
        description: "Could not update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditedProfile(userProfile);
    setEditMode(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    try {
      const updatedProfile = await userService.uploadProfileImage(file);
      setUserProfile(updatedProfile);
      setEditedProfile(updatedProfile);

      toast({
        title: "Image Uploaded",
        description: "Your profile image has been updated successfully.",
      });
    } catch (err) {
      toast({
        title: "Upload Failed",
        description: "Could not upload image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (checked: boolean) => {
    try {
      // Update the local state first for immediate feedback
      const updatedLocalProfile = {
        ...userProfile,
        online_status: checked
      };
      setUserProfile(updatedLocalProfile);

      // Then send the update to the server
      const updatedProfile = await userService.updateOnlineStatus(checked);

      // Update with the server response
      setUserProfile(updatedProfile);
      setEditedProfile(updatedProfile);

      toast({
        title: "Status Updated",
        description: `You are now ${checked ? 'online' : 'offline'}`,
      });
    } catch (err) {
      // Revert the local state if the server update fails
      setUserProfile(prevProfile => ({
        ...prevProfile,
        online_status: !checked
      }));
      setEditedProfile(prevProfile => ({
        ...prevProfile,
        online_status: !checked
      }));

      toast({
        title: "Status Update Failed",
        description: "Could not update your online status.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
        <Layout>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4">Loading profile...</p>
            </div>
          </div>
        </Layout>
    );
  }

  if (error || !userProfile) {
    return (
        <Layout>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <p>Failed to load profile. Please try again later.</p>
              <Button onClick={() => window.location.reload()} className="mt-4">
                Retry
              </Button>
            </div>
          </div>
        </Layout>
    );
  }
  if (loading) {
    return (
        <Layout>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4">Loading profile...</p>
            </div>
          </div>
        </Layout>
    );
  }

  if (error || !userProfile) {
    return (
        <Layout>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <p>Failed to load profile. Please try again later.</p>
              <Button onClick={() => window.location.reload()} className="mt-4">
                Retry
              </Button>
            </div>
          </div>
        </Layout>
    );
  }

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
                      {imageLoading && userProfile.profile_image && (
                          <div className="absolute inset-0 flex items-center justify-center bg-secondary/30 rounded-full z-10">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                          </div>
                      )}
                      <Avatar className="h-24 w-24">
                        <AvatarImage
                            src={userProfile.profile_image || undefined}
                            alt={`${userProfile.first_name} ${userProfile.last_name}`}
                            onLoad={() => setImageLoading(false)}
                            onError={() => setImageLoading(false)}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary text-4xl">
                          {`${userProfile.first_name[0]}${userProfile.last_name[0]}`}
                        </AvatarFallback>
                      </Avatar>
                      {editMode && (
                          <div className="absolute bottom-0 right-0">
                            <label htmlFor="profile-image" className="cursor-pointer">
                              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-secondary">
                                <Camera className="h-4 w-4" />
                              </div>
                              <input
                                  id="profile-image"
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={handleImageUpload}
                              />
                            </label>
                          </div>
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
                          <h2 className="text-xl font-semibold">{`${userProfile.first_name} ${userProfile.last_name}`}</h2>
                          <p className="text-sm text-muted-foreground">@{userProfile.username}</p>
                        </div>
                    )}
                  </div>

                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        {editMode && editedProfile ? (
                            <Input
                                id="firstName"
                                value={editedProfile.first_name}
                                onChange={(e) => setEditedProfile({...editedProfile, first_name: e.target.value})}
                            />
                        ) : (
                            <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2">
                              {userProfile.first_name}
                            </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        {editMode && editedProfile ? (
                            <Input
                                id="lastName"
                                value={editedProfile.last_name}
                                onChange={(e) => setEditedProfile({...editedProfile, last_name: e.target.value})}
                            />
                        ) : (
                            <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2">
                              {userProfile.last_name}
                            </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        {editMode && editedProfile ? (
                            <Input
                                id="email"
                                value={editedProfile.email}
                                onChange={(e) => setEditedProfile({...editedProfile, email: e.target.value})}
                            />
                        ) : (
                            <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2">
                              {userProfile.email}
                            </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        {editMode && editedProfile ? (
                            <Input
                                id="phone"
                                value={editedProfile.phone_number || ""}
                                onChange={(e) => setEditedProfile({...editedProfile, phone_number: e.target.value})}
                            />
                        ) : (
                            <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2">
                              {userProfile.phone_number || "Not provided"}
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
                          checked={userProfile.online_status}
                          onCheckedChange={handleStatusChange}
                      />
                      <Label htmlFor="online-status">Show as Online</Label>
                    </div>

                    <div className="ml-auto flex items-center gap-2">
                      <Label className="text-sm text-muted-foreground">Current Status:</Label>
                      <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${
                          userProfile.online_status ? "bg-emerald-500" : "bg-gray-400"
                      }`}></span>
                        <span>{userProfile.online_status ? "Online" : "Offline"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 text-sm text-muted-foreground">
                    <p>Last seen: {new Date(userProfile.last_seen).toLocaleString()}</p>
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
                <CardFooter>
                  <Button variant="outline" className="w-full">Save Notification Preferences</Button>
                </CardFooter>
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

                    <div className="space-y-2 pt-4">
                      <Button variant="outline" className="w-full">Change Password</Button>
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