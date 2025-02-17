import axios from "axios";
import Media from "@components/Media/Media.tsx";

interface WorkProps {
  mediaMetadata: any | null;
}

export default function WorkPage({
  mediaMetadata,
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

  return <div>Media not found</div>;
}

export async function getStaticProps({ params }: { params: any }) {
  try {
    const mediaResponse = await axios.get(
      "https://micahchoo.github.io/bhc-demo-tropy/audio-demo/media.json"
    );
    const mediaData = mediaResponse.data;

    const mediaItem = mediaData.find((item: any) => item.slug === params.slug);

    if (mediaItem) {
      return {
        props: {
          mediaMetadata: mediaItem || null,
        },
      };
    } else {
      console.log("No media metadata found for slug:", params.slug);
      return {
        notFound: true,
      };
    }
  } catch (error) {
    console.error("Error fetching media.json:", error);
    return {
      notFound: true,
    };
  }
}

export async function getStaticPaths() {
  try {
    const mediaResponse = await axios.get(
      "https://micahchoo.github.io/bhc-demo-tropy/audio-demo/media.json"
    );
    const mediaData = mediaResponse.data;

    const mediaPaths = mediaData.map((item: any) => ({
      params: { slug: item.slug },
    }));

    return {
      paths: mediaPaths,
      fallback: false,
    };
  } catch (error) {
    console.error("Error fetching media.json:", error);
    return {
      paths: [],
      fallback: false,
    };
  }
}
