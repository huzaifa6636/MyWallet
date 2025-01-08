import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Camera } from 'react-native-vision-camera';
import { useCameraPermission, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import '@walletconnect/react-native-compat';
import { Core } from '@walletconnect/core';
import { Web3Wallet } from '@walletconnect/web3wallet';


// Initialize WalletConnect
const initWalletConnect = async () => {
  try {
    const id='f6663411394f06fa3c0d51b351a7958e'
    const core = new Core({
      projectId: 'f6663411394f06fa3c0d51b351a7958e', // Replace with your valid WalletConnect project ID
      // relayUrl: 'www.jawadmovers.com', // Use secure WebSocket URL
    });

    const web3wallet = await Web3Wallet.init({
      core,
      metadata: {
        name: "My Wallet",
        description: "My custom wallet for WalletConnect",
        url: "https://mywallet.com",
        icons: ["https://mywallet.com/icon.png"],
      },
    });

    console.log('Web3Wallet initialized successfully:', web3wallet);
    return web3wallet;
  } catch (error) {
    console.error('Error initializing WalletConnect:', error);
    return null;
  }
};

// Connect and pair with WalletConnect URI
const pairWalletConnect = async (web3wallet, uri) => {
  try {
    if (!web3wallet || !web3wallet.core) {
      throw new Error('Web3Wallet or core is not initialized properly.');
    }
    if (!uri) {
      throw new Error('URI is not provided or invalid.');
    }

    // Now pair with the dApp's URI
    await web3wallet.core.pairing.pair({ uri });
    console.log('WalletConnect pairing successful.');

    // Listen for session proposals
    web3wallet.on('session_proposal', async (proposal) => {
      try {
        console.log('Session proposal received:', proposal);

        // Approve the session proposal with necessary namespaces
        const namespaces = {
          eip155: {
            accounts: [`eip155:11155111:0x4838B106FCe9647Bdf1E7877BF73cE8B0BAD5f97`], // Address on Spolia testnet
            methods: ["eth_sendTransaction", "personal_sign"], // Allowed actions
            events: ["accountsChanged"], // Subscribed events
          },
        };

        const session = await web3wallet.approveSession({
          id: proposal.id,
          namespaces,
        });

        console.log('Session approved:', session);
      } catch (error) {
        console.error('Error approving session:', error);
      }
    });
  } catch (error) {
    console.error('Error during WalletConnect pairing:', error);
  }
};

// Main component for wallet connection
const ConnectMyWallet = () => {
  const [scannedData, setScannedData] = useState('');
  const [isScanning, setScanning] = useState(false);
  const [web3wallet, setWeb3Wallet] = useState(null);
  const device = useCameraDevice('back');
  const { hasPermission } = useCameraPermission();

  // Initialize WalletConnect on component mount
  useEffect(() => {
    const initializeWallet = async () => {
      const wallet = await initWalletConnect();
      if (wallet) {
        setWeb3Wallet(wallet);
      }
    };
    initializeWallet();
  }, []);

  // Handle camera permissions
  if (!hasPermission) {
    return <Text>No camera permissions granted.</Text>;
  }
  if (!device) {
    return <Text>No camera device found.</Text>;
  }

  // QR Code Scanner
  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: (codes) => {
      if (codes.length > 0) {
        const scannedValue = codes[0]?.value;
        setScannedData(scannedValue);
        Alert.alert('Code Scanned!', `Data: ${scannedValue}`);

        // Pair with WalletConnect URI after scanning
        if (web3wallet && scannedValue) {
          pairWalletConnect(web3wallet, scannedValue);
        }
        setScanning(false);
      }
    },
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setScanning(!isScanning)}
      >
        <Text style={styles.buttonText}>Scan QR Code</Text>
      </TouchableOpacity>
      <Text>Scanned Data: {scannedData}</Text>
      {isScanning && (
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          codeScanner={codeScanner}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  button: {
    backgroundColor: '#3498DB',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ConnectMyWallet;
