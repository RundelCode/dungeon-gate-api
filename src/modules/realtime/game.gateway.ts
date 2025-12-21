import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject, UnauthorizedException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GameGateway
  implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    @Inject('SUPABASE_ANON_CLIENT')
    private readonly supabase: SupabaseClient,
  ) { }

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace(
          'Bearer ',
          '',
        );

      if (!token) throw new UnauthorizedException();

      const { data, error } =
        await this.supabase.auth.getUser(token);

      if (error || !data.user) {
        throw new UnauthorizedException();
      }

      client.data.user = {
        id: data.user.id,
        email: data.user.email,
      };

      client.emit('socket.ready', {
        user_id: data.user.id,
      });
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) { }

  @SubscribeMessage('game.join')
  joinGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() gameId: string,
  ) {
    client.join(`game:${gameId}`);
    return { joined: gameId };
  }

  @SubscribeMessage('game.leave')
  leaveGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() gameId: string,
  ) {
    client.leave(`game:${gameId}`);
    return { left: gameId };
  }

  emitToGame(
    gameId: string,
    event: string,
    payload: any,
  ) {
    this.server
      .to(`game:${gameId}`)
      .emit(event, payload);
  }
}
