import Prismic from "@prismicio/client";
import { getPrismicClient } from '../../services/prismic';

import { Document } from '@prismicio/client/types/documents';
function linkResolver(doc: Document): string {
  if (doc.type === 'posts') {
    return `/post/${doc.uid}`;
  }
  return '/';
}

// Client method to query from the Prismic repo
const Client = getPrismicClient;

const Preview = async (req, res) => {
  const { token: ref, documentId } = req.query;
  const redirectUrl = await Client(req)
    .getPreviewResolver(ref, documentId)
    .resolve(linkResolver, "/");

  if (!redirectUrl) {
    return res.status(401).json({ message: "Invalid token" });
  }

  res.setPreviewData({ ref });
  res.writeHead(302, { Location: `${redirectUrl}`  })
  res.end();
};

export default Preview;