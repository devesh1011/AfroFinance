import { Body, Controller, Post, HttpException, HttpStatus } from '@nestjs/common';
import { FaucetService } from './services/faucet.service';

@Controller('web3/faucet')
export class FaucetController {
  constructor(private readonly faucetService: FaucetService) {}

  @Post('husdc')
  async claimHUSDC(@Body() body: { address: string; amount: number }) {
    try {
      const { address, amount = 1000 } = body;

      if (!address) {
        throw new HttpException(
          { success: false, error: 'Address is required', message: 'Please provide a valid wallet address' },
          HttpStatus.BAD_REQUEST
        );
      }

      const txHash = await this.faucetService.claimHUSDC(address, amount);
      
      return {
        success: true,
        txHash,
        message: `Successfully sent ${amount} HUSDC to ${address}`,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      throw new HttpException(
        {
          success: false,
          error: errorMessage,
          message: 'Failed to claim HUSDC',
        },
        error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}

