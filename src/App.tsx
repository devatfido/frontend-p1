import './App.css'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useWriteContract, useTransactionReceipt } from 'wagmi'
import {SBTMintABI} from "./abi/SBT.ts";
import {useState} from "react";
import { useQuery } from '@tanstack/react-query'
import { keccak256, encodePacked } from 'viem'

interface Claim {
  claim: string[]
  sigR8x: string
  sigR8y: string
  sigS: string
  pubKeyX: string
  pubKeyY: string
  claimSchema: string
  slotIndex: number
  operator: number
  value: number[]
}

const fetchClaim = async () => {
    const response = await fetch(`http://localhost:8080/claim`)
    return response.json()
}

function App() {
  const [mintTx, setMintTx] = useState<`0x${string}` | null>(null)
  const [isMinting, setIsMinting] = useState(false)
  const { address, status } = useAccount()
  const { writeContractAsync } = useWriteContract()

  const {data: claim, isFetched: isClaimIssued } = useQuery<Claim>({
    queryKey: ['todos'],
    queryFn: fetchClaim,
    enabled: Boolean(address),
  })

  const result = useTransactionReceipt({
    hash: mintTx as `0x${string}`,
    query: {
      enabled: Boolean(mintTx),
    },
  })

  const {data: tokenId, isFetched: isTokenIdFetched} = useQuery({
    queryKey: ['get-token-id'],
    queryFn: async () => {
      const tokenIdHex = (result?.data as any)?.logs[0]?.topics[3]
      const tokenId = BigInt(tokenIdHex).toString();
      return tokenId
    },
    enabled: Boolean(result?.data),
  })

  const mintSBT = async () => {
    setIsMinting(true)
    const tx = await writeContractAsync({
      abi: SBTMintABI,
      address: "0xA36711a526CF7c05166542709C67507ffd6bF580",
      functionName: "mint",
      args: [
        address,
        "https://bafybeibodo3cnumo76lzdf2dlatuoxtxahgowxuihwiqeyka7k2qt7eupy.ipfs.nftstorage.link/",
        // eslint-disable-next-line
        keccak256(encodePacked(["uint", "uint", "uint"], [claim?.sigR8x as any, claim?.sigR8y as any, claim?.sigS as any])),
      ],
    })

    setMintTx(tx)
    setIsMinting(false)
  }

  return (
    <main className="App">
      <h1>Get Identity</h1>
      <div className="card">
          {
              status !== "connected" && <ConnectButton />
          }
          {
              status === "connected" && isClaimIssued &&
              <div>
                  <p>Connected: {address}</p>
                  <button
                      onClick={mintSBT}
                      aria-busy={isMinting}
                  >
                    Mint Identity
                  </button>
                  {isTokenIdFetched && <p>Token ID: {tokenId}</p>}
                  <br />
                  {isTokenIdFetched && <a href={`/get-token?tokenId=${tokenId}`}>Claim Token</a>}
              </div>
          }

      </div>
      <p className="read-the-docs">
        Connect your wallet and get your identity by minting a SBT Token.
      </p>
    </main>
  )
}

export default App
