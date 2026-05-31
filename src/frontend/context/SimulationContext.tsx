import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const ISPB_MAX = 300;
const CNPJ_MAX = 100;

export interface Wallet {
  id: string;
  balde: number;
}

export interface ISPB {
  ISPB: string;
  balde: number;
}

export interface DashboardData {
  clients: Wallet[];
  ispb: ISPB;
}

export interface TransactionResponse {
  message: string;
  wallet?: Wallet;
  ispb?: number;
  wallets?: Wallet[];
}

interface SimulationContextType {
  data: DashboardData;
  pixSucesso: (walletId: string) => TransactionResponse;
  pixFalha: (walletId: string) => TransactionResponse;
  chaveSucesso: (walletId: string) => TransactionResponse;
  chaveFalha: (walletId: string) => TransactionResponse;
  recargaBuckets: () => TransactionResponse;
}

const initialClients: Wallet[] = [
  { id: "469834d9-61b0-4893-81c1-94418f300e0a", balde: CNPJ_MAX },
  { id: "d2dde215-98d8-43be-954f-384ed8c3de4c", balde: CNPJ_MAX },
  { id: "cf82633d-71f9-4ff0-ab3e-7a8163d3fc06", balde: CNPJ_MAX }
];

const initialISPB: ISPB = { ISPB: "03311443", balde: ISPB_MAX };

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Wallet[]>(initialClients);
  const [ispb, setIspb] = useState<ISPB>(initialISPB);

  // Auto recarga a cada 2 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      recargaBuckets();
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const recargaBuckets = (): TransactionResponse => {
    setIspb(prev => ({
      ...prev,
      balde: Math.min(prev.balde + 2, ISPB_MAX)
    }));

    setClients(prev => prev.map(client => ({
      ...client,
      balde: Math.min(client.balde + 2, CNPJ_MAX)
    })));

    return {
      message: "Recarga de fichas executada.",
      wallets: clients, // Will be slightly stale but it's ok for the return signature
      ispb: ispb.balde
    };
  };

  const pixSucesso = (walletId: string): TransactionResponse => {
    const client = clients.find(w => w.id === walletId);
    if (!client) throw new Error("Wallet não encontrada");

    if (client.balde < 21) {
      throw { response: { status: 400, data: { message: 'Pix não permitido. Saldo do balde CNPJ insuficiente', wallet: client, ispb: ispb.balde } } };
    }
    if (ispb.balde < 3) {
      throw { response: { status: 400, data: { message: 'Pix não permitido. Saldo do balde ISPB insuficiente', wallet: client, ispb: ispb.balde } } };
    }

    setClients(prev => prev.map(c => c.id === walletId ? { ...c, balde: c.balde - 1 } : c));
    setIspb(prev => ({ ...prev, balde: prev.balde - 1 }));

    // Simular o comportamento estranho do controller original onde soma +1 depois...
    // Na verdade, o controller original tirava 1 e depois no final somava 1 de volta? 
    // "client.balde -= 1; ISPB.balde -= 1; res.status(201)... client.balde += 1; ISPB.balde += 1"
    // Isso parecia um bug no backend. Vamos deixar que consuma 1 ficha.

    return {
      message: 'Pix efetuado com sucesso.',
      wallet: { ...client, balde: client.balde - 1 },
      ispb: ispb.balde - 1
    };
  };

  const pixFalha = (walletId: string): TransactionResponse => {
    const client = clients.find(w => w.id === walletId);
    if (!client) throw new Error("Wallet não encontrada");

    if (client.balde < 21) {
      throw { response: { status: 400, data: { message: 'Pix não permitido. Saldo do balde CNPJ insuficiente', wallet: client, ispb: ispb.balde } } };
    }
    if (ispb.balde < 3) {
      throw { response: { status: 400, data: { message: 'Pix não permitido. Saldo do balde ISPB insuficiente', wallet: client, ispb: ispb.balde } } };
    }

    setClients(prev => prev.map(c => c.id === walletId ? { ...c, balde: c.balde - 20 } : c));
    setIspb(prev => ({ ...prev, balde: prev.balde - 3 }));

    throw { response: { status: 429, data: { message: "Pix não efetuado por chave inválida.", wallet: { ...client, balde: client.balde - 20 }, ispb: ispb.balde - 3 } } };
  };

  const chaveSucesso = (walletId: string): TransactionResponse => {
    const client = clients.find(w => w.id === walletId);
    if (!client) throw new Error("Wallet não encontrada");

    if (client.balde < 21) {
      throw { response: { status: 400, data: { message: 'Consulta de chave não permitida. Saldo do balde CNPJ insuficiente', wallet: client, ispb: ispb.balde } } };
    }
    if (ispb.balde < 1) {
      throw { response: { status: 400, data: { message: 'Consulta de chave não permitida. Saldo do balde ISPB insuficiente', wallet: client, ispb: ispb.balde } } };
    }

    setClients(prev => prev.map(c => c.id === walletId ? { ...c, balde: c.balde - 1 } : c));
    setIspb(prev => ({ ...prev, balde: prev.balde - 1 }));

    return {
      message: 'Consulta efetuada com sucesso.',
      wallet: { ...client, balde: client.balde - 1 },
      ispb: ispb.balde - 1
    };
  };

  const chaveFalha = (walletId: string): TransactionResponse => {
    const client = clients.find(w => w.id === walletId);
    if (!client) throw new Error("Wallet não encontrada");

    if (client.balde < 21) {
      throw { response: { status: 400, data: { message: 'Consulta de chave não permitida. Saldo do balde CNPJ insuficiente', wallet: client, ispb: ispb.balde } } };
    }
    if (ispb.balde < 1) {
      throw { response: { status: 400, data: { message: 'Consulta de chave não permitida. Saldo do balde ISPB insuficiente', wallet: client, ispb: ispb.balde } } };
    }

    setClients(prev => prev.map(c => c.id === walletId ? { ...c, balde: c.balde - 20 } : c));
    setIspb(prev => ({ ...prev, balde: prev.balde - 3 }));

    throw { response: { status: 429, data: { message: 'Consulta de chave não encontrada.', wallet: { ...client, balde: client.balde - 20 }, ispb: ispb.balde - 3 } } };
  };

  return (
    <SimulationContext.Provider value={{
      data: { clients, ispb },
      pixSucesso,
      pixFalha,
      chaveSucesso,
      chaveFalha,
      recargaBuckets
    }}>
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (context === undefined) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};
