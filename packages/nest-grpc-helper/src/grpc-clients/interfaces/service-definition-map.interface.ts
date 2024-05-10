export type MethodDefinition = {
  path: string;
  responseType: {
    type: {
      name: string;
    };
  };
  requestType: {
    type: {
      name: string;
    };
  };
};

export type ServiceDefinition = Map<string, MethodDefinition>;

export type ServiceDefinitionMap = Map<string, ServiceDefinition>;
