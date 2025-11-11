import api from "@/shared/services/axios";

interface ChatRequest {
  prompt: string;
  includeChart?: boolean;
  threadId?: string;
  userId?: number;
  context?: string;
}

export interface PendingAction {
  action: string;
  action_description: string;
  params: Record<string, any>;
  endpoint: string;
  method: string;
  confirmation_message: string;
}

export interface ActionConfirmation {
  action: string;
  params: Record<string, any>;
  endpoint: string;
  method: string;
  user_id: number;
}

export interface ChatResponse {
  answer: string;
  threadId?: string;
  chart?: any;
  videos?: any[];
  pending_action?: PendingAction;
  content: string;
  steps: string[];
}

export interface InsightsResponse {
  status: string;
  timestamp: string;
  statistics: {
    os_today: {
      count: number;
      revenue: number;
    };
    monthly_ticket: {
      count: number;
      avg_ticket: number;
      total_revenue: number;
    };
    recurrent_clients: {
      count: number;
      total_orders: number;
    };
    top_parts: Array<{
      name: string;
      usage_count: number;
      quantity: number;
    }>;
    os_status: Record<string, number>;
  };
  analysis: string;
  predictions: string;
  insights_summary: {
    os_today: {
      count: number;
      revenue: number;
    };
    monthly_performance: {
      avg_ticket: number;
      total_revenue: number;
      os_count: number;
    };
    recurrence: {
      clients: number;
      orders: number;
    };
    top_parts: Array<{
      name: string;
      usage_count: number;
      quantity: number;
    }>;
  };
}

// LGPD Interfaces
export interface LgpdStatusResponse {
  status: string;
  user_email: string;
  pending_requests: number;
  total_requests: number;
  deletion_scheduled: boolean;
  deletion_date?: string;
  rights: {
    access: string;
    rectification: string;
    erasure: string;
    portability: string;
    objection: string;
  };
  last_updated: string;
}

export interface LgpdRequestResponse {
  status: string;
  message: string;
  request_id?: string;
  scheduled_date?: string;
  estimated_completion?: string;
  note?: string;
}

export const aiService = {
  chat: (data: ChatRequest) => api.post<ChatResponse>("/ai/chat", data, {
    timeout: 180000, // 3 minutos para chat (processamento + áudio)
  }),
  status: () => api.get("/ai/chat/status"),
  insights: () => api.get<InsightsResponse>("/ai/chat/insights"),
  
  confirmAction: (confirmation: ActionConfirmation) => 
    api.post("/ai/action/confirm", confirmation),
  
  lgpd: {
    status: (userEmail: string) => 
      api.get<LgpdStatusResponse>("/lgpd/status", { params: { userEmail } }),
    
    requestDeletion: (userEmail: string, reason?: string) => 
      api.post<LgpdRequestResponse>("/lgpd/request-deletion", null, {
        params: { userEmail, reason }
      }),
    
    requestExport: (userEmail: string) => 
      api.post<LgpdRequestResponse>("/lgpd/request-export", null, {
        params: { userEmail }
      }),
    
    getRequests: (userEmail: string) => 
      api.get("/lgpd/requests", { params: { userEmail } }),
  },
  
  voice: {
    transcribe: (audioBase64: string, engine?: 'whisper' | 'google', language?: string) =>
      api.post("/ai/voice/transcribe", {
        audio_base64: audioBase64,
        engine: engine || 'whisper',
        language: language || 'pt'
      }, {
        timeout: 120000, // 2 minutos para transcrição
      }),
    
    synthesize: (text: string, voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer') =>
      api.post("/ai/voice/synthesize", {
        text,
        voice: voice || 'nova'
      }, {
        timeout: 180000, // 3 minutos para síntese de áudio (textos maiores)
      }),
    
    command: (audioBase64: string, ttsEnabled?: boolean) =>
      api.post("/ai/voice/command", {
        audio_base64: audioBase64,
        tts_enabled: ttsEnabled || false
      }, {
        timeout: 180000, // 3 minutos para comando completo
      }),
  },
  
  vision: {
    analyze: (imageBase64: string, partContext?: string) =>
      api.post("/ai/vision/analyze", {
        image_base64: imageBase64,
        part_context: partContext
      }),
    
    detectDamage: (imageBase64: string) =>
      api.post("/ai/vision/detect-damage", {
        image_base64: imageBase64
      }),
    
    suggestPart: (identifiedPart: string, vehicleInfo?: {
      make?: string;
      model?: string;
      year?: number;
    }) =>
      api.post("/ai/vision/suggest-part", {
        identified_part: identifiedPart,
        vehicle_info: vehicleInfo
      }),
    
    extractCode: (imageBase64: string) =>
      api.post("/ai/vision/extract-code", {
        image_base64: imageBase64
      }),
  },
  
  predictive: {
    orderDelay: (orderData: {
      id?: number;
      service_type?: string;
      technician_active_orders?: number;
      parts_available?: boolean;
      estimated_hours?: number;
      days_open?: number;
    }) =>
      api.post("/ai/predictive/order-delay", {
        order_data: orderData
      }),
    
    bottlenecks: (operationalData: {
      open_orders?: number;
      active_technicians?: number;
      daily_completion_rate?: number;
      daily_new_orders?: number;
      low_stock_count?: number;
    }, forecastDays?: number) =>
      api.post("/ai/predictive/bottlenecks", {
        operational_data: operationalData,
        forecast_days: forecastDays || 7
      }),
    
    alerts: (currentState: {
      orders_near_deadline?: any[];
      low_stock_items?: any[];
      capacity_usage_percent?: number;
      overloaded_technicians?: any[];
    }) =>
      api.post("/ai/predictive/alerts", {
        current_state: currentState
      }),
  },
  
  simulation: {
    priceChange: (currentData: {
      monthly_revenue: number;
      monthly_orders: number;
      avg_ticket: number;
      profit_margin_percent: number;
    }, priceChangePercent: number) =>
      api.post("/ai/simulation/price-change", {
        current_data: currentData,
        price_change_percent: priceChangePercent
      }),
    
    capacityChange: (currentData: {
      technician_count: number;
      monthly_orders: number;
      avg_ticket: number;
      monthly_revenue: number;
      tech_cost_monthly: number;
    }, additionalTechnicians: number) =>
      api.post("/ai/simulation/capacity-change", {
        current_data: currentData,
        additional_technicians: additionalTechnicians
      }),
    
    whatIf: (query: string, currentData: any) =>
      api.post("/ai/simulation/what-if", {
        query,
        current_data: currentData
      }),
    
    compare: (scenarios: any[]) =>
      api.post("/ai/simulation/compare", {
        scenarios
      }),
  },
  
  multimodal: {
    chat: (data: {
      text?: string;
      audio_base64?: string;
      image_base64?: string;
      context?: string;
      tts_enabled?: boolean;
      metadata?: any;
    }) =>
      api.post("/ai/multimodal/chat", data, {
        timeout: 180000, // 3 minutos para chat (processamento + áudio)
      }),
  },
};
