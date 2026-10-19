const example = { empresa: 'Empresa Ejemplo', cargo: 'Desarrollador web', descripcion: 'Desarrollo de APIs REST', fechaInicio: '2024-01-15', fechaFin: null };
const schema = { type: 'object', additionalProperties: false, required: ['empresa','cargo','descripcion','fechaInicio'], properties: Object.fromEntries(Object.keys(example).map(k => [k, k.startsWith('fecha') ? { type: 'string', format: 'date', ...(k === 'fechaFin' ? { nullable: true } : {}) } : { type: 'string', minLength: 1, maxLength: 2000 }])) };
const response = description => ({ description });
const body = { required: true, content: { 'application/json': { schema, example } } };
const operation = (summary, success, requestBody) => ({ summary, ...(requestBody ? { requestBody } : {}), responses: { [success]: response('Operación exitosa'), 400: response('Datos o ID inválidos'), 404: response('No encontrado'), 500: response('Error interno') } });
export const spec = {
  openapi: '3.0.3', info: { title: 'API de experiencias profesionales', version: '1.0.0', description: 'Actividad unidad 3: CRUD con Express.js y MongoDB. PUT reemplaza los campos editables. fechaFin nula indica empleo actual.' },
  paths: {
    '/api/experiencias': { get: operation('Listar experiencias', 200), post: operation('Crear experiencia', 201, body) },
    '/api/experiencias/{id}': { parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' } }], get: operation('Consultar experiencia',200), put: operation('Actualizar experiencia',200,body), delete: operation('Eliminar experiencia',204) }
  }
};
