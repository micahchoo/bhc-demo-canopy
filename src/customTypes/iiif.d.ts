declare module '@iiif/presentation-3' {
  import { Manifest } from '@iiif/presentation-3';
  export type { Manifest };
}

declare module '@iiif/vault-helpers/fetch' {
  const fetch: any;
  export default fetch;
}
