// Central Meta Pixel loader for all demo pages.
// Demo pages include <script async src="/api/pixel"> and set window.OM_PIXEL = {slug, company}.
// The pixel ID lives ONLY here (env META_PIXEL_ID) — change it once + redeploy to swap the pixel
// across every active demo without touching a single page. Browser pixel only (no CAPI).

export default function handler(req, res) {
  const PIXEL_ID = process.env.META_PIXEL_ID || '2223640331770917';

  const js = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
(function(){
  var M = window.OM_PIXEL || {};
  var BASE = { content_name: M.company || '', content_category: 'demo', content_ids: M.slug ? [M.slug] : [], content_type: 'product' };
  try {
    fbq('init', '${PIXEL_ID}');
    fbq('track', 'PageView');
    fbq('track', 'ViewContent', BASE);
  } catch (e) {}
  // Hook the beacon calls for action events → Meta. book_click is a standard Lead; rest are custom.
  window.omPixel = function(ev){
    try {
      if (ev === 'cta_click') fbq('trackCustom', 'DemoLearnMore', BASE);
      else if (ev === 'vsl_play') fbq('trackCustom', 'DemoVSLPlay', BASE);
      else if (ev === 'scroll_50') fbq('trackCustom', 'DemoScroll50', BASE);
      else if (ev === 'bot_message') fbq('trackCustom', 'DemoChat', BASE);
      else if (ev === 'book_click') fbq('track', 'Lead', BASE);
    } catch (e) {}
  };
})();`;

  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  // Cache briefly so a pixel-ID change propagates within ~5 min without re-invoking on every view.
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
  return res.status(200).send(js);
}
