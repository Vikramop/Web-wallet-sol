import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/navbar';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import Token from './pages/Token';
import Transactions from './pages/Transactions';
import Wallet from './pages/Wallet';
import Home from './pages/Home';

function App() {
  return (
    <div className="container">
      <ConnectionProvider
        endpoint={
          // 'https://api.devnet.solana.com'
          'https://solana-devnet.g.alchemy.com/v2/zhC5LCHoF-DwUmkJgJVlnt1Q1a8cuOcW'
        }
      >
        <WalletProvider wallets={[]} autoConnect>
          <Router>
            <Navbar />
            <Routes>
              {/* <Route path="/" element={<Home />} />
              <Route path="/tokens" element={<Token />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/web-wallet" element={<Wallet />} /> */}
            </Routes>
          </Router>
        </WalletProvider>
      </ConnectionProvider>
    </div>
  );
}

export default App;
