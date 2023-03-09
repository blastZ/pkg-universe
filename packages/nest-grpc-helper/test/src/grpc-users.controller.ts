import { Controller } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";

@Controller()
export class GrpcUsersController {
  @GrpcMethod("UsersService")
  async getUserById(id: string) {
    return {
      data: {
        user: {
          id,
          name: "test",
        },
      },
    };
  }
}
