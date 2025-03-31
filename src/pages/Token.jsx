import { Buffer } from 'buffer';

if (typeof window !== 'undefined' && !window.Buffer) {
  window.Buffer = Buffer;
}

import React, { useState } from 'react';

// Import Solana libraries AFTER setting Buffer
import {
  Connection,
  Keypair,
  PublicKey,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from '@solana/spl-token';
import axios from 'axios';

// Initialize Solana Devnet connection
const connection = new Connection('https://api.devnet.solana.com');

// Pinata API keys (replace with your own keys)
const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_API_SECRET = import.meta.env.VITE_PINATA_API_SECRET;

console.log('Pinata API Key:', PINATA_API_KEY);
console.log('Pinata API Secret:', PINATA_API_SECRET);

const Token = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [status, setStatus] = useState('');
  const [tokenDetails, setTokenDetails] = useState({
    name: '',
    symbol: '',
    decimals: 9,
    supply: 1000,
    description: '',
  });
  const [mintAddress, setMintAddress] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // Function to connect to Phantom Wallet
  const connectWallet = async () => {
    if (window.solana && window.solana.isPhantom) {
      try {
        const response = await window.solana.connect();
        setWalletAddress(response.publicKey.toString());
        setStatus('Wallet connected!');
      } catch (error) {
        setStatus('Wallet connection failed.');
        console.error('Wallet connection error:', error);
      }
    } else {
      alert('Please install Phantom Wallet.');
    }
  };

  // Handle input changes for token details
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTokenDetails({ ...tokenDetails, [name]: value });
  };

  // Function to create a token
  const createToken = async (event) => {
    event.preventDefault(); // Prevent page reload

    if (!walletAddress) {
      setStatus('Please connect your wallet first.');
      return;
    }

    try {
      setStatus('Uploading image to IPFS via Pinata...');

      const formData = new FormData();
      formData.append('file', selectedFile); // `selectedFile` should be set when user selects an image

      const pinataOptions = JSON.stringify({
        cidVersion: 1,
      });

      formData.append('pinataOptions', pinataOptions);

      // Upload image to Pinata
      const imageUploadRes = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_API_SECRET,
          },
        }
      );

      const imageHash = imageUploadRes.data.IpfsHash;
      const imageUrl = `https://gateway.pinata.cloud/ipfs/${imageHash}`;
      console.log('Image uploaded to IPFS:', imageUrl);

      setStatus('Uploading metadata to IPFS...');

      // Step 2: Upload metadata to Pinata
      const metadata = {
        name: tokenDetails.name,
        symbol: tokenDetails.symbol,
        description: tokenDetails.description,
        decimals: tokenDetails.decimals,
        initial_supply: tokenDetails.supply,
        image: imageUrl, // Add image URL to metadata
      };

      const metadataUploadRes = await axios.post(
        'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        metadata,
        {
          headers: {
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_API_SECRET,
          },
        }
      );

      const metadataHash = metadataUploadRes.data.IpfsHash;
      const metadataUrl = `https://gateway.pinata.cloud/ipfs/${metadataHash}`;
      console.log('Metadata uploaded to IPFS:', metadataUrl);

      setStatus('Metadata uploaded successfully!');
    } catch (error) {
      setStatus('Error uploading image or metadata.');
      console.error('Error:', error);
    }
  };

  // Function to mint tokens
  const mintTokens = async () => {
    if (!walletAddress || !mintAddress) {
      setStatus('Please create a token first.');
      return;
    }

    try {
      setStatus('Minting tokens...');

      const payer = Keypair.generate(); // Replace with your wallet setup
      const mintAuthority = Keypair.generate(); // Replace with your mint authority

      // Get or create the associated token account for the connected wallet
      const tokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        payer,
        new PublicKey(mintAddress),
        new PublicKey(walletAddress) // Owner of the token account
      );

      console.log('Token Account Address:', tokenAccount.address.toBase58());

      // Mint tokens to the associated token account
      const mintSignature = await mintTo(
        connection,
        payer,
        new PublicKey(mintAddress),
        tokenAccount.address,
        mintAuthority, // Mint authority
        tokenDetails.supply * Math.pow(10, tokenDetails.decimals) // Adjust supply for decimals
      );

      console.log('Mint Transaction Signature:', mintSignature);

      setStatus('Tokens minted successfully!');
    } catch (error) {
      setStatus('Error minting tokens.');
      console.error('Minting error:', error);
    }
  };

  return (
    <div style={{ padding: '20px' }} className="mt-32">
      <h1>Solana Token Generator</h1>

      {/* Wallet Connection */}
      <button onClick={connectWallet}>
        {walletAddress
          ? `Connected: ${walletAddress.substring(
              0,
              4
            )}...${walletAddress.substring(walletAddress.length - 4)}`
          : 'Connect Wallet'}
      </button>

      {/* Token Creation Form */}
      <div style={{ marginTop: '20px' }}>
        <h2>Create Token</h2>
        <input
          type="text"
          name="name"
          placeholder="Token Name"
          value={tokenDetails.name}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="symbol"
          placeholder="Token Symbol"
          value={tokenDetails.symbol}
          onChange={handleInputChange}
        />
        <input
          type="number"
          name="decimals"
          placeholder="Decimals"
          value={tokenDetails.decimals}
          onChange={handleInputChange}
        />
        <input
          type="number"
          name="supply"
          placeholder="Initial Supply"
          value={tokenDetails.supply}
          onChange={handleInputChange}
        />
        <textarea
          name="description"
          placeholder="Token Description"
          value={tokenDetails.description}
          onChange={handleInputChange}
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setSelectedFile(e.target.files[0])}
        />
        <button onClick={createToken}>Create Token</button>
      </div>

      {/* Minting Tokens */}
      {mintAddress && (
        <div style={{ marginTop: '20px' }}>
          <h2>Mint Tokens</h2>
          <button onClick={mintTokens}>Mint Tokens</button>
        </div>
      )}

      {/* Status Display */}
      <p>Status: {status}</p>
    </div>
  );
};

export default Token;
