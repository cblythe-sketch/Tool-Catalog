/**
 * Updates data/tools.json with direct image URLs from Pexels (and some Unsplash).
 * Run: node scripts/update-tool-images.js
 */
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'data', 'tools.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Pexels direct image URL (w=400 for card size). Some photos use a slug instead of pexels-photo-ID.
const pexelsSlug = { 162553: 'keys-workshop-mechanic-tools-162553' };
function pexels(id) {
  const slug = pexelsSlug[id] || `pexels-photo-${id}`;
  return `https://images.pexels.com/photos/${id}/${slug}.jpeg?auto=compress&cs=tinysrgb&w=400&fit=crop`;
}

// Unsplash direct image URL (known working format from Unsplash CDN)
function unsplash(photoId) {
  return `https://images.unsplash.com/photo-${photoId}?w=400&h=300&fit=crop`;
}

// Curated mapping: tool id -> image URL (Pexels/Unsplash)
// Sources: Pexels (mechanic tools, hammer, tape measure, screwdriver, safety, etc.)
const imageMap = {
  t1: pexels(162553),   // Socket Set - wrenches/tools
  t2: pexels(162553),   // Oil Filter Wrench
  t3: pexels(8703532),  // Jack Stands - car/tools
  t4: pexels(8703532),  // Hydraulic Floor Jack
  t5: pexels(162553),   // Torque Wrench
  t6: pexels(162553),   // Breaker Bar
  t7: pexels(162553),   // Oil Drain Pan - tools
  t8: pexels(162553),   // Funnel Set
  t9: pexels(162553),   // Spark Plug Socket
  t10: pexels(5095879), // OBD-II Scanner - tech/tools
  t11: pexels(5095879), // Battery Charger
  t12: pexels(8703532), // Creeper
  t13: pexels(162553),  // Tire Pressure Gauge
  t14: pexels(162553),  // Tire Iron
  t15: pexels(162553),  // Brake Bleeder Kit
  t16: pexels(957090),  // Claw Hammer - hammer wrench
  t17: pexels(4480466), // Circular Saw - power tools
  t18: pexels(957090),  // Chisel Set
  t19: pexels(30413398),// Tape Measure
  t20: pexels(9449306), // Speed Square - tools
  t21: pexels(9449306), // Framing Square
  t22: pexels(4480466), // Miter Saw
  t23: pexels(4480466), // Table Saw
  t24: pexels(4480466), // Jigsaw
  t25: pexels(4480466), // Router
  t26: pexels(957090),  // Hand Saw
  t27: pexels(957090),  // Coping Saw
  t28: pexels(957090),  // Block Plane
  t29: pexels(957090),  // Wood Mallet
  t30: pexels(957090),  // Nail Set
  t31: pexels(162553),  // C-Clamp
  t32: pexels(162553),  // Bar Clamp
  t33: pexels(4480466), // Pocket Hole Jig
  t34: pexels(162553),  // Countersink Bit
  t35: pexels(9449306), // Carpenter's Pencil
  t36: pexels(4480453), // Wire Strippers - electrical
  t37: pexels(5095879), // Multimeter
  t38: pexels(4480453), // Lineman's Pliers
  t39: pexels(5095879), // Voltage Tester
  t40: pexels(4480453), // Crimping Tool
  t41: pexels(4480453), // Fish Tape
  t42: pexels(5095879), // Circuit Tester
  t43: pexels(4480453), // Staple Gun
  t44: pexels(4480466), // Hole Saw Kit
  t45: pexels(4480453), // Wire Nuts
  t46: pexels(162553),  // Pipe Wrench
  t47: pexels(5853939), // Plunger - plumbing
  t48: pexels(162553),  // Basin Wrench
  t49: pexels(162553),  // Channel-Lock Pliers
  t50: pexels(162553),  // Tubing Cutter
  t51: pexels(162553),  // Pipe Threader
  t52: pexels(5853939), // Drain Snake
  t53: pexels(162553),  // Flux & Soldering Torch
  t54: pexels(162553),  // PEX Crimping Tool
  t55: pexels(5853939), // Toilet Flange Ring
  t56: pexels(5853939), // Trowel - masonry
  t57: pexels(957090),  // Mason's Hammer
  t58: pexels(9449306), // Level
  t59: pexels(957090),  // Masonry Chisel
  t60: pexels(5853939), // Jointer Trowel
  t61: pexels(5853939), // Concrete Float
  t62: pexels(5853939), // Edger
  t63: pexels(16679649),// Wheelbarrow - outdoor
  t64: pexels(16679649),// Mortar Hoe
  t65: unsplash('1513364776144-60967b0f800f'), // Paint Brush - painting
  t66: unsplash('1513364776144-60967b0f800f'), // Roller & Sleeves
  t67: unsplash('1513364776144-60967b0f800f'), // Paint Tray
  t68: unsplash('1513364776144-60967b0f800f'), // Paint Scraper
  t69: unsplash('1513364776144-60967b0f800f'), // Putty Knife
  t70: unsplash('1513364776144-60967b0f800f'), // Caulk Gun
  t71: unsplash('1513364776144-60967b0f800f'), // Drop Cloth
  t72: unsplash('1513364776144-60967b0f800f'), // Painter's Tape
  t73: unsplash('1513364776144-60967b0f800f'), // Paint Mixing Stick
  t74: pexels(9449306), // Drywall T-Square
  t75: pexels(5853939), // Drywall Knife
  t76: pexels(4480466), // Drywall Saw
  t77: pexels(4480466), // Drywall Screw Gun
  t78: pexels(5853939), // Corner Trowel
  t79: pexels(5853939), // Mud Pan
  t80: pexels(4480466), // Drywall Lift
  t81: pexels(957090),  // Rasp
  t82: pexels(4480466), // Angle Grinder - metalworking
  t83: pexels(162553),  // Metal File Set
  t84: pexels(957090),  // Hacksaw
  t85: pexels(162553),  // Center Punch
  t86: pexels(162553),  // Tap and Die Set
  t87: pexels(162553),  // Deburring Tool
  t88: pexels(162553),  // Welding Clamp
  t89: pexels(957090),  // Ball Peen Hammer
  t90: pexels(162553),  // Vise
  t91: pexels(4480466), // Flooring Nailer
  t92: pexels(957090),  // Rubber Mallet
  t93: pexels(162553),  // Pull Bar
  t94: pexels(9449306), // Spacers
  t95: pexels(5853939), // Underlayment Knife
  t96: pexels(5853939), // Tile Cutter
  t97: pexels(5853939), // Notched Trowel
  t98: pexels(8961065), // Knee Pads - safety/construction
  t99: pexels(16679649),// Shovel - garden
  t100: pexels(16679649),// Rake
  t101: pexels(16679649),// Hoe
  t102: pexels(16679649),// Pruning Shears
  t103: pexels(16679649),// Loppers
  t104: pexels(16679649),// Hand Pruner
  t105: pexels(4480466), // Hedge Trimmer
  t106: pexels(16679649),// Post Hole Digger
  t107: pexels(16679649),// Lawn Mower
  t108: pexels(4480466), // String Trimmer
  t109: pexels(8961065), // Safety Glasses
  t110: pexels(8961065), // Hearing Protection
  t111: pexels(8961065), // Work Gloves
  t112: pexels(8961065), // Dust Mask
  t113: pexels(8961065), // Hard Hat
  t114: pexels(8961065), // Steel-Toe Boots
  t115: pexels(8961065), // First Aid Kit
  t116: pexels(8961065), // Fire Extinguisher
  t117: pexels(914913),  // Screwdriver Set
  t118: pexels(162553),  // Adjustable Wrench
  t119: pexels(162553),  // Utility Knife
  t120: pexels(162553),  // Pliers Set
  t121: pexels(4480466), // Cordless Drill
  t122: pexels(162553),  // Drill Bit Set
  t123: pexels(162553),  // Allen Key Set
  t124: pexels(957090),  // Rubber Mallet (general)
  t125: pexels(4480453), // Staple Gun
  t126: pexels(5095879), // Flashlight / Work Light
  t127: pexels(4480453), // Extension Cord
  t128: pexels(9449306), // Ladder
  t129: pexels(162553),  // Toolbox
  t130: pexels(5095879), // Stud Finder
  t131: pexels(9449306), // Square
  t132: pexels(162553),  // Clamps
};

data.tools.forEach((t) => {
  if (imageMap[t.id]) t.image = imageMap[t.id];
});

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log('Updated', data.tools.length, 'tool images with Pexels/Unsplash URLs.');
process.exit(0);
