export type SleepStory = {
  id: string;
  title: string;
  durationMin: number;
  description: string;
  paragraphs: string[];
};

export const SLEEP_STORIES: SleepStory[] = [
  {
    id: 'moonlit-garden',
    title: 'The Moonlit Garden',
    durationMin: 8,
    description: 'A gentle walk through a quiet garden at night.',
    paragraphs: [
      'You find yourself at the edge of a garden where the air is cool and still. Moonlight spills softly between the leaves, painting silver paths on the ground.',
      'With each slow step, your shoulders loosen. The scent of lavender and damp earth rises around you — familiar, safe, unhurried.',
      'A bench appears beneath an old tree. You sit, and the garden breathes with you. In… and out… slower than before.',
      'Fireflies drift like thoughts that no longer need solving. They glow, fade, and return — reminding you that rest is allowed.',
      'When you are ready, the path leads you home. The garden stays behind, holding your calm until morning.',
    ],
  },
  {
    id: 'star-harbor',
    title: 'Star Harbor',
    durationMin: 10,
    description: 'Drift on quiet water beneath a wide night sky.',
    paragraphs: [
      'You are lying in a small boat that rocks so gently you barely feel it move. Above you, stars scatter across a deep indigo sky.',
      'The water murmurs against the hull — a soft rhythm, steady as a heartbeat slowed for sleep.',
      'Clouds pass like slow ships. You watch them without naming them, without needing to understand.',
      'Somewhere distant, a bell rings once. The sound travels across the harbor and dissolves into warmth.',
      'Your body grows heavy in the kindest way. The boat holds you. The night holds the boat. You are carried.',
    ],
  },
  {
    id: 'cloud-house',
    title: 'The Cloud House',
    durationMin: 7,
    description: 'A cozy room made of mist and warmth.',
    paragraphs: [
      'You climb a staircase made of light steps. At the top is a door that opens before you touch it.',
      'Inside, the Cloud House glows with amber light. A blanket waits on a chair that knows the shape of your body.',
      'Rain taps the windows, but here the sound is distant — a lullaby from another world.',
      'You wrap the blanket around your shoulders. Each breath draws the room closer, softer, smaller in the best way.',
      'The house hums: you are safe, you are held, you can sleep now.',
    ],
  },
  {
    id: 'forest-snow',
    title: 'Snow in the Pines',
    durationMin: 9,
    description: 'Winter quiet among tall pines.',
    paragraphs: [
      'Snow falls without hurry between pine trees that stand like old friends. Your footsteps are muffled, almost silent.',
      'Your breath makes small clouds in the cold air, then vanishes — in, out — matching the pace of the falling flakes.',
      'A deer crosses the path ahead, pauses, and continues into the white. You smile without effort.',
      'You find a hollow at the base of a tree, sheltered from wind. Snow gathers on your eyelashes like tiny stars.',
      'The forest grows quieter still. You close your eyes, and the snow keeps falling, gentle as forgiveness.',
    ],
  },
];

export function getSleepStory(id: string) {
  return SLEEP_STORIES.find((s) => s.id === id) ?? SLEEP_STORIES[0];
}
