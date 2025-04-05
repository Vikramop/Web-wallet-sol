import React, { useState } from 'react';
import { Connection, Keypair, PublicKey, clusterApiUrl } from '@solana/web3.js';
import {
  getOrCreateAssociatedTokenAccount,
  mintTo,
  createMint,
} from '@solana/spl-token';
import { useWallet } from '@solana/wallet-adapter-react';
import bs58 from 'bs58';

const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

const PrivateKey = import.meta.env.VITE_PHANTOM_PRIVATE_KEY;
const feePayer = Keypair.fromSecretKey(bs58.decode(PrivateKey));

const Token = () => {
  const { publicKey, connect, signTransaction } = useWallet();
  const [status, setStatus] = useState('');
  const [tokenDetails, setTokenDetails] = useState({
    name: '',
    symbol: '',
    decimals: 9,
    supply: 10,
    description: '',
  });
  const [mintAddress, setMintAddress] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [recipientAddress, setRecipientAddress] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTokenDetails({ ...tokenDetails, [name]: value });
  };

  const createToken = async (event) => {
    event.preventDefault();

    if (!publicKey || !signTransaction) {
      setStatus('❌ Please connect your wallet first.');
      return;
    }

    try {
      const mint = await createMint(
        connection,
        feePayer,
        feePayer.publicKey,
        feePayer.publicKey,
        Number(tokenDetails.decimals)
      );

      const mintPubkey = mint.toBase58(); // ✅ Corrected
      setMintAddress(mintPubkey);
      alert(`✅ Token Created: ${mintPubkey}`);
      console.log(`mint: ${mintPubkey}`);
    } catch (err) {
      console.error('❌ Error creating token:', err);
      setStatus('❌ Token creation failed.');
    }
  };

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

      const tokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        feePayer, // ✅ feePayer must sign
        mint,
        recipientPublicKey
      );

      console.log('✅ Token Account Address:', tokenAccount.address.toBase58());

      await mintTo(
        connection,
        feePayer, // ✅ feePayer signs the transaction
        mint,
        tokenAccount.address,
        feePayer.publicKey, // Mint authority
        tokenDetails.supply * Math.pow(10, tokenDetails.decimals)
      );

      setStatus(
        `✅ ${tokenDetails.supply} tokens minted to ${recipientAddress}`
      );
    } catch (error) {
      console.error('❌ Minting error:', error);
      setStatus('❌ Error minting tokens.');
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
