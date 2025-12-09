export type ExceptionCases<T, I, Y> = Array<{
  name: string;
  body: T;
  params: Y;
  message: string;
  setup: (() => void) | null;
  instance: I;
  errors?: string;
}>;

export type TestCases<T> = {
  name: string;
  fn: T;
};
