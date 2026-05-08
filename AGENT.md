# Buy Home For Less Site Agent Log

## Project Rules
- Stack: React + TypeScript + Tailwind CSS frontend.
- Backend target: GraphQL APIs with future PostgreSQL service.
- Keep frontend lightweight and API-ready.
- Header and footer must show `Buy Home For Less` logo.
- Language control must support EN, RU, ZH, TH, AR, and FA as acronym options.
- Map search must be prepared for open-source map integration, likely Leaflet + OpenStreetMap.
- During deploy/build checks, show or refresh the local preview in the side browser window at `http://localhost:5173/Real-Estate-Test-site/`.
- All code, page creation, and website changes must be security hardened, with specific care to prevent XSS/cross-site scripting by avoiding unsafe HTML injection, sanitizing any future user/API content before render, validating inputs, and keeping external embeds/scripts tightly controlled.
- Before every update and push, do a security pass limited to XSS, unsafe HTML rendering, unsafe image URLs, unsafe href/src values, unsafe search input, unsafe URL params, missing `rel="noopener noreferrer"`, missing validation, missing security headers, and vulnerable dependencies. Make safe code changes without changing the design, then report what was fixed and what still needs manual review.
- At the start of every new chat/session, first confirm the git repo is connected and working, keep git connected throughout the session, and commit plus push every completed change automatically unless the user explicitly says not to.
- User standing instruction: do not ask in chat for git commit or git push permission; after verified changes, commit and push immediately unless the user explicitly says not to.
- Codex must not ask for commit or push permission. After verified work, commit and push automatically by default unless the user explicitly says not to push.
- Priority objective: never ask again for git commit or git push after verified work; commit and push automatically by default unless the user explicitly says not to push.
- Final standing rule: all future updates and changes must be committed and pushed to the GitHub repo automatically after verification, with no chat permission requests for commit or push.
- At the start of every new chat/session and before every push, run the required security pass and any needed build/deploy verification before committing and pushing changes.
- At the start of every new chat/session, always open or refresh the right-side local preview at `http://localhost:5173/Real-Estate-Test-site/` so the current site is visible while working.
- Standing hands-off approval: For this project, the user has pre-approved normal development actions including file edits, dependency installs when needed, build/typecheck/security checks, AGENT.md updates, git add, git commit, and git push. Codex must not ask for permission for these actions and should complete the full workflow automatically unless there is a real blocker such as missing git auth, merge conflict, failed build that cannot be fixed safely, missing required secret, or risk of deleting important user content.
- Priority confirmation rule: the user gives full confirmation to continue normal project work without repeatedly asking for confirmation. Do not pause for plan/edit/commit/push confirmation; proceed through implementation, verification, `AGENT.md` update, commit, and push unless the user explicitly says to stop, only plan, or not push.
- Blocked-command workflow rule: the workflow must work whether commands are blocked or unblocked. If normal commands fail because of Windows permissions, sandbox restrictions, network restrictions, `.git/index.lock` permission errors, or similar environment blocks, immediately retry with the required elevated/approved path and continue the verification, commit, and push flow whenever possible.
- Context-protection command rule: any command with unknown or potentially large output must be byte-capped. Default shell pattern: `COMMAND 2>&1 | head -c 4000`. On PowerShell, prefer targeted commands with explicit caps such as `-TotalCount`, `Select-Object -First N`, or other small bounded output; avoid uncapped large dumps.
- Always update this `AGENT.md` with the latest standing rules, completed changes, checks run, and relevant project notes without asking permission. Objective: work efficiently, verify, update `AGENT.md`, commit, and push without repeatedly asking or wasting token usage.
- Standing search-tool rule:
  - Use whichever `rg` works reliably in the current environment.
  - Prefer the working WinGet ripgrep path when available: `C:\Users\Joe\AppData\Local\Microsoft\WinGet\Links\rg.exe`.
  - If that path fails, immediately try another available `rg` on PATH.
  - If no `rg` works, continue with PowerShell `Get-ChildItem` + `Select-String` or CMD `dir /s /b` + `findstr`.
  - Do not ask the user about search tooling unless all search methods fail.
- Update this file whenever corrections or fixes are applied.

## 2026-04-28
- Created first React/Vite frontend scaffold.
- Added Tailwind CSS setup.
- Copied supplied logo into `public/buy-home-for-less-logo.png`.
- Built front page layout: sticky header, hero banner, search panel, featured cards, map-ready section, footer.
- Added Apollo GraphQL client in `src/services/graphqlClient.ts` with `VITE_GRAPHQL_ENDPOINT` support.
- Added mock property data and TypeScript property model for later backend connection.
- Note: user referenced exact sample template link, but no external URL was provided in prompt. Current layout uses visible requirements and logo while waiting for template URL/images.
- Fix: added Vite client type declaration so `import.meta.env.VITE_GRAPHQL_ENDPOINT` builds in TypeScript.
- Fix: made header language control toggle EN/TH locally.
- Fix: search form now prevents page reload and is ready for backend filter wiring.
- Added GraphQL query contracts for featured properties and map-bounds property search in `src/graphql/propertyQueries.ts`.
- Added Top Locations section with 6 banner tiles, placeholder imagery, map/search links, and data file for later backend replacement.
- Changed header language control from EN/TH toggle to dropdown with EN, RU, ZH, TH, AR, and FA options.
- Changed Top Locations layout to match supplied reference: centered title/description, tall Phuket banner on the left, six smaller banners in a 3-by-2 grid on desktop.
- Fix: added scroll offset for `#locations` so sticky header does not cover the section title.
- Fix: added hash-scroll handler so direct links such as `/#locations` scroll correctly after React renders.
- Fix: added delayed hash-scroll retry for Vite/React initial render timing.
- Changed listing section heading to `Best Deals`.
- Moved Best Deals above Top Locations and expanded it to 6 property cards.
- Restyled property cards with sample-inspired image placeholders, sale labels, save button, location row, price, and property meta.
- Fix: added scroll offset for `#listings` so Best Deals title is not covered by sticky header.
- Fix: added longer hash-scroll retries so section links settle after CSS/layout expansion.
- Changed header nav `Listings` label to `Lease to Home`.
- Added 8 more location boxes under Top Locations.
- Added functional mobile menu so header nav labels, including `Lease to Home`, are visible in narrow preview.
- Updated 8 lower Top Location boxes to match supplied image names/order: Kao Yai, Udon Thani, Nakhon Ratchasima, Samut Sakhon, Samut Prakan, Nan, Phetchaburi, and Surat Thani.
- Replaced header navigation with Home, For Sale, For Rent, Lease to Home, Financing Available, Immigration Visa, and More.
- Added Immigration Visa submenu with Retirement Visa and Long Term Visa.
- Added More submenu with News, Abouts, Contact Us, and FAQ.
- Changed header submenus to show only after clicking the parent menu item.
- Updated hero intro text to describe buying, renting, leasing, luxury homes, distressed properties, and long-term visa packages for foreign buyers.
- Updated search tabs to All, For Rent, For Sale, Lease to Own, and Senior Nursing Home.
- Changed top header menu label from `Lease to Home` to `Lease to Own`.
- Copied supplied service icons into `public/service-icons`.
- Replaced old 3-card service block under search with a `Why Choose Us` section using 8 supplied icons and matching service copy.
- Removed square card boxes from Why Choose Us items and enlarged service icons.
- Added animated stats band above Why Choose Us with exact numbers: 2.5B+ Portfolio Value, 850+ Transactions Closed, and 20 Years Active.
- Removed all text under Why Choose Us icons and enlarged icons to dominate each item.
- Reduced animated stats number size and band height.
- Removed `Call Us` button from header.
- Added keyword search input above province/location field.
- Replaced location text input with Thailand province multi-select dropdown containing checkboxes and listing counts for all 77 provinces.
- Replaced single price range dropdown with Min Price and Max Price fields.
- Added accessible label to province dropdown trigger.
- Added expandable filter panel with Bedroom options Studio and 1-5+, Bathroom options 1-5+, and Unit Feature checkboxes.
- Changed filter panel to start closed and only show after user clicks filter button.
- Set Vite base path to `/Real-Estate-Test-site/` for GitHub Pages.
- Added GitHub Actions Pages deployment workflow at `.github/workflows/deploy.yml`.
- Moved static images under `public/images` and changed image references to use Vite `BASE_URL` so they work on GitHub Pages.
- Restored compatibility copies at `public/buy-home-for-less-logo.png` and `public/service-icons/*` so cached old bundles do not show broken images on GitHub Pages.
- Changed header logo link to `import.meta.env.BASE_URL` so clicking it always reloads the GitHub Pages homepage.
- Reduced Top Locations tile height, gaps, and label sizes to make each box smaller.
- Added supplied Phuket province banner image to Phuket Top Locations tile.
- Added compatibility copy at `public/province-banners/phuket.png` so Phuket banner works even if an older cached bundle requests the old-style path.
- Added supplied Chiang Mai province banner image with GitHub Pages-safe and compatibility public paths.
- Removed hero buttons `Browse Listings` and `Search Map`.
- Added Pattaya / Chonburi province banner image with GitHub Pages-safe and compatibility public paths.
- Added Bangkok province banner image with GitHub Pages-safe and compatibility public paths.
- Added Kanchanaburi province banner image with GitHub Pages-safe and compatibility public paths.
- Added Chiang Rai province banner image with GitHub Pages-safe and compatibility public paths.
- Added Hua Hin / Prachuap Khiri Khan province banner image with GitHub Pages-safe and compatibility public paths.
- Made search category tabs selectable with active state and hidden form value.
- Prepared repository for GitHub push with `.gitignore` excluding dependencies, build output, logs, and env files.
- Kept raw uploaded `site image/` folder out of git; required service icons are copied into `public/service-icons`.
- Added supplied Kao Yai province banner image with GitHub Pages-safe and compatibility public paths.
- Added supplied Udon Thani province banner image with GitHub Pages-safe and compatibility public paths.
- Added supplied Nakhon Ratchasima province banner image with GitHub Pages-safe and compatibility public paths.
- Added supplied Samut Sakhon province banner image with GitHub Pages-safe and compatibility public paths.
- Added supplied Samut Prakan province banner image with GitHub Pages-safe and compatibility public paths.
- Added supplied Nan province banner image with GitHub Pages-safe and compatibility public paths.
- Added supplied Phetchaburi province banner image with GitHub Pages-safe and compatibility public paths.
- Added supplied Surat Thani province banner image with GitHub Pages-safe and compatibility public paths.
- Added Apartment and Villa to the search panel property type dropdown.
- Reduced Best Deals property card image height and added left/right plus six-dot image slider controls to each card.
- Restored animated stats band to full width and reduced vertical height/padding.
- Reduced Why Choose Us heading/copy size and enlarged service icon images for easier reading.
- Enlarged Why Choose Us service icon images again and widened the section container to keep the grid readable.
- Updated Best Deals property meta to show `Sq Meter` before the area number beside the ruler icon.
- Replaced hero placeholder background with a looping muted YouTube embed behind the Find Your Next Home copy.
- Strengthened hero text readability over video with bolder copy, text shadow, and a translucent white backing.
- Added supplied transparent footer logo asset and removed the footer logo white backing.
- Removed the footer Resources column containing Map Search, Agents, Mortgage, and Help Center.
- Reduced hero video white coverage and changed hero copy to bold white text with dark shadow.
- Updated footer Company links to About Us, Contact Us, and News.
- Removed the small `Buy Home For Less` eyebrow text above the hero headline.
- Optimized hero YouTube iframe cover sizing on mobile to remove black letterbox space.
- Made the sticky header fully opaque with a higher z-index so mobile scrolling content does not show behind it.
- Renamed header `Immigration Visa` to `Immigration / Visa` and added `Real Estate Laws for Foreigner` submenu item.
- Changed header `Financing Available` nav label to `Finacing`.
- Added separate Real Estate Laws for Foreigner page with supplied banner image and linked it from the header submenu.
- Reduced Real Estate Laws for Foreigner page banner height.
- Replaced all Real Estate Laws for Foreigner page text with the supplied ownership, condominium, leasehold, and legal consideration copy.
- Changed Real Estate Laws for Foreigner page to clean URL routing and added GitHub Pages SPA fallback.
- Changed Real Estate Laws for Foreigner banner to show the full image with contained sizing instead of cropping it wide.
- Removed black banner background around Real Estate Laws image and enlarged the full banner image.
- Reduced Real Estate Laws full banner image size slightly.
- Added Retirement Visa page with supplied banner image, matching clean page layout, and linked it from the header submenu.
- Replaced Retirement Visa page text with supplied eligibility, financial, health insurance, and important notes copy.
- Replaced footer logo description with supplied real estate partner and visa package copy.
- Replaced footer LinkedIn social icon with WhatsApp and LINE social buttons.
- Preference: always show the local Vite preview in the side browser window for AGENT.md deploy/check work.
- User standing instruction: after every future code, content, asset, or website change, automatically run the required checks, commit the changes, and push to GitHub without asking again.
- Added Long Term Visa page with supplied banner image, clean URL routing, header submenu link, and supplied LTR visa content.
- Added Financing for Foreigners page with supplied banner image, clean URL routing, and Finacing header submenu link.
- Added Own Property in Thailand page with supplied banner image, clean URL routing, and Finacing header submenu link.
- Fixed parent header label typo from `Finacing` to `Financing`.
- Added `Senior Nursing Home` parent header menu item between `Lease to Own` and `Financing`.
- Added `Senior Nursing Home` submenu items: Nursing Home Facility, Private Villa Nursing Care, and Resort Nursing Facility.
- Added Nursing Home Facility page with supplied banner image, clean URL routing, and Senior Nursing Home submenu link.
- Security rule added: future code and page creation must tighten XSS/cross-site scripting defenses across the whole website.
- Added pre-push security pass requirement and applied XSS hardening helpers, CSP/referrer meta tags, safer iframe permissions, validated asset/href/GraphQL URLs, and search input limits.
- Added Private Villa Nursing Care page with supplied banner image, clean URL routing, Senior Nursing Home submenu link, and supplied private villa nursing care content.
- Added Resort Nursing Facility page with supplied banner image, clean URL routing, Senior Nursing Home submenu link, and supplied resort nursing facility content.
- Added Why Retire in Thailand Senior Nursing Home submenu page with supplied banner image, clean URL routing, and supplied retirement destination content.
- Added Why Thailand Is the Leading Nursing Home Facility in Asia section below Why Retire in Thailand with supplied banner image and supplied senior living content.
- Removed Senior Nursing Home eyebrow separators from Why Retire in Thailand page sections and tightened reason-card spacing so headings sit closer to their supporting text.
- Added `Why Seniorcare.net?` submenu item under Senior Nursing Home.
- Added Why Seniorcare.net page with supplied banner image, clean URL routing, Senior Nursing Home submenu link, and supplied Senior Care benefits content.
- Added Lease to Own page from parent header menu with supplied banner image, clean URL routing, and supplied lease-to-own content.
- Added What Is Lease to Own section below Lease to Own page content with supplied banner image and supplied explanatory text.
- Added For Sale parent submenu items for Distress Property, Foreclosure, Pre-Foreclosure, Fixer Upper, and Urgent Sales.
- Added Distress Property page with supplied banner image, clean URL routing, For Sale submenu link, and supplied distressed property content.
- Reduced Distress Property banner max width so the page hero image appears smaller.
- Added FAQ & Learning Center page under More menu with Zillow Learn-inspired small article banner cards and included Lease to Own as one of the Buying cards.
- Removed Private Villa Nursing Care and Resort Nursing Facility cards from the FAQ Senior Living section.
- Moved Lease to Own FAQ card out of Buying into its own Lease to Own section.
- Added For Sale FAQ section with five boxes for Distress Property, Foreclosure, Pre-Foreclosure, Fixer Upper, and Urgent Sale.
- Added Foreclosure page with supplied banner image, clean URL routing, FAQ For Sale card link, and supplied foreclosure buying content.
- Moved Financing for Foreigners and Own Property in Thailand FAQ cards into a new Financing section.
- Added Pre-Foreclosure page with supplied banner image, clean URL routing, FAQ For Sale card link, and supplied pre-foreclosure purchasing content.
- Added Foreigner FAQ section to FAQ page with eight question boxes covering ownership, property types, visas, financing, custom homes, delivery details, warranty duration, and cost of living.
- Added page for `Is it possible for a foreigner to own property in Thailand?` with supplied banner image, clean URL routing, FAQ card link, and supplied ownership rules content.
- Added page for `What type of property can foreigners own in Thailand?` with supplied banner image, clean URL routing, FAQ card link, and supplied permitted property types content.
- Added page for `Can I obtain a long-term visa after renting property in Thailand?` with supplied banner image, clean URL routing, FAQ card link, and supplied visa/property explanation content.
- Added page for `Is mortgage financing available to foreigners?` with supplied banner image, clean URL routing, FAQ card link, and supplied mortgage financing content.
- Added page for `Am I allowed to build a custom home in Thailand as a non-Thai national?` with supplied banner image, clean URL routing, FAQ card link, and supplied custom home ownership content.
- Added page for `How can I ensure that the property I receive matches the specified details?` with supplied banner image, clean URL routing, FAQ card link, and supplied due diligence content.
- Removed all `See all` text links from FAQ page section headers.
- Removed For Sale header submenu items and removed Lease to Own from the top header navigation.
- Added Fixer Upper and Urgent Sale pages with supplied banner images, clean URL routing, and FAQ For Sale card links.
- Fix: routed footer and Top Locations hash links through `safeHref`, corrected `Financing for Foreigners` submenu spelling, and replaced a non-ASCII footer copyright glyph with `&copy;`.
- Updated Fixer Upper page with supplied buyer guidance copy and refreshed the supplied Fixer-Upper banner image.
- Updated Urgent Sale page with supplied urgent property sale copy, sale types, common characteristics, and buyer tips.
- Added Rent section to FAQ & Learning Center with a Rent Requirement card, stable `#rent` anchor, and supplied Rent Requirement image.
- Added startup workflow rules to always verify git connection, run security/build checks before commit and push, auto-commit and auto-push finished changes, and open the right-side localhost preview at the start of each new chat.
- Added FAQ page for `What is the duration of the home warranty provided to homeowners?` with supplied banner image, clean URL routing, FAQ card link, and supplied Thailand home warranty guidance.
- Added FAQ page for `Cost of living in Thailand` with supplied banner image, clean URL routing, FAQ card link, and supplied Thailand cost-of-living guidance.
- Increased header logo size for stronger brand visibility in the sticky top navigation.
- Replaced home page bottom map placeholder section with embedded YouTube video content about moving to Thailand.
- Reduced home page bottom video container width so embedded YouTube section appears smaller and less dominant.
- Added first test version of a main `For Sale` property listing page with top search, side filters, modern listing cards, location-driven mock data, and share buttons.
- Updated main property listing page to use stacked filters below search, a sale/rent toggle, a recommended sort dropdown, inline bedroom and bathroom selectors, amenities chips, and special sale-category filters.
- Refined listing-page controls and chips with rounded modern styling plus smooth dropdown open/close animation inspired by Airbnb-like interaction patterns.
- Reworked property listing page into a compact product-card grid with top search, filter drawer, sort menu above products, heart save buttons, and six-image card sliders.
- Changed property listings to a single vertical list with smaller DDProperty-inspired compact rows and reduced built-year styling for mobile-friendly scanning.
- Increased listing image area while narrowing the overall product list width for a closer DDProperty-style row proportion.
- Replaced min/max price inputs on the listing page with a price range slider, histogram-style price graph, and minimum/maximum value boxes underneath.
- Restyled listing filter dropdown into a modern panel with buy/rent tabs, radio-style home type rows, price boxes, bedroom pills, amenities, special listings, and sticky Clear All/Apply Filter actions.
- Reduced listing price slider height and removed Bedroom from the Buy filter panel while keeping the top quick bedroom selector.
- Added Land Size min/max fields to the listing filter panel and wired them to filter listings by sqm.
- Changed listing filter panel to open as a centered modal with upward motion and close with downward motion when clicking away or the close button.
- Compressed listing search area into a Realtor-style horizontal toolbar with a long search pill and compact filter chips to reduce vertical whitespace.
- Updated listing page search placeholder to `search location, property types`.
- Changed listing Price, Rooms, and Home type toolbar chips to open their own smooth animated dropdown panels instead of always opening the full filter modal.
- Changed listing bedroom and bathroom quick controls into one Room toolbar button with a shared smooth dropdown for bed and bath choices.
- Removed Price from the full listing filter modal and restyled the Price toolbar dropdown to match the requested segmented list/monthly panel with histogram and no-min/no-max controls.
- Updated the listing page Price quick dropdown so users can type Min/Max values directly, drag a visible dual-handle price gauge left/right in List price mode, switch to a Monthly payment panel, and close the panel with a bottom-right Done button.
- Removed `New construction`, `Min 0`, and `Hide pending / contingent` chips from the listing-page quick filter bar to keep only the active controls.
- Shortened the mobile sort control on the listing page by switching the button to compact labels and fit-content width while keeping the full desktop sort label.
- Shortened the desktop listing-page sort button too by using compact labels on all screen sizes while keeping the dropdown menu wide enough for full sort-option text.
- Shortened the desktop listing-page search bar by capping its width while keeping the mobile search field full width.
- Changed the listing-page filter modal to use draft state so Buy/Rent and all modal filter changes do not affect the page until the user clicks `Done`; `Clear All` now resets modal options and applying it shows the full listing set for the chosen tab.
- Centered the home-page search panel and the controls below it, tightened widths, added rounded modern styling, and organized the tabs and filter/search controls into a cleaner centered real-estate search layout.
- Added a visible footer to the home-page expanded filter box with a bottom-left `Clear Reset` action and a bottom-right `Search` submit button so the filter actions are no longer missing or cut off.
- Corrected the listing-page layout by centering the top search bar and quick-filter buttons, centering the quick-filter popovers, and making the main Filters modal use a sticky visible footer with stronger `Clear All` and `Submit` actions so the bottom controls do not get cut off.
- Removed the `New Projects Only` row from the listing-page Filters modal.
- Wired the header `For Rent` menu to the shared listing page route and made the listing page auto-open in Rent mode with clean default filters when entered through the rent URL.
- Updated the listing-page sale price filter to show `Min 0` and `Max 500 MB`, and increased the sale-mode price range cap to 500,000,000.
- Changed the listing-page quick `Room` and `Home type` dropdowns to use local draft selections so the site updates only after the user clicks each dropdown's `Done` button.
- Added large clear `X` actions beside the listing-page `Price`, `Room`, and `Home type` quick-filter buttons whenever those filters are active; clicking each `X` resets that specific filter and removes its selected state.
- Refined the listing-page quick-filter clear controls so each active `X` now sits inside its own `Price`, `Room`, or `Home type` chip instead of appearing outside the button box.
- Added two new listing-page quick-filter boxes directly under the search bar: `Cities`, populated from the current listing dataset, and `Province`, populated from the Thailand province list; both apply their selection only after the user clicks `Done`.
- Connected the home-page `Top Locations` banners to province-filtered listing URLs so clicking a location tile opens the product listing page with that banner's mapped province already selected.
- Aligned the listing-page `Cities` and `Province` quick-filter boxes into the same button row as the other quick filters and matched their chip height/style to the existing controls.
- Removed the listing-page `Cities` quick-filter chip and replaced it with debounced Thailand city/town autocomplete in the main search bar using the open-source Photon OpenStreetMap geocoder, while keeping the local listing search sanitized and punctuation-safe.
- Updated the listing-page search bar so typed queries keep spaces while the search engine still normalizes and matches multi-word place names safely.
- Reused the listing-style property card on the home-page `Best Deals` section so those cards now share the same slider, save button, location row, and metadata styling as the listing page.
- Widened the home-page `Best Deals` grid so each product card gets more horizontal room and the image/text/icon chips do not feel cramped.
- Changed the home-page `Best Deals` layout to a single wide column so the price label and other card text no longer get squeezed on desktop.
- Tuned the home-page `Best Deals` card rail to a centered max width so cards stay readable without stretching too wide across the page.
- Rebuilt the home-page search panel to match the listing-page toolbar style, removed the `Lease to Own` and `Senior Nursing Home` tabs, and passed the home search query plus quick filters into the listing page URL.
- Tightened the home-page search shell by reducing its side padding and max width so the search tabs and toolbar sit closer together horizontally.
- Removed the standalone front-page search block, moved the home search into the center of the hero video area, changed the top mode controls to text-only `Buy`, `Rent`, `Sell`, and `Senior Home`, and moved the search label plus icon to the right side of the hero search field while keeping the sanitized listing-style query flow.
- Brightened the hero video search bar to a solid white treatment with a stronger outline and shadow so it stands out clearly against the video background.
- Changed the hero video mode labels so clicking `Buy` goes straight to the sale listings page, clicking `Rent` goes straight to the rent listings page, and clicking `Senior Home` goes straight to the senior home page while carrying the current search query in the URL when present.
- Added a top-level `Buy` item before `For Sale` in the header menu and added a `Buy` button beside `Sale` above the listing-page search bar, with both `Buy` and `Sale` targeting the sale listings view.
- Split `Buy` and `For Sale` into separate sale-page URLs so only the active page highlights in red: `Buy` now uses `/buy`, `For Sale` stays on `/properties-for-sale`, and the listing-page top toggle highlights by current page instead of by shared sale mode.
- Replaced the home-page hero video with the supplied YouTube embed `83po-NExIPU` while keeping the existing full-bleed slider sizing and overlay layout unchanged.
- Increased the home hero iframe zoom/crop for the `83po-NExIPU` video so the section stays full-bleed without black bars at the top or bottom across screen sizes.
- Removed the visible listing-count text from each home-page `Top Locations` banner while keeping the location image tiles and province links unchanged.
- Tightened the home hero YouTube embed parameters so the video auto-plays muted, loops continuously, and keeps playback controls hidden.
- Added inline clear `X` buttons to the home-page and listing-page search fields so typed search text can be erased directly from the right side of the input.
- Corrected the home hero `Sell` mode so it routes to the `For Sale` listings page, while `Buy` continues to route to the separate `/buy` listings page.
- Changed the home hero `Senior Home` mode to open the shared property listings page instead of the static nursing-home content page.
- Fixed the stacked dual-handle price sliders so the left minimum-price thumb is draggable on mobile by giving the hidden range inputs thumb-only pointer events instead of letting the top input block touches across the full track.
- Changed the header `More` submenu label from `Abouts` to `About Us` and added a dedicated `About Us` page at `/about-us` using the supplied company profile copy.
- Restyled the `About Us` page copy into a single flowing text section instead of separate boxed paragraphs.
- Linked the footer `About Us` item to the real `/about-us` page instead of the old hash anchor.
- Fixed the listing-page mobile sort control so the button aligns to the right edge, the label no longer gets clipped, and the dropdown opens from the correct mobile anchor width.
- Added a property detail page route for each listing with a five-image preview grid, `See all` photo gallery modal, BuyHomeForLess agent contact card, save/share actions, structured property details, amenities, backend-ready FAQ data rendering, and a similar-properties slider based on same-province matching.
- Refined the property detail gallery with a smaller `See all photos` button, a larger centered hero image, and five square clickable preview tiles that swap the main photo in place.
- Restyled the property detail page for mobile with a full-bleed image hero, floating action controls, compact photo chips, cleaner text hierarchy, improved section spacing, a mobile agent card, and a sticky bottom contact/call action bar.
- Brightened all property status/category banners and kept the main-image hero badges pinned visibly at the top, including sale/rent, pre-foreclosure, distress, new, and other listing state labels.
- Removed the separate property-detail asking-price card and moved the price directly under the gallery with the property title and location for a cleaner DDproperty-style header.
- Fixed the mobile property detail layout so long text stays inside the phone width, strengthened the top hero action buttons, added visible previous/next image arrows on the hero and below it, and upgraded `See all photos` so tapping a gallery image opens a full-image viewer with navigation.
- Tightened the mobile property detail sections so details, bio, amenities, FAQ, and similar properties stay within the phone width, removed the lower hero side arrows, and made similar properties finger-scrollable with visible left/right controls.
- Removed the mobile property gallery's top-right agent profile/avatar circle while keeping the back, save, share, and more action controls visible.
- Converted the property detail facts and amenities from boxed mobile cards into modern text/icon rows, moved the mobile agent contact buttons directly below the property details, removed the duplicate mini fact boxes under the price, and deleted the sticky bottom contact/request-call bar.
- Restored a visible header above every property detail page on mobile, using the shared site navigation with a larger logo and hamburger menu before the gallery.
- Restored the desktop property gallery `See all photos` action with a stronger overlay button and a second visible desktop gallery control under the thumbnails.
- Updated the property gallery modal so tapping a photo from `See all photos` opens one large focused image viewer without keeping the thumbnail list underneath.
- Switched the `sqm` metric icon in property details from a square to a ruler to better match measurement context.
- Added a backend-ready `Property Location` section under amenities using OpenStreetMap + Nominatim geocoding, with structured Thai address fields (street, tambon, amphoe, city, province, postal code, country), searchable map input, and automatic marker placement from backend coordinates when available.
- Replaced the property location iframe map with an in-page Leaflet map (OpenStreetMap tiles) to fix blocked-content rendering, and confirmed address search updates the location marker icon from Thai address queries.
- Switched property location search to a Pelias-first geocoding flow (configurable endpoint/API key), while keeping a Nominatim fallback so map marker placement stays available if the Pelias service is unreachable.
- Replaced the property detail page Leaflet map with a MapLibre GL JS map renderer while keeping the same Pelias-first geocoding search flow and Nominatim fallback behavior.
- Removed Leaflet dependencies and added `maplibre-gl` so the property location section now renders with MapLibre controls and marker updates.
- Fixed blank MapLibre rendering by adding CSP directives required for worker/blob usage and by using an OpenStreetMap raster fallback style when no custom MapLibre style URL is configured.
- Improved property map geocoding reliability by adding progressive query fallbacks (full address to broader area variants) before showing `No location matched`.
- Replaced property-location geocoding from Pelias-first to Mapbox-first: Mapbox Search Box `/forward` is now primary, with Mapbox Geocoding v6 and OSM Nominatim fallbacks for better Thai address resilience.
- Added explicit Mapbox token validation/error handling (`VITE_MAPBOX_ACCESS_TOKEN`) and refreshed property-location helper text to reflect the new API flow.
- Replaced the property-location map search flow with an open-source Thailand geocoder setup: Nominatim-compatible search endpoint first, with public Nominatim fallback, so the frontend is ready for a self-hosted index built from Geofabrik Thailand extracts.
- Added new geocoder env settings (`VITE_THAI_NOMINATIM_SEARCH_URL`, `VITE_THAI_NOMINATIM_COUNTRY`, `VITE_THAI_NOMINATIM_LANGUAGE`, optional `VITE_THAI_NOMINATIM_EMAIL`) and removed Mapbox token dependency from property map search.
- Updated property-location map search engine naming/config to OsmAnd: switched env keys to `VITE_OSMAND_SEARCH_URL`, `VITE_OSMAND_COUNTRY`, `VITE_OSMAND_LANGUAGE`, and optional `VITE_OSMAND_EMAIL`, while retaining Nominatim-compatible request flow.
- Updated property location helper copy to indicate OsmAnd online search engine usage with configurable endpoint fallback behavior.
- Increased property-location search result limit to the Nominatim max (`50`) and enabled multilingual labels by requesting English + Thai naming details, then rendering a combined readable location label.
- Changed property detail FAQ behavior so all FAQ items are collapsed by default and remain closed when switching between listings unless the user opens one manually.
- Updated the main header navigation label from `For Sale` to `Sell` while keeping the same sale listing route target.
- Added rent-only pricing support text across product cards and detail views: every rent listing now shows an extra line under the monthly price with a numeric `THB ... deposit per month` value.
- Replaced fixed rent deposit display with listing-backed deposit support across rent cards and property detail views.
- Added a new `Features` section to every property detail page (buy and rent) showing furnishing status, air conditioner availability, and kitchen availability from structured listing data.
- Refined the property-detail `Features` section to a plain text-row layout (no feature boxes), matching the style of details lists.
- Made features backend-ready as dynamic text entries (`features: string[]`) so admins can add any number of custom feature lines and the frontend will render them automatically.

## 2026-05-01
- Security hardening pass: added validated `safeTelHref` and `safeMailtoHref` helpers for agent contact links, and routed remaining internal navigation links through `safeHref` for consistent safe `href` handling without UI changes.
- Added a dedicated `Sell Your Home` page with a two-column hero banner, `lets start` CTA button, and a sanitized seller lead submit form; routed all `Sell` entry points (main header, home hero search mode, and listing toolbar button) to `/sell-your-home`.
- Refined the `Sell Your Home` page for mobile: hero image now appears above hero text on small screens, CTA/button spacing is mobile-first, and the submit form fields are aligned to a tighter Zillow-like stacked mobile flow.
- Updated the `Sell Your Home` hero banner image to a Thailand house/property visual (`own-property-in-thailand.png`) instead of the previous image.
- Added an on-image banner caption on the `Sell Your Home` hero image that reads `Sell your home?` with a readable mobile-safe dark gradient overlay.
- Replaced the `Sell Your Home` hero banner with the user-supplied house image (`sell-your-home-thailand-house.png`) and moved the caption text to a centered full-width strip across the middle of the banner.
- Replaced the Sell banner asset again with the exact user-specified source file (`...prop.webp`) and updated the page to use `sell-your-home-thailand-house.webp`.
- Updated main header order/label: moved `Sell` behind `Rent`, and renamed `For Rent` to `Rent` in the primary navigation.
- Added a new `Contact Us` page (`/contact-us`) using the supplied `download.jfif` top banner, with a PropertyGuru-inspired contact layout and exactly four contact boxes (Tel, Whatsapp, Wechat, Email), and linked the header `More > Contact Us` menu to this new page.
- Updated footer `Company` links so `Contact Us` routes to `/contact-us` and added a new `FAQ` footer link to `/faq`.
- Updated footer right-side contact details to: `Whatsapp: +66-973924632`, `Wechat: +66-973924632`, and `Email: Info@buyhomeforless.com`.
- Reordered the listing-page top mode buttons above the search bar so `Rent` appears before `Sell`.
- Added DeepL free open-source translation flow for language switching: header dropdown now persists EN/RU/ZH/TH/AR/FA selection, auto-translates visible site text and placeholders through a DeepLX-compatible endpoint (`VITE_DEEPLX_API_URL`, default `https://deeplx.vercel.app/translate`), caches translations in local storage, and keeps English as the default fallback.
- Fix: hardened language translation reliability by adding DeepLX endpoint failover (local `127.0.0.1:1188`, `api.deeplx.org`, and public mirrors) and a visible header warning when translation APIs are unreachable, so language-switch failures are explicit instead of silent.
- Fix: corrected translation connectivity for local DeepLX by allowing `http://127.0.0.1:*` in CSP `connect-src` and prioritizing `http://localhost:1188/translate` before other fallbacks, so browser requests are not blocked when using local port 1188.
- Replaced all DeepLX-based translation logic with official DeepL Free API integration through a secure Vite dev proxy endpoint (`/api/deepl-translate`) that reads `DEEPL_API_KEY` and `DEEPL_API_URL` server-side, keeps the API key out of browser code, and routes language dropdown translation requests only through this proxy.
- Added frontend-only mock auth session flow: Login and Sign Up now set a safe sessionStorage-backed signed-in state (email + email-prefix display name only), desktop header switches to avatar/profile dropdown with placeholder items plus working Logout, and mobile hamburger shows the same signed-in profile block with working Logout and session persistence across refresh in the same browser session.
- Added frontend-only social auth placeholders in both Login and Sign Up modal steps: visible `Continue with Google` and `Continue with Facebook` buttons are now shown below the primary auth actions with safe non-submitting disabled behavior until backend OAuth is implemented.
- Improved mobile auth modal usability: Login/Sign Up modal now opens in the active viewport with top-aligned mobile positioning, supports tap-outside backdrop close, and uses a clear top-right `X` close icon so users can dismiss without scrolling.
- Added password visibility toggles to auth forms: Login and Sign Up password fields now include right-side eye icons that let users switch between hidden and visible password text without storing or logging passwords.
- Fixed mobile auth modal layering by rendering Login/Sign Up modal through a top-level portal (`document.body`) with high z-index so it always appears in front of the full site (including hero video/header) and no longer sits behind page content.
- Refined mobile auth modal centering and clipping behavior: modal overlay now uses full dynamic viewport height centering (`100dvh`) with explicit max z-index and scroll-safe container sizing so the full Login/Sign Up box stays visible and accessible without top-edge clipping.
- Adjusted mobile auth modal spacing to sit lower and more centered away from the sticky header by increasing vertical container padding and tightening modal max-height, while preserving full-box visibility and internal scrolling.

## 2026-05-03
- Added frontend-only Account Settings page with profile info, email actions, password/security placeholders, notification preferences, and dashboard menu links.
- Added explicit standing hands-off workflow rule confirming pre-approval for normal development actions, checks, AGENT.md updates, commit, and push unless a real blocker exists.
- Added frontend-only Favorites page connected to property heart buttons with per-user localStorage IDs, profile dropdown/mobile links, empty/login states, and backend-ready service hooks.
- Updated property detail `Contact Agent` reveal content to show `Whatsapp: +66-973924632`, `Wechat: +66-973924632`, and `Email: Info@buyhomeforless.com` on both mobile and desktop contact panels.
- Added Buy/Rent tabs on the Favorites page so saved sale listings are organized under Buy and saved rental listings are organized under Rent.
- Updated the home-page `View All` button to route to `/buy` (Buy listings), while Sell navigation remains routed to `/sell-your-home` info page.

## 2026-05-03 (Backend Foundation Update)
- Started backend foundation with Node/TypeScript GraphQL, PostgreSQL/Prisma schema, auth, admin property management, image upload/optimization, favorites/account APIs, and frontend-ready Buy/Rent/property/map fields.
- Reorganized repository structure into /frontend and /backend for separate deployment workflows (frontend build to public_html, backend as standalone Node.js app).
## 2026-05-03 (Backend Express + MySQL Continuation)
- Confirmed source of truth from current repository files and full `AGENT.md` before coding. Did not re-do completed frontend tasks.
- Replaced incomplete backend transition state with a working Express + MySQL backend foundation (no Prisma) under `/backend`.
- Added MySQL schema import file `backend/database.sql` for phpMyAdmin/cPanel setup.
- Implemented JWT auth with role model: `HEAD_ADMIN`, `ADMIN`, `EMPLOYEE`.
- Added bootstrap logic to auto-create first Head Admin from env vars when DB has no head admin.
- Added auth APIs:
  - `POST /api/auth/register` (bootstrap first head admin, then head-admin-only user creation)
  - `POST /api/auth/login`
  - `GET /api/auth/me`
- Added head-admin employee management APIs:
  - `GET /api/admin/employees`
  - `POST /api/admin/employees`
  - `PATCH /api/admin/employees/:id`
  - `DELETE /api/admin/employees/:id`
  - `PATCH /api/admin/head-admin/credentials`
- Added protected admin listing APIs:
  - `GET /api/admin/test`
  - `GET /api/admin/listings`
  - `POST /api/admin/listings`
  - `PATCH /api/admin/listings/:id`
  - `DELETE /api/admin/listings/:id` (soft delete -> `DELETED`)
  - `POST /api/admin/listings/:id/images` (up to 12 images)
- Added public listing APIs:
  - `GET /api/listings`
  - `GET /api/listings/:id`
- Added sharp image variant generation for frontend needs: card, banner, detail, mobile, gallery; variants stored in DB and served from `/uploads`.
- Added security baseline: helmet, CORS, rate-limit, input validation/sanitization, centralized error handler.
- Updated backend docs and env template for cPanel/TMDHosting-friendly deployment flow.

### Files Created/Edited (Backend)
- Created:
  - `backend/database.sql`
  - `backend/src/server.ts`
  - `backend/src/db/bootstrap.ts`
  - `backend/src/db/pool.ts`
  - `backend/src/db/types.ts`
  - `backend/src/middleware/auth.ts`
  - `backend/src/middleware/errorHandler.ts`
  - `backend/src/routes/authRoutes.ts`
  - `backend/src/routes/adminUserRoutes.ts`
  - `backend/src/routes/adminListingRoutes.ts`
  - `backend/src/routes/listingRoutes.ts`
  - `backend/src/services/imageService.ts`
  - `backend/src/types/express.d.ts`
- Updated:
  - `backend/package.json`
  - `backend/package-lock.json`
  - `backend/tsconfig.json`
  - `backend/.env.example`
  - `backend/README.md`
  - `backend/src/auth/jwt.ts`
  - `backend/src/config/env.ts`
  - `backend/src/utils/errors.ts`
  - `backend/src/utils/sanitize.ts`
- Removed old unfinished GraphQL/Prisma files from backend source.

### How To Run/Test Locally
1. `cd backend`
2. `npm install`
3. Copy env: `Copy-Item .env.example .env`
4. In phpMyAdmin, import: `backend/database.sql`
5. `npm run dev`
6. Test URLs:
   - Backend base: `http://localhost:5000`
   - Health: `http://localhost:5000/health`
   - Register: `POST http://localhost:5000/api/auth/register`
   - Login: `POST http://localhost:5000/api/auth/login`
   - Admin test: `GET http://localhost:5000/api/admin/test` (Bearer token required)

### Environment Variables Needed
- `PORT`
- `FRONTEND_ORIGIN`
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `HEAD_ADMIN_EMAIL`
- `HEAD_ADMIN_PASSWORD`
- `HEAD_ADMIN_NAME`
- `UPLOAD_DIR`
- `PUBLIC_UPLOAD_BASE_URL`

### Unfinished Items
- Frontend is still on mock/localStorage account + favorites flows and is not yet wired to backend auth/listing APIs.
- No DB seed data beyond optional head-admin bootstrap; add sample listings if needed for demos.
- Automated tests (unit/integration) are not added yet.

### Next Recommended Step
- Connect frontend auth/account/favorites/listing data services to these REST endpoints (replace mock localStorage flows gradually while keeping current UI behavior).
## 2026-05-03 (Backend Demo UI Link Enablement)
- Added a browser-visible backend demo interface route at `GET /admin-demo` to let user test mock login/register, admin/employee actions, listing creation, and image upload flows from one page.
- Added root backend index route `GET /` that returns quick links (`/health`, `/admin-demo`, `/api/auth/login`, `/api/auth/register`).
- Updated backend startup behavior to allow server boot even when MySQL is unavailable locally:
  - health now returns `databaseReady: false` if DB is unreachable.
  - this allows UI preview/testing link to open immediately.
- Added a safe dev default for `JWT_SECRET` in env parsing so missing local `.env` no longer blocks startup.

### Files Changed
- `backend/src/routes/adminDemoRoutes.ts` (created)
- `backend/src/server.ts` (updated)
- `backend/src/config/env.ts` (updated)

### Localhost URLs (Now Working)
- Backend root: `http://localhost:5000/`
- Backend health: `http://localhost:5000/health`
- Visual backend admin demo UI: `http://localhost:5000/admin-demo`
- API register: `http://localhost:5000/api/auth/register` (POST)
- API login: `http://localhost:5000/api/auth/login` (POST)

### Unfinished Items
- Full API operations still require MySQL running and `database.sql` imported; currently health shows `databaseReady: false` on this machine.
- Frontend app is still not fully wired from mock storage flows to backend REST endpoints.

### Next Step
- Start MySQL + import `backend/database.sql`, then re-test all admin demo actions so CRUD operations persist to DB.
## 2026-05-03 (Backend Admin Demo + Property System Alignment)
- Rebuilt `GET /admin-demo` into a step-by-step backend admin demo UI: register first head admin, login, auto-redirect to dashboard, full left sidebar modules, and logout.
- Added admin sidebar module coverage: Dashboard Overview, Listings, Add Listing, Seller Applications, Registered Users, Employee Accounts, Account Settings, Media/Images, FAQ Manager.
- Added dashboard API `GET /api/admin/dashboard/overview` with required totals and recent listings/seller applications.
- Expanded listing backend schema/API to include required pricing, currency, buy/rent/deposit, price label, highlights, amenities, features, property details, furnishing, air conditioner, kitchen, full address, lat/lng, map search label, section/category/status, bedrooms/bathrooms, land/interior size, built year, province, city.
- Added per-listing FAQ manager data model + APIs (`GET/PUT /api/admin/listings/:id/faqs`) and integrated FAQ input into listing create/update.
- Added image management endpoints for admin listing media workflow: upload (max 12), reorder, set cover, delete.
- Added seller application backend flow for frontend Sell Your Home form: `POST /api/seller-applications`, plus admin list/status update endpoints.
- Added registered users endpoint and account settings update endpoint; kept head-admin-controlled employee create/edit/disable/delete flow.
- Updated `backend/database.sql` and backend docs to match the new admin/property data model.
## 2026-05-04 (Admin Demo Flow + Missing Listing Inputs Fix)
- Fixed `/admin-demo` auth flow so it is step-based instead of showing everything at once: Step 1 register first head admin (only when missing), then Step 2 login, then dashboard/sidebar.
- Added auth bootstrap detection endpoint `GET /api/auth/bootstrap-status` for step gating.
- Upgraded Add Listing demo form to include missing requested property inputs directly in that flow: highlights, amenities, features, property details, FAQ lines, image gallery upload (up to 12), cover-image selection, full address fields, lat/lng, and map lookup support.
- Added backend map geocode proxy `GET /api/map/geocode` (OsmAnd/Nominatim-compatible) to fill listing location fields from search results.
- Kept map storage backend-side as address + latitude + longitude-related listing fields; no Prisma introduced.
## 2026-05-04 (Admin Demo Clickability Hotfix)
- Fixed `/admin-demo` JavaScript parsing bug in `esc()` (quote escaping) that prevented UI interactions/buttons from working.
- Applied fix in both backend copies to avoid mismatch between running localhost targets.
- Kept visible version label `Admin Demo v3 - Full Workflow Visible` on page for cache/version confirmation.
## 2026-05-04 (Session Handoff Rule)
- New standing verification rule: use only the active backend/frontend target for checks; do not run duplicate typecheck/build on inactive duplicate folders.
- If duplicate backend folders exist, identify active one first and mark inactive one as cleanup candidate.
- Current preview test link for next chat: `http://localhost:5000/admin-demo`.

## 2026-05-04 (Admin Demo v3 Mock Preview)
- Active backend folder is `D:\Buy home for less site\backend`; duplicate `Backend buyhomeforless\backend` is inactive cleanup candidate.
- Switched active backend dev port to `5000` and updated backend env/docs references.
- Made `/admin-demo` render a frontend-only mock admin dashboard when MySQL/API calls are unavailable, with visible notice: `Demo Mode: MySQL is offline, showing mock admin UI only`.
- Mock register/login now opens the full sidebar workflow without waiting for MySQL.
- Add/Edit Listing v3 form shows sectioned Basic Info, Pricing, Rent Pricing, Details, Features, Amenities, FAQ, Images, Location, and Publish Settings with `Deposit amount` directly under `Rent per month`.
- Checks run: backend `npm run typecheck`; frontend `npm run build`.

## 2026-05-04 (Per-Listing FAQ + Section Pricing)
- Removed standalone FAQ Manager from the admin demo sidebar; FAQs now live inside each Add/Edit Listing workflow.
- Replaced raw FAQ lines with repeatable accordion-style FAQ items (question + answer) matching the frontend product detail FAQ accordion model.
- Base Pricing now only shows `Price amount` and `Currency dropdown`; section-specific Buy/Rent pricing shows only when the selected listing section needs it.
- Checks run: backend `npm run typecheck`.

## 2026-05-04 (New Session Catch-Up + Search Tool Rule)
- New chat catch-up completed by reading this `AGENT.md` and orienting on the current repo without creating or editing anything at first.
- Confirmed git is connected on `main` tracking `origin/main`; remote is `https://github.com/Cynicalfocus123/Real-Estate-Test-site.git`.
- Existing dirty worktree item at session start: `Backend buyhomeforless\backend\src\routes\adminDemoRoutes.ts` is modified in the inactive duplicate backend folder. Do not revert or stage it unless the user explicitly asks; active backend remains `D:\Buy home for less site\backend`.
- Confirmed active project shape: `frontend/` is the React + TypeScript + Vite + Tailwind public site; `backend/` is the Express + TypeScript + MySQL backend with `/admin-demo`.
- Confirmed bundled Codex `rg.exe` is blocked by Windows `Access is denied`; working ripgrep is `C:\Users\Joe\AppData\Local\Microsoft\WinGet\Links\rg.exe` and must be called by full path.
- Verified working ripgrep version: `ripgrep 15.1.0 (rev af60c2de9d)`.
- Tested full-path ripgrep search for `admin-demo`; it successfully found matches in `AGENT.md`, active `backend`, and inactive duplicate `Backend buyhomeforless`.
- User instruction from this chat: do not ask about ripgrep again unless the full-path ripgrep, `findstr`, and PowerShell `Select-String` all fail.
- Checks run for this documentation update: active backend `npm.cmd run typecheck`, active frontend `npm.cmd run build`, backend `npm.cmd audit --audit-level=moderate`, frontend `npm.cmd audit --audit-level=moderate`.
- Security pass note: focused XSS scan found existing `innerHTML` usage in active `backend/src/routes/adminDemoRoutes.ts`; quick review showed admin demo dynamic table values route through `esc()` and other instances are static form/template rendering. Keep this on the manual-review list if admin demo starts rendering richer API/user content.

## 2026-05-05 (Standing Agent Log Rule)
- Added standing rule: always update `AGENT.md` with latest rules, completed changes, checks run, and relevant project notes without asking permission.
- User objective clarified: work efficiently, verify, update `AGENT.md`, commit, and push without repeatedly asking permission or wasting token/usage.
- Checks run for this documentation update: active frontend `npm run build`, active frontend `npm audit --audit-level=moderate`.
- Security pass note: focused frontend XSS scan for unsafe HTML/render/link patterns found no matches in `frontend/src`.

## 2026-05-05 (Buy Listings Filter UI Update)
- Updated buy/properties-for-sale listing toolbar on `frontend/src/components/PropertyListingsPage.tsx`: changed `Sell` button label to `Senior Home`.
- Moved the quick `Property Type` filter button to sit directly after `Filters` under the search bar.
- Renamed visible `Home Type` labels to `Property Type` in quick-filter UI and filter modal UI.
- Replaced property type filter options with: `Villa`, `Condo`, `Apartment`, `Townhome`, `Commercial Building`, `Resort`, `Land` (plus existing `Any`), without duplicates.
- Added new filter modal `View` section with selectable options: `Beach`, `Mountain`, `Lake`, `Water Fall`, `Cities`, `Rural`.
- Added new filter modal `Space` section and moved land controls into it as `Land Size Min` and `Land Size Max`.
- Added new `Space` controls: `Room Size Min`, `Room Size Max`, `Building Size Min`, `Building Size Max`.
- Reused existing draft/apply/reset filter-state flow for all new sections and kept existing responsive styling pattern.
- Filter logic update: property type now maps from UI categories to listing data (for example `Townhome` -> `Townhouse`, `Villa` -> house variants), view matching uses safe keyword checks against listing text, and new room/building size controls are numeric-sanitized.
- Checks run: active frontend `npm run build`; active frontend `npm audit --audit-level=moderate`.
- Security pass note: focused XSS/security scan for unsafe HTML/render/link/script patterns in `frontend/src` found no unsafe matches; new numeric inputs are sanitized through existing `cleanNumericText` helper.

## 2026-05-05 (Next Frontend Planning Prompt)
- New requested frontend task prompt: when users click the `Senior Home` button on the listing page, route them to a senior-home listing page that uses the same listing layout as buy/rent, with top heading text `Senior Home Listing` instead of `For Sale`.
- Product detail layout request: move `What's special` text above the bed/bath/meta row and below the `Property Details` heading/text area.
- Home/villa detail request: add a backend-ready `Down Payment and Mortgage` section on detail pages so admins can later provide those numbers from the backend.
- Rent listing/card/detail request: rent product boxes and rent detail pages should show deposit by months, for example `Deposit 2 months` or `Deposit 3 months`, instead of only a currency deposit.
- Rent-only detail request: add text plus icon under property details showing `Furnished` or `Unfurnished`.
- Buy, rent, and senior-home detail request: add a text plus icon section under property details called `View`, connected to the filter view option, showing values such as beach, rural, mountain, lake, waterfall, cities, etc.
- Priority reminders for new chats: read all of `AGENT.md` before starting, keep/open the live frontend site in the side browser on port `5173` every time, and commit plus push every finished verified change without asking.
- Checks run for this documentation update: active frontend `npm run build`.
- Security pass note: focused frontend XSS scan for unsafe HTML/render/link patterns in `frontend/src` found no matches.
- Dependency audit note: active frontend `npm audit --audit-level=moderate` required escalation and was not run because approval was declined.

## 2026-05-05 (Senior Listing + Detail Behavior Update)
- Added a dedicated senior listing route and flow:
  - `App.tsx` now routes `/senior-home-listing` to `PropertyListingsPage` with `pageVariant="senior"`.
  - `PropertyListingsPage.tsx` toolbar `Senior Home` button now links to `/senior-home-listing` (no longer `/sell-your-home`).
  - Hero search `Senior Home` tab in `SearchPanel.tsx` now routes to `/senior-home-listing`.
- Updated listing-page behavior so variant filtering is channel-aware:
  - Added `listingChannel` support (`standard` / `senior-home`) and filtered Senior page listings to only `senior-home` records.
  - Standard Buy/Sale and Rent listing pages now exclude `senior-home` records.
  - Senior listing top eyebrow text now reads `Senior Home Listing` instead of `For Sale`.
- Added backend-ready listing data parameters and types for detail behavior:
  - New fields in `types/propertyListing.ts`: `listingChannel`, `depositMonths`, `furnishing`, `view`, `downPaymentAndMortgage`.
  - Updated `data/propertyListings.ts` mock mapping:
    - rent listings now use `depositMonths` with test value `2`.
    - generated `view` value from listing text.
    - generated `furnishing` value.
    - generated backend-ready `downPaymentAndMortgage` text for home/villa-like properties.
  - Added 3 senior-home sample listings to populate the new senior listing page.
- Updated rent deposit labels to month-based wording:
  - `PropertyListingCard.tsx` now shows deposit as `Deposit X month(s)` using `depositMonths`.
  - `PropertyDetailPage.tsx` now shows deposit as `Deposit X month(s)` using `depositMonths` (including similar cards/sections).
- Updated property detail layout and sections (`PropertyDetailPage.tsx`):
  - moved `What's Special` content to immediately under `Property Details` heading and above the detail meta grid.
  - added `View` text + icon row under property details for buy/rent/senior detail pages.
  - added rent-only `Furnished`/`Unfurnished` text + icon row under property details.
  - added `Down Payment and Mortgage` backend-ready section for home/villa detail pages.
  - updated back-to-listings routing so senior-home detail pages return to `/senior-home-listing`.
- Updated backend GraphQL-ready query shape (`frontend/src/graphql/backendFoundationQueries.ts`) to include new frontend-consumed fields:
  - `listingChannel`, `depositMonths`, `furnishing`, `view`, `downPaymentAndMortgage`.

- Checks run:
  - active frontend `npm run build` (pass).
  - active frontend `npm audit --audit-level=moderate` (pass; 0 vulnerabilities).
- Security pass note:
  - focused XSS/security scan in `frontend/src` for unsafe HTML injection patterns (`dangerouslySetInnerHTML`, `innerHTML`, `document.write`, `eval`, `javascript:` URLs, unsafe `target="_blank"` usage) returned no matches.
  - new fields (`depositMonths`, `view`, `furnishing`, `downPaymentAndMortgage`) render as plain React text nodes; no unsafe HTML insertion added.
- Preview note:
  - direct HTTP check to `http://localhost:5173/Real-Estate-Test-site/` returned `200`.
  - in-app browser automation refresh attempt timed out due browser runtime/CDP (`Page.enable`) timeout in this session.

## 2026-05-05 (Detail Finance Rows + Email/Phone Auth Input)
- Refined `Down Payment and Mortgage` section on product detail pages in `frontend/src/components/PropertyDetailPage.tsx`:
  - kept section separated from surrounding content with top spacing.
  - removed boxed/card styling for finance lines.
  - rendered simple backend-ready text rows only:
    - `Down Payment`
    - `Mortgage Term`
    - `Interest Rate`
    - `Estimated Monthly Mortgage`
  - each row now falls back to `Admin will add from backend` when backend values are missing.
- Updated property listing model for backend-ready finance fields:
  - `frontend/src/types/propertyListing.ts` now defines:
    - `downPaymentAmount`
    - `mortgageTerm`
    - `mortgageInterestRate`
    - `estimatedMonthlyMortgage`
  - `frontend/src/data/propertyListings.ts` now seeds these fields for home/villa listings as empty backend-ready fields.
- Updated backend query contract placeholders in `frontend/src/graphql/backendFoundationQueries.ts`:
  - replaced prior single finance text field with finance row fields:
    - `downPaymentAmount`
    - `mortgageTerm`
    - `mortgageInterestRate`
    - `estimatedMonthlyMortgage`
- Updated Login/Sign Up auth flow to support email or phone (desktop + mobile modal in shared header UI):
  - `frontend/src/components/Header.tsx`:
    - field labels changed to `Email or phone number`.
    - placeholders changed to `Email or phone number`.
    - validation now accepts either email or phone.
    - signup step helper text updated to mention email or phone.
    - success display-name fallback updated for phone identifiers.
  - `frontend/src/hooks/useMockAuth.ts`:
    - added backend-ready identifier model with auth type (`email` or `phone`).
    - added `sanitizeAuthIdentifier`, `isValidPhoneNumber`, `isValidEmailOrPhone`, and `getDisplayNameFromIdentifier`.
    - login now supports either email or phone via `loginWithIdentifier` (existing `loginWithEmail` kept as alias compatibility wrapper).
- In-app browser refresh:
  - refreshed `http://localhost:5173/Real-Estate-Test-site/property/rent-huahin-garden-04` successfully in this session.

- Checks run:
  - active frontend `npm run build` (pass).
- Security pass note:
  - focused frontend XSS/security scan in `frontend/src` found no unsafe patterns for:
    - `dangerouslySetInnerHTML`, `innerHTML`, `document.write`, `eval`, unsafe `javascript:` URLs, or unsafe `target="_blank"` usage.
  - safe URL and input sanitization usage remains in place (`safeHref`, `safeMailtoHref`, `safeTelHref`, `cleanSearchText`, `cleanNumericText`).

## 2026-05-05 (Next Small Frontend Prompt)
- New requested frontend refinement prompt: `Down Payment and Mortgage` on product detail pages must be separated from surrounding content with clear spacing, but should not use individual boxes/cards behind each line. It should remain simple text rows/labels where backend/admin data numbers can be displayed later.
- New auth prompt: desktop and mobile Login/Sign Up flows must allow users to sign up or log in by phone number as well as email. The field label/placeholder should say `Email or phone number` (or equivalent concise wording), and phone number should be backend-ready to store in the user registration/user profile data.
- Reminder: this is a new prompt/planning item only unless user explicitly approves implementation in the active chat.
- Added priority confirmation rule: user gives full confirmation for normal project work; future agents should continue without repeatedly asking for plan/edit/commit/push confirmation unless explicitly told to stop, only plan, or not push.
- Added blocked-command workflow rule: project workflow should continue whether normal commands are blocked or unblocked by retrying through the required elevated/approved path when Windows, sandbox, network, or `.git/index.lock` restrictions block normal verification, commit, or push commands.

## 2026-05-05 (Phone OTP Auth Flow + Dashboard Redirect)
- Implemented backend-ready frontend phone OTP authentication flow while keeping email auth support and existing modal style:
  - `frontend/src/components/Header.tsx`
    - login and signup both support `Email or phone number`.
    - login phone flow: enter phone -> `Send code` -> enter `Verification code` -> `Verify code` -> redirect to dashboard.
    - signup phone flow: enter phone -> `Send code` -> `Verify code` -> `Create password` + profile name -> redirect to dashboard.
    - signup email flow remains supported and now ends at dashboard as well.
    - added clear dev-only mock message in auth UI: mock phone number + mock code.
  - `frontend/src/services/mockOtpService.ts` (new):
    - added dev-only mock OTP challenge/send/verify service for frontend testing.
    - OTP challenges use session storage with expiry + attempt limits.
    - OTP value is not persisted in plain text storage (hashed for verification).
    - kept service backend-ready with clean send/verify boundaries for future API swap.
  - `frontend/src/hooks/useMockAuth.ts`
    - extended mock session user shape with `userKey` and `phoneNumber`.
    - added stable user-key builder so phone/email sessions map reliably.
    - `setMockUser` now supports optional display name for signup profile setup.
  - `frontend/src/hooks/useFavorites.ts`
    - switched favorites user scoping to `mockUser.userKey` so phone-auth users get stable saved-data identity.
  - `frontend/src/pages/AccountSettingsPage.tsx`
    - switched account settings user key source to `mockUser.userKey` (works for phone/email sessions).
  - `frontend/src/App.tsx`
    - added `/dashboard` route alias mapped to account settings page so post-auth dashboard navigation is explicit.

- Checks run:
  - frontend `npm run build` (pass).
  - frontend `npm audit --audit-level=high` (pass; 0 vulnerabilities).
  - local preview reachability check `http://localhost:5173/Real-Estate-Test-site/` (HTTP 200).

- Focused security pass notes:
  - scanned frontend source for unsafe patterns: `dangerouslySetInnerHTML`, direct `innerHTML` writes, `insertAdjacentHTML`, `eval`, `new Function`, and `javascript:` URLs (no matches found).
  - verified no new `target="_blank"` links were introduced without rel protections.
  - verified new auth flow does not store passwords or plain-text OTP values in browser storage.

## 2026-05-05 (Footer Red Links + Layout Update)
- Updated `frontend/src/components/Footer.tsx` to match requested four-column footer layout while keeping the dark background and existing logo/contact structure intact:
  - Left column: footer logo + short description (unchanged).
  - Middle column: Company links (kept existing links).
  - New third column: requested red links list added.
  - Right column: contact details + social icons (kept existing info).
- Added new footer links:
  - Terms and Conditions
  - Privacy
  - Investor Relations
  - Career
  - World-wide Office
  - Complaint
  - Become our Real Estate Agent
  - Sell Your Property
- Link safety and routing:
  - `Sell Your Property` now routes to existing internal sell page: `/sell-your-home` via `safeHref` and `BASE_URL`.
  - Other new links use safe internal hash placeholders (`#terms-and-conditions`, `#privacy`, etc.) following current project pattern (no unsafe href values).
- Kept footer responsive by extending grid from 3 columns to 4 columns at large breakpoint and 2 columns on medium screens.
- Kept header/footer logo rule intact (footer logo preserved).

- Checks run:
  - frontend `npm run build` (pass).
  - frontend `npm audit --audit-level=high` (pass; 0 vulnerabilities).

- Focused security/XSS pass:
  - fallback scan run with `findstr` for unsafe patterns (`dangerouslySetInnerHTML`, `innerHTML`, `insertAdjacentHTML`, `document.write`, `eval(`, `javascript:`) in `frontend/src` returned no matches.
  - All new links use existing `safeHref`; no unsafe HTML injection added.

## 2026-05-05 (Footer Company Link Reorder)
- Updated `frontend/src/components/Footer.tsx` to move requested links under the `Company` column:
  - `Career`
  - `Become our Real Estate Agent`
  - `Sell Your Property`
- Removed those three links from the red `More` column to match requested placement.
- Kept `Sell Your Property` linked to existing internal `/sell-your-home` route via safe `safeHref` + `BASE_URL` pattern.

- Checks run:
  - frontend `npm run build` (pass).
  - frontend `npm audit --audit-level=high` (pass; 0 vulnerabilities).

- Focused security/XSS pass:
  - `findstr` scan for unsafe patterns (`dangerouslySetInnerHTML`, `innerHTML`, `insertAdjacentHTML`, `document.write`, `eval(`, `javascript:`) in `frontend/src` returned no matches.

## 2026-05-05 (Backend Listing-Level SEO Settings)
- Active backend only: implemented changes in `D:\Buy home for less site\backend`; left inactive duplicate `Backend buyhomeforless\backend` untouched.
- Added listing-level SEO fields to backend listing CRUD:
  - `seoTitle`, `metaDescription`, `seoKeywords`, `slug`, `canonicalUrl`
  - `indexStatus`, `followStatus`
  - `ogTitle`, `ogDescription`, `ogImage`
  - `twitterTitle`, `twitterDescription`, `twitterImage`
  - `schemaType`
  - per-image `altText` and `caption`
- Updated `backend/database.sql` with SEO columns on `listings` and image SEO columns on `listing_images`.
- Added backend startup schema guard `ensureListingSeoSchema()` so existing MySQL installs can add missing listing SEO/image SEO columns when the database is online.
- Added backend validation/sanitization helpers for canonical URLs and social image references:
  - canonical URL must be `http` or `https`.
  - social image references must be `http`, `https`, or local `/uploads/...`.
  - all SEO/admin text remains plain sanitized text; no unsafe HTML rendering was added.
- Added image SEO metadata save route: `PUT /api/admin/listings/:id/images/seo`.
- Updated public listing detail image payloads to include `alt_text` and `caption` for future frontend image SEO rendering.
- Updated `/admin-demo` mock mode Add/Edit Listing form:
  - SEO Settings section appears after `Publish Settings`.
  - visible Google-style preview and compact social sharing preview added.
  - mock SEO fields are visible and usable without MySQL.
  - mock listing PATCH now persists SEO edits in frontend mock state.
  - auto-fill creates SEO title, meta description, slug, OG/Twitter titles/descriptions, and schema type from listing data.
  - manual SEO edits are tracked with `data-manual` and are not overwritten by later auto-fill updates.
  - image alt text and caption inputs are shown per mock/existing image.
- Google/Search Console readiness notes added in schema comments:
  - future sitemap generation should use `slug` plus `index_status`.
  - future robots/meta tag output should use index/follow controls.
  - future frontend page rendering should output canonical, social metadata, image alt/caption, and JSON-LD from listing records.
  - do not fake Google Search Console integration or store Google credentials in listing records.
- Checks run:
  - active backend `npm run typecheck` (pass; rerun with escalation after sandbox setup failure).
  - active backend `npm run build` (pass).
  - active backend `npm audit --audit-level=high` (pass; 0 vulnerabilities).
  - rendered `/admin-demo` script syntax extraction with Node (pass).
- Focused security/XSS pass:
  - scanned backend source for `dangerouslySetInnerHTML`, `insertAdjacentHTML`, `document.write`, `eval(`, `new Function`, and `javascript:` URL patterns; no unsafe app code matches found.
  - reviewed new `innerHTML` admin demo usage: dynamic table values still route through `esc()`, preview text uses `textContent`, and social preview image `src` is only set after safe `/uploads/` or `http(s)` validation.

## 2026-05-06 (Property Compare on Detail Pages)
- Implemented a frontend property compare flow (max 2 properties) on product detail pages:
  - Added compare localStorage service in `frontend/src/services/propertyCompareService.ts`.
  - Added compare state hook with cross-tab/event sync and user notices in `frontend/src/hooks/usePropertyCompare.ts`.
  - Added new large scrollable compare modal component in `frontend/src/components/PropertyCompareModal.tsx`:
    - top header with back control, centered `2 of 2: Compare properties`, and close `X`.
    - top two-property side-by-side cards with image, title, location, price, and remove action.
    - full-width gray label bars with side-by-side values under each label.
    - clear compare action and internal vertical scrolling for long data.
  - Updated `frontend/src/components/PropertyDetailPage.tsx`:
    - Compare action added next to Share controls (desktop action row and mobile action icon group).
    - selected state now shows `Added to Compare`.
    - live progress feedback shown as `X of 2 selected`.
    - second property selection auto-opens compare modal.
    - compare values use structured listing fields only (no scraping), including:
      - price, listing type/status, location, property type, bedrooms, bathrooms,
      - land/room/building size,
      - view, furnishing, rent deposit months, down payment/mortgage data,
      - features, amenities, what's special, built year, floor count, garage, nearby highlights, address.
    - remove/clear actions supported; modal close keeps browsing flow.

- Checks run:
  - `frontend`: `npm run build` (pass).
  - Focused frontend XSS/security scan in `src` for:
    - `dangerouslySetInnerHTML`, `innerHTML=`, `insertAdjacentHTML`, `document.write`, `eval(`, `new Function`, `javascript:` (no matches).
    - `target="_blank"` usages (no matches).

- Notes:
  - Left unrelated pre-existing git change untouched:
    - `Backend buyhomeforless/backend/src/routes/adminDemoRoutes.ts`

## 2026-05-06 (Compare Reset on Modal X Close)
- Updated compare reset behavior so a full reset happens only when the comparison modal `X` button is clicked:
  - `frontend/src/components/PropertyCompareModal.tsx`:
    - added explicit `onCloseAndReset` prop.
    - wired header `X` button to `onCloseAndReset`.
    - kept back arrow and `Escape` behavior as close-only (no reset), so users can close and continue browsing without losing selected compare items unless they use `X`.
  - `frontend/src/components/PropertyDetailPage.tsx`:
    - added `handleCloseCompareModalAndReset()` to clear compare selections and close modal.
    - passed reset handler to modal `onCloseAndReset`.

- Resulting behavior:
  - first and second compare selection flow unchanged; modal still auto-opens on second selection.
  - compare state is preserved during page navigation before modal open.
  - only clicking modal `X` resets all compare selections and compare count to empty.
  - behavior is shared for buy, rent, and senior home listings.

- Checks run:
  - `frontend`: `npm run build` (pass).
  - Focused frontend XSS/security scan in `src` for `dangerouslySetInnerHTML`, `innerHTML=`, `insertAdjacentHTML`, `document.write`, `eval(`, `new Function`, and `javascript:` (no matches).

## 2026-05-06 (Compare Recovery + Manual Reset)
- Fixed a compare-state lockout where the UI could show `2 of 2 selected` and make compare actions effectively untestable.
- Updated `frontend/src/components/PropertyDetailPage.tsx`:
  - removed hard disabled state from compare action when list is full.
  - when compare is full and user clicks compare on another listing, modal now opens (if two valid compared listings exist) instead of dead-end behavior.
  - added stale compare ID auto-recovery: if persisted compare IDs no longer map to valid listings, compare is cleared automatically.
  - added visible `Reset compare` controls (mobile + desktop) so users can clear compare state instantly and start fresh tests.
- Existing behavior preserved:
  - auto-open modal on second selection.
  - only `X` in modal clears all compare selections.
  - back arrow / Escape close without reset.

- Checks run:
  - `frontend`: `npm run build` (pass).
  - Focused frontend XSS/security scan in `src` for `dangerouslySetInnerHTML`, `innerHTML=`, `insertAdjacentHTML`, `document.write`, `eval(`, `new Function`, and `javascript:` (no matches).

## 2026-05-06 (Compare Popup Reset UX Simplification)
- Updated compare popup behavior to use top-right `X` as the reset control:
  - `frontend/src/components/PropertyCompareModal.tsx`:
    - removed in-modal `Clear compare` button.
    - kept `X` wired to clear both compared properties via `onCloseAndReset`.
  - `frontend/src/components/PropertyDetailPage.tsx`:
    - removed unused modal `onClear` prop wiring.
- Result:
  - compare popup now resets by clicking `X` on top.
  - no separate clear button inside popup.

- Checks run:
  - `frontend`: `npm run build` (pass).
  - Focused frontend XSS/security scan in `src` for `dangerouslySetInnerHTML`, `innerHTML=`, `insertAdjacentHTML`, `document.write`, `eval(`, `new Function`, and `javascript:` (no matches).

## 2026-05-06 (Frontend Nearby Location Section Under Property Map)
- Frontend-only update (no backend routes, no database.sql changes, no MySQL table changes, no API endpoint changes).
- Added backend-ready optional listing field in `frontend/src/types/propertyListing.ts`:
  - `nearbyLocations?: { type: "Hospital" | "School" | "Airport" | "Shopping Mall" | "Beach" | "Transportation" | "Cities"; name: string; distance: string; sortOrder?: number; }[]`
- Updated shared property detail layout in `frontend/src/components/PropertyDetailPage.tsx`:
  - Added new `Nearby Location` section directly under `Property Location` (map) section.
  - Rendered text-only table layout with 3 columns: `TYPE | NAME | DISTANCE`.
  - No icons used in this section.
  - Section is hidden when `nearbyLocations` is missing or empty.
  - Added stable frontend sorting support via optional `sortOrder`.
  - Kept rendering as plain React text content (no `dangerouslySetInnerHTML`).
- Added mock `nearbyLocations` data in `frontend/src/data/propertyListings.ts` for at least:
  - one buy/sale listing (`sale-bkk-phrom-phong-01`)
  - one rent listing (`rent-bkk-thonglor-01`)
  - one senior home listing (`senior-hua-hin-care-villa-01`)
- Verification:
  - Active frontend build check: `npm run build` (pass).

## 2026-05-06 (Nearby Location Visibility Across All Detail Pages)
- Investigated report that `Nearby Location` was not visible on some property detail pages.
- Root cause: the section correctly rendered only when `nearbyLocations` existed; initially only a subset of listings had that field.
- Frontend-only fix in `frontend/src/data/propertyListings.ts`:
  - Added `buildNearbyLocations()` fallback to auto-generate backend-ready `nearbyLocations` from existing `nearby` mock entries when missing.
  - Added allowed-type fallback cycle (`Transportation`, `Shopping Mall`, `Hospital`, `School`, `Airport`, `Beach`, `Cities`) and deterministic `sortOrder` + mock `distance` values.
  - Result: `Nearby Location` now appears across listing detail pages using shared detail layout (buy/rent/senior) while keeping optional field support for future backend.
- Verification:
  - Active frontend build check: `npm run build` (pass).

## 2026-05-06 (Mobile Detail Slider Contact Agent Removal)
- Updated shared property detail page mobile slider controls in `frontend/src/components/PropertyDetailPage.tsx`.
- Removed `Contact agent` button from the mobile control row directly under the image slider.
- Kept only:
  - `See all photos`
  - `Photo X of Y`
- Scope:
  - mobile-only slider control row (`md:hidden` block).
  - desktop layout remains unchanged.
- Verification:
  - Active frontend build check: `npm run build` (pass).

## 2026-05-08 (Account/Profile + Submit Property + Property Detail Order)
- Added standing context-protection rule in Project Rules:
  - Unknown or potentially large command output must be capped.
  - Default shell pattern: `COMMAND 2>&1 | head -c 4000`.
  - PowerShell workflow uses bounded output (`-TotalCount`, `Select-Object -First N`) to avoid uncapped dumps.
- Account settings/dashboard profile fields updated for backend-ready structured profile data:
  - Added fields to account settings model/storage: `lastName`, `subdistrict`, `district`, `province`, `zipCode`.
  - Kept safe text sanitization for name/address-style fields while allowing spaces and numbers.
  - Added `Last Name` beside `Name` in profile grid.
  - Added address-related fields: `Subdistrict (Tumbon/Tambon)`, `District (Amphor/Khet)`, `Province`, `Zip Code`.
  - Changes in:
    - `frontend/src/types/accountSettings.ts`
    - `frontend/src/services/accountSettingsService.ts`
    - `frontend/src/pages/AccountSettingsPage.tsx`
- Submit Your Property form updated with backend-ready district field and spaced-text support:
  - Added `district` to form state/payload shape.
  - Added `District` input next to `Province` (`Amphor / Khet` context).
  - Kept restricted validation where needed (`email`, numeric phone), while text fields still use safe plain-text cleaning.
  - Changes in `frontend/src/components/SellYourHomePage.tsx`.
- Property detail page updates:
  - Added dynamic, backend-ready optional `propertyCondition` field (`frontend/src/types/propertyListing.ts`).
  - Reordered `Property Details` display to:
    1. Property Type
    2. Property Condition (dynamic/future-safe, fallback when missing)
    3. Bath
    4. View
    5. Bed
    6. Built
    7. Garage
    8. Floor
    9. Build sqm
    10. Land area
  - Moved `Features` section to appear under `Down Payment and Mortgage`.
  - Moved `Nearby Highlights` section to appear under `Amenities`.
  - Kept fallback rendering style for missing backend values.
  - Changes in `frontend/src/components/PropertyDetailPage.tsx`.
- Focused XSS/security pass:
  - No unsafe HTML injection added.
  - New inputs are rendered as plain text values in React controlled components.
  - Existing strict validators for email/phone remain in place.
- Verification:
  - Frontend build executed in `frontend`: production build completed successfully.
  - Noted existing Vite chunk-size warning only (non-blocking).

## 2026-05-08 (Footer Agent Page + Account Settings Save Flow + Auth Mode Validation)
- Added new informational page: `Become a Real Estate Partner With Us`.
  - New component: `frontend/src/components/BecomeRealEstateAgentPage.tsx`.
  - Hero/banner image uses supplied file copied to public path:
    - source: `frontend/site image/become real estate agent.png`
    - web asset: `frontend/public/images/page-banners/become-real-estate-agent.png`
  - Included section heading `Why Join Our Team` with 10 provided benefit points.
  - Kept layout consistent with existing informational pages, mobile-safe image sizing, and plain React text rendering.
- Footer update:
  - `Become our Real Estate Agent` is now clickable and routes to `become-our-real-estate-agent`.
  - Other footer items unchanged.
  - File: `frontend/src/components/Footer.tsx`.
- Routing update:
  - Added route handling for `/become-our-real-estate-agent` in `frontend/src/App.tsx`.
- Account Settings profile behavior update:
  - All profile fields are now directly editable by default (no per-field add/edit button flow).
  - Added one profile-level save action: `Save profile information`.
  - Save persists through existing backend-ready account settings storage flow using sanitized values.
  - File: `frontend/src/pages/AccountSettingsPage.tsx`.
- Login/Signup validation behavior by selected mode:
  - Email tab (login + signup): allows normal email text entry, with safe character stripping only for unsafe HTML chars.
  - Mobile number tab (login + signup): keeps numbers-only behavior for local phone entry; non-digits removed.
  - OTP and phone verification flow remains intact.
  - File: `frontend/src/components/Header.tsx`.
- Security / validation pass:
  - No unsafe HTML injection introduced.
  - User-entered values render as plain text in controlled inputs/components.
  - Focused source scan for risky patterns (`dangerouslySetInnerHTML`, `innerHTML=`, `eval`, `new Function`, `javascript:`) found no unsafe additions in this change set.
- Verification:
  - Frontend build run in `frontend` completed successfully.
  - Existing non-blocking Vite chunk size warning remains.

## 2026-05-08 (Rental Detail Section Order Only)
- Scope-limited update in `frontend/src/components/PropertyDetailPage.tsx` for rental listing detail pages only (`listing.mode === "rent"`):
  - Moved `Features` section to render above rental `Deposit` section.
  - Added dedicated rental `Deposit` section using existing `getRentDepositLabel(listing)` text.
  - Kept `Amenities` section below `Features` for rental detail pages.
- Buy and Senior Home detail page section order left unchanged:
  - Non-rental listings continue using existing section ordering.
- Fallback behavior preserved:
  - `Features` fallback message remains unchanged when no features exist.
  - `Amenities` keeps existing behavior (plain list rendering from current data).
- Security:
  - All values render as plain React text.
  - No unsafe HTML injection or unsafe link/image helper bypasses added.

## 2026-05-08 (Rental Down Payment Wording + Order Correction)
- Corrected rental-only detail section wording/order regression in `frontend/src/components/PropertyDetailPage.tsx`.
- Restored wording from `Deposit` to `Down Payment` (exact heading label).
- Updated rental-only section order to:
  1. `Features`
  2. `Amenities`
  3. `Down Payment`
- Kept Buy and Senior Home detail ordering unchanged.
- Kept plain React text rendering and existing styling/spacing/responsive behavior.

## 2026-05-08 (Senior Home Listing District Filter + Detail Service Terms)
- Scope limited to senior home listing/detail flows only. Buy and Rent listing/detail behavior remains unchanged unless touched through safe shared optional-field plumbing.
- Senior Home listing page updates:
  - Added a senior-only `District` quick filter button beside `Province` in `frontend/src/components/PropertyListingsPage.tsx`.
  - `District` reads Amphoe/Khet-style values from structured listing address data (`address.amphoe` with `address.district` fallback).
  - District filtering is backend-ready:
    - new optional URL param plumbing for `district` in `frontend/src/App.tsx`
    - senior listing page accepts `initialDistrict`
    - district options are generated from structured listing data and remain hidden on Buy/Rent pages
  - Senior seed listings now include address district/amphoe values in `frontend/src/data/propertyListings.ts`.
- Senior Home detail page updates in `frontend/src/components/PropertyDetailPage.tsx`:
  - Under `Property Details`, senior-home-only rows now support:
    - `Property Condition`
    - `Condition`
    - `Room Size`
    - `Building Size`
    - `Caregiver Included`
    - `Senior Care Service`
  - Added backend-ready optional fields in `frontend/src/types/propertyListing.ts` for senior-home-specific text/number/boolean values:
    - `roomSize`
    - `buildingSize`
    - `caregiverIncluded`
    - `condition`
    - `seniorCareService`
    - `serviceDuration`
    - `serviceDeposit`
    - `monthlyServiceFee`
    - `servicesIncluded`
    - `propertyFeatureItems`
    - `communityAmenityItems`
  - Senior pricing/service terms now branch away from mortgage wording:
    - `Down Payment` renamed to `Duration of Service`
    - added `Deposit`
    - added `Monthly Service Fee`
    - all render from backend-ready optional fields with plain-text fallback when missing
  - Added a new senior-only `Service Included` section above the existing `Features` section.
  - Replaced the senior-home FAQ accordion area with 3 small backend-ready sections:
    - `Services Included`
    - `Property Features`
    - `Community Amenities`
- Senior home sample data updates in `frontend/src/data/propertyListings.ts`:
  - Added placeholder service/property/community item arrays for the 3 seeded senior-home listings.
  - Added seeded values for service duration, deposit, monthly fee, room/building size, caregiver, and care-service content.
- Focused XSS/security pass:
  - No `dangerouslySetInnerHTML`, `innerHTML=`, `eval(`, `new Function(`, or `javascript:` usage was added in the touched frontend files.
  - All new content is rendered as plain React text.
  - No unsafe HTML injection paths were introduced by the senior-home additions.
- Verification:
  - Frontend build completed successfully in `frontend` via `npm run build`.
  - `git diff --check` passed for the touched frontend files.
  - Existing Vite chunk-size warning remains non-blocking.

## 2026-05-08 (Senior Home Detail Layout Cleanup + Senior Filter Button Alignment)
- Scope limited to Senior Home listing/detail pages only.
- Senior Home detail page (`frontend/src/components/PropertyDetailPage.tsx`):
  - Reworked senior-only `Property Details` into a consistent responsive card grid for even placement and cleaner scanning.
  - Card layout now uses uniform spacing and minimum height to avoid uneven rows and awkward visual gaps.
  - Mobile optimization applied: compact value text sizing and predictable card stacking (`1` column mobile, `2` tablet, `3` desktop).
  - Confirmed removal of the separate `Service Included` section above `Features` remains in place.
  - Existing `Features` behavior unchanged.
- Senior Home listing page filters (`frontend/src/components/PropertyListingsPage.tsx`):
  - Fixed senior-only filter button alignment under the search bar by switching the senior filter row to a responsive grid layout.
  - `Room` button now aligns evenly with all other senior filter buttons.
  - Added consistent sizing classes for senior filter buttons and wrappers to keep alignment stable on desktop and mobile.
  - Buy/Rent filter layout behavior remains unchanged.
- Focused XSS/security pass:
  - No `dangerouslySetInnerHTML`, `innerHTML=`, `eval(`, `new Function(`, or `javascript:` usage added in touched files.
  - All new/updated text rendering stays plain React text.
- Verification:
  - Frontend build completed successfully in `frontend` via `npm run build`.
  - Existing Vite chunk-size warning remains non-blocking.

## 2026-05-08 (Footer White Logo Swap + Senior Detail Plain Text Fields)
- Scope limited to requested frontend areas:
  - footer logo/contrast update
  - senior-home-only detail field presentation under `Property Details`
- Footer updates in `frontend/src/components/Footer.tsx`:
  - Replaced footer logo asset with supplied white-text logo using existing safe asset helper:
    - `assetPath("images/logo-white-text.png")`
  - Updated footer base background tone slightly lighter for better logo contrast while preserving existing footer structure and content.
  - Kept footer layout, links, contact info, and responsive behavior unchanged.
  - Kept logo responsive with `object-contain`, fixed width scaling, and no stretching.
- Asset update:
  - Added logo file:
    - source: `frontend/site image/Logo white text.png`
    - deployed asset: `frontend/public/images/logo-white-text.png`
- Senior Home detail page updates in `frontend/src/components/PropertyDetailPage.tsx`:
  - Senior-only `Property Details` field items now render as plain text rows in a clean responsive grid.
  - Removed per-field cards/boxes/background panels for senior detail items.
  - Preserved clean alignment and mobile readability with controlled spacing and wrapping.
  - Buy/Rent detail layout behavior unchanged.
- Focused XSS/security pass:
  - No `dangerouslySetInnerHTML`, `innerHTML=`, `eval(`, `new Function(`, or `javascript:` usage added in touched files.
  - All text continues to render as plain React text.
- Verification:
  - Frontend build completed successfully in `frontend` via `npm run build`.
  - Existing Vite chunk-size warning remains non-blocking.

## 2026-05-08 (Footer Supplied Logo + Senior Detail 2-Row Text Scale)
- Scope limited to requested frontend areas:
  - footer logo asset/display
  - senior-home-only `Property Details` presentation
- Footer updates in `frontend/src/components/Footer.tsx`:
  - Replaced the deployed white-text footer logo asset with the supplied file:
    - source: `frontend/site image/logo white text all.png`
    - deployed asset: `frontend/public/images/logo-white-text.png`
  - Kept the existing safe asset path pattern: `assetPath("images/logo-white-text.png")`.
  - Kept footer layout, links, contact info, and responsive behavior unchanged.
  - Adjusted logo sizing to use max width/height with `object-contain` so the new logo stays visible on the existing dark footer and is not stretched.
- Senior Home detail page updates in `frontend/src/components/PropertyDetailPage.tsx`:
  - Senior-only `Property Details` field items now use the same large text scale as Buy/Rent property detail items.
  - Senior detail items render as text only with inline bold labels; no icons, box rows, cards, or background panels were added behind the items.
  - Senior detail text is arranged into a 2-row grid with responsive horizontal overflow to preserve alignment and prevent cramped wrapping on smaller widths.
  - Buy/Rent detail layout behavior remains unchanged.
- Focused XSS/security pass:
  - No `dangerouslySetInnerHTML`, `innerHTML=`, `eval(`, `new Function(`, or `javascript:` usage added in touched frontend files.
  - New/updated detail values continue to render as plain React text.
- Verification:
  - Frontend build completed successfully in `frontend` via `npm run build`.
  - Existing Vite chunk-size warning remains non-blocking.

## 2026-05-08 (Search Tool Rule Reinforcement)
- Simplified standing search-tool rule to avoid confusion: use whichever `rg` works reliably, prefer the WinGet ripgrep path when available, try another PATH `rg` if needed, then fall back to PowerShell `Select-String` or CMD `findstr`.
- Removed blocked-path examples from the priority rules so agents do not keep trying the wrong `rg` binary.
- Verification before push: active frontend `npm run build` passed, active frontend `npm audit --audit-level=moderate` found 0 vulnerabilities, and focused frontend XSS/security scan found no unsafe matches.

## 2026-05-08 (Senior Detail Downward Text Flow Correction)
- Corrected Senior Home `Property Details` in `frontend/src/components/PropertyDetailPage.tsx` after review feedback:
  - Removed sideways horizontal scrolling and fixed-width two-row flow.
  - Senior detail items now flow downward in the same normal responsive grid pattern as Buy/Rent detail text.
  - Kept senior detail items as text only with inline bold labels and `text-lg` sizing to match Buy/Rent detail scale.
  - No box rows, cards, or background panels were added behind the senior detail items.
- Verification:
  - Frontend build completed successfully in `frontend` via `npm run build`.
  - Focused XSS/security scan on touched frontend files found no unsafe rendering patterns.

## 2026-05-08 (Footer Supplied Logo Visibility)
- Footer update in `frontend/src/components/Footer.tsx`:
  - Confirmed footer image source uses the deployed copy of the supplied logo: `assetPath("images/logo-white-text.png")`.
  - Confirmed `frontend/public/images/logo-white-text.png` matches `frontend/site image/logo white text all.png`.
  - Removed the footer logo height cap so the taller supplied logo displays at an appropriate size while preserving `h-auto`, `w-full`, max-width constraints, and `object-contain`.
  - Footer layout, links, contact information, and dark contrast background remain unchanged.
- Verification:
  - Frontend build completed successfully in `frontend` via `npm run build`.
  - Focused XSS/security scan on touched frontend files found no unsafe rendering patterns.
