class FetchRequestError extends Error {
  code: any;
  originalStack: any;

  constructor(originalError) {
    const detailedError = originalError.cause
      ? originalError.cause
      : originalError;

    let { message, code } = detailedError;

    if (originalError.name === 'AbortError') {
      message = 'Request timeout';
      code = 'ETIMEDOUT';
    }

    super(message);

    this.name = detailedError.name;
    this.code = code;
    this.originalStack = detailedError.stack;
  }
}

function configureTimeout({ timeout, abortController = new AbortController() }) {
  let timeoutId = null;
  const { signal } = abortController;

  if (timeout) {
    timeoutId = setTimeout(() => {
      abortController.abort();
    }, timeout);
  }

  return { signal, timeoutId };
}


function tryParseJSON(value) {
  try {
    return JSON.parse(value);
  } catch (error) {
    return value;
  }
};


/* eslint-disable-next-line max-lines-per-function */
async function formatResponse(response, returnStream) {
  const body = returnStream
    ? response.body
    : tryParseJSON(await response.text());

  const responseHeaders = {};

  Array.from(response.headers.keys()).forEach((key: any) => {
    responseHeaders[key] = response.headers.get(key);
  });

  const formattedResponse = {
    body,
    response: {
      body,
      headers: responseHeaders,
      ok: response.ok,
      statusCode: response.status,
      statusText: response.statusText,
    },
  };

  return response.ok
    ? formattedResponse
    : Promise.reject(formattedResponse);
}

/**
 * Sends a fetch request.
 *
 * @param {Object} options - The options for the fetch request.
 * @param {string} options.uri - The URI to request.
 * @param {Object} options.headers - The headers to include in the request.
 * @param {Object} options.body - The body of the request.
 * @param {Object} options.params - The query parameters to include in the request.
 * @param {boolean} returnStream - Whether to return the response body as a stream.
 * @returns {Promise<Object>} The response from the fetch request.
 *
 * @throws {Promise<Object>} If the fetch request fails, it throws a Promise
 *  that rejects with the response of a instance of FetchRequestError.
 */
/* eslint-disable-next-line max-lines-per-function, max-statements */
export default async function fetchRequest(
  options = {} as any,
  returnStream = false,
) {
  try {
    const abortSignal = configureTimeout(options);

    const reqHeaders = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const uri = new URL(options.uri);

    const { params = {} } = options;

    Object.keys(params).forEach((key) => {
      uri.searchParams.append(key, params[key]);
    });

    const response = await fetch(uri, {
      ...options,
      body: JSON.stringify(options.body),
      headers: reqHeaders,
      signal: abortSignal.signal,
    });

    clearTimeout(abortSignal.timeoutId);

    return formatResponse(response, returnStream);
  } catch (error) {
    const fetchRequestError = new FetchRequestError(error);

    console.error({
      details: fetchRequestError,
      error: fetchRequestError.name,
      message: `[COMMONS-FETCH-REQUEST]-ERROR: ${fetchRequestError.name} - ${fetchRequestError.message}`,
    });

    throw fetchRequestError;
  }
};
