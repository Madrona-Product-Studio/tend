// Vercel serverless function: turn a spoken garden-walk transcript into a
// structured garden draft (zones -> beds -> plantings + systems + tasks).
//
// Stateless: no database, no auth. It calls Claude with a strict JSON-schema
// output constraint and returns the parsed draft; the client reviews it and
// builds the garden locally (Dexie). Needs ANTHROPIC_API_KEY in the env.
import Anthropic from '@anthropic-ai/sdk';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Default per Anthropic guidance; override with WALK_MODEL (e.g. claude-sonnet-4-6)
// to trade cost for the same task without a code change.
const MODEL = process.env.WALK_MODEL || 'claude-opus-4-8';
const MAX_TRANSCRIPT_CHARS = 40_000;

const CROP_CATEGORIES = [
  'brassica', 'fruiting', 'root', 'allium', 'herb', 'legume',
  'leafy', 'cucurbit', 'fruit-tree', 'berry', 'other',
];
const BED_TYPES = ['vigo-wicking', 'vigo', 'aluminum-raised', 'greenhouse', 'container', 'in-ground'];
const SUN = ['full-sun', 'partial-shade', 'shade', 'unknown'];

// Strict structured-output schema: every property is required; optionals are
// expressed as nullable types (structured outputs disallows partial objects).
// Nullability is expressed with anyOf (not a ['string','null'] union type): the
// structured-outputs validator requires each enum value to match a single
// declared type, so a nullable enum must be {enum-of-strings} OR {null}.
const nullableEnum = (values: string[]) => ({ anyOf: [{ type: 'string', enum: values }, { type: 'null' }] });
const nullableString = { anyOf: [{ type: 'string' }, { type: 'null' }] };

const GARDEN_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    gardenName: nullableString,
    zones: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          name: { type: 'string' },
          description: nullableString,
          sunExposure: nullableEnum(SUN),
          beds: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                name: { type: 'string' },
                type: nullableEnum(BED_TYPES),
                typeDetail: nullableString,
                plants: {
                  type: 'array',
                  items: {
                    type: 'object',
                    additionalProperties: false,
                    properties: {
                      name: { type: 'string' },
                      variety: nullableString,
                      cropCategory: nullableEnum(CROP_CATEGORIES),
                      note: nullableString,
                      issue: nullableString,
                    },
                    required: ['name', 'variety', 'cropCategory', 'note', 'issue'],
                  },
                },
                hasReservoir: { type: 'boolean' },
                irrigation: nullableEnum(['emitters', 'misters', 'soaker']),
                cover: nullableEnum(['heat', 'mesh-shade']),
                hasSensor: { type: 'boolean' },
              },
              required: ['name', 'type', 'typeDetail', 'plants', 'hasReservoir', 'irrigation', 'cover', 'hasSensor'],
            },
          },
        },
        required: ['name', 'description', 'sunExposure', 'beds'],
      },
    },
    tasks: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: { text: { type: 'string' }, bed: nullableString },
        required: ['text', 'bed'],
      },
    },
  },
  required: ['gardenName', 'zones', 'tasks'],
} as const;

const SYSTEM = `You turn a home gardener's spoken garden walkthrough into a structured garden.

The person walks their garden and talks through it, area by area, bed by bed. Extract:
- ZONES: distinct areas they describe (a bed row, the greenhouse side, the patio, fences/edges). Give each a short name. Set sunExposure only if they say it; otherwise "unknown".
- BEDS within each zone: name each bed (use what they call it, or a sensible short name like "Tomato bed"). Set type only if clearly stated or obvious (a "Vigo wicking bed", "aluminum raised bed", "greenhouse", "container", "in-ground"); else null. Put any extra descriptor in typeDetail.
- PLANTS in each bed: name, and variety if given. Set cropCategory to your best classification. Capture a neutral note (e.g. "transplanted", "volunteer") in note, and any problem (e.g. "bolted", "mold", "didn't fruit") in issue.
- SYSTEMS per bed, only if they mention them: hasReservoir (a wicking bed with a water reservoir), irrigation kind (drip emitters / misters / soaker), a cover (heat cover, or mesh/shade), hasSensor (a temp/humidity sensor).
- TASKS: any to-dos, fixes, or "I need to..." they mention. Attach to a bed name if clear.

Rules:
- Extract only what they actually say. Do NOT invent plants, beds, systems, or readings. Leave anything unstated null/false.
- Do NOT fabricate live sensor values or reservoir levels — those are captured later; only note that the hardware exists.
- If they ramble, correct themselves, or go back to a bed, reconcile it into one coherent structure.`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: 'Garden walk is not configured yet (missing API key).' });
  }

  const transcript = typeof req.body?.transcript === 'string' ? req.body.transcript.trim() : '';
  if (!transcript) return res.status(400).json({ error: 'Provide a transcript.' });
  if (transcript.length > MAX_TRANSCRIPT_CHARS) {
    return res.status(413).json({ error: `Transcript is too long (max ${MAX_TRANSCRIPT_CHARS.toLocaleString()} characters).` });
  }

  try {
    const client = new Anthropic();
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 16_000,
      system: SYSTEM,
      output_config: { format: { type: 'json_schema', name: 'garden', schema: GARDEN_SCHEMA } },
      messages: [{ role: 'user', content: transcript }],
    });

    const text = response.content.find((b): b is Anthropic.TextBlock => b.type === 'text')?.text;
    if (!text) return res.status(422).json({ error: "Couldn't read the walkthrough. Try again." });

    // Structured outputs guarantees schema-valid JSON in the text block.
    const draft = JSON.parse(text);
    return res.status(200).json({ draft });
  } catch (err) {
    if (err instanceof Anthropic.APIError) {
      console.error('parse-walk Anthropic error', err.status, err.message);
      return res.status(502).json({ error: 'The garden parser had trouble. Please try again.' });
    }
    console.error('parse-walk error', err);
    return res.status(500).json({ error: 'Something went wrong parsing the walkthrough.' });
  }
}
