<?xml version="1.0" encoding="UTF-8"?>
<audit version="0.0.25">
<site url="https://mybcat.com" crawled="0" date="2026-01-29T23:02:24.525Z"/>
<score overall="79" grade="C">
 <cat name="Security" score="86"/>
 <cat name="Crawlability" score="89"/>
 <cat name="Images" score="100"/>
 <cat name="Links" score="100"/>
 <cat name="Performance" score="100"/>
</score>
<summary passed="12" warnings="2" failed="0"/>
<issues>
 <category name="Crawlability" errors="0" warnings="1">
  <rule id="crawl/robots-txt" severity="error" status="warn" docs="https://docs.squirrelscan.com/rules/crawl/robots-txt">
   No robots.txt found
  </rule>
 </category>
 <category name="Security" errors="0" warnings="1">
  <rule id="security/http-to-https" severity="warning" status="warn" docs="https://docs.squirrelscan.com/rules/security/http-to-https">
   1 HTTP URL(s) redirect to HTTPS
   Items (1):
    - http://mybcat.com/ (http://mybcat.com/ → https://mybcat.com/ (308)) [statusCode: 308, chain: [object Object]]
  </rule>
 </category>
</issues>
</audit>