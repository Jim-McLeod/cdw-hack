const { app } = require('@azure/functions');
const { getPool } = require('../shared/db');

// GET /api/places  ->  [{ id, slug, name }, ...]
app.http('places', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      const pool = await getPool();
      const result = await pool.request().query(
        'SELECT Id AS id, Slug AS slug, Name AS name FROM dbo.Places ORDER BY Name'
      );
      return {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        jsonBody: result.recordset
      };
    } catch (err) {
      context.error('places query failed', err);
      return { status: 500, jsonBody: { error: 'Failed to load places' } };
    }
  }
});
