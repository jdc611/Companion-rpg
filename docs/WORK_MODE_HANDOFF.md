# Lings — Work Mode Handoff and Implementation Queue

Updated: 2026-11-03
Project: Lings / Ling Universe, original creature-collecting post-apocalyptic Earth RPG
Repository: https://github.com/jdc611/Companion-rpg
Playable build: https://jdc611.github.io/Companion-rpg/
Status: Active development. This file is the canonical queue of tasks delegated to ChatGPT Work, not a claim that any are complete.

## How Work should use this file
1. Read this document and inspect the repository and live game before making changes.
2. Keep approved story, gameplay, and character decisions intact. Do not replace original Lings with the old temporary 'Companions' prototype.
3. Work through tasks in priority order. Make real commits, test the live build and mobile controls, and record actual results.
4. Mark each task as TODO, IN PROGRESS, BLOCKED, or VERIFIED. Never mark VERIFIED without testing.
5. Record commit SHA, live URL, screenshot/test evidence, unresolved issues and next action after each milestone.
6. Prefer incremental, recoverable commits. Do not claim a polished playable game based on concept art alone.
7. If an asset cannot be accessed, document exactly what is missing and how to recover it rather than substituting crude placeholder artwork.

## APPROVED VISUAL QUALITY BAR — 2026-11-04 (highest priority)
Status: APPROVED ART DIRECTION; NOT YET IMPLEMENTED
- The user approved the latest richly detailed pixel-art concept of West Village featuring natural textured grass, irregular dirt roads with scattered stones, layered trees, warm lantern-lit buildings, and a rugged brown-haired survivor with red scarf. This reference is the quality target for **the entire game**, not just the character.
- Retrieve the latest approved concept image from the originating ChatGPT conversation. Do not confuse it with the earlier rough asset sheet or live v2.1 screenshot.
- Build a cohesive pixel-art production style guide: pixel density, scale, perspective, tile size, material palette, lighting direction, shadow/occlusion rules, contrast, animation frame standards, atlas naming, and mobile readability.
- **Terrain**: Replace repeated flat grass and square road tiles with high-detail organic grass, ground variation, natural dirt/road boundaries, stones, flowers, wear and biome transitions. Ensure seamless terrain tiling without obvious repeated patches.
- **Buildings**: Replace flat procedural rectangles with richly detailed structures: roof depth, varied materials, doors, windows, chimneys, signs, ambient lighting and environmental storytelling. The concept illustrates QUALITY, not medieval-only architecture. Preserve post-apocalyptic Earth: salvage, repurposed modern construction, concrete, corrugated metal, remnants of roads and civilization.
- **Vegetation**: Maintain irregular placement, varied species, canopy sizes, clustering, depth sorting, collision and no overlapping shrubs or uniform tree rows.
- **Player/NPCs**: Produce a clean four-direction walking/idle atlas for the approved brown-haired rugged survivor with red scarf, armor and pack; consistent proportions and actual movement. Match NPCs to the same style.
- **Props**: Original matching debris, road signs, salvage piles, lamps, crates, fences, vehicles, and rebuilding materials.
- **Rebuilding states**: Distinct ruined, under-construction and restored artwork for buildings, with visible progression and environmental changes.
- **UX**: Match polished game aesthetic, but keep touch controls usable and text legible on iPhone.
- **Workflow**: First produce one truly polished vertical-slice settlement and short surrounding route, replacing placeholders end-to-end. Test live on iPhone. Only then propagate the art system across the wider map.
- Avoid extracting production sprites from a JPEG screenshot at runtime. Create proper transparent atlases and tiled maps. Current v2.1 is a visual experiment only.
- Acceptance: a screenshot of the playable game, not a mockup, approaches the approved concept in texture richness, depth, character detail, terrain transitions and visual coherence, while preserving responsive gameplay.
- Never claim that a generated scene mockup has been implemented in the live game.

## Priority 0 — Repair art asset pipeline and playable survivor
Status: TODO / BLOCKED ON ASSET TRANSFER
- Locate the generated sprite sheet `lings_survivor_walk_v2.png` from the ChatGPT conversation attachment or working files. Previously available at `/mnt/data/lings_survivor_walk_v2.png` in the originating environment; this path may not persist in Work.
- Upload the actual PNG bytes to `assets/lings_survivor_walk_v2.png` on the default branch. Use Work computer/browser or supported GitHub binary/blob upload. Do NOT upload a text representation under a .png extension.
- Check the sprite sheet dimensions, transparency, cell spacing, frame alignment, and whether it is truly usable. It originated from a generated artwork board and may require recropping, background removal, and manual cleanup.
- The game `index.html` currently attempts `assets/lings_survivor_walk_v2.png` and falls back to `assets/survivor_preview.svg`. Verify whether the PNG exists and whether the loaded asset is actually the desired artwork.
- Build a proper transparent, evenly spaced four-direction sprite atlas (down/left/right/up) with 4+ distinct walking frames per direction and an idle pose. Preserve exact character identity across directions. Adjust source rects and display size in the game to match final atlas.
- Verify real arm/leg motion, feet alignment, animation speed, no sprite clipping, no black rectangular backgrounds, and correct facing on iPhone.
- Remove the rough SVG as primary artwork only after the final sprite works. Keep rollback path.
- Approved visual target: rugged, bearded survivor, dark tousled hair, red scarf, weathered layered metal armor, leather straps, backpack/bedroll, realistic compact proportions; cinematic concept art and pixel gameplay art must depict same person.
- User rejected earlier blob-like hand-built SVG sprites and wants quality approaching the polished pixel-art settlement concept image, NOT an approximation of that screenshot.
Acceptance: live iPhone game renders identifiable polished survivor with genuinely different, consistent walking poses in all four directions.


## Priority 0D — West Village Asset Pack v1 live integration (v2.2)
Status: IN PROGRESS; committed, live mobile QA pending
- User uploaded `assets/west_village_asset_pack_v1.png`; GitHub SHA `f646975c0471d74e332263ffae1352f2b7c84f79`.
- v2.2 code commit `55a1192cf7db9a270e46fe764ff68b1e9206876c` loads the image and uses extracted grass/dirt and building crops, with toggle back to original. The workshop stage uses saved rebuilding state.
- Work: verify crop coordinates against actual PNG; clean dark background around buildings, avoid accidentally including neighboring labels/arrows, fix tile seams and perspective/scale. Ensure visual buildings align with existing collision footprints and doors; preserve working entrances and quest interactions.
- Work: prepare optimized transparent game-ready atlases instead of cropping this presentation board at runtime. Check actual mobile rendering before marking complete.

## Priority 0C — Experimental survivor sprites (v2.0)
Status: IN PROGRESS; committed, mobile visual QA pending
- Added a temporary directional survivor renderer in `assets/visual-upgrade.js` using four pose crops per direction from the concept-art sheet. Wired it into `drawCharacter` in `index.html` at commit `54f0affb55b8404ef23f7d7dae39fcc43a86853b`.
- Work: inspect crop bounds, direction consistency, walk animation frame-to-frame continuity, background removal, player anchor, apparent scale, occlusion and iPhone performance. Concept sheet frames are not validated production animation.
- Replace with a proper cleaned transparent atlas and actual distinct leg/arm walking frames, preserving the rugged survivor design and the reversible art toggle until tested.

## Priority 0B — Experimental art integration QA (v1.9)
Status: IN PROGRESS; code committed, live rendering NOT YET VERIFIED
- Normal chat committed `assets/visual-upgrade.js` and updated `index.html` (commit `1183e3599217cd3c92db03f111c9d808c27adc80`).
- The new module loads `lings-art-preview.html` from the same GitHub Pages site, extracts its embedded reference-board JPEG, crops grass/dirt/tree/bush/flower samples at runtime, and masks near-black backgrounds for objects. This is a temporary experimental proof of concept, NOT a production-ready atlas.
- The game now has an `Art: NEW / Art: ORIGINAL` toggle; keep this rollback mechanism until the new art is verified.
- Work must inspect the live page on iPhone and desktop, verify crop coordinates, transparency halos, sprite scale, repeated tile seams, draw ordering, loading time and performance. Fix any regression.
- Work must replace runtime extraction of a 450KB HTML-embedded JPEG with true transparent optimized PNG/WebP atlases, with consistent tile dimensions, no background/text artifacts, and appropriate tree canopy collision/occlusion.
- Do not claim the sprite quality is production-ready; the goal is a fast visual comparison.

## Priority 1 — Build a polished playable vertical slice
Status: TODO
- Focus on one small settlement, surrounding paths, ruins and wilderness; do not expand the map until art quality is established.
- Replace placeholder environment tiles with coherent detailed pixel-art tiles/props (terrain, roads, walls, roofs, vegetation, signage, camp equipment), consistent scale and perspective.
- Include a few distinct NPCs with appropriate animations, readable dialogue, functional interaction, and matching visual style.
- Preserve smooth movement, collision, camera, D-pad and other touch controls; test in mobile Safari and GitHub Pages.
- Keep performance practical for iPhone, including sprite atlas loading, caching and offline behavior where possible.
Acceptance: polished, visually consistent and playable 5–10-minute area with no placeholder blobs or broken controls.


## Priority 1A — Settlement rebuilding and NPC quest system follow-through
Status: IN PROGRESS (initial code committed; browser QA not yet verified)
- Implemented in normal chat on 2026-11-03: `assets/rebuilding.js` with persistent resources (scrap/timber), Elder Rowan introduction, salvage interactions at Abandoned Vehicle, Collapsed Transit Entrance, Old Highway Sign and Ruins Sign, Tobin workshop repair, Mira beacon repair, and a milestone tracker. `index.html` invokes this system on NPC/object interactions and renders repaired-world decorations.
- Current milestone build: v1.8. Commit: `57421bfa7e8eb6478c575b7d1e24db76b410958a` (quest bug fix), index integration commit `91502b94d337aeaeff5b18acd8f5b871467e7f14`.
- Work: verify actual live deployment, inspect JavaScript console, test quest completion and save persistence on iPhone Safari, ensure all scavenging objects can be reached and interacted with, test repairs in both orders, and ensure no conflict with door interactions or NPC walking.
- Work: upgrade basic repair overlays to proper art-backed before/after building states; add construction animations and visible settlement growth after repair. Do not replace approved survivor art.
- Work: build data-driven quest scripting and a journal for branching dialogue, dependencies, choice consequences, objective markers, quest reward/claim states, and migrations of saved progress.
- Work: design a bounded first-settlement economy and gradual population changes; don't treat prototype numbers or names as final canon.
- Work: add automated smoke tests and an on-device QA checklist for quests, movement, interiors, save/load and UI.
Acceptance: four milestones can be completed in live mobile gameplay, repairs visibly persist, and there are no progression softlocks.

## Priority 2 — Reliable asset-production workflow
Status: TODO
- Establish reproducible image-generation -> clean transparent assets -> sprite atlas -> GitHub commit -> browser verification workflow.
- Store source assets and processed game assets separately, with clear filenames and documented atlas metadata (dimensions, rows, columns, frame rate, anchors).
- Check copyright/originality and keep character designs consistent between portraits, cutscenes and sprites.
- Add a simple preview/test page to cycle every sprite frame at native and game scale before integrating it.
- Avoid manual user uploads whenever Work can access the files and repository.

## Priority 3 — Game architecture and persistence
Status: TODO
- Audit current single-file `index.html` structure; refactor carefully into manageable files without breaking the playable build.
- Improve save/load, error handling, asset fallback, mobile UX, and offline installability.
- Establish regression checks for movement, collision, interiors, interactions and saved progress.
- Maintain GitHub Pages deployment and an easy stable playable URL.

## Priority 4 — Ling creature and narrative production
Status: TODO; DESIGN AUTHORITY PRESERVED
- Build creature collection and encounters, companion behavior, progression and story integration only after vertical slice quality is established.
- Eight established Ling families: Bestilings, Draclings, Morphlings, Florlings, Arthlings, Aquilings, Terralings, Spectralings. Avilings is provisional.
- Core myth: The Shattering destroyed the Ling homeworld and devastated Earth; Lings escaped via dimensional passage. Eight surviving Ancients became immortal Council of Guardians, each entrusted with a power fragment. Evil Dracling and Morphling imprisoned the Bestiling Guardian, stole its fragment and caused the Shattering. Game One centers on Earth rebuilding and Bestiling rescue; broader Guardian/Convergence revelation comes later.
- Do not redesign approved individual Guardian anatomy or treat rejected group composites as canonical. Retrieve the full prior design/handoff before creating Guardian assets.
- Earth has compact distinct settlements separated by vast wilderness and reclaimed ruins. Rebuilding must be gradual and player-driven.
- Human faction names Rebuilders, Dominion, Archivists, Purists are working proposals, not final canon.
- Candidate biomes: hopeful valley, bioluminescent wetlands, abandoned metropolis, desert, frozen heights and dimensional rifts. Names provisional.
- Aim for a connected handcrafted world of roughly Kanto-like scope over time; this is a long-term goal, not vertical-slice scope.
- Include higher-resolution cinematic portraits and story illustrations where useful, consistent with in-game characters.

## Non-Work tasks to keep in normal chat
- Creative direction, naming, lore decisions, visual approvals, scope priorities, gameplay tradeoffs and feedback.
- Small GitHub text/code edits that the connected GitHub tools can safely perform.
- Reviewing screenshots and giving specific feedback before committing to a style.

## Current technical state (verify; do not assume)
- Repo: `jdc611/Companion-rpg`; the repo name is a legacy placeholder, game is Lings.
- Latest code version in conversation: v1.7, committed to `index.html` with PNG loading path and SVG fallback.
- Current source atlas crop code previously assumed 4 columns x 4 rows, each cell 96x112; confirm actual dimensions of new PNG before trusting those crop values.
- Prior concept art screenshot and illustrated survivor character board exist in the originating ChatGPT conversation. They are design references, not game-ready atlases.
- User uses an iPhone and wants implementation handled by assistant/Work without needing to code or buy Replit.

## Execution log
| Date | Task | Status | Evidence / Next step |
|---|---|---|---|
| 2026-11-03 | Create persistent Work handoff | DONE | This file |
| 2026-11-03 | Integrate detailed survivor PNG | BLOCKED | Upload/verify image asset; game currently has fallback |
| 2026-11-03 | Polished vertical slice | TODO | Begin after protagonist sprite is verified |
| 2026-11-03 | Rebuilding and NPC quest prototype | IN PROGRESS | v1.8 committed; mobile QA and art upgrades assigned to Work |
| 2026-11-03 | Experimental nature art | IN PROGRESS | v1.9 committed; user visual comparison and Work QA needed |
