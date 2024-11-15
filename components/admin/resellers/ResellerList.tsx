'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  MoreHorizontal,
  Wallet,
  Store,
  User,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ResellerDetails } from './ResellerDetails';

interface ResellerListProps {
  status: 'active' | 'pending' | 'suspended';
}

export function ResellerList({ status }: ResellerListProps) {
  const [resellers, setResellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReseller, setSelectedReseller] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchResellers();
  }, [status]);

  const fetchResellers = async () => {
    try {
      const response = await fetch(`/api/admin/resellers?status=${status}`);
      if (!response.ok) throw new Error('Failed to fetch resellers');
      const data = await response.json();
      setResellers(data);
    } catch (error) {
      console.error('Failed to fetch resellers:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch resellers',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (resellerId: string) => {
    try {
      const response = await fetch(`/api/admin/resellers/${resellerId}/approve`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to approve reseller');
      }

      toast({
        title: 'Success',
        description: 'Reseller approved successfully',
      });

      fetchResellers();
    } catch (error) {
      console.error('Failed to approve reseller:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve reseller',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (resellerId: string) => {
    try {
      const response = await fetch(`/api/admin/resellers/${resellerId}/reject`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to reject reseller');
      }

      toast({
        title: 'Success',
        description: 'Reseller application rejected',
      });

      fetchResellers();
    } catch (error) {
      console.error('Failed to reject reseller:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject reseller',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (resellers.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No {status} resellers found
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Reseller</TableHead>
            <TableHead>Business Name</TableHead>
            <TableHead>Domain</TableHead>
            <TableHead>Wallet Balance</TableHead>
            <TableHead>Total Revenue</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {resellers.map((reseller) => (
            <TableRow key={reseller._id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={reseller.image} />
                    <AvatarFallback>
                      {reseller.name?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{reseller.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {reseller.email}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>{reseller.businessName}</TableCell>
              <TableCell>{reseller.domain || 'Not set'}</TableCell>
              <TableCell>
                {formatCurrency(reseller.wallet?.balance || 0, reseller.wallet?.currency || 'USD')}
              </TableCell>
              <TableCell>
                {formatCurrency(reseller.statistics?.totalRevenue || 0, 'USD')}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    reseller.status === 'active'
                      ? 'default'
                      : reseller.status === 'pending'
                      ? 'secondary'
                      : 'destructive'
                  }
                >
                  {reseller.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem onClick={() => setSelectedReseller(reseller)}>
                      <User className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>

                    {reseller.status === 'pending' ? (
                      <>
                        <DropdownMenuItem
                          onClick={() => handleApprove(reseller._id)}
                          className="text-green-600"
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleReject(reseller._id)}
                          className="text-destructive"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <>
                        <DropdownMenuItem>
                          <Wallet className="mr-2 h-4 w-4" />
                          Manage Wallet
                        </DropdownMenuItem>
                        {reseller.domain && (
                          <DropdownMenuItem>
                            <Store className="mr-2 h-4 w-4" />
                            Visit Store
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-destructive">
                          <XCircle className="mr-2 h-4 w-4" />
                          Suspend Account
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ResellerDetails
        reseller={selectedReseller}
        onClose={() => setSelectedReseller(null)}
      />
    </>
  );
}