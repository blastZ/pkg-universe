const TYPEORM_CUSTOM_REPOSITORY = Symbol('TYPEORM_CUSTOM_REPOSITORY');

export const getCustomRepositoryToken = () => {
  return TYPEORM_CUSTOM_REPOSITORY;
};
