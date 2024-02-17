export const response = <T>(data: T) => {
  return Response.json(data) as T;
};
