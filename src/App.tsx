import './App.css'
import { ConnectButton } from '@rainbow-me/rainbowkit';

function App() {
  return (
    <main className="App">
      <h1>Get Identity</h1>
      <div className="card">
          <ConnectButton />
      </div>
      <p className="read-the-docs">
        Connect your wallet and get your identity by minting a SBT Token.
      </p>
    </main>
  )
}

export default App
