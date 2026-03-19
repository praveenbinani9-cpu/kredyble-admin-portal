import { useState, useEffect } from 'react';
import { Tag, TrendingUp, TrendingDown, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import { offersAPI } from '../lib/api';
import { formatCurrency, formatPercent } from '../lib/utils';

export default function OffersPage() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await offersAPI.getAll();
        setOffers(response.data.offers);
      } catch (error) {
        console.error('Failed to fetch offers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleToggle = async (offerId) => {
    try {
      await offersAPI.toggle(offerId);
      setOffers(offers.map(offer => 
        offer.id === offerId ? { ...offer, is_active: !offer.is_active } : offer
      ));
    } catch (error) {
      console.error('Failed to toggle offer:', error);
    }
  };

  const totalRevenue = offers.reduce((sum, o) => sum + o.revenue_generated, 0);
  const totalForgone = offers.reduce((sum, o) => sum + o.revenue_forgone, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="offers-page">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Offers & Pricing</h1>
          <p className="text-slate-500">Manage pricing plans and promotional offers</p>
        </div>
        <Button data-testid="create-offer-btn">
          <Plus className="h-4 w-4 mr-2" />
          Create Offer
        </Button>
      </div>

      {/* Impact Summary */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Revenue Generated</p>
                <p className="text-xl font-bold text-emerald-600">{formatCurrency(totalRevenue, { compact: true })}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-lg">
                <TrendingDown className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Revenue Forgone</p>
                <p className="text-xl font-bold text-amber-600">{formatCurrency(totalForgone, { compact: true })}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-2 gap-6">
        {offers.map((offer) => (
          <Card 
            key={offer.id} 
            className={`relative ${!offer.is_active ? 'opacity-60' : ''}`}
            data-testid={`offer-card-${offer.id}`}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{offer.name}</CardTitle>
                  <CardDescription>{offer.description}</CardDescription>
                </div>
                <Switch
                  checked={offer.is_active}
                  onCheckedChange={() => handleToggle(offer.id)}
                  data-testid={`toggle-${offer.id}`}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Fee Display */}
              <div className="p-4 bg-slate-50 rounded-lg text-center">
                <p className="text-4xl font-bold text-slate-900">
                  {offer.fee_percent}%
                  {offer.fee_percent > 0 && <span className="text-lg font-normal text-slate-500"> + GST</span>}
                </p>
                <p className="text-sm text-slate-500 mt-1">Platform Fee</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 border rounded-lg">
                  <p className="text-2xl font-bold">{offer.users_count}</p>
                  <p className="text-xs text-slate-500">Users Assigned</p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <p className="text-2xl font-bold text-emerald-600">
                    {formatCurrency(offer.revenue_generated, { compact: true })}
                  </p>
                  <p className="text-xs text-slate-500">Revenue Generated</p>
                </div>
              </div>

              {offer.revenue_forgone > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-700">
                    Revenue forgone: <span className="font-semibold">{formatCurrency(offer.revenue_forgone)}</span>
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Assign Users
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Edit
                </Button>
              </div>
            </CardContent>

            {/* Status Badge */}
            <div className="absolute top-4 right-16">
              <Badge variant={offer.is_active ? 'default' : 'secondary'}>
                {offer.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
