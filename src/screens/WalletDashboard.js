import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import {ethers} from 'ethers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {getProvider} from '../web3Helpers/provider';

const WalletDashboard = () => {
  const navigation = useNavigation();
  const [walletAddress, setWalletAddress] = useState('');
  const [walletBalance, setWalletBalance] = useState('');
  const [providerName, setProviderName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  const fetchPrivateKey = async () => {
    try {
      const privateKey = await AsyncStorage.getItem('privateKey');
      if (!privateKey) {
        Alert.alert('Error', 'No private key found in storage');
        return null;
      }
      return privateKey;
    } catch (error) {
      console.error('Error fetching private key:', error.message);
      Alert.alert('Error', 'Failed to fetch private key');
      return null;
    }
  };

  const fetchWalletDetails = async () => {
    try {
      setIsLoading(true);

      const privateKey = await fetchPrivateKey();
      if (!privateKey) return;

      const provider = getProvider();
      const network = await provider.getNetwork();

      setProviderName(network.name || 'Unknown Provider');

      const wallet = new ethers.Wallet(privateKey, provider);
      setWalletAddress(wallet.address);

      const balance = await provider.getBalance(wallet.address);
      const formattedBalance = ethers.formatEther(balance);
      setWalletBalance(formattedBalance);
    } catch (error) {
      console.error('Error fetching wallet details:', error.message);
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const sendFunds = () => {
    navigation.navigate('SendToken');
  };

  useEffect(() => {
    fetchWalletDetails();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wallet Dashboard</Text>

      {walletAddress ? (
        <View style={styles.infoCard}>
          <Text style={styles.label}>Wallet Address:</Text>
          <Text style={styles.value}>{walletAddress}</Text>

          <Text style={styles.label}>Wallet Balance:</Text>
          <Text style={styles.value}>{walletBalance} ETH</Text>

          <Text style={styles.label}>Provider Name:</Text>
          <Text style={styles.value}>{providerName}</Text>
        </View>
      ) : (
        <Text style={styles.loadingText}>
          {isLoading ? 'Loading...' : 'No Wallet Connected'}
        </Text>
      )}

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonLoading]}
        onPress={fetchWalletDetails}
        disabled={isLoading}>
        <Text style={styles.buttonText}>
          {isLoading ? 'Fetching...' : 'Refetch Balance'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={sendFunds}>
        <Text style={styles.buttonText}>Send</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={toggleModal}>
        <Text style={styles.buttonText}>Receive</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={()=>{navigation.navigate('ConnectWallet')}}>
        <Text style={styles.buttonText}>Connect Wallet</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={toggleModal}>
        <Pressable onPress={toggleModal} style={styles.overlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Receive Funds</Text>
            <Text style={styles.modalContent}>{walletAddress}</Text>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f4f4',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    marginBottom: 20,
  },
  label: {
    fontWeight: '600',
    color: '#34495e',
    fontSize: 16,
  },
  value: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginVertical: 10,
    shadowColor: '#3498db',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  buttonLoading: {
    backgroundColor: '#a9cce3',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#bdc3c7',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: 300,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#34495e',
  },
  modalContent: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },
});

export default WalletDashboard;
