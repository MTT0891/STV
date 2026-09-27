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
  if (event.httpMethod !== 'GET') return resp(405, { error: 'method not allowed' });

  const store = getStore('stv-app');
  const prefix = path.endsWith('/') ? path : path + '/';

  try {
    const list = await store.list({ prefix });
    const docs = await Promise.all(
      list.blobs.map(async (blob) => {
        const data = await store.get(blob.key, { type: 'json' });
        return { id: blob.key.slice(prefix.length), data: data || {} };
      })
    );
    return resp(200, { docs });
  } catch (e) {
    return resp(500, { error: String((e && e.message) || e) });
  }
};
