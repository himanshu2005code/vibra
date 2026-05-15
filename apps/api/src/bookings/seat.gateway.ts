import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { BookingsService } from './bookings.service';

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/seats' })
export class SeatGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  constructor(private bookings: BookingsService) {}

  handleConnection(client: Socket) {
    client.emit('connected', { message: 'EventSphere seat engine connected' });
  }

  @SubscribeMessage('join-showtime')
  async joinShowtime(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { showtimeId: string },
  ) {
    const room = `showtime:${data.showtimeId}`;
    await client.join(room);
    const seatMap = await this.bookings.getSeatMap(data.showtimeId);
    client.emit('seat-map', seatMap);
    return { joined: room };
  }

  @SubscribeMessage('leave-showtime')
  async leaveShowtime(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { showtimeId: string },
  ) {
    await client.leave(`showtime:${data.showtimeId}`);
  }

  broadcastSeatUpdate(showtimeId: string, payload: unknown) {
    this.server.to(`showtime:${showtimeId}`).emit('seat-update', payload);
  }
}
