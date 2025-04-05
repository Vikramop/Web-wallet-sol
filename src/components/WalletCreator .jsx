import React, { useState, useEffect } from 'react';
import * as bip39 from 'bip39';

import { Buffer } from 'buffer';

// Polyfill Buffer globally
window.Buffer = Buffer;

const WalletCreator = () => {
  const [mnemonic, setMnemonic] = useState('');
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [accounts, setAccounts] = useState([]);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedMnemonic = localStorage.getItem('mnemonic');
    const savedAccounts = localStorage.getItem('accounts');

    if (savedMnemonic) {
      setMnemonic(savedMnemonic);
    }
    if (savedAccounts) {
      setAccounts(JSON.parse(savedAccounts));
    }
  }, []);

  // Save accounts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('accounts', JSON.stringify(accounts));
  }, [accounts]);

  const createWallet = () => {
    try {
      const newMnemonic = bip39.generateMnemonic(); // Generate a 12-word mnemonic
      setMnemonic(newMnemonic);
      localStorage.setItem('mnemonic', newMnemonic); // Save to localStorage
      setShowMnemonic(false); // Ensure mnemonic is hidden initially
      setAccounts([]); // Reset accounts
      localStorage.removeItem('accounts'); // Clear accounts in localStorage
    } catch (error) {
      console.error('Error generating mnemonic:', error);
    }
  };

  // Add a new account associated with the wallet
  const createAccount = () => {
    const newAccount = {
      id: accounts.length + 1,
      balance: Math.floor(Math.random() * 10000) / 100, // Simulated balance
      tokens: ['Token A', 'Token B', 'Token C'], // Example tokens
    };
    const updatedAccounts = [...accounts, newAccount];
    setAccounts(updatedAccounts);
  };

  const handleShowMnemonic = () => {
    if (showMnemonic) {
      setShowMnemonic(false); // Hide the mnemonic
    } else {
      setShowModal(true); // Show the confirmation modal
    }
  };

  const handleConfirmShowMnemonic = () => {
    setShowModal(false);
    setShowMnemonic(true); // Show the mnemonic after confirmation
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className="flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-6">Create Your Web Wallet</h1>
      <button
        onClick={createWallet}
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
      >
        Create New Wallet
      </button>

      {mnemonic && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-4">Your Mnemonic Key:</h2>
          <div className="flex flex-wrap gap-2 relative -z-10">
            {mnemonic.split(' ').map((word, index) => (
              <span
                key={index}
                className={`px-2 py-1 rounded backdrop-blur-sm bg-gray-200/50 font-virgil font-500 ${
                  showMnemonic ? 'blur-none' : 'blur-sm'
                }`}
              >
                {word}
              </span>
            ))}
          </div>
          <button
            onClick={handleShowMnemonic}
            className={`mt-4 px-4 py-2 rounded-md transition ${
              showMnemonic
                ? 'bg-gray-500 text-white hover:bg-gray-600'
                : 'bg-red-500 text-white hover:bg-red-600'
            }`}
          >
            {showMnemonic ? 'Hide Your Key' : 'Show Your Key'}
          </button>
        </div>
      )}

      <button
        onClick={createAccount}
        className="mt-6 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
        disabled={!mnemonic} // Disable if no wallet exists
      >
        Create New Account
      </button>

      {/* Account Cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative -z-10">
        {accounts.map((account) => (
          <div
            key={account.id}
            className="p-4 bg-white/10 rounded-lg shadow-lg backdrop-blur-lg border border-gray-300"
          >
            <h2 className="text-3xl font-bold text-white mb-4 font-virgil">
              Balance: ${account.balance}
            </h2>
            <div className="flex justify-center gap-10 mb-4">
              <button className="bg-blue-500 text-white text-xl px-3 py-1 rounded-md hover:bg-blue-600">
                Send
              </button>
              <button className="bg-green-500 text-white text-xl px-3 py-1 rounded-md hover:bg-green-600">
                Receive
              </button>
            </div>
            <div className="mt-2">
              <h3 className="text-lg font-semibold mb-2 text-center">
                Tokens:
              </h3>
              <div className="flex flex-col gap-1">
                {account.tokens.map((token, index) => (
                  <div key={index} className="text-white">
                    {token}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-md shadow-lg text-red-400">
            <h2 className="text-lg font-bold mb-4">CAUTION</h2>
            <p className="mb-4">
              You are about to reveal your private key. Keep it safe and never
              share it with anyone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={handleCloseModal}
                className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmShowMnemonic}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletCreator;
