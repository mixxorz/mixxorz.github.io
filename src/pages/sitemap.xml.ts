import { getCollection } from "astro:content";
import { siteConfig } from "@/config/site";
import { postHref, postsPerPage, visiblePosts } from "@/lib/posts";

const escapeXml = (value: string) =>
  value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

const sitemapEntry = (path: string, lastmod?: Date) => {
  const url = escapeXml(new URL(path, siteConfig.siteUrl).toString());
  const modified = lastmod ? `<lastmod>${lastmod.toISOString()}</lastmod>` : "";
  return `<url><loc>${url}</loc>${modified}</url>`;
};

export async function GET() {
  const posts = visiblePosts(await getCollection("posts"));
  const archivePages = Math.max(1, Math.ceil(posts.length / postsPerPage));
  const archiveEntries = Array.from({ length: archivePages }, (_, index) =>
    sitemapEntry(index === 0 ? "/posts/" : `/posts/${index + 1}/`),
  );
  const postEntries = posts.map((post) =>
    sitemapEntry(postHref(post), post.data.updatedDate ?? post.data.date),
  );
  const entries = [sitemapEntry("/"), sitemapEntry("/about/"), ...archiveEntries, ...postEntries];

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>\n`,
    {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
      },
    },
  );
}
