import axios from 'axios';

const IMDB_GRAPHQL_ENDPOINT = 'https://api.graphql.imdb.com/';

export const gqlRequest = async (query, variables = {}) => {
  const req = await axios.post(
    IMDB_GRAPHQL_ENDPOINT,
    JSON.stringify({ query, variables }),
    {
      headers: {
        'Content-Type': 'application/json',
        'x-imdb-client-name': 'imdb-web-next',
        'x-imdb-user-country': 'US',
        'x-imdb-user-language': 'en-US',
      },
      validateStatus: () => true,
    },
  );
  if (!req.data?.data) {
    console.error(req.data);
  }
  return req.data.data;
};
