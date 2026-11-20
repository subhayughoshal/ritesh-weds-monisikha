# Personalised Wedding Invitation Website

A mobile-first, cinematic wedding invitation starter inspired by the supplied Wedvo screen recording. It uses an original layout and CSS-drawn royal entrance/palace motifs rather than copying the reference site's artwork or wording.

## Preview locally

1. Extract the ZIP.
2. Open `index.html` in a modern browser. For the best results, run a local static server from this folder (`python -m http.server 8000`) and visit `http://localhost:8000`.
3. Edit `content.js` to change names, date, invitation copy, story, venue, map link and event details.

## Personalise assets

Replace these files in `assets/` with your own photographs/audio (keep the same filenames):
- `couple-story.svg` — original decorative royal wedding illustration (no couple photographs required)
- `event-wedding.svg`, `event-reception.svg` — event photos/illustrations
- `music.mp3` — music you have permission to use

The story section uses an original illustrated motif, so no couple photographs are required. Add a music file you have permission to use as `assets/music.mp3` to enable the floating player.

## Set the wedding date

In `content.js`, set `weddingDate` to an ISO date-time including timezone, for example:
`weddingDate: "2027-02-14T18:30:00+05:30"`
Then set `dateLabel` to the wording you want displayed, for example `14 FEBRUARY 2027`.

## Notes
- The scratch reveal is a canvas interaction and works with mouse or touch.
- The floating music control starts playback only after a visitor taps it (browser autoplay restrictions).
- The countdown remains inactive until a real wedding date is supplied.
- The design is responsive and intended primarily for phones.


## Current invitation content
This version is pre-filled with the details supplied in the invitation image for Ritesh and Monisikha. The programme contains only Gatraharidra & Marriage Ceremony on 13 December 2026, and Reception & Dinner on 15 December 2026 at Own House, Ketika, with 7 PM onwards shown for the reception. Teen Kirtan and Mehendi are not included.

The countdown is set to the start of 13 December 2026 because the exact ceremony time was not specified. Update `weddingDate` in `content.js` if you later confirm the ceremony start time.

## Suggested background music
A gentle instrumental with sitar, flute and tabla suits the royal invitation. One option is “Indian background music - Lotus Dreams” by Diana_Production_Music on Pixabay. It is listed as free under the Pixabay Content License; download it from the creator page and save the MP3 as `assets/music.mp3`. The website does not hotlink the track. https://pixabay.com/music/india-indian-background-music-lotus-dreams-260415/
