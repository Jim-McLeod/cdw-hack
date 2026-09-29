const { app } = require('@azure/functions');
const { getPool, sql } = require('../shared/db');

// POST /api/visits  body: { placeId, visitorName, message }
app.http('visits', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return { status: 400, jsonBody: { error: 'Invalid JSON body' } };
    }

    const placeId = parseInt(body.placeId, 10);
    const visitorName = (body.visitorName || '').trim();
    const message = (body.message || '').trim();

    if (!placeId || Number.isNaN(placeId)) {
      return { status: 400, jsonBody: { error: 'placeId is required' } };
    }
    if (!visitorName) {
      return { status: 400, jsonBody: { error: 'visitorName is required' } };
    }
    if (visitorName.length > 100) {
      return { status: 400, jsonBody: { error: 'visitorName must be <= 100 characters' } };
    }
    if (message.length > 500) {
      return { status: 400, jsonBody: { error: 'message must be <= 500 characters' } };
    }

    const query = `
      INSERT INTO dbo.Visits (PlaceId, VisitorName, Message)
      OUTPUT INSERTED.Id AS id, INSERTED.VisitedAt AS visitedAt
      VALUES (@placeId, @visitorName, @message)`;
    const params = {
      placeId: placeId,
      visitorName: visitorName,
      message: message.length ? message : null
    };

    try {
      const pool = await getPool();
      const result = await pool.request()
        .input('placeId', sql.Int, params.placeId)
        .input('visitorName', sql.VarChar(100), params.visitorName)
        .input('message', sql.VarChar(500), params.message)
        .query(query);

      return {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
          'X-Debug-SQL': encodeURIComponent(query),
          'X-Debug-Params': encodeURIComponent(JSON.stringify(params))
        },
        jsonBody: result.recordset[0]
      };
    } catch (err) {
      context.error('visit insert failed', err);
      return { status: 500, jsonBody: { error: 'Failed to log visit' } };
    }
  }
});
