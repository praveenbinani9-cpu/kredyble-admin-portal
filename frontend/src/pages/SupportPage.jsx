import { Headphones, MessageSquare, FileText, Phone, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';

export default function SupportPage() {
  return (
    <div className="space-y-6" data-testid="support-page">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Support</h1>
        <p className="text-slate-500">Get help and contact support</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Contact Form */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Contact Support</CardTitle>
            <CardDescription>Fill out the form below and we'll get back to you</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Input placeholder="What do you need help with?" data-testid="support-subject" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <select className="w-full h-10 px-3 border border-slate-200 rounded-md text-sm" data-testid="support-priority">
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Critical</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea 
                  placeholder="Describe your issue in detail..." 
                  rows={5}
                  data-testid="support-description"
                />
              </div>
              <Button type="submit" data-testid="submit-ticket">
                <MessageSquare className="h-4 w-4 mr-2" />
                Submit Ticket
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Quick Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer">
                <div className="p-2 bg-blue-100 rounded">
                  <Phone className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Phone Support</p>
                  <p className="text-xs text-slate-500">+91 1800 123 4567</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer">
                <div className="p-2 bg-emerald-100 rounded">
                  <Mail className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Email Support</p>
                  <p className="text-xs text-slate-500">support@kredyble.com</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer">
                <div className="p-2 bg-purple-100 rounded">
                  <MessageSquare className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Live Chat</p>
                  <p className="text-xs text-slate-500">Available 9 AM - 6 PM IST</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <a href="#" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                <FileText className="h-4 w-4" />
                API Documentation
              </a>
              <a href="#" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                <FileText className="h-4 w-4" />
                Integration Guide
              </a>
              <a href="#" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                <FileText className="h-4 w-4" />
                FAQ
              </a>
              <a href="#" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                <FileText className="h-4 w-4" />
                Troubleshooting
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
