# AI Graphic Designer Engine
> Antigravity replaces your graphic designer — end to end.

---

## What This Does

You describe what you need. Antigravity acts as your Senior Graphic Designer:
- Reads your brand kit and applies it automatically to everything
- Makes creative decisions so you don't have to
- Generates logo concepts, social posts, print layouts, UI mockups
- Gives you a review sheet — you approve or reject
- Scales approved designs to all required formats
- Delivers organised, export-ready files

**Your job:** Fill in a brief and say yes or no.  
**Antigravity's job:** Everything else.

---

## Quick Start

### First time — set up your brand kit

Tell Antigravity (with `design.md` loaded):
> "Read `design.md` and act as my AI Graphic Designer. Let's set up the brand kit."

Antigravity will walk you through it — colours, fonts, logo. Fill in `brand-kit.md` together.

### Start any design project

> "Start a new project called [Project Name]"

Antigravity scaffolds the folder and opens `brief.md` for you.

Or run manually:

```powershell
$name = "my-project"
$base = "C:\Users\HP\.gemini\antigravity\scratch\design-engine\projects\$name"
New-Item -ItemType Directory -Force -Path "$base\refs", "$base\concepts\brand", "$base\concepts\social", "$base\concepts\print", "$base\concepts\ui", "$base\approved", "$base\rejected", "$base\deliverables\brand-identity", "$base\deliverables\social", "$base\deliverables\print", "$base\deliverables\ui"
Copy-Item "templates\design_brief_template.md" -Destination "$base\brief.md"
```

### Trigger any workflow

| You say... | Antigravity does... |
|-----------|-------------------|
| "Create brand identity" | Workflow 1 — Logo + colours + fonts + guidelines |
| "Create social content" | Workflow 2 — On-brand posts in all formats |
| "Design a poster / flyer" | Workflow 3 — Print collateral concept |
| "Design an app screen" | Workflow 4 — UI mockup |
| "Create a mood board" | Workflow 5 — Visual direction reference |
| "Critique this design" | Workflow 6 — Design critique with specific fixes |
| "Scale this to all formats" | Workflow 7 — Size + colourway variations |

---

## Folder Structure

```
design-engine/
├── design.md                        ← Antigravity's designer brain
├── brand-kit.md                     ← Brand colours, fonts, logo — always loaded
├── README.md                        ← You are here
├── assets/
│   ├── logos/                       ← Drop your logo files here
│   ├── fonts/                       ← Font files if not Google Fonts
│   └── colours/                     ← Colour palette exports
├── templates/
│   └── design_brief_template.md     ← Copy this to start a project
└── projects/
    └── [project-name]/
        ├── brief.md                 ← Your project inputs
        ├── refs/                    ← Reference images
        ├── concepts/
        │   ├── brand/               ← Logo / brand concept images
        │   ├── social/              ← Social post concepts
        │   ├── print/               ← Print layout concepts
        │   └── ui/                  ← UI mockup concepts
        ├── approved/                ← Approved concepts
        ├── rejected/                ← Rejected concepts
        ├── review.md                ← You mark ✅ or ❌ here
        └── deliverables/
            ├── brand-identity/      ← Final brand files
            ├── social/              ← Social media files (all sizes)
            ├── print/               ← Print concepts + specs
            └── ui/                  ← UI mockups + component notes
```

---

## How to Activate

Point Antigravity to `design.md` in any conversation:

> **"Read `design-engine/design.md` and act as my AI Graphic Designer. I want to [describe what you need]."**

Or set `design-engine` as your active Antigravity workspace so it's always loaded.

---

## What Antigravity Can Generate

| Deliverable | Tool Used | Cost |
|-------------|----------|------|
| Logo concepts | generate_image (Antigravity) | Free |
| Brand identity sheet | generate_image | Free |
| Social posts (all formats) | generate_image | Free |
| Mood boards | generate_image | Free |
| Print layout concepts | generate_image | Free |
| UI/UX mockups | generate_image | Free |
| Size variations | Python (Pillow) | Free |
| Contact sheets | Python (Pillow) | Free |

> ⚠️ **Note on print production files:** Antigravity generates concept images for approval. For final press-ready files (CMYK PDF with bleed + crop marks), you'll need Figma, Adobe Illustrator, or Canva Pro. Antigravity's output is the visual direction — the production step is quick once the concept is approved.

---

## Requirements

- **Antigravity** — image generation included in your plan
- **Python 3.9+** — optional, for automation scripts
- **Pillow** (`pip install pillow`) — optional, for size variations + contact sheets

---

*AI Graphic Designer Engine v1.0 — built with Antigravity*
