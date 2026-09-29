import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { customerAuthApi, Customer } from "../api/customerAuth";
import { withRetry } from "../api/client";

interface CustomerAuthContextValue {
  customer: Customer | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (input: { firstName: string; lastName: string; email: string; password: string; phone: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (input: { firstName: string; lastName: string; phone: string }) => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(null);

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // React 18 StrictMode double-invokes this effect in dev, firing two
    // near-simultaneous /customer/me requests - whichever resolves last
    // would otherwise win, including a spurious failure of the discarded
    // first run. The cancelled flag (set by this run's own cleanup) means
    // only the currently-mounted effect's result can ever update state.
    let cancelled = false;
    withRetry(() => customerAuthApi.me())
      .then((res) => {
        if (!cancelled) setCustomer(res.user);
      })
      .catch(() => {
        if (!cancelled) setCustomer(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (email: string, password: string) => {
    const res = await customerAuthApi.login(email, password);
    setCustomer(res.user);
  };

  const signup = async (input: { firstName: string; lastName: string; email: string; password: string; phone: string }) => {
    const res = await customerAuthApi.signup(input);
    setCustomer(res.user);
  };

  const logout = async () => {
    await customerAuthApi.logout();
    setCustomer(null);
  };

  const updateProfile = async (input: { firstName: string; lastName: string; phone: string }) => {
    const res = await customerAuthApi.updateProfile(input);
    setCustomer(res.user);
  };

  return (
    <CustomerAuthContext.Provider value={{ customer, loading, login, signup, logout, updateProfile }}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) throw new Error("useCustomerAuth must be used within CustomerAuthProvider");
  return ctx;
}
