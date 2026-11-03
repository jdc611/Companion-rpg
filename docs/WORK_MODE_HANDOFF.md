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

## Priority 1 — Build a polished playable vertical slice
Status: TODO
- Focus on one small settlement, surrounding paths, ruins and wilderness; do not expand the map until art quality is established.
- Replace placeholder environment tiles with coherent detailed pixel-art tiles/props (terrain, roads, walls, roofs, vegetation, signage, camp equipment), consistent scale and perspective.
- Include a few distinct NPCs with appropriate animations, readable dialogue, functional interaction, and matching visual style.
- Preserve smooth movement, collision, camera, D-pad and other touch controls; test in mobile Safari and GitHub Pages.
- Keep performance practical for iPhone, including sprite atlas loading, caching and offline behavior where possible.
Acceptance: polished, visually consistent and playable 5–10-minute area with no placeholder blobs or broken controls.

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
