export type RedisServiceMock = {
  get: jest.Mock;
  set: jest.Mock;
  setEx: jest.Mock;
  incr: jest.Mock;
  incrEx: jest.Mock;
  decr: jest.Mock;
  del: jest.Mock;
  expire: jest.Mock;
  disconnect: jest.Mock;
};
