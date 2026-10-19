import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MongoClient } from 'mongodb';
import { createApp } from '../src/app.js';
test('CRUD HTTP contra MongoDB real', { skip: !process.env.TEST_MONGODB_URI }, async () => {
  const client = await new MongoClient(process.env.TEST_MONGODB_URI).connect();
  const db = client.db(`actividad_test_${Date.now()}`);
  const server = createApp(db.collection('experiencias')).listen(0);
  await new Promise(resolve => server.on('listening', resolve));
  const url = `http://127.0.0.1:${server.address().port}/api/experiencias`;
  const data = { empresa:'ACME', cargo:'Developer', descripcion:'API', fechaInicio:'2024-01-01' };
  const write = (method, body) => ({ method, headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) });
  try {
    assert.equal((await fetch(url,write('POST',{}))).status,400);
    const created = await fetch(url,write('POST',data));
    assert.equal(created.status,201);
    const item = await created.json();
    assert.equal((await (await fetch(url)).json()).length,1);
    assert.equal((await (await fetch(`${url}/${item._id}`)).json()).empresa,'ACME');
    const updated = await fetch(`${url}/${item._id}`,write('PUT',{...data,cargo:'Senior'}));
    assert.equal(updated.status,200);
    assert.equal((await updated.json()).cargo,'Senior');
    assert.equal((await fetch(`${url}/invalid`)).status,400);
    assert.equal((await fetch(`${url}/${item._id}`,{method:'DELETE'})).status,204);
    assert.equal((await fetch(`${url}/${item._id}`)).status,404);
  } finally { await new Promise(resolve => server.close(resolve)); await db.dropDatabase(); await client.close(); }
});
