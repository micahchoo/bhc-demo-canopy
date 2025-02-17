require("dotenv").config();
const buildConfig = require("./src/lib/build/config");
const aggregate = require("./src/lib/build/aggregate");

const axios = require("axios");
const args = process.argv;

(async () => {
  const path = args
    .find((value) => value.includes("--path="))
    ?.split("=")
    ?.pop();

  const isDev = args.includes("dev");
  const config = buildConfig.getConfig(path, isDev);

  const url = isDev ? `http://localhost:5001` : process.env.NEXT_PUBLIC_URL;
  const basePath = isDev ? `` : process.env.NEXT_PUBLIC_BASE_PATH;
  const baseUrl = basePath ? `${url}${basePath}` : url;
  const assetPrefix = basePath;

  try {
    const mediaResponse = await axios.get(
      "https://micahchoo.github.io/bhc-demo-tropy/audio-demo/media.json"
    );
    const mediaData = mediaResponse.data;

    config.media = mediaData;
  } catch (error) {
    console.error("Error fetching media.json:", error);
  }

  const env = {
    CANOPY_CONFIG: {
      ...config,
      url,
      assetPrefix,
      basePath,
      baseUrl,
    },
  };

  console.log("CANOPY_CONFIG", env.CANOPY_CONFIG);
  aggregate.build(env.CANOPY_CONFIG, config.media);
})();
