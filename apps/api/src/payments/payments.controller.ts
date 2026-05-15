import { Body, Controller, Post, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/payment.dto';

@ApiTags('payments')
@Controller({ path: 'payments', version: '1' })
export class PaymentsController {
  constructor(private payments: PaymentsService) {}

  @Post('create-order')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  createOrder(@Req() req: { user: { sub: string } }, @Body() dto: CreatePaymentDto) {
    return this.payments.createOrder(req.user.sub, dto);
  }

  @Post('webhook/razorpay')
  razorpayWebhook(@Body() body: Record<string, string>) {
    return this.payments.verifyRazorpay(body as never);
  }

  @Post('mock-complete')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  mockComplete(@Req() req: { user: { sub: string } }, @Body() body: { bookingId: string }) {
    return this.payments.mockComplete(req.user.sub, body.bookingId);
  }
}
