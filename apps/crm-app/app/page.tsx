import { Button } from '@/components/ui/button'
import { Building2, Users, Briefcase } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <Building2 className="mx-auto h-16 w-16 text-blue-600 mb-6" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Tinedy CRM
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Internal CRM system for managing customers, jobs, and quality
            control workflows
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Users className="h-12 w-12 text-green-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Customer Management
              </h3>
              <p className="text-gray-600">
                Manage customer data and service history
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <Briefcase className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Job Tracking</h3>
              <p className="text-gray-600">Track job status and assignments</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <Building2 className="h-12 w-12 text-purple-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Quality Control</h3>
              <p className="text-gray-600">Manage quality control workflows</p>
            </div>
          </div>

          <div className="mt-12 space-x-4">
            <Button size="lg">Get Started</Button>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
