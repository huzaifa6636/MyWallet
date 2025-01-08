import 'react-native-get-random-values';
import '@ethersproject/shims';
import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ethers} from 'ethers';
import {useNavigation} from '@react-navigation/native';
import {getProvider} from '../web3Helpers/provider';

const CreateWallet = () => {
  const navigation = useNavigation();
  const [mnemonic, setMnemonic] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const saveToAsyncStorage = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, value);
      console.log(`Saved ${key} to AsyncStorage`);
    } catch (error) {
      console.error(`Failed to save ${key}`, error);
    }
  };

  const copyToClipboard = (text, label) => {
    Clipboard.setString(text);
    Alert.alert(`${label} Copied`, `${label} has been copied to clipboard.`);
  };

  const createWallet = async () => {
    try {
      setIsLoading(true);
      const provider = getProvider();
      // Generate a random mnemonic (seed phrase)
      const randomMnemonic = ethers.Mnemonic.entropyToPhrase(
        ethers.randomBytes(16),
      );
      setMnemonic(randomMnemonic);

      // Create a wallet instance using the mnemonic
      const wallet = ethers.Wallet.fromPhrase(randomMnemonic).connect(provider);

      // Set wallet details
      setWalletAddress(wallet.address);
      setPrivateKey(wallet.privateKey);

      // Save wallet details in AsyncStorage
      await saveToAsyncStorage('mnemonic', randomMnemonic);
      await saveToAsyncStorage('walletAddress', wallet.address);
      await saveToAsyncStorage('privateKey', wallet.privateKey);

      Alert.alert('Wallet Created', `Address: ${wallet.address}`);
    } catch (error) {
      console.log('Error creating wallet:', error);
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const connectToInfura = async () => {
    try {
      // Use ethers v6-compatible provider
      const provider = getProvider();
      const network = await provider.getNetwork();
      Alert.alert(
        'Connected to Network',
        `Chain ID: ${network?.chainId}, Name: ${network?.name}`,
      );
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Your Ethereum Wallet</Text>

      <View style={styles.card}>
        <TouchableOpacity
          style={[styles.actionButton, isLoading && styles.disabledButton]}
          onPress={createWallet}
          disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.actionButtonText}>Generate Wallet</Text>
          )}
        </TouchableOpacity>

        {walletAddress ? (
          <View>
            <Text style={styles.infoLabel}>Your Wallet Details</Text>

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Mnemonic:</Text>
              <Text style={styles.infoText}>{mnemonic}</Text>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={() => copyToClipboard(mnemonic, 'Mnemonic')}>
                <Text style={styles.copyButtonText}>Copy</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Wallet Address:</Text>
              <Text style={styles.infoText}>{walletAddress}</Text>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={() => copyToClipboard(walletAddress, 'Wallet Address')}>
                <Text style={styles.copyButtonText}>Copy</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Private Key:</Text>
              <Text style={styles.infoText}>{privateKey}</Text>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={() => copyToClipboard(privateKey, 'Private Key')}>
                <Text style={styles.copyButtonText}>Copy</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {walletAddress ? (
          <TouchableOpacity style={styles.actionButton} onPress={connectToInfura}>
            <Text style={styles.actionButtonText}>Connect to Infura</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.navigationButtons}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('WalletDashboard')}>
          <Text style={styles.navButtonText}>Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('ImportWallet')}>
          <Text style={styles.navButtonText}>Import Wallet</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  actionButton: {
    backgroundColor: '#3498db',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#95a5a6',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 10,
  },
  infoBox: {
    marginBottom: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: '#dcdcdc',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#34495e',
    marginBottom: 5,
  },
  infoText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  copyButton: {
    marginTop: 5,
    backgroundColor: '#1abc9c',
    padding: 5,
    borderRadius: 5,
    alignItems: 'center',
  },
  copyButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1abc9c',
    padding: 12,
    borderRadius: 8,
    width: '48%',
    justifyContent: 'center',
  },
  navButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default CreateWallet;
