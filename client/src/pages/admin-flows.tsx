import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GitBranch, Upload } from 'lucide-react';

export default function AdminFlows() {
  return (
    <AdminLayout title="Flows Management">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Flows Management</h2>
          <p className="text-gray-600">View and manage intake flows for different case types.</p>
        </div>
        <Button className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Import
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-blue-600" />
              Asylum Flow
            </CardTitle>
            <CardDescription>
              Affirmative asylum application intake
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              8 questions covering persecution fears, entry information, and court status.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-green-600" />
              K-1 Fiancé Visa
            </CardTitle>
            <CardDescription>
              Fiancé visa application intake
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Questions for U.S. citizen petitioners bringing fiancés to the U.S.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-purple-600" />
              Family-Based Green Card
            </CardTitle>
            <CardDescription>
              Family immigration intake
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Separate flows for petitioners and beneficiaries.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-orange-600" />
              Removal of Conditions
            </CardTitle>
            <CardDescription>
              I-751 petition intake
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              For conditional residents removing conditions on their green card.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-indigo-600" />
              Citizenship/Naturalization
            </CardTitle>
            <CardDescription>
              N-400 application intake
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Naturalization application for lawful permanent residents.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
