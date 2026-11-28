export const config = {
  matcher: ['/', '/q/:path*'],
};

const BOT_UA_REGEX =
  /whatsapp|facebookexternalhit|facebot|twitterbot|telegrambot|linkedinbot|slackbot|discordbot|line|applebot|pinterest|embedly|skypeuripreview|viber/i;

export default function middleware(request: Request): Response | undefined {
  const ua = request.headers.get('user-agent') || '';
  if (!BOT_UA_REGEX.test(ua)) {
    return undefined;
  }

  const url = new URL(request.url);
  const rewriteUrl = new URL('/api/og-preview', url.origin);

  if (url.pathname.startsWith('/q/')) {
    const slug = url.pathname.slice(3).split('/')[0];
    if (slug) {
      rewriteUrl.searchParams.set('slug', slug);
    }
  }

  return new Response(null, {
    headers: {
      'x-middleware-rewrite': rewriteUrl.toString(),
    },
  });
}
