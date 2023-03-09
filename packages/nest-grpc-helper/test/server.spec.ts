import { INestApplication } from '@nestjs/common';
// import { Test } from "@nestjs/testing";
import dotenv from 'dotenv';

// import { getGrpcServerOptions } from "../src/index.js";
// import { GrpcUsersController } from "./src/grpc-users.controller.js";
// import { HttpUsersController } from "./src/http-users.controller.js";

dotenv.config();

describe('grpc server', () => {
  let grpcServer: any;
  let grpcApp: INestApplication;
  let httpServer: any;
  let httpApp: INestApplication;

  // beforeAll(async () => {
  //   const serverModule = await Test.createTestingModule({
  //     controllers: [GrpcUsersController],
  //   }).compile();

  //   grpcApp = serverModule.createNestApplication();
  //   grpcServer = grpcApp.getHttpAdapter().getInstance();

  //   grpcApp.connectMicroservice(
  //     getGrpcServerOptions({
  //       packageName: "accountManager",
  //       url: "0.0.0.0:3000",
  //     })
  //   );

  //   await grpcApp.startAllMicroservices();
  //   await grpcApp.init();

  //   const clientModule = await Test.createTestingModule({
  //     controllers: [HttpUsersController],
  //   }).compile();

  //   httpApp = clientModule.createNestApplication();
  //   httpServer = httpApp.getHttpAdapter().getInstance();

  //   await httpApp.init();
  // });

  // afterAll(async () => {
  //   await grpcApp.close();
  //   await httpApp.close();
  // });

  it('should get user by id', async () => {
    // const res = await request(httpServer).get("/users/usrxxxxxx");

    // expect(res.body).toEqual({
    //   data: { user: { id: "usrxxxxxx", name: "test" } },
    // });

    // console.log(res.body);
    console.log('hi');
  });
});
