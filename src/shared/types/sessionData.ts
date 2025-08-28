export type SessionData = {
  buster: string;
  timestamp: number;
  clientState: {
    mutations: any[]; 
    queries: Array<{
      dehydratedAt: number;
      state: {
        data: {
          token: string;
          email: string;
          name: string;
          role: string;
        };
        dataUpdateCount: number;
        dataUpdatedAt: number;
        error: any;
        errorUpdateCount: number;
        errorUpdatedAt: number;
        fetchFailureCount: number;
        fetchFailureReason: any;
        fetchMeta: any;
        isInvalidated: boolean;
        status: string;
        fetchStatus: string;
      };
      queryKey: string[];
      queryHash: string;
    }>;
  };
};