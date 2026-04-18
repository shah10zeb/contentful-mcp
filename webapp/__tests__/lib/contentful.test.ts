import { fetchLandingPageBySlug } from '../../lib/contentful';

// Mock the global fetch
global.fetch = jest.fn();

describe('fetchLandingPageBySlug', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      CONTENTFUL_SPACE_ID: 'test_space',
      CONTENTFUL_ENVIRONMENT: 'test_env',
      CONTENTFUL_ACCESS_TOKEN: 'test_token',
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should return null if spaceId or accessToken are missing', async () => {
    delete process.env.CONTENTFUL_SPACE_ID;
    const result = await fetchLandingPageBySlug('home', 'en');
    expect(result).toBeNull();
  });

  it('should format GraphQL request correctly and return content', async () => {
    const mockContent = '<h1>Hello World</h1><style>h1 { color: red; }</style>';
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          landingPageCollection: {
            items: [{ content: mockContent }],
          },
        },
      }),
    });

    const result = await fetchLandingPageBySlug('home', 'en');

    expect(global.fetch).toHaveBeenCalledWith(
      'https://graphql.contentful.com/content/v1/spaces/test_space/environments/test_env',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test_token',
        },
        body: expect.stringContaining('"slug":"home","preview":false,"locale":"en"'),
      })
    );
    expect(result).toBe(mockContent);
  });

  it('should format GraphQL request with preview token and preview flag correctly', async () => {
    process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN = 'test_preview_token';
    const mockContent = '<h1>Preview Content</h1>';
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          landingPageCollection: {
            items: [{ content: mockContent }],
          },
        },
      }),
    });

    const result = await fetchLandingPageBySlug('new-feature', 'fr', true);

    expect(global.fetch).toHaveBeenCalledWith(
      'https://graphql.contentful.com/content/v1/spaces/test_space/environments/test_env',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test_preview_token',
        },
        body: expect.stringContaining('"slug":"new-feature","preview":true,"locale":"fr"'),
      })
    );
    expect(result).toBe(mockContent);
  });

  it('should return null if API response is not ok', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404,
    });

    const result = await fetchLandingPageBySlug('home', 'en');
    expect(result).toBeNull();
  });

  it('should return null if there are GraphQL errors', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        errors: [{ message: 'Something went wrong' }],
      }),
    });

    const result = await fetchLandingPageBySlug('home', 'en');
    expect(result).toBeNull();
  });

  it('should return null if items array is empty', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          landingPageCollection: {
            items: [],
          },
        },
      }),
    });

    const result = await fetchLandingPageBySlug('home');
    expect(result).toBeNull();
  });
});
