import {useAccount, useWriteContract} from "wagmi";
import {ConnectButton} from "@rainbow-me/rainbowkit";
import {useQuery} from "@tanstack/react-query";
import {SBTMintABI} from "./abi/SBT.ts";
import {encodePacked, keccak256} from "viem";
import {AirDropABI} from "./abi/AirDrop.ts";
import React from "react";
import {useSearchParams} from "react-router-dom";

const fetchZkProofs = async () => {
    const response = await fetch(`http://localhost:8080/gen-zk`)
    return response.json()
}

function ClaimToken() {
    const [tx, setTx] = React.useState<string>("")
    const [claiming, setClaiming] = React.useState(false)
    const { address, status } = useAccount()
    const {data: zkProofs, isFetching: isZkProofsFetching, isFetched: isZkProofsFetched } = useQuery<string[][]>({
        queryKey: ['fetchZkProofs'],
        queryFn: fetchZkProofs,
        enabled: Boolean(address),
    })
    const [searchParams] = useSearchParams();
    const tokenId = searchParams.get("tokenId");
    const { writeContractAsync } = useWriteContract()

    const claimToken = async () => {
        const [a, b, c, input] = zkProofs as string[][]
        console.log(a)
        console.log(b)
        console.log(c)
        console.log(input)
        setClaiming(true)
        const tx = await writeContractAsync({
            abi: AirDropABI,
            address: "0xa697b73cbee99D5DDdf26C4D273f39a72eF7007f",
            functionName: "collectAirdrop",
            args: [
                a,b,c, input, tokenId
            ],
        })

        setTx(tx)
        setClaiming(false)
    }

    return (
        <main className="App">
            <h1>Claim Token</h1>
            <div className="card">
                {
                    status !== "connected" && <ConnectButton/>
                }
                {
                    status === "connected" &&
                    <div>
                        <p>Connected: {address}</p>
                        <button
                            disabled={isZkProofsFetching}
                            onClick={claimToken}
                            aria-busy={claiming}
                        >
                            Get my token
                        </button>
                        {tx && <p>Transaction: {tx}</p>}
                    </div>
                }
            </div>
            {
                isZkProofsFetching &&
                <div>
                    <progress/>
                    <p className="read-the-docs">
                        {
                            isZkProofsFetching ?
                                "Fetching zk proofs..." :
                                ""
                        }
                    </p>
                </div>
            }
        </main>
    )
}

export default ClaimToken