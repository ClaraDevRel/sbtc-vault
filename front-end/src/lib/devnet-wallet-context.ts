import { createContext, useContext } from 'react';

export interface DevnetWallet {
  stxAddress: string;
  label: string;
  mnemonic: string;
}

export interface DevnetWalletContextType {
  currentWallet: DevnetWallet | null;
  wallets: DevnetWallet[];
  setCurrentWallet: (wallet: DevnetWallet) => void;
}

// Devnet wallet mnemonics loaded from environment variables.
// These are standard Stacks devnet wallets — see .env.example for values.
export const devnetWallets: DevnetWallet[] = [
  {
    stxAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    label: 'Deployer',
    mnemonic: process.env.NEXT_PUBLIC_DEVNET_MNEMONIC_DEPLOYER ?? ''
  },
  {
    stxAddress: 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5',
    label: 'Wallet 1',
    mnemonic: process.env.NEXT_PUBLIC_DEVNET_MNEMONIC_1 ?? ''
  },
  {
    stxAddress: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
    label: 'Wallet 2',
    mnemonic: process.env.NEXT_PUBLIC_DEVNET_MNEMONIC_2 ?? ''
  },
  {
    stxAddress: 'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC',
    label: 'Wallet 3',
    mnemonic: process.env.NEXT_PUBLIC_DEVNET_MNEMONIC_3 ?? ''
  },
  {
    stxAddress: 'ST2NEB84ASENDXKYGJPQW86YXQCEFEX2ZQPG87ND',
    label: 'Wallet 4',
    mnemonic: process.env.NEXT_PUBLIC_DEVNET_MNEMONIC_4 ?? ''
  },
  {
    stxAddress: 'ST2REHHS5J3CERCRBEPMGH7921Q6PYKAADT7JP2VB',
    label: 'Wallet 5',
    mnemonic: process.env.NEXT_PUBLIC_DEVNET_MNEMONIC_5 ?? ''
  },
];

export const DevnetWalletContext = createContext<DevnetWalletContextType>({
  currentWallet: null,
  wallets: devnetWallets,
  setCurrentWallet: () => {},
});

export const useDevnetWallet = () => useContext(DevnetWalletContext);
