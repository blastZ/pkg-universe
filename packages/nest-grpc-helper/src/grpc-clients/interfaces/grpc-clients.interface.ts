import type { ClientGrpc } from '@nestjs/microservices';

export type GrpcClients = Map<string, ClientGrpc>;
