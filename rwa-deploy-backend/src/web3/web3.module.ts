import { Module, forwardRef } from '@nestjs/common';
import { EventListenerService } from './services/event-listener.service';
import { TokenService } from './services/token.service';
import { FaucetService } from './services/faucet.service';
import { ProviderFactory } from './providers/provider.factory';
import { OrdersModule } from '../orders/orders.module';
import { AlpacaModule } from '../alpaca/alpaca.module';
import { HcsListener } from './hcs.listener';
import { HcsPublisherService } from './hcs.publisher';
import { HcsController } from './hcs.controller';
import { FaucetController } from './faucet.controller';

@Module({
  imports: [ProviderFactory, forwardRef(() => OrdersModule), AlpacaModule],
  providers: [
    EventListenerService,
    TokenService,
    FaucetService,
    HcsListener,
    HcsPublisherService
  ],
  exports: [EventListenerService, TokenService, FaucetService, HcsListener, HcsPublisherService],
  controllers: [HcsController, FaucetController]
})
export class Web3Module {}
