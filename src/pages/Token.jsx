import React, { useState } from 'react';

// Import Solana libraries AFTER setting Buffer
import {
  Connection,
  Keypair,
  PublicKey,
  LAMPORTS_PER_SOL,
  Transaction,
  SystemProgram,
} from '@solana/web3.js';
import {
  createMint,
  createMintToInstruction,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  getAssociatedTokenAddress,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import axios from 'axios';
import { useWallet } from '@solana/wallet-adapter-react';

// Initialize Solana Devnet connection
const connection = new Connection(
  'https://solana-devnet.g.alchemy.com/v2/zhC5LCHoF-DwUmkJgJVlnt1Q1a8cuOcW',
  'confirmed'
);

// Pinata API keys (replace with your own keys)
// const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
// const PINATA_API_SECRET = import.meta.env.VITE_PINATA_API_SECRET;

const Token = () => {
  const { publicKey, connect, signTransaction, sendTransaction } = useWallet();
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
  const [recipientAddress, setRecipientAddress] = useState('');
  // const [freezeAuthorityEnabled, setFreezeAuthorityEnabled] = useState(false);

  // Handle input changes for token details
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTokenDetails({ ...tokenDetails, [name]: value });
  };

  // Function to create a token
  const createToken = async (event) => {
    event.preventDefault();

    if (!publicKey || !signTransaction) {
      setStatus('❌ Please connect your wallet first.');
      return;
    }

    try {
      setStatus('⏳ Creating token on Solana...');

      // ✅ Use Alchemy RPC for the connection
      const alchemyConnection = new Connection(
        'https://solana-devnet.g.alchemy.com/v2/zhC5LCHoF-DwUmkJgJVlnt1Q1a8cuOcW',
        'confirmed'
      );

      // ✅ Check if wallet has enough balance
      const walletBalance = await alchemyConnection.getBalance(publicKey);
      if (walletBalance < 0.05 * LAMPORTS_PER_SOL) {
        setStatus('❌ Not enough SOL in wallet. Please add funds.');
        return;
      }

      console.log(
        'Wallet Public Key:',
        publicKey?.toBase58() || '❌ Not available'
      );
      console.log('Signer Available:', signTransaction ? '✅ Yes' : '❌ No');
      console.log('Alchemy Connection:', alchemyConnection.rpcEndpoint);

      // ✅ Generate a new Keypair for the mint
      const mintKeypair = Keypair.generate();
      const mintAddress = mintKeypair.publicKey.toBase58();
      console.log('✅ Mint Keypair Generated:', mintAddress);

      // Fetch the recent blockhash
      const { blockhash } = await alchemyConnection.getLatestBlockhash();
      console.log('✅ Recent Blockhash:', blockhash);

      // Create the mint token transaction
      const transaction = new Transaction({
        recentBlockhash: blockhash,
        feePayer: publicKey, // Ensure the correct fee payer
      });

      // Create the associated token address (for the token receiver)
      const receiverTokenAddress = await getAssociatedTokenAddress(
        mintKeypair.publicKey, // Mint address
        publicKey // Owner address
      );

      // Create the mint-to instruction
      const mintToInstruction = createMintToInstruction(
        mintKeypair.publicKey, // Mint address
        receiverTokenAddress, // Receiver's associated token address
        publicKey, // Mint authority
        1 * LAMPORTS_PER_SOL, // Amount to mint (example: 1 token)
        [],
        TOKEN_PROGRAM_ID
      );

      transaction.add(mintToInstruction);

      // Sign the transaction
      const signedTransaction = await signTransaction(transaction);

      // Send the transaction
      const txId = await alchemyConnection.sendTransaction(signedTransaction, [
        mintKeypair,
      ]);

      // Confirm the transaction
      const confirmation = await alchemyConnection.confirmTransaction(
        txId,
        'confirmed'
      );
      if (confirmation.value.err) {
        setStatus('❌ Token creation failed.');
        console.error('❌ Token creation error:', confirmation.value.err);
      } else {
        setMintAddress(mintKeypair.publicKey.toBase58());
        setStatus(
          `✅ Token created successfully! Mint Address: ${mintKeypair.publicKey.toBase58()}`
        );
      }
    } catch (error) {
      setStatus('❌ Error creating token.');
      console.error('Token creation error:', error);
    }
  };

  // Function to mint tokens
  const mintTokens = async () => {
    if (!recipientAddress) {
      setStatus('❌ Please enter a recipient wallet address.');
      return;
    }
    if (!mintAddress) {
      setStatus('❌ Please create a token first.');
      return;
    }

    try {
      setStatus('⏳ Minting tokens...');

      const mint = new PublicKey(mintAddress);
      const recipientPublicKey = new PublicKey(recipientAddress);

      // ✅ Get or create the associated token account for the recipient
      const tokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        publicKey, // Payer (wallet)
        mint,
        recipientPublicKey
      );

      console.log('✅ Token Account Address:', tokenAccount.address.toBase58());

      // ✅ Mint tokens to the recipient's token account
      await mintTo(
        connection,
        publicKey, // Payer (wallet)
        mint,
        tokenAccount.address, // Recipient's token account
        publicKey, // Mint authority
        tokenDetails.supply * Math.pow(10, tokenDetails.decimals) // Amount
      );

      setStatus(`✅ Tokens minted successfully to ${recipientAddress}!`);
    } catch (error) {
      setStatus('❌ Error minting tokens.');
      console.error('Minting error:', error);
    }
  };

  return (
    <div style={{ padding: '20px' }} className="mt-32">
      <h1>Solana Token Generator</h1>
      <p>
        Wallet Status:{' '}
        {publicKey ? (
          <strong>
            Connected: {publicKey.toBase58().slice(0, 4)}...
            {publicKey.toBase58().slice(-4)}
          </strong>
        ) : (
          <span style={{ color: 'red' }}>Not Connected</span>
        )}
      </p>

      {/* Token Creation Form */}
      <div style={{ marginTop: '20px' }}>
        <h2>Create Token</h2>
        <input
          type="text"
          name="name"
          placeholder="Token Name"
          value={tokenDetails.name}
          onChange={handleInputChange}
          className="border-2 border-red-300"
        />
        <input
          type="text"
          name="symbol"
          placeholder="Token Symbol"
          value={tokenDetails.symbol}
          onChange={handleInputChange}
          className="border-2 border-red-300"
        />
        <input
          type="number"
          name="decimals"
          placeholder="Decimals"
          value={tokenDetails.decimals}
          onChange={handleInputChange}
          className="border-2 border-red-300"
        />
        <input
          type="number"
          name="supply"
          placeholder="Initial Supply"
          value={tokenDetails.supply}
          onChange={handleInputChange}
          className="border-2 border-red-300"
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

        {/* <label>
          <input
            type="checkbox"
            checked={freezeAuthorityEnabled}
            onChange={() => setFreezeAuthorityEnabled(!freezeAuthorityEnabled)}
          />
          Enable Freeze Authority
        </label> */}
        <div style={{ marginTop: '20px' }}>
          {publicKey ? (
            <button onClick={createToken}>Create Token</button>
          ) : (
            <button onClick={connect}>Connect Wallet</button>
          )}
        </div>
      </div>

      {/* Minting Tokens */}
      {mintAddress && (
        <div style={{ marginTop: '20px' }}>
          <h2>Mint Tokens</h2>
          <input
            type="text"
            placeholder="Enter recipient wallet address"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            style={{ marginBottom: '10px', padding: '5px', width: '100%' }}
          />
          <button onClick={mintTokens} className="border-2 border-red-400">
            Mint Tokens
          </button>
        </div>
      )}

      {/* Status Display */}
      <p>Status: {status}</p>
    </div>
  );
};

export default Token;
