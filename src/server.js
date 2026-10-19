import { MongoClient } from 'mongodb';
import { createApp } from './app.js';
const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017', { serverSelectionTimeoutMS: 5000 });
try {
  await client.connect();
  const app = createApp(client.db(process.env.MONGODB_DB || 'hoja_de_vida').collection('experiencias'));
  const server = app.listen(process.env.PORT || 3000, () => console.log('API lista. Swagger: /docs'));
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(async () => { await client.close(); process.exit(0); }));
} catch (error) {
  console.error('No se pudo iniciar la API:', error.message);
  await client.close();
  process.exitCode = 1;
}
