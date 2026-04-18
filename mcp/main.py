import os
import requests
from mcp.server.fastmcp import FastMCP

# Initialize FastMCP Server
mcp = FastMCP("Contentful")

def get_contentful_credentials():
    """Retrieve Contentful credentials from environment variables."""
    space_id = os.environ.get("CONTENTFUL_SPACE_ID")
    environment = os.environ.get("CONTENTFUL_ENVIRONMENT", "master")
    cma_token = os.environ.get("CONTENTFUL_MANAGEMENT_TOKEN")
    
    if not space_id or not cma_token:
        raise ValueError("CONTENTFUL_SPACE_ID and CONTENTFUL_MANAGEMENT_TOKEN environment variables must be set.")
        
    return space_id, environment, cma_token

def get_base_url():
    """Retrieve the frontend Next.js base URL."""
    return os.environ.get("WEBAPP_BASE_URL", "http://localhost:3000")

@mcp.tool()
def draft_landing_page(slug: str, content: str) -> str:
    """
    Drafts a new landingPage entry in Contentful.
    
    Args:
        slug: The URL slug for the landing page.
        content: The text/HTML content of the landing page.
        
    Returns:
        A success message containing the Contentful entry ID and a preview link to test the draft in the browser.
    """
    try:
        space_id, environment, token = get_contentful_credentials()
    except ValueError as e:
        return f"Configuration Error: {e}"

    url = f"https://api.contentful.com/spaces/{space_id}/environments/{environment}/entries"
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/vnd.contentful.management.v1+json",
        "X-Contentful-Content-Type": "landingPage"
    }
    
    # We use en-US as the default locale for the underlying Contentful fields
    payload = {
        "fields": {
            "slug": {
                "en-US": slug
            },
            "content": {
                "en-US": content
            }
        }
    }
    
    response = requests.post(url, headers=headers, json=payload)
    
    if response.status_code == 201:
        data = response.json()
        entry_id = data["sys"]["id"]
        version = data["sys"]["version"]
        
        preview_url = f"{get_base_url()}/en/{slug}?preview=true"
        
        return (
            f"Successfully drafted landing page!\n"
            f"Entry ID: {entry_id}\n"
            f"Version: {version}\n"
            f"Slug: {slug}\n\n"
            f"Preview Link: {preview_url}"
        )
    else:
        return f"Failed to draft landing page. Status Code: {response.status_code}\nResponse: {response.text}"

@mcp.tool()
def publish_landing_page(entry_id: str, version: int, slug: str) -> str:
    """
    Publishes an existing/drafted landing page entry in Contentful.
    
    Args:
        entry_id: The Contentful Entry ID to publish.
        version: The current version number of the entry (required by Contentful to ensure no conflicting updates).
        slug: The URL slug of the landing page (used to generate the published link).
        
    Returns:
        A success message with the published link.
    """
    try:
        space_id, environment, token = get_contentful_credentials()
    except ValueError as e:
        return f"Configuration Error: {e}"

    url = f"https://api.contentful.com/spaces/{space_id}/environments/{environment}/entries/{entry_id}/published"
    
    headers = {
        "Authorization": f"Bearer {token}",
        "X-Contentful-Version": str(version)
    }
    
    response = requests.put(url, headers=headers)
    
    if response.status_code == 200:
        published_url = f"{get_base_url()}/en/{slug}"
        return (
            f"Successfully published landing page (Entry ID: {entry_id})!\n\n"
            f"Published Link: {published_url}"
        )
    else:
        return f"Failed to publish landing page. Status Code: {response.status_code}\nResponse: {response.text}"

if __name__ == "__main__":
    mcp.run(transport='stdio')
