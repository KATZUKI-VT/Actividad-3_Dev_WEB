# Actividad-3_Dev_WEB
API REST para la gestión de experiencias profesionales de una hoja de vida, desarrollada con Node.js, Express.js y MongoDB. Implementa operaciones CRUD y documentación interactiva con Swagger.

## Ejecutar

Requisitos: Node.js 22 o superior, npm y MongoDB local o Atlas.

```powershell
npm install
Copy-Item .env.example .env
# Si tienes Docker, inicia MongoDB:
docker compose up -d
npm start
```

Si usas Atlas, configura MONGODB_URI en `.env` con tu conexión y habilita el acceso de tu IP en Atlas. No publiques credenciales. La API espera a que MongoDB se conecte antes de aceptar solicitudes. Docker es opcional si ya tienes MongoDB.

Abre http://localhost:3000/docs para probar Swagger. El documento OpenAPI está en http://localhost:3000/openapi.json.

## Endpoints

| Método | Ruta | Resultado |
|---|---|---|
| POST | /api/experiencias | Crear (201) |
| GET | /api/experiencias | Listar (200) |
| GET | /api/experiencias/{id} | Consultar (200) |
| PUT | /api/experiencias/{id} | Actualizar (200) |
| DELETE | /api/experiencias/{id} | Eliminar (204) |

Ejemplo de cuerpo para POST y PUT:

```json
{"empresa":"ACME","cargo":"Desarrollador web","descripcion":"Desarrollo de APIs REST","fechaInicio":"2024-01-15","fechaFin":null}
```

Empresa, cargo, descripción y fecha de inicio son obligatorios. Las fechas usan YYYY-MM-DD. fechaFin puede omitirse o ser null para empleo actual; no puede ser anterior al inicio. PUT requiere todos los campos obligatorios. Los ID inválidos devuelven 400; los registros inexistentes, 404.

## Prueba de la actividad con Swagger

1. Abre POST, selecciona **Try it out**, introduce el ejemplo y pulsa **Execute**. Verifica 201 y copia `_id`.
2. Ejecuta GET de la lista y verifica que aparece el registro.
3. Ejecuta GET por ID con el identificador creado y verifica 200.
4. Ejecuta PUT con el mismo ID, todos los campos requeridos y un cargo diferente. Verifica 200 y el nuevo cargo con GET.
5. Reinicia la API y consulta el registro para comprobar persistencia en MongoDB.
6. Ejecuta DELETE con el ID. Verifica 204 y después GET con el mismo ID: 404.
7. Prueba POST sin empresa, fechas imposibles, fechaFin anterior al inicio e ID inválido: deben devolver 400.

Guarda capturas de Swagger de estas operaciones como evidencia para entregar. Este repositorio no incluye capturas de una ejecución que no se haya realizado.

## Prueba automática de integración

Usa una instancia MongoDB destinada a pruebas. El test crea y elimina únicamente una base temporal con prefijo actividad_test_.

```powershell
$env:TEST_MONGODB_URI='mongodb://127.0.0.1:27017'
npm test
```

Sin TEST_MONGODB_URI, la prueba de integración se omite. La API es una actividad académica local; no implementa usuarios ni autenticación.

Referencias: [Express](https://expressjs.com/en/guide/routing/) y [MongoDB Node.js](https://www.mongodb.com/docs/drivers/node/current/crud/insert/).
