import express from 'express';
import { ObjectId } from 'mongodb';
import swaggerUi from 'swagger-ui-express';
import { spec } from './openapi.js';

export function validate(body) {
  const fields = ['empresa', 'cargo', 'descripcion', 'fechaInicio', 'fechaFin'];
  if (!body || typeof body !== 'object' || Array.isArray(body)) return 'Se requiere un objeto JSON';
  if (Object.keys(body).some(k => !fields.includes(k))) return 'Hay campos desconocidos';
  for (const key of ['empresa', 'cargo', 'descripcion']) {
    if (typeof body[key] !== 'string' || !body[key].trim() || body[key].length > 2000) return `${key} es obligatorio (máximo 2000 caracteres)`;
  }
  const date = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
  if (!date(body.fechaInicio)) return 'fechaInicio debe ser una fecha válida YYYY-MM-DD';
  if (body.fechaFin != null && (!date(body.fechaFin) || body.fechaFin < body.fechaInicio)) return 'fechaFin debe ser válida y posterior o igual a fechaInicio';
  return null;
}

export function createApp(collection) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '32kb' }));
  app.get('/', (req, res) => res.redirect('/docs'));
  app.get('/openapi.json', (req, res) => res.json(spec));
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec));
  const base = '/api/experiencias';
  app.param('id', (req, res, next, id) => {
    if (!/^[a-fA-F0-9]{24}$/.test(id)) return res.status(400).json({ error: 'ID inválido' });
    req.objectId = new ObjectId(id);
    next();
  });
  app.get(base, async (req, res) => res.json(await collection.find({}).sort({ fechaInicio: -1 }).toArray()));
  app.get(`${base}/:id`, async (req, res) => {
    const item = await collection.findOne({ _id: req.objectId });
    return item ? res.json(item) : res.status(404).json({ error: 'Experiencia no encontrada' });
  });
  const write = update => async (req, res) => {
    const error = validate(req.body);
    if (error) return res.status(400).json({ error });
    const item = Object.fromEntries(Object.entries(req.body).map(([k,v]) => [k, typeof v === 'string' ? v.trim() : v]));
    item.fechaFin ??= null;
    if (update) {
      const result = await collection.findOneAndUpdate({ _id: req.objectId }, { $set: item }, { returnDocument: 'after' });
      return result ? res.json(result) : res.status(404).json({ error: 'Experiencia no encontrada' });
    }
    const { insertedId } = await collection.insertOne(item);
    res.status(201).location(`${base}/${insertedId}`).json({ ...item, _id: insertedId });
  };
  app.post(base, write(false));
  app.put(`${base}/:id`, write(true));
  app.delete(`${base}/:id`, async (req, res) => {
    const result = await collection.deleteOne({ _id: req.objectId });
    return result.deletedCount ? res.status(204).end() : res.status(404).json({ error: 'Experiencia no encontrada' });
  });
  app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));
  app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON inválido' });
    if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Cuerpo demasiado grande' });
    console.error(err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  });
  return app;
}
