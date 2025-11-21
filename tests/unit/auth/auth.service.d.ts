export type ExceptionCases<T, I> = Array<{
  name: string;
  body: T;
  message: string;
  setup: (() => void) | null;
  instance: I;
  errors?: string;
}>;

export type TestCases<T> = {
  name: string;
  fn: T;
};
