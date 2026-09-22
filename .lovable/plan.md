# Animate V(D)J randomization

## Changes
- Give the Randomize button an active spinning state while the shuffle runs.
- Briefly cycle the V, D, and J selections through candidate segments before settling on the randomized result.
- Scramble the junction nucleotide string during the same interval, then reveal its final generated sequence.
- Add focused shuffle and settle animations to the affected locus tiles and rearranged exon panel.
- Disable repeated randomization during the short animation and preserve reduced-motion behavior.

## Validation
- Trigger randomization in the live tool and confirm the controls animate, settle correctly, and remain usable on desktop and mobile.
