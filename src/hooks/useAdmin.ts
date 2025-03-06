
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { checkIsAdmin, addFunds, withdrawFunds, getAllUsers, getAllBalances } from '@/services/adminService';
import { useToast } from '@/hooks/use-toast';

interface UserBalance {
  user_id: string;
  currency: string;
  balance: number;
}

interface AdminUser {
  id: string;
  email?: string;
  created_at: string;
  balances?: UserBalance[];
}

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [balances, setBalances] = useState<UserBalance[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  // Check if current user is admin
  useEffect(() => {
    if (!user) return;

    async function checkAdmin() {
      setLoading(true);
      const adminStatus = await checkIsAdmin();
      setIsAdmin(adminStatus);
      
      if (adminStatus) {
        // Fetch users and balances if admin
        fetchAdminData();
      } else {
        setLoading(false);
      }
    }
    
    checkAdmin();
  }, [user]);

  // Fetch admin data (users and balances)
  const fetchAdminData = async () => {
    setLoading(true);
    
    const [usersResponse, balancesResponse] = await Promise.all([
      getAllUsers(),
      getAllBalances()
    ]);
    
    if (usersResponse.data && balancesResponse.data) {
      // Process users data
      const userData = usersResponse.data.users.map((user: any) => ({
        id: user.id,
        email: user.email,
        created_at: user.created_at
      }));
      
      // Organize balances by user
      const userBalances = balancesResponse.data.map((balance: any) => ({
        user_id: balance.user_id,
        currency: balance.currency,
        balance: Number(balance.balance)
      }));
      
      // Associate balances with users
      const enhancedUsers = userData.map((user: AdminUser) => ({
        ...user,
        balances: userBalances.filter((balance: UserBalance) => balance.user_id === user.id)
      }));
      
      setUsers(enhancedUsers);
      setBalances(userBalances);
    }
    
    setLoading(false);
  };

  // Add funds to a user's account
  const handleAddFunds = async (userId: string, amount: number, currency: string, description?: string) => {
    try {
      const result = await addFunds({ userId, amount, currency, description });
      
      if (result.error) {
        toast({
          title: "Error",
          description: result.error.message,
          variant: "destructive"
        });
        return false;
      }
      
      toast({
        title: "Success",
        description: `Added ${amount} ${currency} to user account`,
      });
      
      fetchAdminData(); // Refresh data
      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add funds",
        variant: "destructive"
      });
      return false;
    }
  };

  // Withdraw funds from a user's account
  const handleWithdrawFunds = async (userId: string, amount: number, currency: string, description?: string) => {
    try {
      const result = await withdrawFunds({ userId, amount, currency, description });
      
      if (result.error) {
        toast({
          title: "Error",
          description: result.error.message,
          variant: "destructive"
        });
        return false;
      }
      
      toast({
        title: "Success",
        description: `Withdrew ${amount} ${currency} from user account`,
      });
      
      fetchAdminData(); // Refresh data
      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to withdraw funds",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    isAdmin,
    loading,
    users,
    balances,
    refetch: fetchAdminData,
    addFunds: handleAddFunds,
    withdrawFunds: handleWithdrawFunds
  };
}
