/* ══════════════════════════════════════════════════════════════════════════
   SCENE 2 — THE ENGINE
   ──────────────────────────────────────────────────────────────────────────
   One schematic, pinned, scrubbed over three and a half viewport heights, in
   four phases:

     A  THE PROBLEM    fire-and-forget. Fourteen requests run one wire at one
                       provider, nose to tail, with TOO MANY REQUESTS riding
                       above the train the whole way; the provider answers 429
                       to the first of them and they fall off the wire and die
                       in the order they arrived, the nose already falling
                       while the tail is still flying in. Then the wire itself fails:
                       a segment of the push link flickers, dissolves into a
                       gap with frayed ends, and the next packet teeters on the
                       broken edge and tumbles through it. Nothing retries,
                       because there is nothing to retry with.
     B  THE ABSORBER   the engine draws itself between the app and the
                       providers. The same burst is accepted in 8ms, BUFFERS
                       in a six-slot queue — entering at the tail, stepping
                       forward a slot every time the head departs — and is
                       metered out on an even beat. Ragged in, rhythmic out;
                       that is the whole argument, and the slots are what
                       make it countable.
                       Then a duplicate arrives and is stamped, not sent.
     C  THE ASSURANCE  three failures, three different endings, and they have
                       to read as three different mechanisms:
                         · RETRY — a 429 on a paced packet loops onto the
                           retry rail, waits at 1s, GOES BACK ROUND AND TRIES
                           AGAIN, is refused again, waits at 4s, tries again,
                           and that one is delivered. Wait-then-attempt, never
                           wait-then-wait: a backoff whose attempt is not drawn
                           is three stops on a road, which is a picture of a
                           message being delayed rather than retried.
                         · FAILOVER — a provider goes dark, the packet flies
                           all the way to it, BOUNCES off it, and reroutes
                           along the secondary wire to the next provider. The
                           SAME attempt, walking the provider chain. It never
                           touches the retry rail, because a chain that has
                           another link in it has not failed yet.
                         · PERMANENT — a bad address. The provider is healthy
                           and its box never goes amber; the message is the
                           thing that is wrong. So it does not fail over (the
                           secondary wire greys out as it declines) and it does
                           not retry (it runs the rail past 1s · 4s · 16s
                           without lighting one of them) — it goes straight to
                           the dead-letter siding.
                       Between the second and the third, a packet that runs the
                       whole ladder — 1s, try, 4s, try, 16s, try — and is
                       refused a fourth time has nothing left to wait on, so it
                       rolls off the end of the rail and parks on the siding,
                       in plain sight, still there. The permanent one parks
                       beside it, having attempted exactly once.
     D  THE SCALE      the queue splits into three slotted rails, p0/p1/p2,
                       and one otp overtakes a flood of marketing. Seven
                       events collapse into one envelope. One event fans out
                       to six channels — the junction where it does so is
                       engraved with the name of the pattern — receipts
                       cascade, the camera pulls back, and the receipts travel
                       back up the wires onto a timeline. Then one of those
                       receipts is READ: an "opened" walks off the strip into
                       a two-step workflow, shuts the gate on step 2, and the
                       reminder that was queued behind it never launches.

   THE RULES THIS FILE OBEYS
   ─────────────────────────
   1. ONE timeline, scrubbed. Every beat is a tween of a number. There is not
      a single .call(), .set() or Math.random() inside the scrubbed range, so
      scrolling backwards is scrolling forwards with the sign flipped — the
      scene has no memory and therefore nothing to get wrong.
   2. Every tween is a fromTo with immediateRender:false. A plain .to() records
      its start value the first time it renders, which under a scrub is
      whenever the reader happens to arrive; a fromTo knows both ends before
      anyone scrolls.
   3. CSS paints the FINISHED diagram; restState() pushes it back to the start.
      That inversion is what makes the still fallbacks free — a clone of the
      markup with no JS on it already is the finished figure.
   4. transform, opacity, stroke and drawSVG only. The camera scales geometry;
      every stroke is non-scaling, so no hairline ever gets fat.

   Constants first, with the arithmetic, same as bell.ts.
   ══════════════════════════════════════════════════════════════════════════ */

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/* ══════════════════════════════════════════════════════════════════════════
   TUNING CONSTANTS  —  change these, not the code below
   ══════════════════════════════════════════════════════════════════════════ */

/* ── The scrub window ──────────────────────────────────────────────────────
   The pin consumes PIN_HEIGHTS extra viewport heights of scroll on top of the
   100dvh the section already occupies. The number that actually matters is
   SCROLL PER TIMELINE UNIT, and it is PIN_HEIGHTS / TL_END = 0.035 viewport
   heights: enough that a trackpad flick does not skip a micro-beat, short
   enough that a reader who is not sold by phase B can get out in two flicks.
   Below ~0.025 the dedupe and digest beats read as glitches; above ~0.05 the
   section overstays.

   4.55 over 130 units is the same 0.035 that 3.5 over 100, 3.92 over 112 and
   4.34 over 124 were, so every beat consumes exactly the scroll it always did
   and every later beat — skip-if-opened, the permanent-error nuance, then the
   retry cycle — is pure addition. The four phases now run 0.63 / 0.84 / 1.54 /
   1.54 viewport-heights: C and D are the same length, and they should be, as
   they are the two halves of the argument. */
const PIN_HEIGHTS = 4.55;

/** Scrub catch-up, in seconds. 0.55 is enough to smooth a notched mouse wheel
 *  into continuous motion without the schematic feeling like it is on elastic.
 *  `true` (no smoothing) makes every wheel notch a visible step; above ~1.0 the
 *  diagram keeps moving after the reader has stopped, which reads as lag. */
const SCRUB = 0.55;

/* Phase boundaries, in timeline units. A unit is 1/TL_END of the pinned
   scroll, and — this is the part that has to stay true — a unit is a FIXED
   amount of scroll, because PIN_HEIGHTS is kept proportional to TL_END above.
   So every beat time below can be read straight off the storyboard and the
   ones written before the timeline was lengthened still mean what they meant.

   TL_END was 100 until the skip-if-opened beat needed 12 units at the end of
   phase D that could not be taken from anywhere else: D's other four beats
   (lanes, digest, fan-out, bridge) already overlap each other, and squeezing
   them is squeezing the argument.

   It has moved twice more since, both times for the same reason one phase
   earlier, and both times by growing C_ADD:

     +12  the failover packet flies to the dark provider and bounces off it
          instead of turning away short of it, and the permanent-error beat
          arrives as a whole new mechanism.
     +6   the two retry packets stopped being packets that WAIT and became
          packets that wait and then TRY AGAIN. Five wait-then-attempt cycles
          (two for C1, three for C3) at RETRY_CYCLE apiece is most of it; the
          rest is C3's fourth and final refusal, which is what earns the
          siding. This one is not decoration: without the attempt, "backoff"
          was drawn as three stops on a road.

   Phase C paid for some of that itself — C1's own beat came out SHORTER than
   the version it replaced, because a cycle at these rates costs less than the
   two slow rail legs and the long return it used to make — so C2, C3 and C4
   all start earlier inside the phase than they did.

   Phase D is written in absolute times and every one of them moved by exactly
   C_ADD. Nothing about phase D's own shape has ever changed; if a number in
   it looks eighteen too big against an old screenshot, this is why. */
const PHASE_A = 0;
const PHASE_B = 18;
const PHASE_C = 42;
/** How much phase C has grown, in total, for the bounce, the permanent-error
 *  beat and the retry cycle. Phase D and TL_END moved by this and nothing
 *  else did. */
const C_ADD = 18;
const PHASE_D = 68 + C_ADD;
const TL_END = 112 + C_ADD;

/* ── The request flood (phase A — the abuse) ───────────────────────────────
   Three packets in a line is traffic. FLOOD_A_N is the count at which a
   provider stops reading a wire as "requests" and starts reading it as abuse,
   and 14 is where that flips at this scale: too many to count at a glance,
   few enough that at FLOOD_A_R they stay individual dots instead of smearing
   into one amber smudge.

   The shape is doing the work, not the number. A stream of evenly spaced dots
   with air between them is a picture of traffic no matter how long it is; a
   CONVOY — fourteen packets nose to tail, one solid amber thing moving down
   one wire — is a picture of a flood.

   That convoy comes from exactly ONE thing: WHEN each packet leaves. Every
   packet rides the same curve, end to end, in the same FLOOD_A_DUR, at the
   same rate; packet i simply departs FLOOD_A_PITCH after packet i−1. Spacing
   that is path-TIME is spacing that lies on the path — which is the whole
   reason this replaced fixed [dx,dy] offsets on the circles. Those were added
   to a point on a CURVE in screen space, so the lead packet sat on the wire
   and the other thirteen hung off it.

   The arithmetic. The email wire is 833u of arc, covered in FLOOD_A_DUR, so a
   pitch of P timeline units puts

       833 · P / FLOOD_A_DUR   units of wire between neighbours.

   0.0264 over 2.0 gives 11.0u — the same pitch the offsets were authored
   with, now measured along the curve instead of across the frame. Against a
   7.6u packet diameter that is 3.4u of black between dots: touching to the
   eye, never fusing. The train spans 13 · 11 = 143u of wire, a sixth of the
   run, and measures 136–143u the whole way across (it is only the wire's own
   curvature that moves it inside that band).

   Ease "none", and that is load-bearing rather than a default. Under any
   accelerating ease the gap between two packets is proportional to the speed
   at that instant, so a train tuned to 143u at the provider is 15u wide at
   the app's outlet — fourteen dots inside two diameters, one amber smudge.
   A constant rate is the only thing that makes a path-time convoy hold its
   shape for a whole flight.

   The price, paid gladly: the flood no longer lands as one event. What
   happens to it instead is below. */
const FLOOD_A_N = 14;
const FLOOD_A_R = 3.8;
const FLOOD_A_T0 = 8.0;
const FLOOD_A_DUR = 2.0;
/** Path-time separation between neighbours, in timeline units — 11.0u of
 *  wire at this duration. The bracket is narrow: below ~0.018 the fourteen
 *  fuse into one dash, above ~0.035 the convoy opens into a queue and phase A
 *  starts arguing against phase B instead of setting it up. */
const FLOOD_A_PITCH = 0.0264;
/** When the FRONT of the train reaches the provider. Everything in the
 *  exchange — the amber box, the 429, the label leaving — is written against
 *  this, because a refusal answers the first packet, not the last. */
const FLOOD_A_HIT = FLOOD_A_T0 + FLOOD_A_DUR;

/* ── The refusal, and where it catches each packet ─────────────────────────
   The first version of the convoy let all fourteen packets run the wire to
   its END. They did — and then they sat on the same coordinate, because a
   path has only one last point. Fourteen packets became one dot at the
   provider's edge, and a phase built to say "look how many" spent its
   loudest beat showing one. A convoy has to die where it is standing.

   So the 429 is a thing that TRAVELS, and it travels the other way. It
   leaves the provider when the nose arrives and runs back down the wire at
   FLOOD_A_REFUSE per packet — faster than the packets are running forward,
   which is the only reason it ever reaches the tail. Packet i is stopped
   where it is caught, so its flight is the fraction of the wire it got:

       reach_i = 1 − i · (FLOOD_A_PITCH − FLOOD_A_REFUSE) / FLOOD_A_DUR
       time_i  = FLOOD_A_DUR · reach_i        ← same rate as everyone else
       hit_i   = FLOOD_A_HIT + i · FLOOD_A_REFUSE

   Nothing about the flight changes: the same start point, the same rate, the
   same 11u pitch. Only the last instant of it does. At 0.004 the refusal
   overtakes the convoy by 9.3u a packet, so the fourteen come to rest as a
   121u line pressed up against the provider — slightly tighter than they
   flew, which is what a queue running into a closed door looks like — and
   the last one never touches the box at all. It was refused 115u out.

   FLOOD_A_REFUSE has a ceiling of FLOOD_A_PITCH and gets nowhere near it:
   at the ceiling the 429 travels at exactly the packets' speed, never gains
   on them, and the whole train piles onto the endpoint again. Half of it
   (0.013) already squeezes the line to 5.5u and the dots start fusing. */
const FLOOD_A_REFUSE = 0.004;

/* ── The deaths ────────────────────────────────────────────────────────────
   Fourteen packets that leave the wire together leave it like a plate, and a
   plate is one event. These leave it nose first: FLOOD_A_DIE after being
   refused, plus FLOOD_A_DIE_STEP for every place further back in the train.
   The nose is 0.26 units into its fall before the tail lets go, which at
   this gravity is a 14u lead — so the flood peels off the wire as a diagonal
   rather than dropping as a bar, and for the whole of that beat there are
   packets still stuck amber on the wire above packets that are already gone.
   That is the pressure phase A is for.

   Every spread is read off the packet's index, never rolled, so a scroll
   back up finds the same fourteen falls (same rule as RECEIPT_MS). The nose
   falls furthest — it has been dead longest by the time the tail lets go —
   and each step back down the train takes FLOOD_A_FALL_STEP off the drop.
   The DURATION is then derived from that drop rather than authored, because
   `power2.in` over a distance D in a time T is exactly constant acceleration
   2D/T²: scaling T by √(D/FLOOD_A_FALL) gives all fourteen packets ONE
   gravity. Fourteen different falls, one physics. */
const FLOOD_A_FALL = 96;
const FLOOD_A_FALL_STEP = 5;
/** How long the shortest drop (the tail's, FLOOD_A_FALL) takes. Every other
 *  packet's time comes off this by √(distance), above. */
const FLOOD_A_FALL_DUR = 1.7;
/** The beat between being refused and coming off the wire — for the nose,
 *  and then one step more for every packet behind it. Long enough that the
 *  amber registers as the cause of the fall rather than as part of it. */
const FLOOD_A_DIE = 0.16;
const FLOOD_A_DIE_STEP = 0.02;

/* ── The traveling label ───────────────────────────────────────────────────
   "TOO MANY REQUESTS" is not written on the packets and it is not parked at
   the provider waiting for them: it RIDES the train. It runs its own lane —
   the email wire's curve, lifted clear of it — at exactly the train's pace,
   so it hangs above the flood for the whole flight and arrives with it.

   It has to hang over the BODY of the convoy, not over its nose, and the lane
   does that retarget by itself — which is why it still leaves at FLOOD_A_T0,
   with the nose, now that the packets behind the nose are behind it in TIME.
   The lane is 681u of arc against the wire's 833u, so at matched progress the
   label trails the nose by 59u as the train clears the app and by 160u where
   it parks. Read against an 11u pitch that is the 5th packet, then the 7th,
   then the 10th: the banner enters over the front of the mob and is walked
   back through it, which is what banners over mobs do. Timing it off the mid
   packet instead would start it 58u further back and it would spend the whole
   flight behind the tail.

   Where it lands is the whole beat, and it took two tries. The label is ~148u
   wide and the 429 stamp's own left edge is at ~959, so landing it at 875 put
   85u of its own body inside the stamp's approach and the two rendered as ONE
   line of amber text: "TOO MANY REQUESTS 429 Too Many Requests". They are not
   one line. They are a call and an answer, and an answer has to arrive from
   somewhere else. 800 leaves 85u of black between them — call on the left,
   answer over the provider — at the cost of the label finishing 160u behind
   the nose, which is the right thing to pay: a banner trails the mob. */
const FLAG_FLOOD_AT: readonly [number, number] = [800, 100];
const FLAG_FLOOD_LANE: readonly (readonly [number, number])[] = [
  [146, 276],
  [430, 272],
  [640, 104],
  [800, 100],
];
/** Where the break's label settles once it has finished stuttering. Matches
 *  `.eng-flag-settled` in styles.css, which is what the still cards show. */
const FLAG_SETTLE = 0.62;

/* ── The network drop (phase A — the wire itself) ──────────────────────────
   The push wire is authored ONCE, as the four control points of its own
   cubic, because four different things have to agree about it: the route the
   packet flies (#g-direct-2), the two pieces of line that survive, the piece
   that dissolves, and the two frayed ends. Splitting a cubic is exact — de
   Casteljau, below — so every piece lies ON the route rather than near it.

   MUST match the wire this replaced: `M 146 310 C 420 310 620 470 960 470`.

   BREAK_T is in the cubic's OWN parameter, not in arc length: the split is a
   de Casteljau split, and "75.5% of the length" would need an inversion
   nobody would ever be able to read off the source. In scene units these two
   values put the severed ends at (732,446) and (787,456) — a 56u gap, seven
   times the packet's diameter. Narrower than ~40u and the packet looks like
   it could still make it, which is a different (and wrong) sentence. */
const W_PUSH: readonly (readonly [number, number])[] = [
  [146, 310],
  [420, 310],
  [620, 470],
  [960, 470],
];
const BREAK_T = [0.755, 0.818] as const;
/** How much line on each side of the gap stops being line and becomes dashes.
 *  0.034 of the curve ≈ 30u, which is four dashes at the 2.5/5 pattern in
 *  styles.css. Sized off the PACKET, not off the wire: the packet teeters with
 *  its centre on the severed edge, so a 9u-wide dot parks on the last 9u of
 *  the fray and eats it. At 19u (the first try) that left three dashes, two of
 *  them under the packet, and the break read as "the line stops here" instead
 *  of "the line came apart here". */
const FRAY_T = 0.034;

/* ── The metering rhythm (phase B — the load-bearing beat) ─────────────────
   Six events are fired at the API in two ragged clumps and released on a
   metronome. The gap between BURST_OFFSETS and METER_PERIOD is the argument
   the whole scene exists to make, so it has to be visible: the arrivals span
   1.26 units and the departures span 5 × 0.85 = 4.25. Four times longer, and
   perfectly even. */
const BURST_OFFSETS = [0, 0.24, 0.4, 1.02, 1.16, 1.26];
/** Timeline units between two releases. Even, always. */
const METER_PERIOD = 0.85;

/* ── The queue, as a queue ────────────────────────────────────────────────
   A lane with dots parked on it is a picture of six things waiting. A BOX
   WITH CELLS is a picture of a queue: the reader can count the free slots,
   see a message take one, and see the whole column step forward when the head
   leaves. That last part is the buffering argument — ragged in, rhythmic out
   — and it only reads if the slots are drawn.

   The box runs from QUEUE_X0 (the tail, where the approach lane ends) to
   QUEUE_X1 (the head, which is exactly the meter's x — the queue's mouth and
   the thing that opens it are the same line). QUEUE_SLOTS cells of QUEUE_SLOT
   each fill it exactly, so QUEUE_X1 − QUEUE_X0 === QUEUE_SLOTS · QUEUE_SLOT
   is not a coincidence to be maintained by hand: it is asserted below.

   Six slots for six burst packets: the queue fills to the brim and no
   further, which is the most a buffer can say for itself in one picture. */
const QUEUE_SLOTS = 6;
const QUEUE_SLOT = 34;
const QUEUE_X0 = 586;
const QUEUE_X1 = 790;
/** Cell height, and how far the dividers stop short of the walls. A hairline
 *  that touches both walls cuts the box into six boxes; a hairline inset 5u
 *  reads as ruling inside one box, which is what a queue is. */
const QUEUE_H = 28;
const QUEUE_INSET = 5;
/** The three lanes' centre lines. p1 alone in phases B–C; all three from D. */
const QUEUE_Y = [250, 310, 370];
/** The head of the queue — the centre of the rightmost cell, and the point
 *  every departure guide (#g-dep-*) starts from. */
const QUEUE_HEAD_X = QUEUE_X1 - QUEUE_SLOT / 2;

/* ── The backoff (phase C) ────────────────────────────────────────────────
   Tick positions are given in scene x, not in path fractions: the rail's
   straight section runs right-to-left, so the first tick a packet meets is the
   rightmost. engine.ts finds the fraction for each x at build time, which is
   also what places the tick marks — the label and the wait are guaranteed to
   be the same point on the rail.

   The holds are NOT to scale with the labels (1s · 4s · 16s would need a 16×
   spread and the reader would leave). They are ordered and clearly growing,
   which is the information: each wait is longer than the last. */
const BACKOFF_X = [880, 800, 720];
const BACKOFF_LABEL = ["1s", "4s", "16s"];
const BACKOFF_HOLD = [0.7, 1.0, 1.4];

/* ── The retry CYCLE (phase C) ────────────────────────────────────────────
   A backoff is not a rest stop, and the first version of this beat drew it as
   one: the packet came down the rail, stopped at 1s, stopped at 4s, stopped
   at 16s, and went back into the queue. Three stops on a road is a picture of
   a message being DELAYED. A retry is a wait and then an ATTEMPT, and the
   attempt was the half that was missing — which also made the dead-letter
   packet unreadable, because "it spent everything it had" needs something to
   have been spent ON.

   One cycle, always in the same direction — no stretch of rail is ever run
   backwards, because a road that a packet reverses down stops being a road:

     the tick it waited on ──rail──▶ the rail's exit ──▶ the queue's head
        (the re-enqueue: a retry goes to the BACK of the queue, same as the
         rail has always said)
     ──dep1──▶ the provider                 THE ATTEMPT
     ──▶ refused (amber knock) ──▶ across the box, out of its far corner
     ──rail──▶ the NEXT tick                THE NEXT WAIT, longer than the last

   The RATES matter, but not in the way a first pass assumes. A lap covers
   ~1450u of wire and a wait covers none, so in TIME the lap is always the
   longer of the two and no tuning will change that. What has to be true is
   that the lap never feels like a JOURNEY: every leg below is the shortest it
   can be and still be followed at 0.035 viewport-heights a unit, and the six
   of them run back to back with no pause anywhere inside them. The only place
   in the whole cycle where the packet is STILL is the tick. Standing still is
   what a backoff looks like; everything else is the engine getting on with
   it, and one hesitation added anywhere in the lap would put a second kind of
   stillness on screen and make the ticks stop meaning anything.

   The last leg is the only one that changes between the two packets that use
   this: C1's third attempt is answered green, C3's fourth is answered amber
   with no tick left to walk to. */
const RETRY_LEG = {
  /** the tick → the rail's exit on the approach lane */
  out: 0.62,
  /** the exit → the queue's head. A retry is a re-enqueue. */
  enqueue: 0.46,
  /** the queue's head → the provider. THE ATTEMPT. */
  strike: 0.58,
  /** how long the provider takes to say no */
  refuse: 0.22,
  /** across the provider and out of its far corner onto the rail's head */
  drop: 0.32,
  /** the rail's head → the tick this refusal has earned */
  in: 0.84,
} as const;

/** C1's holds, shortened for C3. Same order, same growth, half the dwell: by
 *  its turn the reader has been taught this rhythm, and a second full-length
 *  rendition of it is a lesson repeated rather than a story continued. */
const DLQ_HOLD = [0.45, 0.55, 0.7];
/** Where the dead-letter siding leaves the retry rail: past the last tick,
 *  because a packet only reaches it having spent every backoff it had. */
const DLQ_BRANCH_X = 700;

/** Where parked failures stand inside the dead-letter box, in arrival order.
 *  The siding is entered from its right, so the first arrival stands deepest
 *  and the second parks beside it at the mouth. Mirrored by #dlq-mark and
 *  #dlq-mark-2 in the markup, and asserted below. */
const DLQ_PARK_X = [500, 518] as const;

/** How far along the primary wire the failover crossover leaves it. 0.72 is
 *  past the point where the packet has visibly committed to the email
 *  provider — a reroute at 0.2 reads as routing, at 0.72 it reads as rescue.
 *  It also matters geometrically: earlier than ~0.65 the split point is still
 *  left of the provider column, and a curve from there down to the sms box
 *  doubles back on itself into a hook. */
const FAILOVER_SPLIT = 0.72;

/* ── The failover bounce (phase C) ────────────────────────────────────────
   The packet does not peel off at the fork on its way past. It runs the
   primary ALL THE WAY to the dark provider, knocks, is refused, recoils, and
   only then comes back to the fork and takes the other road. Same dot, same
   attempt, new road — which is what the product actually does: one attempt
   walks the provider chain, and only a chain that fails end to end goes to
   the retry rail.

   The version this replaced turned the packet away at 0.72 and delivered it
   on the secondary wire without it ever touching the provider it was
   supposedly rescued from. It read as a silent drop followed by a different
   message taking a different wire — which is the exact opposite of the
   sentence the phase is making. Nothing in this scene may vanish; a packet
   that leaves the frame has to be seen leaving it.

   BOUNCE_BACK is in the primary route's own path fraction: 0.055 of its 282u
   is 15.5u, a bit over three packet diameters. Below ~0.03 the recoil is a
   twitch the eye files as a rendering stutter; above ~0.09 it stops being a
   rebound and becomes a retreat, and the packet looks like it changed its
   mind rather than like it was pushed back. */
const BOUNCE_BACK = 0.055;

/* ── The permanent error (phase C) ────────────────────────────────────────
   The road out of the provider column for a message that will never be
   deliverable. It uses the same vocabulary a refused packet already uses —
   cross the box that rejected you, drop out of its far corner — and then BOWS
   OUTSIDE the sms provider on the way down to the retry rail's head, which
   happens to be the sms box's own bottom-right corner.

   The bow is the whole reason this is a path and not a two-leg x/y tween like
   the retry drop. Straight down from (1150,173) to (1150,333) runs the packet
   along the sms box's right EDGE for its last 46u, and a packet sliding down
   the side of the second provider is the reader watching a failover — which
   is the one thing this beat exists to say is not happening. At 1180 the
   packet clears that edge by ~19u at the corner and stays inside the frame
   (the rail itself bulges further, to 1192). */
const PERM_BOW_X = 1180;

/* ── The flood (phase D) ──────────────────────────────────────────────────
   FLOOD_N faint packets pour down p2 with a FLOOD_GAP head start each, taking
   FLOOD_DUR to clear. The otp leaves at FLOOD_T0 + 3.0 and takes OTP_DUR.

   The overtake has to happen IN THE LANES, not at the finish line. Both routes
   are ~940u long, so the otp catches the leader when
       (t − 86.2)/2.4 = (t − 83.2)/8.2   ⇒  t ≈ 87.4
   which is 50% of the way along — mid-lane, in open view, with a third of the
   run left to pull clear in. Tuned the other way (a fast flood and a marginal
   otp) the pass happens on the last 40 units of wire and reads as a photo
   finish, which is not the claim: p0 is not slightly better, it is first.

   Arrivals: otp 88.6, first flood 91.4. */
const FLOOD_N = 11;
const FLOOD_T0 = 83.2;
const FLOOD_GAP = 0.32;
const FLOOD_DUR = 8.2;
const FLOOD_OPACITY = 0.28;
const OTP_T0 = 86.2;
const OTP_DUR = 2.4;

/** How many events collapse into one digest, and the aside that says so. */
const DIGEST_N = 7;

/* ── The skip-if-opened workflow (phase D — the bridge's second sentence) ──
   Two steps on one vertical wire, with a gate on the wire that feeds step 2.
   The reader has already watched six receipts land on the timeline strip;
   this beat takes ONE of them back off the strip and shows it changing what
   happens next. That is the difference between a log and a control loop, and
   it is the only thing in the scene that runs right-to-left on purpose.

   THE COLUMN is stacked directly over the app box (x 30–146), in its own
   vertical corridor and nothing else's: a workflow is something the app
   declares, and putting it anywhere else in the frame would have made it a
   seventh mechanism instead. The quadrant it lives in — x < 300, y < 286,
   with the box's left edge 12u left of the app's — is the only part of the
   finished schematic that is completely empty: the strip starts at x 300, the chassis
   at x 250 / y 176, the app box at y 286. It is also clear of all six return
   guides, which stay right of x 340 (their control points are the strip tick
   x's, and STRIP_TICK_X[0] is 340).

   THE LADDER, top to bottom, and why each gap is the size it is:

       86   CONDITIONS · SKIP-IF-OPENED   engraved, 13u caps
      100   inlet stub starts             20u, same order as #w-api-split
      120   ┌ ● step 1 · email ─────┐     26u box, status dot at the left
      146   └───────────────────────┘     inset — a channel terminal's own
                                          anatomy at this scale
      162   ● junction                    16u below step 1 — where the
                                          "opened" receipt lands
      180   ○ waiting packet              18u below the junction, 3.4u radius
      192   ══ gate ══                    12u below the packet: far enough
                                          that the bar closing under it reads
                                          as a bar and not as a collision
      214   ┌ ○ step 2 · in-app ────┐     22u below the gate
      240   └───────────────────────┘
      262   skipped · already opened      15u stamp, left-aligned on the
                                          engraving, 24u clear of the app box

   THE BOXES are 168u and their labels are LEFT-aligned after a status dot,
   which is not a style choice: the step-1 packet arrives at the box's own
   rim the way every fan-out packet arrives at a terminal's, and a centred
   14u label is exactly what sits under that rim. It cost one screenshot to
   find out. The dots also make the drawing say the whole beat with nothing
   moving — step 1 green, step 2 idle ink, gate shut.

   THE GATE is the meter at x 790 turned ninety degrees: a hairline across a
   flow, resting at drawSVG "50% 50%" and snapping to "0% 100%". Both are
   endpoints that survive the non-scaling-stroke dash law (DESIGN §3) — zero
   and everything are the same number in screen space as in user space — so
   this is one of the few things in the scene that CAN be a drawSVG tween
   rather than a cross-fade. 36u wide against a 168u box: wide enough to read
   as a barrier, narrow enough not to read as a third step. */
const SKIP_X = 102;
const SKIP_BOX_W = 168;
const SKIP_BOX_H = 26;
/** Where the step's status dot sits, and where its packet stops: 16u in from
 *  the box's left edge, and on the box's own top rim. The two are 68u apart
 *  and that is the point — the traveller lands on the wall, the record
 *  lights up inside, exactly as at the six channel terminals. */
const SKIP_DOT_X = 34;
const SKIP_RIM_Y = 120;
/** Centre y of step 1 and step 2. */
const SKIP_STEP_Y = [133, 227] as const;
const SKIP_JUNCTION_Y = 162;
/** Where the packet that will never launch stands: step 2's mouth. */
const SKIP_MOUTH_Y = 180;
const SKIP_GATE_Y = 192;
/** Half the bar's span, and how far its two jamb ticks reach either side of
 *  it. The jambs are what make the OPEN gate a mark rather than nothing —
 *  two posts with the wire running between them — so the bar has somewhere
 *  to arrive from and the reader knows a gate was always there. */
const SKIP_GATE_HALF = 18;
const SKIP_JAMB_HALF = 5;

/* ── The camera ───────────────────────────────────────────────────────────
   Each keyframe is "put scene point (fx,fy) in the middle of the frame at
   zoom z". The zoom range is deliberately narrow: 0.88–1.26. A schematic that
   pushes in hard stops being a schematic and becomes a slideshow, and the
   reader loses the map. The one big move is the last one — pulling back under
   1 is what makes the finale read as "and here is all of it at once".
   fy is measured against the frame centre (310), fx against (600).

   D4 → D5 → D6 is wide, then close, then widest, and the middle move is what
   earns the last one: the reader watches six receipts land across the full
   width, is taken in to one 140u box in the corner to see what the engine
   DOES with one of them, and is then pulled further back than the scene has
   ever been. Without D5 the ladder would be 129px wide carrying 13u type on a
   1200px frame — in shot, and unreadable. */
const CAM: { at: number; dur: number; z: number; fx: number; fy: number }[] = [
  { at: 18.0, dur: 3.0, z: 1.08, fx: 590, fy: 302 }, // B — the engine assembling
  /* C1 — the retry CYCLE, and the frame has to hold the whole loop, because
     the loop is the beat: the queue's head (773,310), the provider it strikes
     (960,310), the rail's head (1150,333) and its own bulge at x 1192, and
     the three ticks down at y 536. 634 ± 600/0.98 covers x 22…1246 and
     384 ± 310/0.98 covers y 68…700, which is all of it with air. A camera
     that followed the packet instead would be a camera that hides the
     circuit. */
  { at: 42.0, dur: 3.0, z: 0.98, fx: 634, fy: 384 },
  /* C2 — the bounce. Centred on the dark provider rather than on the fork,
     because the fork is no longer where the beat happens: 930 ± 600/1.22
     covers x 438…1422 and 232 ± 310/1.22 covers y −22…486, which holds the
     queue's head (773,310), the provider the packet knocks on (960,150), the
     cue under it (1055,198) and where the secondary wire lands (1000,287). */
  { at: 55.5, dur: 2.2, z: 1.22, fx: 930, fy: 232 },
  /* C3 — the exhausted packet's own circuit, which is C1's plus one more lap
     and an ending. Same reason as C1 for the wide frame, and it also has to
     hold the siding and the dead-letter box the fourth refusal sends it to:
     720 ± 612 covers x 108…1332, 430 ± 316 covers y 114…746. */
  { at: 60.9, dur: 2.4, z: 0.98, fx: 720, fy: 430 },
  /* C4 — the permanent error, which is the one beat in the scene that has to
     hold the provider column and the siding in ONE frame: the stamp lands at
     y 106 and the packet it names parks at y 576. At z 1.0, 880 ± 600 covers
     x 280…1480 and 330 ± 310 covers y 20…640 — the stamp, the cue, the road
     out at x 1180, all three backoff ticks it does not stop at, the siding,
     and the dlq aside at y 612. Any closer and one end falls off. */
  { at: 77.0, dur: 2.6, z: 1.0, fx: 880, fy: 330 },
  { at: 86.0, dur: 2.4, z: 1.14, fx: 640, fy: 318 }, // D1 — the three lanes
  { at: 99.0, dur: 2.2, z: 1.22, fx: 620, fy: 306 }, // D2 — the digest
  { at: 105.6, dur: 2.4, z: 1.06, fx: 820, fy: 310 }, // D3 — the fan-out
  { at: 113.2, dur: 2.4, z: 0.92, fx: 606, fy: 306 }, // D4 — the receipts landing
  /* D5 — the workflow ladder. Framed so the ladder (x 18–263) sits left of
     centre and the strip's email tick at x 340, where the "opened" receipt
     leaves from, is still in shot: 300 ± 600/1.26 covers x −176…776, and
     168 ± 310/1.26 covers y −78…414. */
  { at: 118.2, dur: 2.6, z: 1.26, fx: 300, fy: 168 },
  /* D6 — the whole anatomy, which now runs from the ladder at x 18 to the
     rail entry at x 1150, and from the strip at y 34 to the dlq aside at
     y 612. 584 ± 682 and 323 ± 352 clears both with air at every edge. */
  { at: 127.6, dur: 2.4, z: 0.88, fx: 584, fy: 323 },
];
const CAM_START = { z: 1, fx: 600, fy: 310 };

/* ── Caption swaps ───────────────────────────────────────────────────────
   Timeline unit each caption owns the rail from. The last three are all
   inside phase D: the priority lanes, the bridge, and what the engine does
   with what comes back over it are three different sentences. The bridge
   still owns 4.5 units (113.5 → 118), exactly as it did before the timeline
   was lengthened three times; the condition owns 12 (118 → 130).

   "The assurance" is now the longest-held caption in the scene — 44 units,
   1.54 viewport-heights — and it stays one caption on purpose: retry,
   failover and permanent are three answers to the SAME question, and cutting
   them into three cards would turn one argument into three claims. The
   caption names all three so the reader has the frame before the beats. */
const CAP_AT = [0, PHASE_B, PHASE_C, PHASE_D, 113.5, 118.0];
const CAP_FADE = 1.6;

/* ══════════════════════════════════════════════════════════════════════════
   SCENE GEOMETRY  —  scene units. These MUST match the markup in index.html.
   ══════════════════════════════════════════════════════════════════════════ */

/** viewBox centre — the point the camera puts things at. */
const FRAME_CX = 600;
const FRAME_CY = 310;

/** The spine every node sits on. */
const SPINE_Y = 310;
/** x of the app's outlet and the api's inlet. */
const APP_OUT_X = 146;
const API_CX = 338;
/** Where the fan leaves the chassis. */
const FAN_X = 840;

/** Provider column: left edge, and the y of each box's centre. */
const PROV_X = 960;
const PROV_Y = [150, 310, 470];

/** Channel terminals (generated). Six rows, 90u apart, centred on the spine. */
const TERM_X = 990;
const TERM_W = 130;
const TERM_H = 30;
const TERM_Y = [85, 175, 265, 355, 445, 535];
const CHANNELS = ["email", "sms", "push", "in-app", "telegram", "slack"] as const;
/** Mock latencies, fixed rather than rolled: a number that changes when you
 *  scroll back up is a number nobody believes. Ordered to match the arrival
 *  stagger, so the slower channels also report the slower numbers. */
const RECEIPT_MS = [118, 96, 143, 88, 207, 164];

/** The timeline strip and its six ticks (generated). */
const STRIP_Y = 58;
const STRIP_TICK_X = [340, 430, 520, 610, 700, 790];

/** Dead-letter box: right edge and centre y, for the siding's landing point. */
const DLQ_RIGHT = 532;
const DLQ_CY = 576;

/** Where the retry rail meets the provider column: the sms box's bottom-RIGHT
 *  corner. Right, not left, and this is not a style choice — the rail has to
 *  get from the provider column down to the siding below the chassis, and the
 *  only lane clear of the push-provider box is outside the column's right
 *  edge. A refused packet therefore crosses its provider and drops out of the
 *  far corner, which also happens to be what a request that was accepted and
 *  then rejected looks like. MUST match the head of #retry-rail. */
const RAIL_ENTRY_X = 1150;
const RAIL_ENTRY_Y = 333;
/** Where the retry rail lets a packet back out: on the approach lane, just
 *  short of the queue's tail wall. MUST match the tail of #retry-rail. A retry
 *  goes to the BACK of the queue — it is a re-enqueue, not a queue-jump — so
 *  the packet then slides the whole length of the box to the head, which is
 *  also the only way the reader sees that it went back in at all. */
const RAIL_EXIT_X = 574;

/** The gate's drawSVG range in its short state. The path is 164u tall and the
 *  gate is 52u in phases B–C, so 26u each side of centre = 50% ± 15.9%. 52
 *  and not 44: the queue box's head wall now sits on exactly this x, and a
 *  gate shorter than QUEUE_H + ~20 disappears behind it. It has to overhang
 *  the mouth it meters by enough to read as a separate thing. */
const GATE_SHORT = "34% 66%";
const GATE_FULL = "0% 100%";

/** Packet radius. 4.5u ≈ 4px on screen: the hero's delivered-dot, same size. */
const DOT_R = 4.5;
const FLOOD_R = 3.4;

/* Windows the still cards look through: "x y w h" in scene units, plus which
   caption belongs to each. `phase` is the CSS key that decides which layers
   the card shows; two cards may share one.

   These are cut for LEGIBILITY, not for coverage. A card is ~420px wide on a
   phone, so a 14u label only clears 10px once the window is under ~590u —
   showing the whole 1200u schematic four times would be four illegible
   thumbnails. Each card is therefore a close-up of the one mechanism its
   caption is about, and the captions carry the thread between them. */
const CARD_VIEW = [
  { phase: "a", cap: 0, box: "690 70 510 470" }, // the providers, refusing
  { phase: "b", cap: 1, box: "240 160 620 310" }, // the engine: api, queue, meter
  { phase: "c", cap: 2, box: "360 498 600 134" }, // the backoff rail and the siding
  { phase: "d", cap: 3, box: "700 20 500 592" }, // the six channels, delivered
  { phase: "e", cap: 4, box: "280 22 560 118" }, // the timeline the receipts land on
  { phase: "f", cap: 5, box: "4 66 268 210" }, // the workflow ladder, gate shut
] as const;

const COLOR = {
  green: "#3dd68c",
  greenDim: "#2ba36c",
  amber: "#ffb224",
  faint: "#6e6e6e",
  dim: "#a1a1a1",
  hairline: "#262626",
  hairlineStrong: "#3f3f3f",
} as const;

const SVG_NS = "http://www.w3.org/2000/svg";

/* ══════════════════════════════════════════════════════════════════════════
   IMPLEMENTATION
   ══════════════════════════════════════════════════════════════════════════ */

function q<T extends Element>(root: ParentNode, sel: string): T {
  const el = root.querySelector<T>(sel);
  if (!el) throw new Error(`[engine] missing element: ${sel}`);
  return el;
}

function svgEl<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | number>,
): SVGElementTagNameMap[K] {
  const el = document.createElementNS(SVG_NS, tag);
  for (const k in attrs) el.setAttribute(k, String(attrs[k]));
  return el;
}

/** The fraction of `path` whose point is nearest x = `targetX`, considering
 *  only the part of the path below y = `minY`. Used to put the backoff ticks
 *  and the dead-letter junction exactly on the retry rail rather than near it:
 *  the rail is one hand-authored curve, and nothing else should have to know
 *  its control points. 400 samples over a ~750u path is sub-2u accuracy. */
function fracNearX(path: SVGPathElement, targetX: number, minY: number): number {
  const total = path.getTotalLength();
  const STEPS = 400;
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i <= STEPS; i++) {
    const f = i / STEPS;
    const p = path.getPointAtLength(total * f);
    if (p.y < minY) continue;
    const d = Math.abs(p.x - targetX);
    if (d < bestD) {
      bestD = d;
      best = f;
    }
  }
  return best;
}

function pointAt(path: SVGPathElement, frac: number): { x: number; y: number } {
  const p = path.getPointAtLength(path.getTotalLength() * frac);
  return { x: p.x, y: p.y };
}

/* ── cutting a cubic into pieces ─────────────────────────────────────────
   The push wire breaks in phase A, which means the one line the reader sees
   has to become three paths that still lie on one curve. Approximating the
   pieces (sampling the path, re-fitting) would put them near the route the
   packet flies; de Casteljau puts them ON it, exactly, and it is nine lerps.

   Everything here is in the cubic's own parameter t, never in arc length. */

type Pt = readonly [number, number];

const lerpPt = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

/** The two halves of a cubic split at `t`, each as its own four control
 *  points. The classic construction: three lerps, then two, then one. */
function splitCubic(c: readonly Pt[], t: number): [Pt[], Pt[]] {
  const [p0, p1, p2, p3] = c as [Pt, Pt, Pt, Pt];
  const a = lerpPt(p0, p1, t);
  const b = lerpPt(p1, p2, t);
  const d = lerpPt(p2, p3, t);
  const e = lerpPt(a, b, t);
  const f = lerpPt(b, d, t);
  const g = lerpPt(e, f, t);
  return [
    [p0, a, e, g],
    [g, f, d, p3],
  ];
}

/** The sub-curve between two parameters. The first cut re-parameterises what
 *  is left — the tail's t runs 0→1 over the original's t0→1 — so the second
 *  cut has to be rescaled or the piece comes out short. */
function subCubic(c: readonly Pt[], t0: number, t1: number): Pt[] {
  const tail = splitCubic(c, t0)[1];
  return splitCubic(tail, (t1 - t0) / (1 - t0))[0];
}

const n2 = (v: number): string => String(Math.round(v * 100) / 100);

const cubicD = (c: readonly Pt[]): string =>
  `M ${n2(c[0]![0])} ${n2(c[0]![1])} C ${n2(c[1]![0])} ${n2(c[1]![1])} ` +
  `${n2(c[2]![0])} ${n2(c[2]![1])} ${n2(c[3]![0])} ${n2(c[3]![1])}`;

export interface EngineScene {
  destroy(): void;
}

/**
 * Scene 2. Owns its own media gating: gsap.matchMedia() decides between the
 * pinned scrub and the still fallback, and re-decides for free if the reader
 * crosses 768px or turns reduced motion on mid-visit.
 */
export function createEngineScene(): EngineScene {
  const doc = document;

  const section = q<HTMLElement>(doc, "#scene-engine");
  const pin = q<HTMLElement>(doc, "#eng-pin");
  const still = q<HTMLElement>(doc, "#eng-still");
  const capsWrap = q<HTMLElement>(doc, "#eng-caps");
  const caps = Array.from(capsWrap.querySelectorAll<HTMLElement>(".eng-cap"));
  const stat = q<HTMLElement>(doc, "#eng-stat");
  const progressFill = q<HTMLElement>(doc, "#eng-progress-fill");

  const svg = q<SVGSVGElement>(doc, "#eng-svg");
  const cam = q<SVGGElement>(svg, "#eng-cam");
  const dotsG = q<SVGGElement>(svg, "#eng-dots");
  const termG = q<SVGGElement>(svg, "#eng-terminals");
  const ticksG = q<SVGGElement>(svg, "#retry-ticks");
  const stripTicksG = q<SVGGElement>(svg, "#strip-ticks");

  /* ════════════════════════════════════════════════════════════════════════
     GENERATED DOM
     Six terminals, six fan wires, six return guides, six timeline ticks,
     three backoff ticks and three sets of queue-slot dividers. All parametric
     — the channel list lives in exactly one place, same as the hero's chips,
     and the queue's cell pitch lives only in QUEUE_SLOT.
     ════════════════════════════════════════════════════════════════════════ */

  /* The box in index.html and the slot arithmetic here have to agree, and the
     cheapest way to guarantee that is to refuse to boot if they do not. */
  if (QUEUE_X1 - QUEUE_X0 !== QUEUE_SLOTS * QUEUE_SLOT) {
    throw new Error("[engine] queue box width does not divide into QUEUE_SLOTS");
  }

  /* Same contract, one phase earlier. The flood's shape now lives entirely in
     three numbers that have to agree, and the way they stop agreeing is the
     train getting longer than the wire it rides: at a pitch of
     FLOOD_A_DUR/(FLOOD_A_N−1) the tail departs after the nose has already
     been refused, and phase A stops being a flood arriving and becomes a
     queue departing — which is phase B's line, not phase A's. */
  if ((FLOOD_A_N - 1) * FLOOD_A_PITCH >= FLOOD_A_DUR) {
    throw new Error("[engine] FLOOD_A_PITCH strings the flood out longer than its own flight");
  }
  /* And the 429 has to be able to catch the train it is chasing. At or above
     the packets' own pitch it never gains on them and all fourteen pile onto
     the wire's last point, which is the bug this pair of constants exists to
     make impossible to reintroduce. */
  if (FLOOD_A_REFUSE >= FLOOD_A_PITCH) {
    throw new Error("[engine] FLOOD_A_REFUSE never overtakes the flood");
  }
  /* The retry cycle's own contract, and it is the argument rather than the
     geometry. The ONE thing 1s · 4s · 16s says is that each wait is longer
     than the last, and the only thing on screen that says it is how long the
     packet stands on each tick — the labels are text, and text is not what
     the reader is watching. A ladder that stopped growing would still animate
     perfectly, still hit every tick, and would be saying "the engine waits a
     bit, three times", which is not backoff. Both ladders, because C3's are
     shortened by hand and shortening is exactly how the order gets lost. */
  for (const ladder of [BACKOFF_HOLD, DLQ_HOLD]) {
    for (let i = 1; i < ladder.length; i++) {
      if (ladder[i]! <= ladder[i - 1]!) {
        throw new Error("[engine] a backoff ladder stopped growing — that is not a backoff");
      }
    }
  }

  /* And the third contract: a gate only means anything if it is between the
     thing that wants to move and the thing it wants to move into. Slide the
     bar above the waiting packet and the packet is standing on the wrong side
     of it — the beat still animates, and it says the opposite of what it
     means. Slide it below step 2's top edge and it is drawn inside the box.
     Both are one edited constant away, and neither is visible in a diff. */
  if (
    SKIP_MOUTH_Y <= SKIP_JUNCTION_Y ||
    SKIP_GATE_Y <= SKIP_MOUTH_Y ||
    SKIP_GATE_Y >= SKIP_STEP_Y[1] - SKIP_BOX_H / 2
  ) {
    throw new Error("[engine] skip gate is not between the waiting packet and the step it guards");
  }

  /** The QUEUE_SLOTS − 1 dividers of one lane, ruled between its walls. */
  const slotLines: SVGLineElement[][] = QUEUE_Y.map((cy, lane) => {
    const g = q<SVGGElement>(svg, `#slots-p${lane}`);
    const lines: SVGLineElement[] = [];
    for (let k = 1; k < QUEUE_SLOTS; k++) {
      const x = QUEUE_X0 + k * QUEUE_SLOT;
      const line = svgEl("line", {
        class: "eng-slot",
        x1: x,
        y1: cy - QUEUE_H / 2 + QUEUE_INSET,
        x2: x,
        y2: cy + QUEUE_H / 2 - QUEUE_INSET,
      });
      g.appendChild(line);
      lines.push(line);
    }
    return lines;
  });

  const termRects: SVGRectElement[] = [];
  const termDots: SVGCircleElement[] = [];
  const termLabels: SVGTextElement[] = [];
  const termReceipts: SVGTextElement[] = [];
  const fanWires: SVGPathElement[] = [];
  const backGuides: SVGPathElement[] = [];
  const stripTicks: SVGLineElement[] = [];
  const stripDots: SVGCircleElement[] = [];

  const guidesG = q<SVGGElement>(svg, "#eng-guides");

  CHANNELS.forEach((name, i) => {
    const ty = TERM_Y[i]!;

    // The wire out to this terminal. Both handles sit on the fan junction's
    // own horizontal so all six leave the chassis as one bundle and only then
    // peel apart — the hero's SIG_BUNDLE_X, in a straighter world.
    const wire = svgEl("path", {
      class: "eng-wire",
      d: `M ${FAN_X} ${SPINE_Y} C ${FAN_X + 60} ${SPINE_Y} ${TERM_X - 70} ${ty} ${TERM_X} ${ty}`,
    });
    termG.appendChild(wire);
    fanWires.push(wire);

    const g = svgEl("g", { class: "eng-term" });
    const rect = svgEl("rect", {
      class: "eng-box",
      x: TERM_X,
      y: ty - TERM_H / 2,
      width: TERM_W,
      height: TERM_H,
      rx: 6,
    });
    const dot = svgEl("circle", { class: "eng-term-dot", cx: TERM_X + 18, cy: ty, r: 3.5 });
    const label = svgEl("text", {
      class: "eng-label",
      x: TERM_X + 32,
      y: ty,
      "dominant-baseline": "central",
    });
    label.textContent = name;
    const receipt = svgEl("text", {
      class: "eng-receipt",
      x: TERM_X + TERM_W / 2,
      y: ty + 30,
      "text-anchor": "middle",
    });
    receipt.textContent = `delivered · ${RECEIPT_MS[i]}ms`;

    g.append(rect, dot, label, receipt);
    termG.appendChild(g);

    termRects.push(rect);
    termDots.push(dot);
    termLabels.push(label);
    termReceipts.push(receipt);

    // The return journey. Back down the fan to the junction, then up to this
    // channel's own tick on the timeline strip.
    const tx = STRIP_TICK_X[i]!;
    const back = svgEl("path", {
      id: `g-back-${i}`,
      d:
        `M ${TERM_X} ${ty} C ${TERM_X - 70} ${ty} ${FAN_X + 60} ${SPINE_Y} ${FAN_X} ${SPINE_Y} ` +
        `C ${FAN_X - 90} ${SPINE_Y} ${tx} ${SPINE_Y - 130} ${tx} ${STRIP_Y}`,
    });
    guidesG.appendChild(back);
    backGuides.push(back);

    const stripTick = svgEl("line", {
      class: "eng-strip-tick",
      x1: tx,
      y1: STRIP_Y - 6,
      x2: tx,
      y2: STRIP_Y + 6,
    });
    stripTicksG.appendChild(stripTick);
    stripTicks.push(stripTick);

    /* The receipt, once it has landed. A separate mark from the packet that
       carried it, so the strip is a permanent record rather than six travelling
       dots that happened to stop — and so the still cards have something to
       show, which six mid-flight packets never would. */
    const landed = svgEl("circle", { class: "eng-strip-dot", cx: tx, cy: STRIP_Y, r: 3.5 });
    stripTicksG.appendChild(landed);
    stripDots.push(landed);
  });

  /* ── the workflow ladder's gate ─────────────────────────────────────────
     Three marks that have to share one x and one y: the bar, and the two
     jamb ticks it closes between. Authored here rather than in the markup
     for the same reason the queue's dividers are — the failure mode of doing
     it by hand is a bar that shuts past its own posts, which looks like a
     rendering bug rather than like a gate.

     The two ladder boxes ARE in the markup (they are boxes, not repeats), so
     the one thing that can drift is their centres against SKIP_STEP_Y. */
  const skipStep1 = q<SVGRectElement>(svg, "#skip-step-1");
  const skipStep2 = q<SVGRectElement>(svg, "#skip-step-2");
  [skipStep1, skipStep2].forEach((rect, i) => {
    const w = Number(rect.getAttribute("width"));
    const h = Number(rect.getAttribute("height"));
    const cx = Number(rect.getAttribute("x")) + w / 2;
    const cy = Number(rect.getAttribute("y")) + h / 2;
    const dot = q<SVGCircleElement>(svg, `#skip-dot-${i + 1}`);
    if (
      w !== SKIP_BOX_W ||
      h !== SKIP_BOX_H ||
      cx !== SKIP_X ||
      cy !== SKIP_STEP_Y[i] ||
      Number(dot.getAttribute("cx")) !== SKIP_DOT_X ||
      Number(dot.getAttribute("cy")) !== SKIP_STEP_Y[i]
    ) {
      throw new Error(`[engine] skip step ${i + 1} does not match SKIP_X / SKIP_STEP_Y / SKIP_*`);
    }
  });
  /* The packet has to stop ON the box's rim, not near it: the whole handoff
     reads as "arrived at step 1" only if the traveller and the wall are the
     same line. */
  if (SKIP_RIM_Y !== SKIP_STEP_Y[0] - SKIP_BOX_H / 2) {
    throw new Error("[engine] SKIP_RIM_Y is not step 1's top edge");
  }

  const skipGate = q<SVGPathElement>(svg, "#skip-gate");
  skipGate.setAttribute(
    "d",
    `M ${SKIP_X - SKIP_GATE_HALF} ${SKIP_GATE_Y} L ${SKIP_X + SKIP_GATE_HALF} ${SKIP_GATE_Y}`,
  );

  const skipJambsG = q<SVGGElement>(svg, "#skip-jambs");
  const skipJambs: SVGLineElement[] = [-SKIP_GATE_HALF, SKIP_GATE_HALF].map((dx) => {
    const line = svgEl("line", {
      class: "eng-strip-tick",
      x1: SKIP_X + dx,
      y1: SKIP_GATE_Y - SKIP_JAMB_HALF,
      x2: SKIP_X + dx,
      y2: SKIP_GATE_Y + SKIP_JAMB_HALF,
    });
    skipJambsG.appendChild(line);
    return line;
  });

  /* ── geometry measured off the hand-authored rails ─────────────────────── */

  const retryRail = q<SVGPathElement>(svg, "#retry-rail");
  const dlqRail = q<SVGPathElement>(svg, "#dlq-rail");
  const failWire = q<SVGPathElement>(svg, "#w-failover");
  const dep0 = q<SVGPathElement>(svg, "#g-dep-0");

  /* Backoff ticks. Only the part of the rail below y 510 is the siding, so the
     search is fenced to it — otherwise the swing down from the provider, which
     passes through the same x values, wins. */
  const backoffFrac = BACKOFF_X.map((x) => fracNearX(retryRail, x, 524));
  const backoffTicks: SVGLineElement[] = [];
  const backoffLabels: SVGTextElement[] = [];

  backoffFrac.forEach((f, i) => {
    const p = pointAt(retryRail, f);
    const tick = svgEl("line", {
      class: "eng-tick",
      x1: p.x,
      y1: p.y - 7,
      x2: p.x,
      y2: p.y + 7,
    });
    const label = svgEl("text", {
      class: "eng-tick-label",
      x: p.x,
      y: p.y + 26,
      "text-anchor": "middle",
    });
    label.textContent = BACKOFF_LABEL[i]!;
    ticksG.append(tick, label);
    backoffTicks.push(tick);
    backoffLabels.push(label);
  });

  /* The dead-letter siding starts exactly on the rail, past the last tick. */
  const dlqFrac = fracNearX(retryRail, DLQ_BRANCH_X, 524);
  {
    const s = pointAt(retryRail, dlqFrac);
    dlqRail.setAttribute(
      "d",
      `M ${s.x} ${s.y} C ${s.x - 40} ${s.y} ${s.x - 56} ${DLQ_CY} ${s.x - 96} ${DLQ_CY} ` +
        `L ${DLQ_RIGHT} ${DLQ_CY}`,
    );
  }

  /* The secondary wire leaves the primary along the primary's OWN tangent —
     which is what makes the reroute read as peeling off a road rather than
     teleporting onto a new one — and lands on the top edge of the sms box
     rather than its inlet. The inlet is already taken by the primary sms wire,
     and a second line arriving at the same point reads as one line. */
  const FAILOVER_LAND_X = PROV_X + 40;
  const FAILOVER_LAND_Y = PROV_Y[1]! - 23; // the box's top edge
  {
    const a = pointAt(dep0, FAILOVER_SPLIT);
    const b = pointAt(dep0, Math.min(FAILOVER_SPLIT + 0.04, 1));
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    // 26u of tangent: long enough to read as "still heading for email",
    // short enough that the turn does not become a loop.
    const c1x = a.x + ((b.x - a.x) / len) * 26;
    const c1y = a.y + ((b.y - a.y) / len) * 26;
    failWire.setAttribute(
      "d",
      `M ${a.x} ${a.y} C ${c1x} ${c1y} ${FAILOVER_LAND_X} ${FAILOVER_LAND_Y - 47} ` +
        `${FAILOVER_LAND_X} ${FAILOVER_LAND_Y}`,
    );
  }

  /* The permanent failure's road out of the provider column, written from the
     same geometry every other beat reads: it starts where a packet stops at
     the email provider, leaves by that box's far corner (which is the rail
     entry's own x — the two columns line up), bows out past the sms box, and
     lands exactly on the head of the retry rail. See PERM_BOW_X for why it
     bows rather than falling straight. */
  const gPerm = q<SVGPathElement>(svg, "#g-perm");
  gPerm.setAttribute(
    "d",
    `M ${PROV_X} ${PROV_Y[0]!} L ${RAIL_ENTRY_X} ${PROV_Y[0]! + 23} ` +
      `C ${PERM_BOW_X} 208 ${PERM_BOW_X} 296 ${RAIL_ENTRY_X} ${RAIL_ENTRY_Y}`,
  );

  /* ── the push wire, cut into the pieces that break ──────────────────────
     One curve (W_PUSH), five paths off it, and one guide that is still the
     whole thing because a ROUTE does not break — only the line does. Setting
     the guide's own `d` from the same constants is what guarantees the
     packet's flight and the drawn wire cannot drift apart. */
  const gDirect2 = q<SVGPathElement>(svg, "#g-direct-2");
  const frayA = q<SVGPathElement>(svg, "#fray-a");
  const frayB = q<SVGPathElement>(svg, "#fray-b");

  /** The five cuts, in order along the wire. Every boundary is shared, so the
   *  pieces abut exactly and there is no seam to see. */
  const pushCuts: readonly [number, number][] = [
    [0, BREAK_T[0] - FRAY_T],
    [BREAK_T[0] - FRAY_T, BREAK_T[0]],
    [BREAK_T[0], BREAK_T[1]],
    [BREAK_T[1], BREAK_T[1] + FRAY_T],
    [BREAK_T[1] + FRAY_T, 1],
  ];

  gDirect2.setAttribute("d", cubicD(W_PUSH));

  /** The five solid pieces, indexed the same way as pushCuts. */
  const pushPieces = pushCuts.map(([a, b], i) => {
    const p = q<SVGPathElement>(svg, `#w-push-${i}`);
    p.setAttribute("d", cubicD(subCubic(W_PUSH, a, b)));
    return p;
  });

  /* The two dashed ends sit on the same two curves as pieces 1 and 3 — same
     `d`, different stroke — so the cross-fade at the break swaps one for the
     other without anything moving. */
  frayA.setAttribute("d", pushPieces[1]!.getAttribute("d")!);
  frayB.setAttribute("d", pushPieces[3]!.getAttribute("d")!);

  /** The two pieces that stop being line and become dashes. */
  const pushEdges = [pushPieces[1]!, pushPieces[3]!];
  /** The one that goes entirely. */
  const pushSeg = pushPieces[2]!;

  /** The share of the wire's draw each piece owns. Phase A draws them back to
   *  back at a constant rate, which is the only way five paths add up to one
   *  continuous line — see the draw call itself. */
  const pushShare = ((): number[] => {
    const l = pushPieces.map((p) => p.getTotalLength());
    const total = l.reduce((a, b) => a + b, 0);
    return l.map((v) => v / total);
  })();

  /** The broken edge — where the near fray ends — and its fraction along the
   *  route, in ARC LENGTH, which is what motionPath counts in. The packet
   *  flies to exactly here and stops. */
  const breakEdge = splitCubic(W_PUSH, BREAK_T[0])[0][3]!;
  const breakEdgeF = fracNearX(gDirect2, breakEdge[0], 0);

  /* ── the traveling label's lane ─────────────────────────────────────────
     Written as offsets from where the label is authored, so the scrub only
     ever moves it BY something and the still frame — which no scrub touches —
     is already correct. */
  q<SVGPathElement>(svg, "#g-flood-label").setAttribute(
    "d",
    cubicD(
      FLAG_FLOOD_LANE.map(
        (p) => [p[0] - FLAG_FLOOD_AT[0], p[1] - FLAG_FLOOD_AT[1]] as Pt,
      ),
    ),
  );

  /* ── the packet pool ───────────────────────────────────────────────────── */

  const allDots: SVGCircleElement[] = [];

  /** One packet. ALWAYS at the origin — no exceptions, and that is a rule
   *  rather than a convenience. A motionPath's align lands the centre of a
   *  circle authored at 0,0 exactly on the path point, and a later `x`/`y`
   *  tween then moves it in scene coordinates with no offset arithmetic. A
   *  packet carrying its own cx/cy is a packet whose position is the sum of a
   *  point on a CURVE and a fixed screen displacement, which is a point next
   *  to the curve — the phase-A flood spent one commit proving it. */
  function newDot(r = DOT_R): SVGCircleElement {
    const c = svgEl("circle", { class: "eng-dot", cx: 0, cy: 0, r });
    dotsG.appendChild(c);
    allDots.push(c);
    return c;
  }

  const dA = {
    solo: newDot(),
    flood: Array.from({ length: FLOOD_A_N }, () => newDot(FLOOD_A_R)),
    lost: newDot(),
  };
  const dB = { queue: Array.from({ length: 6 }, () => newDot()), dupe: newDot() };
  const dC = { retry: newDot(), fail: newDot(), dlq: newDot(), perm: newDot() };
  const dD = {
    flood: Array.from({ length: FLOOD_N }, () => newDot(FLOOD_R)),
    otp: newDot(5),
    digest: Array.from({ length: DIGEST_N }, () => newDot(3.4)),
    fanIn: newDot(),
    fan: Array.from({ length: 6 }, () => newDot()),
    back: Array.from({ length: 6 }, () => newDot(3.4)),
    /* The ladder's three. All 3.4u — the receipt size, not the packet size:
       the ladder is a 140u box, and a 4.5u dot standing in it would be a
       different scale of object from everything else in that corner. */
    step1: newDot(3.4),
    waiting: newDot(3.4),
    opened: newDot(3.4),
  };

  /* ── the pristine clone ────────────────────────────────────────────────
     Captured now: the anatomy is complete and no gsap.set has touched it, so
     this node IS the finished diagram. The still fallbacks are clones of it.
     Ids are stripped (a document may only have one of each) and the packet
     layer emptied (nothing is in flight in a still frame). */
  const pristine = svg.cloneNode(true) as SVGSVGElement;
  pristine.removeAttribute("id");
  for (const el of Array.from(pristine.querySelectorAll("[id]"))) el.removeAttribute("id");
  pristine.querySelector(".eng-l-dots")?.replaceChildren();

  /* ════════════════════════════════════════════════════════════════════════
     ELEMENT HANDLES
     ════════════════════════════════════════════════════════════════════════ */

  const appBox = q<SVGRectElement>(svg, "#app-box");
  const appLabel = q<SVGTextElement>(svg, "#app-label");

  /* The two direct wires that stay whole. The third one is `pushPieces` — it
     comes apart in phase A and every beat that touches it has to know which
     piece it means. */
  const wEmail = q<SVGPathElement>(svg, "#w-direct-0");
  const wSms = q<SVGPathElement>(svg, "#w-direct-1");

  const flagFlood = q<SVGTextElement>(svg, "#flag-flood");
  const flagDrop = q<SVGTextElement>(svg, "#flag-drop");
  const gFloodLabel = q<SVGPathElement>(svg, "#g-flood-label");

  const chassis = q<SVGRectElement>(svg, "#chassis");
  const chassisLabel = q<SVGTextElement>(svg, "#chassis-label");
  const wAppApi = q<SVGPathElement>(svg, "#w-app-api");
  const apiBox = q<SVGRectElement>(svg, "#api-box");
  const apiLabel = q<SVGTextElement>(svg, "#api-label");
  const wApiSplit = q<SVGPathElement>(svg, "#w-api-split");
  const spP1 = q<SVGPathElement>(svg, "#sp-p1");
  const laneP1 = q<SVGPathElement>(svg, "#lane-p1");
  const gate = q<SVGPathElement>(svg, "#gate");
  const gateLabel = q<SVGTextElement>(svg, "#gate-label");
  const wGateWall = q<SVGPathElement>(svg, "#w-gate-wall");
  const lblQueue = q<SVGTextElement>(svg, "#lbl-queue");

  /** The three slotted boxes, indexed the same way as QUEUE_Y / slotLines. */
  const queueBoxes = [0, 1, 2].map((i) => q<SVGRectElement>(svg, `#queue-p${i}`));

  const spP0 = q<SVGPathElement>(svg, "#sp-p0");
  const laneP0 = q<SVGPathElement>(svg, "#lane-p0");
  const spP2 = q<SVGPathElement>(svg, "#sp-p2");
  const laneP2 = q<SVGPathElement>(svg, "#lane-p2");
  const lblP0 = q<SVGTextElement>(svg, "#lbl-p0");
  const lblP1 = q<SVGTextElement>(svg, "#lbl-p1");
  const lblP2 = q<SVGTextElement>(svg, "#lbl-p2");

  const provWires = [0, 1, 2].map((i) => q<SVGPathElement>(svg, `#w-prov-${i}`));
  const provGroups = [0, 1, 2].map((i) => q<SVGGElement>(svg, `#prov-${i}`));
  const provRects = provGroups.map((g) => q<SVGRectElement>(g, "rect"));

  const dlqBox = q<SVGRectElement>(svg, "#dlq-box");
  const dlqLabel = q<SVGTextElement>(svg, "#dlq-label");
  const dlqAside = q<SVGTextElement>(svg, "#dlq-aside");
  /* The two permanent marks on the siding, in arrival order. A packet parks
     ON one of these and then hands over to it, so a mark that has drifted off
     DLQ_PARK_X is a packet that visibly jumps at the end of its journey —
     which is exactly the kind of thing a diff does not show. */
  const dlqMarks = [1, 2].map((i, k) => {
    const mark = q<SVGCircleElement>(svg, i === 1 ? "#dlq-mark" : `#dlq-mark-${i}`);
    if (Number(mark.getAttribute("cx")) !== DLQ_PARK_X[k]) {
      throw new Error(`[engine] dlq mark ${i} is not on DLQ_PARK_X[${k}]`);
    }
    return mark;
  });

  const stripLine = q<SVGPathElement>(svg, "#strip-line");
  const stripLabel = q<SVGTextElement>(svg, "#strip-label");
  const stripLegend = q<SVGTextElement>(svg, "#strip-legend");

  const stamp429 = q<SVGTextElement>(svg, "#stamp-429");
  const stamp202 = q<SVGTextElement>(svg, "#stamp-202");
  const stampDupe = q<SVGTextElement>(svg, "#stamp-dupe");
  const stampRetry = q<SVGTextElement>(svg, "#stamp-retry");
  const stampInvalid = q<SVGTextElement>(svg, "#stamp-invalid");
  const asideFailover = q<SVGTextElement>(svg, "#aside-failover");
  const asidePerm = q<SVGTextElement>(svg, "#aside-perm");
  const asideDigest = q<SVGTextElement>(svg, "#aside-digest");
  const asideEda = q<SVGTextElement>(svg, "#aside-eda");
  const lblDigest = q<SVGTextElement>(svg, "#lbl-digest");
  const lblIdem = q<SVGTextElement>(svg, "#lbl-idem");
  const digestEnv = q<SVGGElement>(svg, "#digest-env");

  /* The workflow ladder. `skipStep1/2`, `skipGate` and `skipJambs` are
     already in hand from the generated-DOM section above. */
  const skipIn = q<SVGPathElement>(svg, "#skip-in");
  const skipWire = q<SVGPathElement>(svg, "#skip-wire");
  const skipLbl1 = q<SVGTextElement>(svg, "#skip-lbl-1");
  const skipLbl2 = q<SVGTextElement>(svg, "#skip-lbl-2");
  const skipDots = [1, 2].map((i) => q<SVGCircleElement>(svg, `#skip-dot-${i}`));
  const skipJunction = q<SVGCircleElement>(svg, "#skip-junction");
  const skipDelivered = q<SVGTextElement>(svg, "#skip-delivered");
  const lblSkip = q<SVGTextElement>(svg, "#lbl-skip");
  const skipStamp = q<SVGTextElement>(svg, "#skip-stamp");
  const gOpened = q<SVGPathElement>(svg, "#g-opened");

  const dep1 = q<SVGPathElement>(svg, "#g-dep-1");
  const dep2 = q<SVGPathElement>(svg, "#g-dep-2");
  const gLaneP0 = q<SVGPathElement>(svg, "#g-lane-p0");
  const gLaneP2 = q<SVGPathElement>(svg, "#g-lane-p2");
  const gFanIn = q<SVGPathElement>(svg, "#g-fan-in");

  /** Every filled box. DrawSVG traces an outline; it knows nothing about the
   *  fill, so a --surface rectangle would sit on the canvas fully painted
   *  while its own border is still being drawn. The fill fades in behind the
   *  trace instead — same move the bell makes with the clapper ball, and the
   *  same reason: the drawing is a line drawing first. */
  const boxRects: SVGRectElement[] = [
    appBox,
    apiBox,
    ...provRects,
    dlqBox,
    ...termRects,
    skipStep1,
    skipStep2,
  ];

  /** Everything that gets traced rather than faded in. */
  const strokeParts: SVGGeometryElement[] = [
    appBox,
    wEmail,
    wSms,
    ...pushPieces,
    chassis,
    wAppApi,
    apiBox,
    wApiSplit,
    spP1,
    laneP1,
    ...queueBoxes,
    ...slotLines.flat(),
    wGateWall,
    spP0,
    laneP0,
    spP2,
    laneP2,
    ...provWires,
    ...provRects,
    failWire,
    retryRail,
    dlqRail,
    dlqBox,
    stripLine,
    ...fanWires,
    ...termRects,
    skipIn,
    skipWire,
    skipStep1,
    skipStep2,
  ];

  /** Everything that only ever fades. */
  const fadeParts: SVGElement[] = [
    appLabel,
    chassisLabel,
    apiLabel,
    gateLabel,
    lblQueue,
    lblP0,
    lblP1,
    lblP2,
    ...provGroups.map((g) => q<SVGTextElement>(g, "text")),
    ...backoffTicks,
    ...backoffLabels,
    dlqLabel,
    dlqAside,
    ...dlqMarks,
    stripLabel,
    stripLegend,
    ...stripTicks,
    ...stripDots,
    ...termLabels,
    ...termDots,
    ...termReceipts,
    stamp429,
    stamp202,
    stampDupe,
    stampRetry,
    stampInvalid,
    asideFailover,
    asidePerm,
    asideDigest,
    asideEda,
    lblDigest,
    lblIdem,
    digestEnv,
    /* The workflow ladder's marks. The gate BAR is not here — it is a
       drawSVG, not a fade, and it rests at "50% 50%" rather than at 0. */
    ...skipJambs,
    skipLbl1,
    skipLbl2,
    ...skipDots,
    skipJunction,
    skipDelivered,
    lblSkip,
    skipStamp,
    /* Phase A's two flags and the two frayed ends. All four are marks the
       stylesheet paints in their finished state and restState hides, same as
       every other fade — which is also why the still cards get them free. */
    flagFlood,
    flagDrop,
    frayA,
    frayB,
  ];

  /* ════════════════════════════════════════════════════════════════════════
     REST STATE — the inverse of the stylesheet
     ════════════════════════════════════════════════════════════════════════ */

  /* ── the camera ──────────────────────────────────────────────────────────
     Three numbers — zoom, and the scene point to centre — tweened as a plain
     object and written out as one transform attribute. Not as gsap `scale`/
     `x`/`y` on the group, and that is load-bearing: gsap resolves an SVG
     element's transform origin against its own bbox unless `svgOrigin` sticks,
     re-derives it whenever the transform cache is rebuilt, and applies
     smoothOrigin compensation when it thinks the origin moved. A camera whose
     pivot silently becomes "wherever the drawing happens to be widest" drifts
     a little further off with every keyframe. Owning the matrix costs one
     setAttribute per frame and cannot be wrong.

     The mapping is: scene point p renders at z·p + t, and t is chosen so that
     (fx,fy) lands on the frame centre. */
  const camState = { z: CAM_START.z, fx: CAM_START.fx, fy: CAM_START.fy };

  function applyCam(): void {
    const { z, fx, fy } = camState;
    cam.setAttribute(
      "transform",
      `translate(${(FRAME_CX - z * fx).toFixed(3)} ${(FRAME_CY - z * fy).toFixed(3)}) scale(${z.toFixed(5)})`,
    );
  }

  function restState(): void {
    gsap.set(pin, { opacity: 0 });
    gsap.set(caps, { opacity: 0, y: 10 });
    gsap.set(stat, { opacity: 0 });
    gsap.set(progressFill, { scaleY: 0 });

    gsap.set(strokeParts, { drawSVG: "0% 0%" });
    /* The two gates in the scene rest COLLAPSED ONTO THEIR OWN MIDDLE rather
       than at zero, because both of them grow outward from there: the meter
       widens from 44u to its full 164u when the queue splits, and the
       workflow's bar snaps out to its jambs when the "opened" lands. */
    gsap.set([gate, skipGate], { drawSVG: "50% 50%" });
    gsap.set(boxRects, { fillOpacity: 0 });
    gsap.set(fadeParts, { opacity: 0 });
    gsap.set(provGroups, { opacity: 1 });
    /* Every status dot starts at idle ink, including the workflow's two. The
       stylesheet paints step 1's green (it delivers) and step 2's faint (it
       never does); rest is where both are still waiting to be told. */
    gsap.set([...termDots, ...skipDots], { fill: COLOR.faint });
    gsap.set(provRects, { stroke: COLOR.hairline });
    /* Packets are invisible at rest, and PARKED ON THE APP'S OUTLET rather
       than left at the scene origin. The opacity is what actually hides them;
       the position is the insurance. A circle authored at cx/cy 0 (which they
       must be, so motionPath's align needs no offset arithmetic) sits at the
       viewBox's top-left corner until something moves it — so the failure mode
       of ANY future beat that forgets to place a packet before showing it is a
       green dot floating above the schematic, attached to nothing. Parked on
       the outlet, the same mistake puts it on the wire, where it belongs. */
    gsap.set(allDots, {
      opacity: 0,
      fill: COLOR.greenDim,
      scale: 1,
      x: APP_OUT_X,
      y: SPINE_Y,
      transformOrigin: "50% 50%",
    });
    gsap.set(digestEnv, { x: QUEUE_HEAD_X, y: SPINE_Y, scale: 1, transformOrigin: "50% 50%" });
    /* The traveling label is the one piece of TEXT the scrub moves. Its lane
       is written in offsets from where the markup already puts it, so zero is
       its home and rest means "not moved". */
    gsap.set(flagFlood, { x: 0, y: 0 });
    /* The push wire's middle three pieces are hidden by drawSVG above, but the
       break drives their OPACITY as well — the segment flickers, the two edges
       hand over to their dashed twins. Rest has to put that back or a rewind
       past the break leaves a dimmed or missing piece of wire. */
    gsap.set([pushSeg, ...pushEdges], { opacity: 1 });
    /* Same insurance for the secondary wire: phase C dims it to a ghost when
       the permanent failure declines it, and phase D fades it out with the
       providers. Both are fromTo pairs and both rewind, but rest is where the
       scene states what it believes rather than where it trusts a tween. */
    gsap.set(failWire, { opacity: 1 });
    camState.z = CAM_START.z;
    camState.fx = CAM_START.fx;
    camState.fy = CAM_START.fy;
    applyCam();
  }

  /* ════════════════════════════════════════════════════════════════════════
     THE STILL STATE  (< 768px, and prefers-reduced-motion)
     ════════════════════════════════════════════════════════════════════════ */

  function buildStill(reduced: boolean): () => void {
    const frag = doc.createDocumentFragment();

    function figure(phase: string, box: string): HTMLElement {
      const wrap = doc.createElement("div");
      wrap.className = "eng-card-figure";
      wrap.dataset["phase"] = phase;
      const clone = pristine.cloneNode(true) as SVGSVGElement;
      clone.setAttribute("viewBox", box);
      // The card is exactly as tall as its own window is deep, so nothing
      // letterboxes and no two cards share an arbitrary aspect ratio.
      const n = box.split(" ");
      clone.style.aspectRatio = `${n[2]} / ${n[3]}`;
      wrap.appendChild(clone);
      return wrap;
    }

    function copyStat(): HTMLElement {
      const el = stat.cloneNode(true) as HTMLElement;
      el.removeAttribute("id");
      return el;
    }

    if (reduced) {
      /* One finished figure, then the argument as a list. The reader gets
         every piece of information the motion carried; none of it moves. */
      const lede = doc.createElement("p");
      lede.className = "eng-still-lede";
      lede.textContent = "One API call in. Every provider paced, retried and accounted for.";
      frag.appendChild(lede);
      frag.appendChild(figure("all", "0 24 1200 592"));
      for (const [i, capNode] of caps.entries()) {
        const card = doc.createElement("div");
        card.className = "eng-card";
        card.append(...Array.from(capNode.children).map((n) => n.cloneNode(true)));
        /* Phase A is the one phase whose mechanism is ERASED from the finished
           anatomy: the direct wires retract the moment the engine arrives, so
           the whole-drawing figure above has no flood, no broken wire, and
           nowhere to hang the two things phase A says out loud. It gets its
           own close-up, or a reduced-motion reader never learns what the
           engine was built to answer (DESIGN §3 — same information, delivered
           by layout instead of by time). No other caption needs one; every
           other mechanism is still in the finished picture. */
        if (i === 0) card.appendChild(figure(CARD_VIEW[0].phase, CARD_VIEW[0].box));
        frag.appendChild(card);
      }
      frag.appendChild(copyStat());
    } else {
      /* One card per caption, each a close-up of the mechanism it describes. */
      for (const view of CARD_VIEW) {
        const card = doc.createElement("div");
        card.className = "eng-card";
        const cap = caps[view.cap];
        if (cap) card.append(...Array.from(cap.children).map((n) => n.cloneNode(true)));
        card.appendChild(figure(view.phase, view.box));
        frag.appendChild(card);
      }
      frag.appendChild(copyStat());
    }

    still.replaceChildren(frag);
    still.hidden = false;
    pin.hidden = true;

    return () => {
      still.replaceChildren();
      still.hidden = true;
      pin.hidden = false;
    };
  }

  /* ════════════════════════════════════════════════════════════════════════
     THE SCRUB
     ════════════════════════════════════════════════════════════════════════ */

  function buildScrub(): void {
    restState();

    /* The scene materialises on the way in. Its own trigger, because the pin's
       timeline does not start until the section is already at the top. */
    gsap.fromTo(
      pin,
      { opacity: 0 },
      {
        opacity: 1,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top 85%",
          end: "top 12%",
          scrub: true,
        },
      },
    );

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      /* The camera's three numbers are tweened; this is what paints them. Pure
         function of camState, so it is as rewindable as the tweens are. */
      onUpdate: applyCam,
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: `+=${PIN_HEIGHTS * 100}%`,
        pin,
        pinSpacing: true,
        anticipatePin: 1,
        scrub: SCRUB,
        invalidateOnRefresh: true,
      },
    });

    /* ── the five helpers every beat is built from ───────────────────────
       All of them are fromTo with immediateRender:false, which is the whole
       trick: the timeline can be rendered at any progress, in any order, and
       every element knows both ends of every tween it is in. */

    function ft(t: gsap.TweenTarget, from: gsap.TweenVars, to: gsap.TweenVars, at: number): void {
      tl.fromTo(t, from, { ...to, immediateRender: false }, at);
    }

    const fadeIn = (t: gsap.TweenTarget, at: number, dur = 1.2, to = 1, stagger = 0): void =>
      ft(t, { opacity: 0 }, { opacity: to, duration: dur, stagger }, at);

    const fadeOut = (t: gsap.TweenTarget, at: number, dur = 1.2, from = 1): void =>
      ft(t, { opacity: from }, { opacity: 0, duration: dur }, at);

    const draw = (t: gsap.TweenTarget, at: number, dur: number, stagger = 0): void =>
      ft(t, { drawSVG: "0% 0%" }, { drawSVG: "0% 100%", duration: dur, stagger, ease: "power2.out" }, at);

    /** A box: outline traced, fill brought up behind it at the halfway mark so
     *  the rectangle is a line before it is a surface. */
    const drawBox = (t: gsap.TweenTarget, at: number, dur: number, stagger = 0): void => {
      draw(t, at, dur, stagger);
      ft(t, { fillOpacity: 0 }, { fillOpacity: 1, duration: dur * 0.8, stagger }, at + dur * 0.45);
    };

    /** A packet running a route. Always explicit about both ends of the path
     *  so the tween is a pure function of progress and never of whatever
     *  transform the element happened to be carrying.
     *
     *  `raw` drops `align`/`alignOrigin` and lets the path's own coordinates
     *  land straight in x/y. Every guide and every packet lives inside
     *  #eng-cam with no transform of its own, so the two forms put a centred
     *  element in exactly the same place — but `alignOrigin` measures the
     *  target's bounding box and centres THAT on the path, which silently
     *  cancels any offset the element was authored with. The traveling label
     *  is the one thing in the scene that needs its offset to survive the
     *  flight — it is authored at its landing point and its lane is written
     *  as displacements from there — so it is the one thing that runs `raw`.
     *  Packets never do: they are circles at the origin and `align` puts
     *  their centres on the stroke. */
    function run(
      dot: Element,
      path: SVGPathElement,
      at: number,
      dur: number,
      o: { start?: number; end?: number; ease?: string; raw?: boolean } = {},
    ): void {
      const span = { start: o.start ?? 0, end: o.end ?? 1 };
      tl.to(
        dot,
        {
          motionPath: o.raw
            ? { path, ...span }
            : { path, align: path, alignOrigin: [0.5, 0.5], ...span },
          duration: dur,
          ease: o.ease ?? "none",
          immediateRender: false,
        },
        at,
      );
    }

    /** The delivered-dot's moment: dim green to full green, 1.45× pop, settle,
     *  then out. Two power2 tweens, never an elastic ease (DESIGN §3). */
    function deliver(dot: Element, at: number, fade = true): void {
      ft(dot, { fill: COLOR.greenDim }, { fill: COLOR.green, duration: 0.14 }, at);
      ft(dot, { scale: 1 }, { scale: 1.45, duration: 0.26, ease: "power2.out" }, at);
      ft(dot, { scale: 1.45 }, { scale: 1, duration: 0.3, ease: "power2.inOut" }, at + 0.26);
      if (fade) fadeOut(dot, at + 0.7, 0.8);
    }

    /* ── the camera ──────────────────────────────────────────────────────── */
    {
      let prev = CAM_START;
      for (const k of CAM) {
        ft(
          camState,
          { z: prev.z, fx: prev.fx, fy: prev.fy },
          { z: k.z, fx: k.fx, fy: k.fy, duration: k.dur, ease: "power2.inOut" },
          k.at,
        );
        prev = k;
      }
    }

    /* ── the rail ────────────────────────────────────────────────────────── */
    ft(progressFill, { scaleY: 0 }, { scaleY: 1, duration: TL_END }, 0);

    caps.forEach((capEl, i) => {
      const at = CAP_AT[i]!;
      const next = CAP_AT[i + 1];
      ft(capEl, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: CAP_FADE, ease: "power2.out" }, at);
      if (next !== undefined) {
        ft(
          capEl,
          { opacity: 1, y: 0 },
          { opacity: 0, y: -10, duration: CAP_FADE, ease: "power2.in" },
          next - CAP_FADE,
        );
      }
    });

    /* ══════════════════════════════════════════════════════════════════════
       PHASE A — THE PROBLEM   (0 → 18)
       ══════════════════════════════════════════════════════════════════════ */

    drawBox(appBox, PHASE_A, 2.0);
    fadeIn(appLabel, 1.2, 1.2);
    drawBox(provRects, 1.0, 2.0, 0.5);
    fadeIn(
      provGroups.map((g) => q<SVGTextElement>(g, "text")),
      2.4,
      1.2,
      1,
      0.5,
    );
    /** How long a direct wire takes to draw, and the gap between the three of
     *  them. The push wire is drawn last, which is why its pieces begin at
     *  2.6 + 2 · 0.35. */
    const WIRE_DUR = 2.6;
    const WIRE_GAP = 0.35;
    draw([wEmail, wSms], 2.6, WIRE_DUR, WIRE_GAP);

    /* The push wire is five paths and has to draw as ONE line, so each piece
       takes exactly the share of WIRE_DUR that its own length is, back to
       back. Ease "none" and not draw()'s power2.out, and that is the whole
       reason this is written out rather than being a draw() call: an eased
       sweep cannot be cut into pieces and reassembled — five power2.out curves
       laid end to end is a line that lurches five times. A linear
       concatenation is exact. Over 2.6 units, against two neighbours easing
       out beside it, the constant rate is not readable. */
    {
      let at = 2.6 + 2 * WIRE_GAP;
      pushPieces.forEach((piece, i) => {
        const dur = WIRE_DUR * pushShare[i]!;
        ft(piece, { drawSVG: "0% 0%" }, { drawSVG: "0% 100%", duration: dur }, at);
        at += dur;
      });
    }

    /* One packet gets through, so the reader learns what an arrival looks
       like before being shown fourteen that do not. */
    fadeIn(dA.solo, 5.4, 0.4);
    run(dA.solo, wSms, 5.4, 2.4, { ease: "power1.inOut" });
    deliver(dA.solo, 7.8);

    /* ── the flood ─────────────────────────────────────────────────────────
       Fourteen at the same provider, nose to tail. Every one of them starts
       at the same end of the same wire and runs it at the same RATE — the
       convoy is one number, FLOOD_A_PITCH, applied to the moment they leave.
       They differ in one other thing, and only at the end: how far they get
       before the 429 meets them (FLOOD_A_REFUSE), which sets each one's
       duration so that the rate stays shared. Nothing here displaces a packet
       from the curve, so nothing here can lift one off it. */
    /** The wire's own arc length, asked of the wire rather than recomputed
     *  from a copy of its `d`. Every halt point below is read off the same
     *  object the packets are flying, so a packet and the place it stops
     *  cannot drift apart — the contract the push wire gets from W_PUSH. */
    const emailLen = wEmail.getTotalLength();

    dA.flood.forEach((dot, i) => {
      const t = FLOOD_A_T0 + i * FLOOD_A_PITCH;
      /* How much of the wire this packet gets before the 429 coming the other
         way reaches it — and, the rate being shared, how long that takes.
         See FLOOD_A_REFUSE. */
      const reach = 1 - (i * (FLOOD_A_PITCH - FLOOD_A_REFUSE)) / FLOOD_A_DUR;
      const hit = t + FLOOD_A_DUR * reach;
      const halt = wEmail.getPointAtLength(reach * emailLen);

      fadeIn(dot, t, 0.35);
      run(dot, wEmail, t, FLOOD_A_DUR * reach, { end: reach });

      /* Refused where it stands. The packet goes amber, waits its turn — one
         FLOOD_A_DIE_STEP longer than the packet ahead of it — and then comes
         off the wire under gravity: power2.in, because that is what falling
         is, from ITS OWN point on the curve instead of from a shared one.
         The distance and the duration are read off the packet's place in the
         train (one gravity, fourteen different drops), derived rather than
         rolled, so a scroll back up finds the same fourteen falls. */
      const drop = FLOOD_A_FALL + (FLOOD_A_N - 1 - i) * FLOOD_A_FALL_STEP;
      const go = hit + FLOOD_A_DIE + i * FLOOD_A_DIE_STEP;
      ft(dot, { fill: COLOR.greenDim }, { fill: COLOR.amber, duration: 0.2 }, hit);
      ft(
        dot,
        { y: halt.y },
        {
          y: halt.y + drop,
          duration: FLOOD_A_FALL_DUR * Math.sqrt(drop / FLOOD_A_FALL),
          ease: "power2.in",
        },
        go,
      );
      fadeOut(dot, go + 0.3, 1.5);
    });

    /* The complaint, riding the train. Same start as its nose, same duration,
       same rate, on a lane that is their wire lifted clear — so it is not
       following them, it is one of them. */
    run(flagFlood, gFloodLabel, FLOOD_A_T0, FLOOD_A_DUR, { raw: true });
    fadeIn(flagFlood, FLOOD_A_T0 + 0.3, 0.5);

    /* And the provider answers. 0.35 units after the label lands, not with
       it: call, beat, response. Three sentences in a row would be noise. */
    ft(provRects[0]!, { stroke: COLOR.hairline }, { stroke: COLOR.amber, duration: 0.5 }, FLOOD_A_HIT);
    fadeIn(stamp429, FLOOD_A_HIT + 0.35, 0.9);
    /* The label leaves once it has been answered. The 429 stays, because the
       provider's word is the one that counts. */
    fadeOut(flagFlood, FLOOD_A_HIT + 0.95, 0.85);
    fadeOut(stamp429, 13.6, 1.4);
    ft(provRects[0]!, { stroke: COLOR.amber }, { stroke: COLOR.hairline, duration: 1.4 }, 13.6);

    /* ══════════════════════════════════════════════════════════════════════
       PHASE A — THE NETWORK DROP   (12.6 → 18)
       ──────────────────────────────────────────────────────────────────────
       The second half of the phase is a different accusation. The flood was
       the PROVIDER refusing; this is nobody refusing. The wire fails, and the
       packet on it has nowhere to be.

       It is staged on the push link because that link is otherwise idle: the
       flood owns the top wire and the one delivery owned the middle, so the
       bottom of the frame is clear and the two failures never share a beat.
       ══════════════════════════════════════════════════════════════════════ */

    /** When the segment starts arguing. Everything below is written against
     *  it, so the whole break moves as one if the phase is retimed. */
    const DROP_T0 = 12.6;

    /* Two stutters. A link does not go down cleanly, it flickers first — and
       the flicker is what makes the reader look at the wire instead of at the
       packet, which is the point: the wire is the subject now. */
    ft(pushSeg, { opacity: 1 }, { opacity: 0.12, duration: 0.12 }, DROP_T0);
    ft(pushSeg, { opacity: 0.12 }, { opacity: 1, duration: 0.14 }, DROP_T0 + 0.12);
    ft(pushSeg, { opacity: 1 }, { opacity: 0.18, duration: 0.12 }, DROP_T0 + 0.34);
    ft(pushSeg, { opacity: 0.18 }, { opacity: 1, duration: 0.14 }, DROP_T0 + 0.46);

    /* Then it dissolves. drawSVG collapses the segment onto its own middle,
       so the gap opens outward from a point rather than being erased from one
       end — a line coming apart, not a line being rubbed out. It lands on a
       ZERO-LENGTH dash, which with `stroke-linecap: butt` (DESIGN §3, and
       styles.css says it again) is nothing at all. With a round cap it would
       be a 1px dot sitting in the middle of the gap, which is the exact bug
       this scene has already paid for once. */
    ft(pushSeg, { drawSVG: "0% 100%" }, { drawSVG: "50% 50%", duration: 0.7, ease: "power2.in" }, DROP_T0 + 0.7);

    /* The ends fray: the two edge pieces hand over to their dashed twins, which
       lie on exactly the same curve. A cross-fade and not a retraction — see
       index.html for why a retraction cannot work on a non-scaling stroke.
       The dashes come up 0.1 behind the solid going down, so there is a frame
       where the edge is neither, which is the fray happening. */
    fadeOut(pushEdges, DROP_T0 + 1.0, 0.5);
    fadeIn([frayA, frayB], DROP_T0 + 1.1, 0.5, 0.9);

    /* It is not dead, it is intermittent, which is worse. Three dips, unevenly
       spaced so they never read as a pulse. Authored as tweens rather than a
       repeating one: an infinite loop has no place on a timeline that can run
       backwards, and this one has to rewind like everything else. */
    ([
      [14.9, 0.34],
      [15.9, 0.5],
      [17.0, 0.28],
    ] as const).forEach(([at, lo]) => {
      ft([frayA, frayB], { opacity: 0.9 }, { opacity: lo, duration: 0.18 }, at);
      ft([frayA, frayB], { opacity: lo }, { opacity: 0.9, duration: 0.22 }, at + 0.18);
    });

    /* ── the packet that finds it ──────────────────────────────────────────
       It leaves before the segment has finished dissolving and arrives after
       — so the reader watches it commit to a wire that is already failing,
       which is the whole feeling of a network drop. The route is the WHOLE
       curve (#g-direct-2): a route does not break, only the line does. */
    const DROP_PKT_T0 = 12.9;
    const DROP_PKT_DUR = 1.5;
    /** When it reaches the severed edge, and where. */
    const DROP_EDGE_AT = DROP_PKT_T0 + DROP_PKT_DUR;
    const [edgeX, edgeY] = breakEdge;

    fadeIn(dA.lost, DROP_PKT_T0, 0.4);
    run(dA.lost, gDirect2, DROP_PKT_T0, DROP_PKT_DUR, {
      end: breakEdgeF,
      ease: "power1.inOut",
    });

    /* The teeter. Lean, pull back, lean again — three tweens, none of them
       more than 5u, which on a 1200u schematic is nothing and is meant to be:
       it has to read as hesitation, not as a second journey. sine.inOut on the
       first two because a rock is a rock; sine.in on the third because that
       one does not come back. */
    ft(
      dA.lost,
      { x: edgeX, y: edgeY },
      { x: edgeX + 4, y: edgeY + 2.5, duration: 0.3, ease: "sine.inOut" },
      DROP_EDGE_AT,
    );
    ft(
      dA.lost,
      { x: edgeX + 4, y: edgeY + 2.5 },
      { x: edgeX - 2, y: edgeY - 1, duration: 0.28, ease: "sine.inOut" },
      DROP_EDGE_AT + 0.3,
    );
    ft(
      dA.lost,
      { x: edgeX - 2, y: edgeY - 1 },
      { x: edgeX + 5, y: edgeY + 3, duration: 0.26, ease: "sine.in" },
      DROP_EDGE_AT + 0.58,
    );

    /* And through. Gravity down (power2.in), a little forward drift because it
       was still moving when the wire stopped, and a tumble.

       THE TUMBLE: a circle cannot show rotation — spin a disc about its own
       centre and nothing on screen changes. So it is squashed onto its edge
       and back while it turns, which is what a coin going end over end
       actually looks like. Two tweens on scaleY plus one on rotation, and the
       rotation only becomes visible BECAUSE of the squash. */
    const DROP_FALL_AT = DROP_EDGE_AT + 0.84;
    const DROP_FALL_DUR = 2.0;
    ft(
      dA.lost,
      { y: edgeY + 3 },
      { y: edgeY + 3 + 210, duration: DROP_FALL_DUR, ease: "power2.in" },
      DROP_FALL_AT,
    );
    ft(dA.lost, { x: edgeX + 5 }, { x: edgeX + 19, duration: DROP_FALL_DUR }, DROP_FALL_AT);
    ft(dA.lost, { rotation: 0 }, { rotation: 214, duration: DROP_FALL_DUR }, DROP_FALL_AT);
    ft(
      dA.lost,
      { scaleY: 1 },
      { scaleY: 0.42, duration: DROP_FALL_DUR * 0.42, ease: "sine.inOut" },
      DROP_FALL_AT,
    );
    ft(
      dA.lost,
      { scaleY: 0.42 },
      { scaleY: 1, duration: DROP_FALL_DUR * 0.58, ease: "sine.inOut" },
      DROP_FALL_AT + DROP_FALL_DUR * 0.42,
    );
    /* Gone before it reaches the bottom of the frame, so it reads as falling
       out of the drawing rather than as landing on its edge — but not before.
       power2.in means the first half of the fall covers a quarter of the
       distance, so a fade that starts at +0.7 spends itself while the packet
       has barely moved and the tumble never gets seen. +1.0 puts the whole
       fade in the part of the drop that is actually moving. */
    fadeOut(dA.lost, DROP_FALL_AT + 1.0, 0.95);

    /* ── and the name of it ────────────────────────────────────────────────
       Struck in where it happened, with the same double-blink the segment made
       on its way out — so the label reads as the wire's own last word rather
       than as a caption somebody added afterwards. Then it settles faint and
       stays for the rest of the phase, because unlike the 429 nobody is going
       to tell you about this one twice. */
    const DROP_LBL_AT = 15.3;
    ft(flagDrop, { opacity: 0 }, { opacity: 0.95, duration: 0.1 }, DROP_LBL_AT);
    ft(flagDrop, { opacity: 0.95 }, { opacity: 0, duration: 0.12 }, DROP_LBL_AT + 0.1);
    ft(flagDrop, { opacity: 0 }, { opacity: 1, duration: 0.1 }, DROP_LBL_AT + 0.32);
    ft(flagDrop, { opacity: 1 }, { opacity: 0, duration: 0.12 }, DROP_LBL_AT + 0.42);
    ft(flagDrop, { opacity: 0 }, { opacity: FLAG_SETTLE, duration: 0.5 }, DROP_LBL_AT + 0.64);

    /* ══════════════════════════════════════════════════════════════════════
       PHASE B — THE ABSORBER   (18 → 42)
       ══════════════════════════════════════════════════════════════════════ */

    /* The direct wires retract toward the providers as the engine takes the
       middle of the line. Nothing is deleted; the route is re-cut. */
    ft(
      [wEmail, wSms],
      { drawSVG: "0% 100%" },
      { drawSVG: "100% 100%", duration: 2.6, stagger: 0.3, ease: "power2.inOut" },
      PHASE_B,
    );

    /* The broken wire leaves as it stands, on the third beat of the stagger:
       the two surviving pieces retract to their own far ends, the frayed ends
       and the label fade, and the three pieces in the middle are already
       nothing — two at opacity 0 since the break, one dissolved. */
    ft(
      [pushPieces[0]!, pushPieces[4]!],
      { drawSVG: "0% 100%" },
      { drawSVG: "100% 100%", duration: 2.6, ease: "power2.inOut" },
      PHASE_B + 0.6,
    );
    fadeOut([frayA, frayB], PHASE_B + 0.6, 1.6, 0.9);
    fadeOut(flagDrop, PHASE_B - 0.6, 1.4, FLAG_SETTLE);

    draw(chassis, 19.4, 3.0);
    fadeIn(chassisLabel, 21.6, 1.2);
    drawBox(apiBox, 21.0, 1.6);
    fadeIn(apiLabel, 22.4, 1.0);
    draw(wAppApi, 22.2, 1.2);
    draw([wApiSplit, spP1], 23.0, 0.8);
    draw(laneP1, 23.4, 1.0);

    /* The queue builds in the order it would be read: the box first, then the
       cells ruled into it left to right, so the reader watches six places to
       stand appear before anything arrives to stand in them. Both are done by
       25.9, and the first packet does not reach a slot until 29.3. */
    draw(queueBoxes[1]!, 24.1, 1.4);
    draw(slotLines[1]!, 24.9, 0.6, 0.1);

    ft(gate, { drawSVG: "50% 50%" }, { drawSVG: GATE_SHORT, duration: 1.0, ease: "power2.out" }, 25.2);
    draw(wGateWall, 25.6, 0.8);
    draw(provWires, 26.0, 2.0, 0.4);
    fadeIn([lblQueue, gateLabel], 26.2, 1.0, 1, 0.15);

    /* The same burst, absorbed. Arrivals are ragged (BURST_OFFSETS, two
       clumps); departures are a metronome (METER_PERIOD). The queue advances
       one slot every time the head leaves. */
    const BURST_T0 = 27.4;
    const LEG_APP_API = 0.85;
    /** api → the TAIL cell, then tail → the deepest cell still free. Two legs
     *  and not one, because a message that materialises in the middle of the
     *  box has not joined a queue — it has to come in at the back and walk
     *  forward past the cells that are already taken. The first burst arrives
     *  at an empty queue, so packet 0 walks the whole box; packet 5 stops
     *  where it entered. Everything is settled by 30.6, and the meter does not
     *  release until 31.2. */
    const LEG_API_TAIL = 0.62;
    const LEG_TAIL_SLOT = 0.45;
    const QUEUE_TAIL_X = QUEUE_X0 + QUEUE_SLOT / 2;
    const DEPART_T0 = 31.2;
    const LEG_DEPART = 2.05;

    fadeIn(stamp202, BURST_T0 + LEG_APP_API - 0.05, 0.8);
    fadeOut(stamp202, 33.0, 1.0);

    dB.queue.forEach((dot, i) => {
      const t = BURST_T0 + BURST_OFFSETS[i]!;
      const slotX = QUEUE_HEAD_X - i * QUEUE_SLOT;

      fadeIn(dot, t, 0.3);
      ft(dot, { x: APP_OUT_X, y: SPINE_Y }, { x: API_CX, duration: LEG_APP_API }, t);
      ft(
        dot,
        { x: API_CX },
        { x: QUEUE_TAIL_X, duration: LEG_API_TAIL, ease: "power2.out" },
        t + LEG_APP_API,
      );
      ft(
        dot,
        { x: QUEUE_TAIL_X },
        { x: slotX, duration: LEG_TAIL_SLOT, ease: "power2.inOut" },
        t + LEG_APP_API + LEG_API_TAIL,
      );

      /* Every packet ahead of it that leaves moves it one slot forward. This
         is the buffering — six dots standing still on a rail is a picture of
         a queue, six dots shuffling up a cell at a time as the head departs
         is a queue. */
      for (let d = 0; d < i; d++) {
        const from = QUEUE_HEAD_X - (i - d) * QUEUE_SLOT;
        ft(
          dot,
          { x: from },
          { x: from + QUEUE_SLOT, duration: 0.4, ease: "power2.inOut" },
          DEPART_T0 + d * METER_PERIOD,
        );
      }

      const depart = DEPART_T0 + i * METER_PERIOD;
      const guide = [dep0, dep1, dep2][i % 3]!;
      run(dot, guide, depart, LEG_DEPART, { ease: "power1.inOut" });
      deliver(dot, depart + LEG_DEPART);
    });

    /* Send twice, deliver once. The duplicate reaches the api, is recognised,
       and dissolves — it never touches a provider, which is the point. */
    const DUPE_T = 37.6;
    /* It stops at the api's outlet, not on top of the api's label: the packet
       reached the engine and went no further, and you have to be able to see
       both facts at once. */
    const DUPE_STOP_X = 406;
    fadeIn(dB.dupe, DUPE_T, 0.3);
    ft(dB.dupe, { x: APP_OUT_X, y: SPINE_Y }, { x: DUPE_STOP_X, duration: 1.1 }, DUPE_T);
    /* The name of the mechanism lands just BEFORE the receipt that proves
       it: the engraving says what is about to happen, the stamp says it
       happened. Both leave together at 40.6 — see the note on #lbl-idem in
       index.html for why this is the one engraving that does not stay. */
    fadeIn(lblIdem, DUPE_T + 0.8, 1.2, 0.9);
    fadeIn(stampDupe, DUPE_T + 1.2, 0.9);
    ft(dB.dupe, { scale: 1 }, { scale: 0.5, duration: 1.4, ease: "power2.in" }, DUPE_T + 1.3);
    ft(dB.dupe, { fill: COLOR.greenDim }, { fill: COLOR.faint, duration: 0.8 }, DUPE_T + 1.3);
    fadeOut(dB.dupe, DUPE_T + 1.4, 1.2);
    fadeOut(stampDupe, 40.6, 1.2);
    fadeOut(lblIdem, 40.6, 1.2, 0.9);

    /* ══════════════════════════════════════════════════════════════════════
       PHASE C — THE ASSURANCE   (42 → 86)
       ──────────────────────────────────────────────────────────────────────
       Four failures, and the reader has to be able to tell them apart from
       the motion alone:

         C1  retry        429 → rail → wait 1s → TRY → 429 → wait 4s → TRY →
                          delivered.               Two waits, three attempts.
         C2  failover     dark provider → the packet BOUNCES off it → back to
                          the fork → secondary wire → delivered at the next
                          provider.                The SAME attempt.
         C3  exhausted    the same circuit, one lap further: 1s · try · 4s ·
                          try · 16s · try, refused a fourth time with no tick
                          left to walk to → off the end of the rail → parked.
                                                   Every attempt, used up.
         C4  permanent    healthy provider, bad address → the secondary wire
                          greys out, untaken → the rail run at a constant rate
                          with no tick lit → parked beside C3's.
                                                   NO attempt after the first.

       The three of them that end at a provider all leave it the same way and
       that is deliberate: the vocabulary of a failure is fixed, and what
       varies is what the packet does with it. C2 never reaches the rail at
       all; C1 goes round the loop twice and C3 three times; C4 crosses the
       rail once, stopping nowhere, which is only legible BECAUSE the other
       two have just been seen stopping.

       See RETRY_LEG for the shape of one lap and why its legs are so short.
       ══════════════════════════════════════════════════════════════════════ */

    /* ── the two marks a refusal makes ─────────────────────────────────────
       The provider's box goes amber and the stamp names the code. The FIRST
       refusal of a packet gets the long form; every repeat gets the knock —
       shorter, same vocabulary as the failover bounce — because by then the
       reader knows what amber on that box means and a full-length stamp on
       every lap would turn a rhythm into a stutter. */
    function refuse(at: number, repeat: boolean): void {
      const hold = repeat ? 0.34 : 0.7;
      ft(provRects[1]!, { stroke: COLOR.hairline }, { stroke: COLOR.amber, duration: repeat ? 0.14 : 0.4 }, at);
      ft(provRects[1]!, { stroke: COLOR.amber }, { stroke: COLOR.hairline, duration: repeat ? 0.5 : 0.7 }, at + hold);
      fadeIn(stampRetry, at + 0.05, repeat ? 0.4 : 0.8);
      fadeOut(stampRetry, at + hold + 0.2, repeat ? 0.5 : 0.8);
    }

    /** The wait itself: the tick the packet is standing on lights while it
     *  stands there. Without it the reader sees a dot that stopped, not a dot
     *  that is waiting — and the light going out is the starting gun for the
     *  attempt that follows. */
    function waitAt(i: number, at: number, hold: number): number {
      ft(backoffTicks[i]!, { opacity: 0.85 }, { opacity: 1, duration: 0.2 }, at);
      ft(backoffTicks[i]!, { opacity: 1 }, { opacity: 0.85, duration: 0.3 }, at + hold - 0.3);
      return at + hold;
    }

    /** The rail's head → tick `i`. Decelerating, because it is arriving at a
     *  place it has to stand. Walks straight past any earlier tick without
     *  lighting it: the wait it has earned is the one it stops on. */
    function railToTick(dot: Element, at: number, i: number): number {
      run(dot, retryRail, at, RETRY_LEG.in, { start: 0, end: backoffFrac[i]!, ease: "power2.out" });
      return at + RETRY_LEG.in;
    }

    /** One lap: leave the tick, re-enter the queue at its head, and strike the
     *  provider. `refused` is false only for a lap that ends in delivery, and
     *  even then the DELIVERING is left to the caller — what a successful
     *  attempt looks like belongs to the beat, not to the loop. Returns the
     *  time the packet is back on the rail's head, or, for the lap that
     *  succeeds, the time it lands. */
    function retryLap(dot: Element, at: number, fromFrac: number, refused: boolean): number {
      run(dot, retryRail, at, RETRY_LEG.out, { start: fromFrac, end: 1, ease: "power1.inOut" });
      ft(
        dot,
        { x: RAIL_EXIT_X, y: SPINE_Y },
        { x: QUEUE_HEAD_X, duration: RETRY_LEG.enqueue, ease: "power1.inOut" },
        at + RETRY_LEG.out,
      );
      const strike = at + RETRY_LEG.out + RETRY_LEG.enqueue;
      run(dot, dep1, strike, RETRY_LEG.strike, { ease: "power1.inOut" });
      const hit = strike + RETRY_LEG.strike;
      if (!refused) return hit;
      refuse(hit, true);
      /* Across the provider and out of its far corner — the same move the
         first refusal makes, and the reason the rail starts where it does. */
      ft(
        dot,
        { x: PROV_X, y: SPINE_Y },
        { x: RAIL_ENTRY_X, y: RAIL_ENTRY_Y, duration: RETRY_LEG.drop, ease: "power1.inOut" },
        hit + RETRY_LEG.refuse,
      );
      return hit + RETRY_LEG.refuse + RETRY_LEG.drop;
    }

    /* ── C1: retry — wait, then try again ────────────────────────────────── */
    draw(retryRail, PHASE_C, 3.2);
    fadeIn(backoffTicks, 44.2, 0.9, 0.85, 0.2);
    fadeIn(backoffLabels, 44.4, 0.9, 1, 0.2);

    const R = dC.retry;
    fadeIn(R, 43.2, 0.3);
    ft(R, { x: APP_OUT_X, y: SPINE_Y }, { x: API_CX, duration: 0.9 }, 43.2);
    ft(R, { x: API_CX }, { x: QUEUE_HEAD_X, duration: 1.2, ease: "power2.out" }, 44.1);
    run(R, dep1, 45.8, 2.2, { ease: "power1.inOut" });

    /* Attempt 1, refused in full. Amber, stamped, and onto the rail — the rail
       begins at the provider's bottom-RIGHT corner, so a refused packet
       crosses the box that rejected it and drops out of the far side. */
    const R_HIT = 48.0;
    refuse(R_HIT, false);
    ft(R, { fill: COLOR.greenDim }, { fill: COLOR.amber, duration: 0.3 }, R_HIT + 0.2);
    ft(
      R,
      { x: PROV_X, y: SPINE_Y },
      { x: RAIL_ENTRY_X, y: RAIL_ENTRY_Y, duration: 0.45, ease: "power1.inOut" },
      R_HIT + 0.3,
    );

    /* 1s · try · 4s · try. Two waits and two more attempts: three in all,
       which is the shortest run that shows a backoff GROWING and still ends
       on a success the reader has been made to wait for. A third wait would
       show the same thing a third time, and 16s belongs to C3 — the packet
       that gets all the way to the end of the ladder is the one that does not
       come back. */
    let rc = R_HIT + 0.75;
    rc = waitAt(0, railToTick(R, rc, 0), BACKOFF_HOLD[0]!);
    rc = retryLap(R, rc, backoffFrac[0]!, true);
    rc = waitAt(1, railToTick(R, rc, 1), BACKOFF_HOLD[1]!);

    /* And this one is answered. The amber comes off on the way in — it was
       the failure it was carrying, and it is not carrying it any more. */
    const R_LAND = retryLap(R, rc, backoffFrac[1]!, false);
    ft(R, { fill: COLOR.amber }, { fill: COLOR.greenDim, duration: 0.5 }, R_LAND - 0.75);
    deliver(R, R_LAND);

    /* ── C2: failover — the bounce and the reroute ───────────────────────── */
    draw(failWire, 53.7, 1.6);

    /* The email provider goes dark. Three quick steps, not a fade: an outage
       is not a dimmer switch. */
    ft(provGroups[0]!, { opacity: 1 }, { opacity: 0.2, duration: 0.14 }, 55.7);
    ft(provGroups[0]!, { opacity: 0.2 }, { opacity: 0.85, duration: 0.12 }, 55.9);
    ft(provGroups[0]!, { opacity: 0.85 }, { opacity: 0.16, duration: 0.16 }, 56.1);
    ft(provGroups[0]!, { opacity: 0.16 }, { opacity: 0.26, duration: 0.5 }, 56.4);

    /** When the packet touches the dark provider. Every mark in the beat — the
     *  blink, the recoil, the cue — is written against this, because the whole
     *  beat is a consequence of one contact. */
    const BOUNCE_AT = 59.4;

    const F = dC.fail;
    fadeIn(F, 55.9, 0.3);
    ft(F, { x: APP_OUT_X, y: SPINE_Y }, { x: API_CX, duration: 0.7 }, 55.9);
    ft(F, { x: API_CX }, { x: QUEUE_HEAD_X, duration: 0.9, ease: "power2.out" }, 56.6);
    /* All the way to the provider, and accelerating into it. `power1.in` is
       the one place in the scene an ease-in is right: this is not a frame the
       reader triggered, it is an object arriving, and an object arriving
       speeds up. */
    run(F, dep0, 57.7, 1.7, { end: 1, ease: "power1.in" });

    /* CONTACT. The packet goes amber, and the dark box answers with one amber
       knock — up from its outage opacity, not to full, so the flicker reads as
       the door being rattled rather than as the provider coming back. */
    ft(F, { fill: COLOR.greenDim }, { fill: COLOR.amber, duration: 0.16 }, BOUNCE_AT);
    ft(provRects[0]!, { stroke: COLOR.hairline }, { stroke: COLOR.amber, duration: 0.12 }, BOUNCE_AT);
    ft(provGroups[0]!, { opacity: 0.26 }, { opacity: 0.5, duration: 0.1 }, BOUNCE_AT);
    ft(provGroups[0]!, { opacity: 0.5 }, { opacity: 0.26, duration: 0.34 }, BOUNCE_AT + 0.1);
    ft(provRects[0]!, { stroke: COLOR.amber }, { stroke: COLOR.hairline, duration: 0.5 }, BOUNCE_AT + 0.25);

    /* The recoil: BOUNCE_BACK of the route, decelerating, then a beat of
       nothing. The pause is what turns a rebound into a refusal — the packet
       has to be seen stopped and amber before it does anything about it. */
    run(F, dep0, BOUNCE_AT + 0.04, 0.34, { start: 1, end: 1 - BOUNCE_BACK, ease: "power2.out" });

    /* The cue belongs to the bounce, not to the crossover: the sentence is
       about the thing that just refused, and it now lands while the packet is
       still sitting in front of it. */
    fadeIn(asideFailover, BOUNCE_AT + 0.15, 1.0);

    /* And the SAME packet takes the other road. Back down its own route to the
       fork, then out along the secondary wire — one attempt, two providers,
       which is exactly what a provider chain is. */
    run(F, dep0, 60.05, 0.5, { start: 1 - BOUNCE_BACK, end: FAILOVER_SPLIT, ease: "power1.in" });
    run(F, failWire, 60.55, 1.2, { ease: "power1.out" });
    /* Amber is the failure it is carrying, and it stops carrying it once it is
       committed to a provider that is answering. Back to rest green before
       deliver()'s fromTo needs it there. */
    ft(F, { fill: COLOR.amber }, { fill: COLOR.greenDim, duration: 0.5 }, 60.8);
    deliver(F, 61.75);
    fadeOut(asideFailover, 63.7, 1.2);

    /* The provider comes back. It was their outage, not a deletion. */
    ft(provGroups[0]!, { opacity: 0.26 }, { opacity: 1, duration: 1.4 }, 64.3);

    /* ── C3: retries exhausted → the dead-letter siding ──────────────────── */
    draw(dlqRail, 61.4, 2.0);
    drawBox(dlqBox, 61.7, 2.0);

    /* Same provider as C1, because there is only one retry rail and it starts
       where it starts — and the same 429 stamp, because it is the same
       refusal. What is different is the ending, and the ending only means
       anything if the ladder in front of it is CLIMBED.

       So this is C1's circuit with one more lap on it: 1s · try · 4s · try ·
       16s · try, and the fourth refusal has no tick left to walk to. The
       holds are DLQ_HOLD — shorter than C1's, because the reader has already
       been taught this rhythm and a second full-length rendition of it is a
       lesson repeated rather than a story continued — but the laps are the
       same laps, at the same rates, so what the reader is counting is the
       number of them.

       An earlier version had this packet run the rail straight through in one
       sweep, stopping nowhere. That reads as "it did not try", which is the
       exact sentence C4 was built to own, and it left "exhausted" as
       something the caption asserted rather than something the schematic
       showed. */
    const L = dC.dlq;
    fadeIn(L, 60.6, 0.3);
    ft(L, { x: APP_OUT_X, y: SPINE_Y }, { x: API_CX, duration: 0.7 }, 60.6);
    ft(L, { x: API_CX }, { x: QUEUE_HEAD_X, duration: 0.9, ease: "power2.out" }, 61.3);
    run(L, dep1, 62.4, 1.4, { ease: "power1.inOut" });

    /* Attempt 1, refused in full, exactly as C1's was. */
    const L_HIT = 63.8;
    refuse(L_HIT, false);
    ft(L, { fill: COLOR.greenDim }, { fill: COLOR.amber, duration: 0.3 }, L_HIT + 0.1);
    ft(
      L,
      { x: PROV_X, y: SPINE_Y },
      { x: RAIL_ENTRY_X, y: RAIL_ENTRY_Y, duration: 0.45, ease: "power1.inOut" },
      L_HIT + 0.15,
    );

    /* Three laps. Every one of them ends in a refusal, and the third one ends
       standing on 16s with the ladder behind it. */
    let lc = L_HIT + 0.75;
    for (let i = 0; i < 3; i++) {
      lc = waitAt(i, railToTick(L, lc, i), DLQ_HOLD[i]!);
      lc = retryLap(L, lc, backoffFrac[i]!, true);
    }

    /* The fourth refusal is the one that matters: there is no fourth tick, so
       the rail carries it PAST all three — none of them lighting, because
       there is nothing left to wait for — and hands it to the siding. Slower
       than C4's identical-looking run and eased at both ends: that one is a
       packet that was never going to stop, this one is a packet that has run
       out of places to. */
    run(L, retryRail, lc, 1.5, { end: dlqFrac, ease: "power1.inOut" });
    run(L, dlqRail, lc + 1.5, 1.1, { ease: "power2.out" });
    /* And parks DEEPEST in the box — the first arrival goes furthest in, so
       the one that follows it in C4 has the mouth to stand in. No fade-out
       anywhere for what it leaves behind: it is still on screen at the end of
       the scene, which is the entire claim being made. */
    ft(
      L,
      { x: DLQ_RIGHT, y: DLQ_CY },
      { x: DLQ_PARK_X[0]!, duration: 0.6, ease: "power2.out" },
      lc + 2.6,
    );
    fadeIn([dlqLabel, dlqAside], lc - 1.4, 1.1, 1, 0.2);
    /* The packet hands over to a permanent mark, same as the receipts do on
       the timeline strip. Nothing on this siding depends on having watched. */
    fadeIn(dlqMarks[0]!, lc + 3.3, 0.5);
    fadeOut(L, lc + 3.4, 0.4);

    /* ── C4: the permanent error — the nuance ────────────────────────────── */
    /* Everything above is the provider's fault. This one is the MESSAGE's, and
       the whole beat is built to make that difference visible rather than
       stated:

         · the provider's box never goes amber. It is answering, correctly,
           that the address does not exist. Only the packet and the stamp
           carry amber — which is still amber's own domain (BRAND §2: retry,
           backoff, DEGRADED), because a message that can never be delivered
           is the degraded case, but the ROUTE is not degraded and its ink
           says so.
         · the secondary wire is right there, drawn, and greys out as the
           packet declines it. A permanent error does not fail over: the next
           provider would say exactly the same thing.
         · the retry rail is run at a CONSTANT RATE with not one tick lit. C1
           and C3 both stopped at all three; this one has no attempt left to
           make because it never had a second one. */
    const P = dC.perm;
    fadeIn(P, 75.9, 0.3);
    ft(P, { x: APP_OUT_X, y: SPINE_Y }, { x: API_CX, duration: 0.7 }, 75.9);
    ft(P, { x: API_CX }, { x: QUEUE_HEAD_X, duration: 0.9, ease: "power2.out" }, 76.6);
    /* Straight past the fork, on the road whose fork the reader has just
       watched be taken, to a provider at full opacity. */
    run(P, dep0, 77.7, 1.4, { ease: "power1.inOut" });

    fadeIn(stampInvalid, 79.15, 0.7);
    ft(P, { fill: COLOR.greenDim }, { fill: COLOR.amber, duration: 0.3 }, 79.2);
    /* The road not taken, saying so. Dimming an already-hairline stroke to a
       fifth is close to erasing it, which is the point — for the length of
       this beat the crossover is not an option. */
    ft(failWire, { opacity: 1 }, { opacity: 0.2, duration: 0.35 }, 79.35);
    fadeIn(asidePerm, 79.55, 1.0);

    run(P, gPerm, 80.0, 1.0, { ease: "power1.inOut" });
    /* Ease "none", and it is load-bearing rather than a default: a packet that
       eases along this rail is a packet pausing, and pausing on this rail is
       the one thing this packet never does. Constant rate, three dark ticks,
       straight onto the siding. */
    run(P, retryRail, 81.0, 1.6, { end: dlqFrac, ease: "none" });
    ft(failWire, { opacity: 0.2 }, { opacity: 1, duration: 1.0 }, 81.8);
    fadeOut(stampInvalid, 82.3, 1.0);
    run(P, dlqRail, 82.6, 1.0, { ease: "power2.out" });
    fadeOut(asidePerm, 83.1, 1.2);
    /* Parked at the mouth, beside the one that spent everything it had. Two
       marks, two reasons, one siding — and both still there in the finale. */
    ft(
      P,
      { x: DLQ_RIGHT, y: DLQ_CY },
      { x: DLQ_PARK_X[1]!, duration: 0.5, ease: "power2.out" },
      83.6,
    );
    fadeIn(dlqMarks[1]!, 84.2, 0.5);
    fadeOut(P, 84.3, 0.4);

    /* ══════════════════════════════════════════════════════════════════════
       PHASE D — THE SCALE   (86 → 130)
       ══════════════════════════════════════════════════════════════════════ */

    /* ── D1: priority lanes ──────────────────────────────────────────────── */
    /* The split inherits the queue's own vocabulary: two more slotted boxes,
       same cell pitch, same ruling, above and below the one already there. A
       priority lane that looked like a plain rail would be claiming to be a
       different kind of thing, and it is not — it is the same queue, three
       times, with a meter that now spans all three. */
    draw([spP0, laneP0, spP2, laneP2], PHASE_D, 1.6, 0.3);
    draw([queueBoxes[0]!, queueBoxes[2]!], 87.0, 1.4, 0.2);
    draw([...slotLines[0]!, ...slotLines[2]!], 87.4, 0.6, 0.06);
    ft(gate, { drawSVG: GATE_SHORT }, { drawSVG: GATE_FULL, duration: 1.4, ease: "power2.out" }, 87.6);
    fadeOut(lblQueue, 88.0, 1.0);
    fadeIn([lblP1, lblP0, lblP2], 88.4, 1.0, 1, 0.16);

    dD.flood.forEach((dot, i) => {
      const t = FLOOD_T0 + i * FLOOD_GAP;
      fadeIn(dot, t, 0.4, FLOOD_OPACITY);
      run(dot, gLaneP2, t, FLOOD_DUR, { ease: "none" });
      fadeOut(dot, t + FLOOD_DUR, 0.5, FLOOD_OPACITY);
    });

    /* One login code, entering last and arriving first. Linear, like the flood:
       an eased otp would be doing the overtaking with an ease curve rather than
       with its lane, and the lane is the point. */
    fadeIn(dD.otp, OTP_T0, 0.4);
    run(dD.otp, gLaneP0, OTP_T0, OTP_DUR, { ease: "none" });
    deliver(dD.otp, OTP_T0 + OTP_DUR);

    /* ── D2: digest ──────────────────────────────────────────────────────── */
    dD.digest.forEach((dot, i) => {
      const x0 = 470 + i * 30;
      ft(dot, { opacity: 0, x: x0, y: SPINE_Y }, { opacity: 1, duration: 0.5 }, 99.0 + i * 0.08);
      ft(dot, { x: x0 }, { x: QUEUE_HEAD_X, duration: 1.5, ease: "power2.in" }, 100.0 + i * 0.06);
      fadeOut(dot, 101.2 + i * 0.05, 0.4);
    });
    ft(digestEnv, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.8, ease: "power2.out" }, 101.2);
    /* Name above the spine, count below it, envelope on it. The engraving
       does NOT leave with the count: like EVENT-DRIVEN ARCHITECTURE it names
       a mechanism that is still in the finished anatomy — the queue it
       collapses into is right there — so by the finale the reader is looking
       at a diagram with the words for its own parts cut into it. */
    fadeIn(lblDigest, 101.4, 1.2, 0.9);
    fadeIn(asideDigest, 101.6, 0.9);
    run(digestEnv, dep0, 102.8, 1.9, { ease: "power1.inOut" });
    ft(digestEnv, { stroke: COLOR.greenDim }, { stroke: COLOR.green, duration: 0.2 }, 104.7);
    fadeOut(digestEnv, 105.0, 0.8);
    fadeOut(asideDigest, 105.0, 1.0);

    /* ── D3: the fan-out ─────────────────────────────────────────────────── */
    /* The providers hand over to the channels they exist to reach. They leave
       before the terminals arrive rather than crossfading with them — the two
       columns share x, and half a box on top of half a box is mush. */
    fadeOut([...provGroups, ...provWires, failWire], 105.8, 1.3);

    draw(fanWires, 107.2, 1.6, 0.14);
    drawBox(termRects, 107.4, 1.4, 0.18);
    fadeIn(termLabels, 108.0, 0.9, 1, 0.14);
    fadeIn(termDots, 108.0, 0.9, 1, 0.14);

    /* The junction gets its name the moment it does the thing the name is for.
       It does not leave again: by the end of the scene the reader is looking at
       the whole anatomy, and this is the word for the shape of it. 0.9 rather
       than 1 keeps it engraved rather than printed. */
    fadeIn(asideEda, 107.8, 1.4, 0.9);

    fadeIn(dD.fanIn, 109.0, 0.3);
    run(dD.fanIn, gFanIn, 109.0, 2.2, { ease: "power1.inOut" });
    fadeOut(dD.fanIn, 111.1, 0.2);

    dD.fan.forEach((dot, i) => {
      const t = 111.2 + i * 0.09;
      fadeIn(dot, t, 0.2);
      run(dot, fanWires[i]!, t, 1.35, { ease: "power1.inOut" });
      const arrive = t + 1.35;
      deliver(dot, arrive);
      ft(termDots[i]!, { fill: COLOR.faint }, { fill: COLOR.green, duration: 0.14 }, arrive);
      ft(termDots[i]!, { scale: 1 }, { scale: 1.4, duration: 0.22, ease: "power2.out" }, arrive);
      ft(termDots[i]!, { scale: 1.4 }, { scale: 1, duration: 0.26, ease: "power2.inOut" }, arrive + 0.22);
      ft(
        termRects[i]!,
        { stroke: COLOR.hairline },
        { stroke: COLOR.hairlineStrong, duration: 0.4 },
        arrive,
      );
      ft(
        termReceipts[i]!,
        { opacity: 0, y: 4 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" },
        arrive + 0.1,
      );
    });

    /* ── D4: the bridge ──────────────────────────────────────────────────── */
    draw(stripLine, 113.0, 1.5);
    fadeIn(stripLabel, 113.4, 0.9);
    fadeIn(stripTicks, 113.6, 0.8, 1, 0.1);

    dD.back.forEach((dot, i) => {
      const t = 114.6 + i * 0.16;
      ft(dot, { opacity: 0, fill: COLOR.green }, { opacity: 1, duration: 0.3 }, t);
      run(dot, backGuides[i]!, t, 1.6, { ease: "power2.inOut" });
      /* The packet hands its receipt to the strip and goes; the mark it leaves
         stays. A record you have to have been watching for is not a record. */
      fadeIn(stripDots[i]!, t + 1.5, 0.3);
      fadeOut(dot, t + 1.6, 0.3);
    });

    fadeIn(stripLegend, 116.6, 0.9);

    /* ── D5: skip-if-opened ──────────────────────────────────────────────
       The bridge's second sentence. Six receipts have just landed on the
       strip; this beat takes ONE of them back off it and shows it changing
       what happens next, which is the difference between a log and a control
       loop. Everything here runs right-to-left and top-to-bottom in a corner
       the schematic has never used — see the SKIP_* block for why that
       corner, and why the ladder is on the app box's own centre line.

       The whole beat is 12 units and it is the reason TL_END first moved from
       100 to 112. Nothing before it shifted then; every time phase C has since
       grown, everything here shifted with it by exactly C_ADD and nothing here
       changed shape. PIN_HEIGHTS moved with TL_END each time, so every beat in
       the scene consumes exactly the scroll it always did. */
    const SKIP_T0 = 118.4;

    /* The ladder draws in the order it is read — inlet, step 1, the rung
       between them, step 2 — and the gate's two posts arrive LAST. The gate
       is what the beat is about, and it should turn up once the reader
       already knows what it is sitting on. */
    draw(skipIn, SKIP_T0, 0.8);
    drawBox(skipStep1, SKIP_T0 + 0.3, 1.4);
    fadeIn(lblSkip, SKIP_T0 + 0.6, 1.4, 0.9);
    fadeIn([skipLbl1, skipDots[0]!], SKIP_T0 + 1.2, 0.9);
    draw(skipWire, SKIP_T0 + 1.4, 1.0);
    drawBox(skipStep2, SKIP_T0 + 2.0, 1.4);
    fadeIn([skipLbl2, skipDots[1]!], SKIP_T0 + 2.6, 0.9);
    fadeIn(skipJambs, SKIP_T0 + 3.0, 0.8, 1, 0.12);

    /* Step 1 fires: a dedicated packet down the inlet onto the box's rim,
       and step 1's own status dot lights inside it. Exactly the handoff the
       six channel terminals make in D3 — the traveller stops at the wall,
       the record is what turns green — and a receipt that stays behind. */
    const SKIP_SEND = SKIP_T0 + 3.6; // 122.0
    const SKIP_ARRIVE = SKIP_SEND + 0.9;
    ft(dD.step1, { opacity: 0, x: SKIP_X, y: 100 }, { opacity: 1, duration: 0.35 }, SKIP_SEND);
    ft(dD.step1, { y: 100 }, { y: SKIP_RIM_Y, duration: 0.9, ease: "power2.out" }, SKIP_SEND);
    deliver(dD.step1, SKIP_ARRIVE);
    ft(skipDots[0]!, { fill: COLOR.faint }, { fill: COLOR.green, duration: 0.14 }, SKIP_ARRIVE);
    ft(skipDots[0]!, { scale: 1 }, { scale: 1.4, duration: 0.22, ease: "power2.out" }, SKIP_ARRIVE);
    ft(
      skipDots[0]!,
      { scale: 1.4 },
      { scale: 1, duration: 0.26, ease: "power2.inOut" },
      SKIP_ARRIVE + 0.22,
    );
    fadeIn(skipDelivered, SKIP_SEND + 1.2, 0.9);

    /* And step 2's packet takes its place at the mouth. It has to be ON
       SCREEN, in the lane, ready — otherwise "the reminder never fires" is
       something the reader is told rather than something they watch not
       happen. */
    ft(
      dD.waiting,
      { opacity: 0, x: SKIP_X, y: SKIP_MOUTH_Y },
      { opacity: 1, duration: 0.4 },
      SKIP_SEND + 2.0,
    );

    /* The receipt comes back — off the strip's EMAIL tick, which is the
       first of the six that just landed there. Green the whole way, because
       an open IS an arrival and green is what arrivals are (BRAND §2). */
    const SKIP_OPEN_T0 = SKIP_SEND + 2.6; // 124.6
    const SKIP_OPEN_DUR = 1.7;
    /** When it reaches the junction. The gate, the dissolve and the stamp
     *  are all written against this, so the consequence moves as one if the
     *  travel is retimed. */
    const SKIP_LAND = SKIP_OPEN_T0 + SKIP_OPEN_DUR; // 126.3

    ft(dD.opened, { opacity: 0, fill: COLOR.green }, { opacity: 1, duration: 0.3 }, SKIP_OPEN_T0);
    run(dD.opened, gOpened, SKIP_OPEN_T0, SKIP_OPEN_DUR, { ease: "power2.inOut" });
    /* Same handoff as the timeline strip and the dead-letter siding: the
       traveller goes, the mark it left stays. What the engine heard has to
       still be on screen for a reader who arrives after the motion. */
    fadeIn(skipJunction, SKIP_LAND - 0.1, 0.3);
    fadeOut(dD.opened, SKIP_LAND, 0.3);

    /* And at that instant the gate. 0.24 units under power3.out is a SNAP —
       a condition does not ease shut — and it is a drawSVG rather than a
       cross-fade because "50% 50%" → "0% 100%" is one of the three ranges a
       non-scaling stroke can actually express (DESIGN §3). */
    ft(
      skipGate,
      { drawSVG: "50% 50%" },
      { drawSVG: GATE_FULL, duration: 0.24, ease: "power3.out" },
      SKIP_LAND,
    );

    /* The packet that was waiting does not launch. Note for note the dedupe
       dissolve from phase B — dim to faint, shrink under power2.in, fade —
       because it is note for note the same claim: the engine already knew. */
    ft(dD.waiting, { fill: COLOR.greenDim }, { fill: COLOR.faint, duration: 0.7 }, SKIP_LAND + 0.3);
    ft(dD.waiting, { scale: 1 }, { scale: 0.5, duration: 1.2, ease: "power2.in" }, SKIP_LAND + 0.3);
    fadeOut(dD.waiting, SKIP_LAND + 0.4, 1.1);

    /* Neutral ink, and that is the whole point of the beat. Nothing failed
       here — amber would turn a decision into an incident. */
    fadeIn(skipStamp, SKIP_LAND + 0.45, 0.85);

    /* The closing line lands under the last camera move, not fourteen units
       before it: it is the caption for the whole anatomy, and the whole
       anatomy is not on screen until D6 has pulled back. */
    fadeIn(stat, 128.2, 1.4);
  }

  /* ════════════════════════════════════════════════════════════════════════
     MEDIA GATING
     One matchMedia owns the choice. Crossing 768px, or turning reduced motion
     on, reverts one context and builds the other — no listeners of our own,
     no half-torn-down ScrollTrigger.
     ════════════════════════════════════════════════════════════════════════ */

  const mm = gsap.matchMedia();

  mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
    buildScrub();
  });

  mm.add("(max-width: 767.98px) and (prefers-reduced-motion: no-preference)", () =>
    buildStill(false),
  );

  mm.add("(prefers-reduced-motion: reduce)", () => buildStill(true));

  /* The hero's copy block changes height when the web fonts land, which moves
     every trigger below it. One refresh, guarded so a slow font cannot poke a
     scene that has already been torn down. */
  let alive = true;
  if (doc.fonts?.ready) {
    void doc.fonts.ready.then(() => {
      if (alive) ScrollTrigger.refresh();
    });
  }

  function destroy(): void {
    alive = false;
    mm.revert();
  }

  return { destroy };
}
