const { app } = require('@azure/functions');
const { getPool, sql } = require('../shared/db');

// GET /api/place?tag=XYZ     -> look up by NFC tag
// GET /api/place?slug=xyz    -> look up by slug
// GET /api/place?id=1        -> look up by numeric id
app.http('place', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    const tag = request.query.get('tag');
    const slug = request.query.get('slug');
    const id = request.query.get('id');

    if (!tag && !slug && !id) {
      return { status: 400, jsonBody: { error: 'Provide tag, slug or id' } };
    }

    try {
      const pool = await getPool();
      const req = pool.request();
      let query;

      if (tag) {
        req.input('tag', sql.VarChar(100), tag);
        query = `
          SELECT p.Id AS id, p.Slug AS slug, p.Name AS name,
                 p.Latitude AS latitude, p.Longitude AS longitude,
                 p.Theme AS theme, p.Story AS story,
                 p.DataPrompt AS dataPrompt, p.Accessibility AS accessibility,
                 p.SourceUrl AS sourceUrl, p.NextPlaceSlug AS nextPlaceSlug
          FROM dbo.NfcTags t
          JOIN dbo.Places p ON p.Id = t.PlaceId
          WHERE t.TagId = @tag`;
      } else if (slug) {
        req.input('slug', sql.VarChar(100), slug);
        query = `
          SELECT Id AS id, Slug AS slug, Name AS name,
                 Latitude AS latitude, Longitude AS longitude,
                 Theme AS theme, Story AS story,
                 DataPrompt AS dataPrompt, Accessibility AS accessibility,
                 SourceUrl AS sourceUrl, NextPlaceSlug AS nextPlaceSlug
          FROM dbo.Places WHERE Slug = @slug`;
      } else {
        const parsedId = parseInt(id, 10);
        if (Number.isNaN(parsedId)) {
          return { status: 400, jsonBody: { error: 'id must be an integer' } };
        }
        req.input('id', sql.Int, parsedId);
        query = `
          SELECT Id AS id, Slug AS slug, Name AS name,
                 Latitude AS latitude, Longitude AS longitude,
                 Theme AS theme, Story AS story,
                 DataPrompt AS dataPrompt, Accessibility AS accessibility,
                 SourceUrl AS sourceUrl, NextPlaceSlug AS nextPlaceSlug
          FROM dbo.Places WHERE Id = @id`;
      }

      const result = await req.query(query);
      if (result.recordset.length === 0) {
        return { status: 404, jsonBody: { error: 'Place not found' } };
      }

      return {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        jsonBody: result.recordset[0]
      };
    } catch (err) {
      context.error('place query failed', err);
      return { status: 500, jsonBody: { error: 'Failed to load place' } };
    }
  }
});
