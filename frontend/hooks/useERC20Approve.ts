import { useWriteContract } from 'wagmi';

const erc20Abi = [
  {
    "constant": false,
    "inputs": [
      { "name": "_spender", "type": "address" },
      { "name": "_value", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [
      { "name": "", "type": "bool" }
    ],
    "type": "function"
  }
];

export function useERC20Approve(tokenAddress: `0x${string}`) {
  const { writeContractAsync, isPending, error } = useWriteContract();

  const approve = (spender: `0x${string}`, amount: bigint) => {
    return writeContractAsync({
      address: tokenAddress,
      abi: erc20Abi as any,
      functionName: 'approve',
      args: [spender, amount],
    });
  };

  return { approve, isPending, error };
} 