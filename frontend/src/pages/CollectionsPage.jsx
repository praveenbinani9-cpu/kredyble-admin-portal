import { useState, useEffect } from 'react';
import { Wallet, Building2, TrendingUp, Clock, PiggyBank, Calculator } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { KPICard } from '../components/features/KPICard';
import { FlowVisualization } from '../components/features/FlowVisualization';
import { collectionsAPI } from '../lib/api';

export default function CollectionsPage() {
  const [stats, setStats] = useState(null);
  const [flow, setFlow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('vendor');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, flowRes] = await Promise.all([
          collectionsAPI.getStats(),
          collectionsAPI.getFlow()
        ]);
        setStats(statsRes.data);
        setFlow(flowRes.data);
      } catch (error) {
        console.error('Failed to fetch collections data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const kpiData = [
    { title: 'Gross Collected', value: stats?.gross_collected, icon: Wallet },
    { title: 'Vendor Paid', value: stats?.vendor_paid, icon: Building2 },
    { title: 'Pending with PG', value: stats?.pending_pg, icon: Clock },
    { title: 'In Settlement', value: stats?.in_settlement, icon: TrendingUp },
    { title: 'Net Revenue', value: stats?.net_revenue, icon: PiggyBank, variant: 'highlight' },
    { title: 'GST Liability', value: stats?.gst_liability, icon: Calculator },
  ];

  return (
    <div className="space-y-6" data-testid="collections-page">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Collections & Flow</h1>
        <p className="text-slate-500">Financial control dashboard with flow visualization</p>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        {kpiData.map((kpi) => (
          <KPICard key={kpi.title} {...kpi} />
        ))}
      </div>

      {/* Flow Visualization */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="vendor" data-testid="vendor-flow-tab">Vendor Payment Flow</TabsTrigger>
          <TabsTrigger value="links" data-testid="links-flow-tab">Payment Link Flow</TabsTrigger>
        </TabsList>
        
        <TabsContent value="vendor">
          <FlowVisualization 
            data={flow?.vendor_flow} 
            title="Vendor Payment Flow - Money Movement" 
          />
        </TabsContent>
        
        <TabsContent value="links">
          <FlowVisualization 
            data={flow?.link_flow} 
            title="Payment Link Flow - Money Movement" 
          />
        </TabsContent>
      </Tabs>

      {/* Additional Info Cards */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Settlement Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <span className="text-sm font-medium text-emerald-700">T+0 Settlements</span>
                <span className="text-sm font-bold text-emerald-700">32%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-sm font-medium text-blue-700">T+1 Settlements</span>
                <span className="text-sm font-bold text-blue-700">45%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <span className="text-sm font-medium text-amber-700">T+2 Settlements</span>
                <span className="text-sm font-bold text-amber-700">23%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Fee Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Platform Fee Rate</span>
                <span className="text-sm font-semibold">2.0%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Average PG Rate</span>
                <span className="text-sm font-semibold">1.8%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Net Margin</span>
                <span className="text-sm font-semibold text-emerald-600">0.2%</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t">
                <span className="text-sm text-slate-600">GST on Platform Fee</span>
                <span className="text-sm font-semibold">18%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
