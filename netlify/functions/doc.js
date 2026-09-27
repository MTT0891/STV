const { getStore } = require('@netlify/blobs');

function resp(statusCode, obj) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(obj)
  };
}

exports.handler = async (event) => {
  const path = event.queryStringParameters && event.queryStringParameters.path;
  if (!path) return resp(400, { error: 'missing path' });

  const store = getStore('stv-app');

  try {
    if (event.httpMethod === 'GET') {
      const data = await store.get(path, { type: 'json' });
      return resp(200, { exists: data !== null, data: data === null ? null : data });
    }

    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      await store.setJSON(path, body);
      return resp(200, { ok: true });
    }

    if (event.httpMethod === 'PATCH') {
      const patch = JSON.parse(event.body || '{}');
      const existing = await store.get(path, { type: 'json' });
      if (existing === null) return resp(400, { error: 'document does not exist' });
      const merged = Object.assign({}, existing, patch);
      await store.setJSON(path, merged);
      return resp(200, { ok: true });
    }

    if (event.httpMethod === 'DELETE') {
      await store.delete(path);
      return resp(200, { ok: true });
    }

    return resp(405, { error: 'method not allowed' });
  } catch (e) {
    return resp(500, { error: String((e && e.message) || e) });
  }
};
