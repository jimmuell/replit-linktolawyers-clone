import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/contexts/AuthContext';
import AttorneyAppBar from '@/components/AttorneyAppBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Save, User, Briefcase, MapPin, Award } from 'lucide-react';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC'
];

const PRACTICE_AREAS = [
  'Immigration','Family Law','Criminal Defense','Personal Injury','Corporate Law',
  'Real Estate','Employment Law','Bankruptcy','Estate Planning','Tax Law',
  'Intellectual Property','Civil Rights','Environmental Law','Health Care Law'
];

interface AttorneyProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  barNumber: string | null;
  licenseState: string | null;
  practiceAreas: string[];
  yearsOfExperience: number;
  hourlyRate: number;
  firmName: string | null;
  firmAddress: string | null;
  bio: string | null;
  isActive: boolean;
  isVerified: boolean;
  organizationId: number | null;
}

export default function AttorneyProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    barNumber: '',
    licenseState: '',
    practiceAreas: [] as string[],
    yearsOfExperience: 0,
    hourlyRate: 0,
    bio: '',
  });

  const { data: profile, isLoading, error } = useQuery<AttorneyProfile>({
    queryKey: ['/api/attorney/profile'],
    enabled: !!user,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phoneNumber: profile.phoneNumber || '',
        barNumber: profile.barNumber || '',
        licenseState: profile.licenseState || '',
        practiceAreas: profile.practiceAreas || [],
        yearsOfExperience: profile.yearsOfExperience || 0,
        hourlyRate: profile.hourlyRate || 0,
        bio: profile.bio || '',
      });
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest('/api/attorney/profile', {
        method: 'PUT',
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/attorney/profile'] });
      setIsEditing(false);
      toast({ title: 'Success', description: 'Profile updated successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update profile', variant: 'destructive' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handlePracticeAreaChange = (area: string, checked: boolean) => {
    if (checked) {
      setFormData({ ...formData, practiceAreas: [...formData.practiceAreas, area] });
    } else {
      setFormData({ ...formData, practiceAreas: formData.practiceAreas.filter(a => a !== area) });
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phoneNumber: profile.phoneNumber || '',
        barNumber: profile.barNumber || '',
        licenseState: profile.licenseState || '',
        practiceAreas: profile.practiceAreas || [],
        yearsOfExperience: profile.yearsOfExperience || 0,
        hourlyRate: profile.hourlyRate || 0,
        bio: profile.bio || '',
      });
    }
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AttorneyAppBar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
          <p className="text-gray-600 mt-1">View and update your professional information</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading profile...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">Failed to load profile. Please try again.</p>
          </div>
        ) : profile ? (
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" /> Personal Information
                    </CardTitle>
                    {!isEditing ? (
                      <Button type="button" variant="outline" onClick={() => setIsEditing(true)}>
                        Edit Profile
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={handleCancel}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={updateMutation.isPending}>
                          <Save className="w-4 h-4 mr-2" />
                          {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      {isEditing ? (
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        />
                      ) : (
                        <p className="mt-1 text-gray-900">{profile.firstName}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      {isEditing ? (
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        />
                      ) : (
                        <p className="mt-1 text-gray-900">{profile.lastName}</p>
                      )}
                    </div>
                    <div>
                      <Label>Email</Label>
                      <p className="mt-1 text-gray-900">{profile.email}</p>
                      {isEditing && (
                        <p className="text-xs text-gray-400 mt-1">Contact admin to change email</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      {isEditing ? (
                        <Input
                          id="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        />
                      ) : (
                        <p className="mt-1 text-gray-900">{profile.phoneNumber || 'Not provided'}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" /> Professional Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="barNumber">Bar Number</Label>
                      {isEditing ? (
                        <Input
                          id="barNumber"
                          value={formData.barNumber}
                          onChange={(e) => setFormData({ ...formData, barNumber: e.target.value })}
                        />
                      ) : (
                        <p className="mt-1 text-gray-900">{profile.barNumber || 'Not provided'}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="licenseState">License State</Label>
                      {isEditing ? (
                        <Select value={formData.licenseState} onValueChange={(v) => setFormData({ ...formData, licenseState: v })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            {US_STATES.map(state => (
                              <SelectItem key={state} value={state}>{state}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="mt-1 text-gray-900">{profile.licenseState || 'Not provided'}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                      {isEditing ? (
                        <Input
                          id="yearsOfExperience"
                          type="number"
                          min="0"
                          value={formData.yearsOfExperience}
                          onChange={(e) => setFormData({ ...formData, yearsOfExperience: parseInt(e.target.value) || 0 })}
                        />
                      ) : (
                        <p className="mt-1 text-gray-900">{profile.yearsOfExperience || 0} years</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                      {isEditing ? (
                        <Input
                          id="hourlyRate"
                          type="number"
                          min="0"
                          value={formData.hourlyRate}
                          onChange={(e) => setFormData({ ...formData, hourlyRate: parseInt(e.target.value) || 0 })}
                        />
                      ) : (
                        <p className="mt-1 text-gray-900">${profile.hourlyRate || 0}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label>Status</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={profile.isActive ? 'default' : 'secondary'}>
                        {profile.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      {profile.isVerified ? (
                        <Badge variant="default">Verified</Badge>
                      ) : (
                        <Badge variant="secondary">Unverified</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" /> Practice Areas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {PRACTICE_AREAS.map(area => (
                        <div key={area} className="flex items-center space-x-2">
                          <Checkbox
                            id={`pa-${area}`}
                            checked={formData.practiceAreas.includes(area)}
                            onCheckedChange={(checked) => handlePracticeAreaChange(area, checked as boolean)}
                          />
                          <Label htmlFor={`pa-${area}`} className="text-sm">{area}</Label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profile.practiceAreas?.length > 0 ? (
                        profile.practiceAreas.map((area: string) => (
                          <Badge key={area} variant="outline">{area}</Badge>
                        ))
                      ) : (
                        <p className="text-gray-500">No practice areas specified</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" /> Biography
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      rows={5}
                      placeholder="Tell clients about your background and experience..."
                    />
                  ) : (
                    <p className="text-gray-700 leading-relaxed">
                      {profile.bio || 'No biography provided'}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </form>
        ) : null}
      </div>
    </div>
  );
}
