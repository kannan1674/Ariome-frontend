// 'use client';

// import { Button } from '@/components/ui/button';
// import { cn } from '@/lib/utils';
// import { fetchAiClips } from '@/lib/content/contentApi';
// import type { AiClip } from '@/lib/content/types';
// import { Loader2, Play, Sparkles } from 'lucide-react';
// import { useState } from 'react';

// type Props = {
//   mood: string;
//   onPlayClip?: (clip: { title: string; description: string }) => void;
// };

// export default function AiClipsPanel({ mood, onPlayClip }: Props) {
//   const [clips, setClips] = useState<AiClip[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [generated, setGenerated] = useState(false);

//   const generate = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const data = await fetchAiClips(mood === 'All' ? 'Peaceful' : mood);
//       setClips(data.clips || []);
//       setGenerated(true);
//     } catch (e) {
//       setError(e instanceof Error ? e.message : 'Could not generate clips');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <section className="mt-10" aria-labelledby="ai-clips-heading">
//       <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
//         <div className="flex items-center gap-2">
//           <Sparkles className="size-5 text-violet-600" aria-hidden />
//           <h2 id="ai-clips-heading" className="text-lg font-semibold text-gray-900 sm:text-xl">
//             AI clips
//           </h2>
//         </div>
//         <Button
//           type="button"
//           size="sm"
//           variant="outline"
//           disabled={loading}
//           onClick={() => void generate()}
//           className="border-violet-200 text-violet-800 hover:bg-violet-50"
//         >
//           {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Sparkles className="mr-2 size-4" />}
//           {generated ? 'Refresh' : 'Generate for mood'}
//         </Button>
//       </div>
//       <p className="mb-4 text-sm text-gray-600">
//         Personalized micro-practices picked for your current mood.
//       </p>
//       {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
//       {!generated && !loading && (
//         <p className="rounded-xl border border-dashed border-violet-200 bg-violet-50/40 py-8 text-center text-sm text-gray-600">
//           Tap generate to see AI-curated clips for {mood === 'All' ? 'you' : mood}.
//         </p>
//       )}
//       {clips.length > 0 && (
//         <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
//           {clips.map((clip, i) => (
//             <article
//               key={`${clip.title}-${i}`}
//               className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50/60 to-white p-4 shadow-sm"
//             >
//               <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase text-violet-800">
//                 AI · {clip.durationSec}s
//               </span>
//               <h3 className="mt-2 font-semibold text-gray-900">{clip.title}</h3>
//               <p className="mt-1 text-xs font-medium text-violet-700">&ldquo;{clip.hook}&rdquo;</p>
//               <p className="mt-2 text-sm text-gray-600">{clip.description}</p>
//               {onPlayClip && (
//                 <button
//                   type="button"
//                   onClick={() => onPlayClip({ title: clip.title, description: clip.description })}
//                   className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-600"
//                 >
//                   <Play className="size-3.5 fill-current" />
//                   Open as practice
//                 </button>
//               )}
//             </article>
//           ))}
//         </div>
//       )}
//     </section>
//   );
// }
