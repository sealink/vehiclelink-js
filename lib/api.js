function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else if (response.status === 422) {
    return response.json().then((json) => {
      const error = new Error(json.error);
      error.response = response;
      throw error;
    });
  }
  const error = new Error(response.statusText);
  error.response = response;
  throw error;
}

function parseJSON(response) {
  return response.json();
}

export function request(url, request) {
  return fetch(url, request).then(checkStatus).then(parseJSON);
}
