import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';

// ERC20 ABI - minimal interface for transfer, balanceOf, and decimals
const ERC20_ABI = [
  'function transfer(address to, uint256 amount) external returns (bool)',
  'function balanceOf(address account) external view returns (uint256)',
  'function decimals() external view returns (uint8)',
];

@Injectable()
export class FaucetService {
  private readonly logger = new Logger(FaucetService.name);
  private readonly httpProvider: ethers.JsonRpcProvider;

  constructor(private readonly config: ConfigService) {
    const rpcUrl = this.config.get<string>('RPC_HTTP');
    if (!rpcUrl) {
      throw new Error('RPC_HTTP not configured');
    }
    this.httpProvider = new ethers.JsonRpcProvider(rpcUrl);
  }

  /**
   * Transfer HUSDC tokens from treasury to user address
   * @param userAddress - The address to send HUSDC to
   * @param amount - The amount of HUSDC to send (in HUSDC units, e.g., 1000)
   * @returns Transaction hash
   */
  async claimHUSDC(userAddress: string, amount: number): Promise<string> {
    const treasuryPrivateKey = this.config.get<string>('PRIVATE_KEY');
    if (!treasuryPrivateKey) {
      throw new Error('PRIVATE_KEY not configured for faucet treasury');
    }

    const husdcAddress = this.config.get<string>('HUSDC_ADDRESS');
    if (!husdcAddress) {
      throw new Error('HUSDC_ADDRESS not configured');
    }

    try {
      // Validate addresses
      if (!ethers.isAddress(userAddress)) {
        throw new Error('Invalid user address');
      }
      if (!ethers.isAddress(husdcAddress)) {
        throw new Error('Invalid HUSDC address');
      }

      // Create treasury wallet signer
      const treasuryWallet = new ethers.Wallet(treasuryPrivateKey, this.httpProvider);
      this.logger.log(`Faucet treasury address: ${treasuryWallet.address}`);

      // Create HUSDC contract instance
      const husdcContract = new ethers.Contract(
        husdcAddress,
        ERC20_ABI as any,
        treasuryWallet
      );

      // HUSDC has 6 decimals
      const usdcAmount = ethers.parseUnits(amount.toString(), 6);

      // Check treasury balance
      const treasuryBalance = await husdcContract.balanceOf(treasuryWallet.address);
      if (treasuryBalance < usdcAmount) {
        throw new Error(
          `Insufficient treasury balance. Has: ${ethers.formatUnits(treasuryBalance, 6)} HUSDC, Needs: ${amount} HUSDC`
        );
      }

      // Estimate gas
      const gasEstimate = await husdcContract.transfer.estimateGas(userAddress, usdcAmount);
      const gasLimit = (gasEstimate * BigInt(120)) / BigInt(100);

      // Transfer HUSDC to user
      this.logger.log(`Transferring ${amount} HUSDC to ${userAddress}...`);
      const tx = await husdcContract.transfer(userAddress, usdcAmount, { gasLimit });

      this.logger.log(`HUSDC faucet transaction submitted: ${tx.hash}`);
      
      // Wait for transaction confirmation
      await tx.wait();
      this.logger.log(`HUSDC faucet transaction confirmed: ${tx.hash}`);

      return tx.hash;
    } catch (error) {
      this.logger.error(`Error in HUSDC faucet: ${error}`);
      throw new Error(`Failed to claim HUSDC: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

