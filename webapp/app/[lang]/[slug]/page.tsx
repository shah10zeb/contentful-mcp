import { notFound } from "next/navigation";
import { fetchLandingPageBySlug } from "../../../lib/contentful";

interface PageProps {
  params: Promise<{ lang: string; slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}

export default async function LandingPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const isPreview = resolvedSearchParams?.preview === 'true';
  const { lang, slug } = resolvedParams;
  
  const content = await fetchLandingPageBySlug(slug, lang, isPreview);

  if (!content) {
    notFound();
  }

  // The landing page content is returned as pure raw HTML + CSS string
  return (
    <div dangerouslySetInnerHTML={{ __html: content }} />
  );
}
