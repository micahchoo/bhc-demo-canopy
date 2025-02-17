import { CanopyEnvironment } from "@customTypes/canopy";

interface Facets {
  [key: string]: any;
}
declare const FACETS: Facets;
import FACETS from "@.canopy/facets.json";

interface Manifests {
  [key: string]: any;
}
declare const MANIFESTS: Manifests;
import MANIFESTS from "@.canopy/manifests.json";
import { Manifest } from "@iiif/presentation-3";
import { type NavigationItem } from "@src/customTypes/navigation";
import axios from "axios";
import Related from "@components/Related/Related";
import { buildManifestSEO } from "@lib/seo";
import fetch from "@iiif/vault-helpers/fetch";
import { getReferencingContent } from "@src/lib/content/reference/server";
import { shuffle } from "lodash";
import LayoutsWork from "@src/components/Layouts/Work";
import { getMarkdownContent } from "@src/lib/contentHelpers";
import CanopyMDXRemote from "@src/components/MDX";
import WorkManifestId from "@src/components/Work/ManifestId";
import WorkMetadata from "@src/components/Work/Metadata";
import WorkTitle from "@src/components/Work/Title";
import WorkSummary from "@src/components/Work/Summary";
import WorkViewer from "@src/components/Work/Viewer";
import WorkScroll from "@src/components/Work/Scroll";
import WorkReferencingContent from "@src/components/Work/ReferencingContent";
import WorkRequiredStatement from "@src/components/Work/RequiredStatement";
import Media from "@components/Media/Media";
import WorkLinkingProperty from "@components/Work/LinkingProperty";

interface WorkProps {
  manifest: import("@iiif/presentation-3").Manifest | null;
  mediaMetadata: any | null;
  related: any;
  referencingContent: NavigationItem[];
  source: any;
}

export default function WorkPage({
  manifest,
  mediaMetadata,
  referencingContent,
  related,
  source,
}: WorkProps): JSX.Element {
  if (mediaMetadata) {
    return (
      <Media
        title={mediaMetadata.title}
        description={mediaMetadata.description}
        thumbnail={mediaMetadata.thumbnail}
        id={mediaMetadata.id}
      />
    );
  }

  if (!manifest) {
    return <div>Manifest not found</div>;
  }

  const { id, homepage, label, metadata, rendering, requiredStatement, partOf, seeAlso, summary } = manifest;
  const Work = () => <></>;

  Work.ManifestId = () => <WorkManifestId manifestId={id} />;
  Work.Metadata = () => <WorkMetadata metadata={metadata} />;
  Work.LinkingProperty = (props: any) => <WorkLinkingProperty {...props} homepage={homepage} partOf={partOf} rendering={rendering} seeAlso={seeAlso} />;
  Work.RequiredStatement = () => (
    <WorkRequiredStatement requiredStatement={requiredStatement} />
  );
  Work.Related = () => <Related collections={related} />;
  Work.ReferencingContent = () => (
    <WorkReferencingContent referencingContent={referencingContent} />
  );
  Work.Scroll = (props: any) => <WorkScroll {...props} iiifContent={id} />;
  Work.Summary = () => <WorkSummary summary={summary} />;
  Work.Title = () => <WorkTitle label={label} />;
  Work.Viewer = () => <WorkViewer iiifContent={id} />;

  return (
    <LayoutsWork>
      <CanopyMDXRemote source={source} customComponents={{ Work }} />
    </LayoutsWork>
  );
}

export async function getStaticProps({ params }: { params: any }) {
  const { url, basePath } = process.env
    ?.CANOPY_CONFIG as unknown as CanopyEnvironment;
  const baseUrl = basePath ? `${url}${basePath}` : url;

let manifest: import("@iiif/presentation-3").Manifest | null = null;
  let mediaMetadata: any | null = null;
  const { id, index } = MANIFESTS.find(
    (item: any) => item.slug === params.slug
  ) as any;

  try {
    const mediaResponse = await axios.get(
      "https://micahchoo.github.io/bhc-demo-tropy/audio-demo/media.json"
    );
    const mediaData = mediaResponse.data;

    const mediaItem = mediaData.find((item: any) => item.slug === params.slug);

    if (mediaItem) {
      mediaMetadata = mediaItem;
    } else {
      manifest = (await fetch(id)) as Manifest;
    }
  } catch (error) {
    console.error("Error fetching media.json:", error);
    manifest = (await fetch(id)) as Manifest;
  }

  if (!manifest && !mediaMetadata) {
    console.error("No manifest or media metadata found for slug:", params.slug);
    return {
      notFound: true,
    };
  }

  /**
   * build the seo object
   */
  const seo = await buildManifestSEO(manifest?.id, `/works/${params.slug}`);
  const related = FACETS.map((facet: any) => {
    const value = shuffle(
      facet.values.filter((entry: any) => entry.docs.includes(index))
    );
    return `${baseUrl}/api/facet/${facet.slug}/${value[0]?.slug}.json?sort=random`;
  });

  /**
   * Find connected NextJS pages which reference this manifest
   */
  const referencingContent = await getReferencingContent({
    manifestId: manifest?.id,
    // Directories in which to look for markdown files with frontmatter content
    srcDir: ["content"],
  });

  const { frontMatter, source } = await getMarkdownContent({
    slug: "_layout",
    directory: "works",
  });

  /**
   * scrub the manifest of any provider property
   */
  delete manifest?.provider;

  return {
    props: {
      manifest: manifest || null,
      mediaMetadata: mediaMetadata || null,
      related,
      seo,
      referencingContent,
      source,
      frontMatter,
    },
  };
}

export async function getStaticPaths() {
  const paths = MANIFESTS.map((item: any) => ({
    params: { slug: item.slug },
  }));

  try {
    const mediaResponse = await axios.get(
      "https://micahchoo.github.io/bhc-demo-tropy/audio-demo/media.json"
    );
    const mediaData = mediaResponse.data;

    const mediaPaths = mediaData.map((item: any) => ({
      params: { slug: item.slug },
    }));

    return {
      paths: [...paths, ...mediaPaths],
      fallback: false,
    };
  } catch (error) {
    console.error("Error fetching media.json:", error);
    return {
      paths: paths,
      fallback: false,
    };
  }
}
