const middy = require('@middy/core');
const createError = require('http-errors');
const middleware = require('./index');

const error = new createError.NotFound('File not found');

test('Middleware works with logging disabled', async () => {
    const handler = middy(() => {
        throw error;
    });

    handler.use(middleware({ logger: false }));

    await expect(handler({}, {})).rejects.toEqual(
        expect.objectContaining({
            response: {
                body: JSON.stringify({ statusCode: 404, message: 'File not found' }),
                statusCode: 404,
            },
            error,
        })
    );
});

test('Middleware returns error details', async () => {
    const mockLogger = {
        error: jest.fn(() => {}),
    };

    const handler = middy(() => {
        throw new createError.NotFound('File not found');
    });

    handler.use(middleware({ logger: mockLogger }));

    await expect(handler({}, {})).rejects.toEqual(
        expect.objectContaining({
            response: {
                body: JSON.stringify({ statusCode: 404, message: 'File not found' }),
                statusCode: 404,
            },
            error,
        })
    );

    expect(mockLogger.error).toHaveBeenCalledTimes(1);
});
