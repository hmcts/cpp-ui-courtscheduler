export function isDefined<T>(input: null | undefined | T): input is T {
  return input !== null && input !== undefined;
}
