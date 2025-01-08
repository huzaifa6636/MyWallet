import { ethers } from 'ethers';

export const getProvider = () => {
  try {
    return new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/68f968c1f19e47fb971f3448eab2790e');
  } catch (error) {
    console.error('Error initializing provider:', error.message);
    throw new Error('Failed to initialize provider.');
  }
};

