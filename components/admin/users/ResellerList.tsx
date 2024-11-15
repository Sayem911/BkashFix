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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, CheckCircle2, XCircle, Wallet, ExternalLink } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface ResellerListProps {
  status: 'active' | 'pending';
}

export default function ResellerList({ status }: ResellerListProps) {
  const [resellers, setResellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchResellers();
  }, [status]);

  const fetchResellers = async () => {
    try {
      const response = await fetch(`/api/admin/resellers?status=${status}`);
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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Business Name</TableHead>
          <TableHead>Owner</TableHead>
          <TableHead>Domain</TableHead>
          <TableHead>Wallet Balance</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {resellers.map((reseller) => (
          <TableRow key={reseller._id}>
            <TableCell className="font-medium">
              {reseller.businessName}
            </TableCell>
            <TableCell>
              <div className="flex flex-col">
                <span>{reseller.name}</span>
                <span className="text-sm text-muted-foreground">
                  {reseller.email}
                </span>
              </div>
            </TableCell>
            <TableCell>{reseller.domain || 'Not set'}</TableCell>
            <TableCell>
              {formatCurrency(reseller.wallet?.balance || 0, reseller.wallet?.currency || 'USD')}
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
                  {status === 'pending' ? (
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
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Visit Store
                        </DropdownMenuItem>
                      )}
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}