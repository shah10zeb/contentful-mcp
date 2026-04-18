import { logger } from "./logger";

interface LandingPageContent {
  content: string;
}

interface GraphQLResponse {
  data: {
    landingPageCollection: {
      items: LandingPageContent[];
    };
  };
  errors?: any[];
}

export async function fetchLandingPageBySlug(slug: string, locale: string, isPreview: boolean = false): Promise<string | null> {
  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const environment = process.env.CONTENTFUL_ENVIRONMENT || "master";
  const accessToken = isPreview ? process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN : process.env.CONTENTFUL_ACCESS_TOKEN;

  if (!spaceId || !accessToken) {
    logger.error("Contentful credentials are not set in environment variables");
    return null;
  }

  const endpoint = `https://graphql.contentful.com/content/v1/spaces/${spaceId}/environments/${environment}`;

  const query = `
    query GetLandingPage($slug: String!, $preview: Boolean, $locale: String) {
      landingPageCollection(where: { slug: $slug }, limit: 1, preview: $preview, locale: $locale) {
        items {
          content
        }
      }
    }
  `;

  const requestBody = {
    query,
    variables: { slug, preview: isPreview, locale },
  };

  logger.debug("Fetching from Contentful:", { endpoint, isPreview, variables: requestBody.variables });

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(requestBody),
      // Revalidate data periodically or force cache:
      next: isPreview ? { revalidate: 0 } : { revalidate: 60 }, 
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`Contentful API HTTP error: ${response.status} ${response.statusText}`, { response: errorText });
      return null;
    }

    const json: GraphQLResponse = await response.json();

    if (json.errors) {
      logger.error("Contentful GraphQL syntax/execution errors:", { errors: json.errors });
      return null;
    }

    const items = json.data?.landingPageCollection?.items;
    
    logger.info("Successfully received items from Contentful", { count: items?.length || 0, requestedSlug: slug });

    if (items && items.length > 0) {
      return items[0].content;
    }

    return null;
  } catch (error) {
    logger.error("Failed to execute Contentful fetch:", { error: error instanceof Error ? error.message : error });
    return null;
  }
}
