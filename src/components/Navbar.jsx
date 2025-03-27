import {
  WalletModalProvider,
  WalletDisconnectButton,
  WalletMultiButton,
} from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';
import { Link } from 'react-router-dom';

export function Navbar() {
  return (
    <div className="group mb-10 relative   h-[10vh] top-6  border-2 border-transparent rounded-xl backdrop-blur-lg bg-white/40 transition-all duration-300">
      <div className="absolute inset-0 rounded-md blur-lg border-2 border-transparent animate-borderColor"></div>
      <div className="h-[100%] flex justify-between items-center px-4">
        <div className="realtive z-10 bg-black h-14 w-14 flex rounded-full ">
          <Link to="/">
            <img
              src="/dog.png"
              alt="Logo"
              className="realtive z-10 w-14 h-16 rounded-full mx-1"
            />
          </Link>
        </div>

        <div className="realtive flex justify-end items-center gap-5 font-semibold">
          <Link
            to="/tokens"
            className=" relative z-10 font-virgil text-xl hover:text-blue-300 hover:cursor-pointer"
          >
            Tokens
          </Link>
          <Link
            to="/transactions"
            className="relative z-10 font-virgil text-xl hover:text-blue-300"
          >
            Transactions
          </Link>
          <Link
            to="/web-wallet"
            className="relative z-10 font-virgil text-xl hover:text-blue-300"
          >
            Web Wallet
          </Link>
        </div>
        <div>
          <WalletModalProvider>
            <WalletMultiButton />
          </WalletModalProvider>
        </div>
      </div>
    </div>
  );
}
