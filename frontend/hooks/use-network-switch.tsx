import { useAccount, useSwitchChain } from "wagmi";

const HEDERA_TESTNET_CHAIN_ID = 296;

export const useNetworkSwitch = () => {
  const { chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();

  const checkAndSwitchNetwork = async () => {
    if (!chainId) {
      throw new Error("No chain detected. Please connect your wallet.");
    }

    if (chainId !== HEDERA_TESTNET_CHAIN_ID) {
      try {
        await switchChainAsync({ chainId: HEDERA_TESTNET_CHAIN_ID });
      } catch (err) {
        console.error("Error switching network:", err);
        throw new Error("Failed to switch to Hedera Testnet");
      }
    }
  };

  return {
    checkAndSwitchNetwork,
    isHederaTestnet: chainId === HEDERA_TESTNET_CHAIN_ID,
    currentChain: chainId,
  };
};
