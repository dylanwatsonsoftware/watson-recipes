const ALLOWED_HOSTS = new Set([
  'facebook.com', 'www.facebook.com', 'm.facebook.com',
  'instagram.com', 'www.instagram.com',
  'youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'
]);

function readMeta(html, key) {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  for (const tag of tags) {
    const property = tag.match(/\b(?:property|name)\s*=\s*["']([^"']+)["']/i)?.[1];
    if (property !== key) continue;
    return tag.match(/\bcontent\s*=\s*["']([^"']*)["']/i)?.[1] || '';
  }
  return '';
}

function decodeHtml(value) {
  return value
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/\s+/g, ' ').trim();
}

function recipeTitle(rawTitle, description, host) {
  let title = decodeHtml(rawTitle || '');
  const caption = decodeHtml(description || '');
  if (/youtube|youtu\.be/.test(host)) return title.replace(/\s*-\s*YouTube\s*$/i, '').slice(0, 100);

  if (/facebook/.test(host)) {
    const parts = title.split(/\s\|\s/).map(part => part.trim()).filter(Boolean);
    if (parts.length > 1) title = parts.length > 2 ? parts.slice(1, -1).join(' | ') : parts[1];
  } else {
    title = title.replace(/^.*?\bon Instagram:\s*["“]?/i, '').replace(/["”]$/, '');
    const named = caption.match(/\b(?:search|find|make|recipe(?: for)?)\s+[‘“"']([^’”"']{3,100})[’”"']/i);
    if (named) title = named[1];
    else if (!title || /on Instagram/i.test(title)) title = caption;
  }

  title = title.split(/\s(?:@\w+|#[\w-]+)/)[0].split(/\n|[.!?]\s/)[0]
    .replace(/[\p{Extended_Pictographic}\uFE0F]/gu, '').replace(/\s+/g, ' ').trim();
  if (!title || /^(facebook|instagram|recipe|video)\b/i.test(title)) return '';
  return title.slice(0, 100);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let source;
  try {
    source = new URL(req.query.url);
  } catch {
    return res.status(400).json({ error: 'A valid social post URL is required' });
  }
  if (source.protocol !== 'https:' || !ALLOWED_HOSTS.has(source.hostname.toLowerCase())) {
    return res.status(400).json({ error: 'Only Facebook, Instagram and YouTube links are supported' });
  }

  try {
    let target = source;
    let response;
    for (let redirects = 0; redirects <= 4; redirects++) {
      response = await fetch(target.href, {
        redirect: 'manual',
        signal: AbortSignal.timeout(8000),
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WatsonRecipes/1.0; +https://watson-recipes.vercel.app)' }
      });
      if (![301, 302, 303, 307, 308].includes(response.status)) break;
      const location = response.headers.get('location');
      if (!location || redirects === 4) return res.status(502).json({ error: 'The social post redirected too many times' });
      target = new URL(location, target);
      if (target.protocol !== 'https:' || !ALLOWED_HOSTS.has(target.hostname.toLowerCase())) {
        return res.status(400).json({ error: 'The social post redirected to an unsupported site' });
      }
    }
    const finalUrl = new URL(response.url);
    if (!ALLOWED_HOSTS.has(finalUrl.hostname.toLowerCase())) {
      return res.status(400).json({ error: 'The social post redirected to an unsupported site' });
    }
    if (!response.ok) return res.status(502).json({ error: 'The social post could not be opened' });

    const html = (await response.text()).slice(0, 2_000_000);
    const host = finalUrl.hostname.toLowerCase();
    const title = recipeTitle(readMeta(html, 'og:title') || readMeta(html, 'twitter:title'), readMeta(html, 'og:description') || readMeta(html, 'description'), host);
    const description = decodeHtml(readMeta(html, 'og:description') || readMeta(html, 'description')).slice(0, 700);
    let image = decodeHtml(readMeta(html, 'og:image') || readMeta(html, 'twitter:image'));
    try {
      const imageUrl = new URL(image);
      if (imageUrl.protocol !== 'https:' || !/(^|\.)(fbcdn\.net|cdninstagram\.com|ytimg\.com|youtube\.com)$/i.test(imageUrl.hostname)) image = '';
    } catch { image = ''; }

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=21600');
    return res.status(200).json({ title, description, image, source: response.url });
  } catch {
    return res.status(502).json({ error: 'The social post preview is unavailable' });
  }
};
