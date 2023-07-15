export type Configuration = {
  server: {
    port: number;
    environment: string;
  };
  database: {
    connectionString: string;
  };
  secrets: {
    googleBardCookies: string;
    openAiKey: string;
    openAiOrganization: string;
  };
};
