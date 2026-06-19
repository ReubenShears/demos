// oEmbed endpoint so embedders (Canva via Iframely / embed.ly, Notion, etc.)
// can render a page as a live "rich" iframe instead of failing to preview.
// Discovery <link rel="alternate" type="application/json+oembed"> lives in the
// page <head> (currently /calculator). Single-purpose for now: the ROI calculator.

const EMBEDS = {
  'https://demos.optimally.ltd/calculator': {
    title: 'Optimally ROI Calculator',
    src: 'https://demos.optimally.ltd/calculator',
    width: 680,
    height: 860,
  },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const rawUrl = (req.query.url || '').toString().split('?')[0].replace(/\/$/, '');
  const cfg = EMBEDS[rawUrl] || EMBEDS['https://demos.optimally.ltd/calculator'];

  const maxw = parseInt(req.query.maxwidth, 10);
  const maxh = parseInt(req.query.maxheight, 10);
  const width = Math.min(cfg.width, isNaN(maxw) ? cfg.width : maxw);
  const height = Math.min(cfg.height, isNaN(maxh) ? cfg.height : maxh);

  const html =
    `<iframe src="${cfg.src}" width="${width}" height="${height}" ` +
    `style="border:0;width:100%;max-width:${cfg.width}px;height:${cfg.height}px;" ` +
    `frameborder="0" loading="lazy" allow="fullscreen" title="${cfg.title}"></iframe>`;

  const data = {
    version: '1.0',
    type: 'rich',
    provider_name: 'Optimally',
    provider_url: 'https://demos.optimally.ltd',
    author_name: 'Optimally',
    author_url: 'https://optimally.ltd',
    title: cfg.title,
    width,
    height,
    thumbnail_url: 'https://demos.optimally.ltd/calculator/favicon.png',
    thumbnail_width: 918,
    thumbnail_height: 918,
    html,
  };

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
  return res.status(200).json(data);
}
