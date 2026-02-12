import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

// We pretend to be a real user to avoid blocks
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/111.0',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5'
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const type = searchParams.get('type') || 'search';
  
  if (!query) return NextResponse.json({ results: [], related: [] });

  // 1. SUGGESTIONS (Google API - Instant)
  if (type === 'suggestions') {
    try {
      const res = await fetch(`https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(query)}`);
      const data = await res.json();
      return NextResponse.json({ suggestions: data[1] || [] });
    } catch (e) { return NextResponse.json({ suggestions: [] }); }
  }

  // 2. SEARCH & IMAGES & VIDEOS (Direct DuckDuckGo HTML Scraping)
  try {
    // DDG HTML URL Structure
    let ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    
    // For Images/Videos, we just grab the standard HTML results first
    // (Real image scraping requires complex tokens, so we use a robust fallback to SearXNG if needed)
    
    const res = await fetch(ddgUrl, { headers: HEADERS });
    const html = await res.text();
    const $ = cheerio.load(html);
    
    const results = [];
    const related = [];

    // Parse Standard Results
    $('.result').each((i, element) => {
      const title = $(element).find('.result__a').text();
      const url = $(element).find('.result__a').attr('href');
      const snippet = $(element).find('.result__snippet').text();
      const icon = $(element).find('.result__icon__img').attr('src');

      if (title && url) {
        results.push({
          id: i,
          title, 
          url, 
          snippet,
          // Fix relative icon URLs
          image: icon ? (icon.startsWith('//') ? `https:${icon}` : icon) : null,
          source: new URL(url).hostname.replace('www.', '')
        });
      }
    });

    // Parse "Related Searches"
    $('.result--related a').each((i, el) => related.push($(el).text()));

    // 3. KNOWLEDGE GRAPH (Wikipedia API)
    let knowledge = null;
    if (type === 'search') {
      try {
        const wikiRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
        if (wikiRes.ok) {
           const wikiData = await wikiRes.json();
           if (wikiData.type === 'standard') {
             knowledge = {
               title: wikiData.title,
               extract: wikiData.extract,
               image: wikiData.thumbnail?.source,
               url: wikiData.content_urls.desktop.page
             };
           }
        }
      } catch(e) {}
    }

    // 4. IMAGE/VIDEO SPECIAL HANDLING (Using a Public Mirror that works)
    if (type === 'images' || type === 'videos') {
       // We use a specific working node for media to ensure we get grids
       try {
         const category = type === 'images' ? 'images' : 'videos';
         const mediaRes = await fetch(`https://searx.be/search?q=${encodeURIComponent(query)}&categories=${category}&format=json`);
         const mediaData = await mediaRes.json();
         
         const mediaResults = mediaData.results.map((item, idx) => ({
           id: idx,
           title: item.title,
           url: item.url,
           image: item.img_src || item.thumbnail,
           source: item.engine
         }));
         return NextResponse.json({ results: mediaResults, related: [] });
       } catch(e) {
         // Fallback to text results if media fails
       }
    }

    return NextResponse.json({ results, related, knowledge });

  } catch (error) {
    return NextResponse.json({ results: [], related: [] });
  }
}