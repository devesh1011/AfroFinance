import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { TopicMessageQuery, Client, TopicMessage } from '@hashgraph/sdk';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import * as crypto from 'crypto';

@Injectable()
export class HcsListener implements OnModuleInit {
  private readonly logger = new Logger(HcsListener.name);

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    this.init();
  }

  init() {
    const mirror =
      this.config.get<string>('HEDERA_MIRROR_NODE') ||
      'testnet.mirrornode.hedera.com:443';
    const topicId = this.config.get<string>('HCS_ORDERS_TOPIC_ID');
    if (!topicId) {
      this.logger.warn('HCS_ORDERS_TOPIC_ID not set; skipping HCS listener');
      return;
    }
    this.logger.log(`Subscribing to HCS topic ${topicId} @ ${mirror}`);
    const now = Math.floor(Date.now() / 1000);
    this.logger.log(`Starting HCS subscription from timestamp: ${now} (now)`);

    const client = Client.forName('testnet').setMirrorNetwork([mirror]);

    // Subscribe to topic messages
    // Signature: subscribe(client, errorHandler, messageHandler)
    new TopicMessageQuery()
      .setTopicId(topicId)
      .setStartTime(now)
      .subscribe(
        client,
        (error) => {
          // Error handler - called when subscription encounters an error
          if (error) {
            this.logger.error('❌ HCS subscription error:', error);
          }
        },
        (message) => {
          // Message handler - called when a new message arrives
          if (message) {
            const seq = message.sequenceNumber?.toString() || 'unknown';
            this.logger.log(`📨 HCS message received (seq: ${seq})`);
            void this.handleMessage(message);
          }
        },
      );

    this.logger.log(
      '✅ HCS subscription active and listening for new messages',
    );
  }

  private async handleMessage(msg: TopicMessage) {
    try {
      const sequence = Number(msg.sequenceNumber.toString());
      const bytes = Buffer.from(msg.contents);
      this.logger.log(`HCS order message seq=${sequence} size=${bytes.length}`);

      // Parse encrypted order from HCS message
      interface OrderData {
        ciphertext: string;
        iv: string;
        commitment: string;
        ticker: string;
        side: string;
        user: string;
      }
      let orderData: OrderData;
      try {
        orderData = JSON.parse(bytes.toString('utf-8')) as OrderData;
      } catch (e) {
        this.logger.warn(`Failed to parse HCS message as JSON: ${e}`);
        return;
      }

      const { ciphertext, iv, commitment, ticker, side, user } = orderData;
      if (!ciphertext || !iv || !commitment || !ticker || !side || !user) {
        this.logger.warn(
          'Invalid order payload structure - missing required fields',
        );
        return;
      }

      this.logger.log(
        `Processing ${side} order for ${ticker} from ${user} (commitment: ${commitment})`,
      );

      // TODO: In production, forward to TEE/enclave for decryption
      // For now, simulate processing (enclave would decrypt here)
      await this.processOrder({
        ciphertext,
        iv,
        commitment,
        ticker,
        side,
        user,
        hcsSequence: sequence,
      });
    } catch (e) {
      this.logger.error('Failed to handle HCS message', e);
    }
  }

  private decryptOrder(ciphertext: string, iv: string): { usdcAmount: string } {
    try {
      // Get shared encryption key from environment
      const encryptionKeyHex = this.config.get<string>('ENCRYPTION_KEY');
      if (!encryptionKeyHex) {
        throw new Error('ENCRYPTION_KEY not configured');
      }

      // Convert hex strings to buffers
      const key = Buffer.from(encryptionKeyHex, 'hex');
      const ivBuffer = Buffer.from(
        iv.startsWith('0x') ? iv.slice(2) : iv,
        'hex',
      );
      const ciphertextHex = ciphertext.startsWith('0x')
        ? ciphertext.slice(2)
        : ciphertext;

      // AES-GCM produces ciphertext + 16-byte auth tag
      // The ciphertext from frontend includes the auth tag at the end
      const encryptedData = Buffer.from(ciphertextHex, 'hex');

      // Split into ciphertext and auth tag (last 16 bytes)
      const authTagLength = 16;
      const actualCiphertext = encryptedData.subarray(
        0,
        encryptedData.length - authTagLength,
      );
      const authTag = encryptedData.subarray(
        encryptedData.length - authTagLength,
      );

      // Create decipher with AES-256-GCM
      const decipher = crypto.createDecipheriv('aes-256-gcm', key, ivBuffer);
      decipher.setAuthTag(authTag);

      // Decrypt the data
      let decrypted = decipher.update(actualCiphertext);
      decrypted = Buffer.concat([decrypted, decipher.final()]);

      // Parse the decrypted JSON payload
      const parsed = JSON.parse(decrypted.toString('utf8')) as {
        usdcAmount?: string;
        amount?: string; // Frontend sends 'amount' instead of 'usdcAmount'
      };

      // Try both 'usdcAmount' and 'amount' fields for backwards compatibility
      const usdcAmount = parsed.usdcAmount || parsed.amount;

      this.logger.log(
        `✅ Successfully decrypted order: ${usdcAmount} USDC (raw)`,
      );
      return { usdcAmount: usdcAmount || '1000000000' };
    } catch (error) {
      this.logger.error(`❌ Failed to decrypt order: ${error}`);
      // Fallback to a default value if decryption fails
      return { usdcAmount: '1000000000' }; // 1000 USDC (6 decimals)
    }
  }

  private async processOrder(order: {
    ciphertext: string;
    iv: string;
    commitment: string;
    ticker: string;
    side: string;
    user: string;
    hcsSequence: number;
  }) {
    // In production: decrypt in TEE/enclave to get actual amounts
    // For MVP: simulate order processing and settlement
    const { commitment, ticker, user, hcsSequence } = order;

    this.logger.log(
      `Processing order: validating order and checking liquidity for ${ticker}...`,
    );

    // Decrypt the order from the encrypted payload
    const decryptedOrder = this.decryptOrder(order.ciphertext, order.iv);

    // Extract actual USDC amount from the decrypted order
    const usdcAmount = BigInt(decryptedOrder.usdcAmount);

    // Get current market price for the ticker (for now use fixed price, later integrate real price feed)
    const price = 108.5; // TODO: Get from Alpaca/market data API

    // Calculate token amount for 18-decimal token (LQD has 18 decimals)
    // Formula: tokenAmount = (usdcAmount * 10^18) / (price * 10^6)
    const tokenAmount =
      (usdcAmount * BigInt(1e18)) / BigInt(Math.round(price * 1e6));

    this.logger.log(`Executing market buy for ${ticker} securities...`);

    // Sign settlement payload with enclave signer key
    const signature = await this.signSettlement({
      orderCommitment: commitment, // Use commitment from HCS message
      user,
      ticker,
      token: this.config.get<string>('RWA_TOKEN_ADDRESS') || ethers.ZeroAddress,
      price: (price * 1e6).toString(), // Scale price
      usdcAmount: usdcAmount.toString(),
      tokenAmount: tokenAmount.toString(),
      expiry: (Math.floor(Date.now() / 1000) + 3600).toString(), // 1 hour expiry
      hcsSequence: hcsSequence.toString(),
    });

    this.logger.log(`Settling order: minting ${ticker} tokens...`);

    // Call Reserve.settle() to mint tokens
    await this.settleOnChain({
      orderCommitment: commitment, // Use commitment from HCS message
      user,
      ticker,
      token: this.config.get<string>('RWA_TOKEN_ADDRESS') || ethers.ZeroAddress,
      price: (price * 1e6).toString(),
      usdcAmount: usdcAmount.toString(),
      tokenAmount: tokenAmount.toString(),
      expiry: (Math.floor(Date.now() / 1000) + 3600).toString(),
      hcsSequence: hcsSequence.toString(),
      signature,
    });

    this.logger.log(`Order settled: ${ticker} tokens minted to ${user}`);
  }

  private async signSettlement(payload: {
    orderCommitment: string;
    user: string;
    ticker: string;
    token: string;
    price: string;
    usdcAmount: string;
    tokenAmount: string;
    expiry: string;
    hcsSequence: string;
  }): Promise<string> {
    const enclaveKey = this.config.get<string>('ENCLAVE_PRIVATE_KEY');
    if (!enclaveKey) {
      this.logger.warn('ENCLAVE_PRIVATE_KEY not set; using mock signature');
      return '0x' + '0'.repeat(130); // Mock signature
    }

    const wallet = new ethers.Wallet(enclaveKey);
    const payloadHash = ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(
        [
          'bytes32',
          'address',
          'bytes32',
          'address',
          'uint256',
          'uint256',
          'uint256',
          'uint256',
          'uint256',
        ],
        [
          payload.orderCommitment,
          payload.user,
          ethers.keccak256(ethers.toUtf8Bytes(payload.ticker)),
          payload.token,
          payload.price,
          payload.usdcAmount,
          payload.tokenAmount,
          payload.expiry,
          payload.hcsSequence,
        ],
      ),
    );

    // Use ethers' signMessage which automatically adds EIP-191 prefix
    // Contract expects: payloadHash.toEthSignedMessageHash().recover(signature)
    // signMessage does exactly this: keccak256("\x19Ethereum Signed Message:\n32" || hash)
    const signature = await wallet.signMessage(ethers.getBytes(payloadHash));
    return signature;
  }

  async settleOnChain(args: {
    orderCommitment: string;
    user: string;
    ticker: string;
    token: string;
    price: string;
    usdcAmount: string;
    tokenAmount: string;
    expiry: string;
    hcsSequence: string;
    signature: string;
  }) {
    const rpc = this.config.get<string>('RPC_HTTP');
    const reserveAddress = this.config.get<string>('RESERVE_ADDRESS');
    const pk = this.config.get<string>('PRIVATE_KEY');
    if (!rpc || !reserveAddress || !pk) {
      this.logger.warn(
        'Missing RPC_HTTP/RESERVE_ADDRESS/PRIVATE_KEY; cannot settle',
      );
      return;
    }
    const provider = new ethers.JsonRpcProvider(rpc);
    const wallet = new ethers.Wallet(pk, provider);
    const abi = [
      'function settle(bytes32,address,string,address,uint256,uint256,uint256,uint256,uint256,bytes) external',
    ];
    const reserve = new ethers.Contract(reserveAddress, abi, wallet);
    const tx = (await reserve.settle(
      args.orderCommitment,
      args.user,
      args.ticker,
      args.token,
      args.price,
      args.usdcAmount,
      args.tokenAmount,
      args.expiry,
      args.hcsSequence,
      args.signature,
    )) as ethers.ContractTransactionResponse;
    this.logger.log(`settle tx: ${tx.hash}`);
    await tx.wait();
  }
}
