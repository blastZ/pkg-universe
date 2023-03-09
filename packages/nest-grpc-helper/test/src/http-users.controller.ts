import { Controller, Get, Param } from "@nestjs/common";

@Controller("users")
export class HttpUsersController {
  @Get("/:id")
  async getUserById(@Param("id") id: string) {
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
