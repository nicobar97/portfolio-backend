export type AuthError = {
  type: 'auth_error';
  code: string;
  message: string;
};

export type ApiError = {
  type: 'api_error';
  code: string;
  message: string;
};

export type AuthFetchError = {
  type: 'auth_fetch_error';
  code: string;
  message: string;
};

export type MappingError = {
  type: 'mapping_error';
  message: string;
};

export type FetchAuthMapError = AuthError | AuthFetchError | ApiError | MappingError;
export type FetchMapError = ApiError | MappingError;
