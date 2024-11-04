import './App.css'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useWriteContract } from 'wagmi'
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
  const { address, status } = useAccount()
  const { writeContract } = useWriteContract()

  const {data: claim, isFetched: isClaimIssued } = useQuery<Claim>({
    queryKey: ['todos'],
    queryFn: fetchClaim,
    enabled: Boolean(address),
  })

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
                    onClick={() => writeContract({
                      abi: SBTMintABI,
                      address: "0x6ed8b2fb300B533759e624Fde1ce98BFDf16Ef14",
                      functionName: "mint",
                      args: [
                          address,
                          "https://bafybeibodo3cnumo76lzdf2dlatuoxtxahgowxuihwiqeyka7k2qt7eupy.ipfs.nftstorage.link/",
                          // eslint-disable-next-line
                          keccak256(encodePacked(["uint", "uint", "uint"], [claim?.sigR8x as any, claim?.sigR8y as any, claim?.sigS as any])),
                      ],
                    })}
                  >
                    Mint Identity
                  </button>
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
