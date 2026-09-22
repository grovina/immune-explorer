import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Dna, Info, RotateCcw, Shuffle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "VDJ Lab — Build a Human Antibody" },
    { name: "description", content: "Explore human IGH inheritance, V(D)J recombination, CDR frameworks, somatic hypermutation, class switching and antigen binding." },
    { property: "og:title", content: "VDJ Lab — Build a Human Antibody" },
    { property: "og:description", content: "An interactive, scientifically grounded journey from parental IGH alleles to antigen binding." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ]}),
  component: Index,
});

type Origin = "maternal" | "paternal";
type SegmentKey = "v" | "d" | "j";

const stages = [
  { short: "Inheritance", title: "Two inherited IGH loci", place: "Every nucleated cell · chromosome 14q32.33", level: "GERMLINE DNA", enzyme: "None", note: "You inherit one IGH locus from each parent. Their segment arrays can differ, but neither contains a pre-assembled antibody gene.", action: "Choose the homolog this B cell will successfully express." },
  { short: "D–J join", title: "D-to-J recombination", place: "Pro-B cell · bone marrow", level: "SOMATIC DNA", enzyme: "RAG1/2 · Artemis · NHEJ", note: "RAG1/2 pairs a 12-RSS with a 23-RSS and cuts the DNA. Heavy-chain assembly starts with D–J; direct V–J joining is blocked by the 12/23 rule.", action: "Select D and J segments, then inspect the legal join." },
  { short: "V–DJ join", title: "V-to-DJ recombination", place: "Pro-B cell · bone marrow", level: "SOMATIC DNA", enzyme: "RAG1/2 · TdT · NHEJ", note: "Coding ends are trimmed, hairpins can yield palindromic P nucleotides, and TdT adds non-templated N nucleotides. This junction becomes most of CDR-H3.", action: "Randomize the junction to see how sequence diversity is generated." },
  { short: "VDJ → BCR", title: "Expression and structural map", place: "Pre-B → immature B cell · bone marrow", level: "RNA → PROTEIN", enzyme: "Spliceosome · translation", note: "The rearranged VDJ exon is transcribed and spliced to Cμ. A productive μ chain first pairs with surrogate light chain, then a real light chain forms the BCR.", action: "Read the same sequence through the FR/CDR lens." },
  { short: "Tolerance", title: "Self-reactivity checkpoint", place: "Immature B cell · marrow and spleen", level: "CELL SELECTION", enzyme: "BCR signaling · RAG if editing", note: "Strong self-reactivity can cause light-chain receptor editing, deletion or anergy. This is not affinity maturation and does not deliberately improve binding.", action: "Pass the surviving clone into the naïve repertoire." },
  { short: "SHM", title: "Somatic hypermutation", place: "Germinal center · dark zone", level: "SOMATIC DNA", enzyme: "AID · UNG · MMR · Pol η", note: "AID initiates stochastic point mutation in the already rearranged V region. Mutations can help, harm or do nothing; they do not select new V, D or J segments.", action: "Run mutation rounds and watch selected affinity change." },
  { short: "Selection", title: "Affinity maturation", place: "Germinal center · light zone", level: "CLONAL SELECTION", enzyme: "FDC antigen · Tfh help", note: "Clones compete for antigen and T-cell help. Better binders preferentially survive and re-enter the dark zone; affinity maturation is population selection, not a single directed mutation.", action: "Increase selection pressure to retain stronger binders." },
  { short: "Class switch", title: "Class switch recombination", place: "Activated B cell · lymphoid tissue", level: "SOMATIC DNA", enzyme: "AID · UNG · APE1 · NHEJ", note: "Switch-region DNA is cut and intervening constant genes are deleted. The same VDJ is joined to a new constant region: effector function changes, specificity does not.", action: "Choose an isotype without changing the paratope." },
  { short: "Binding", title: "Antigen binding", place: "Secreted antibody or membrane BCR", level: "FOLDED PROTEIN", enzyme: "Non-covalent chemistry", note: "The paratope combines six CDR loops from heavy and light chains. Shape, charge and chemistry determine affinity; Fc isotype controls downstream function.", action: "Compare the matured paratope with its antigen." },
];

const segmentOptions = { v: ["IGHV1-2", "IGHV3-23", "IGHV3-30", "IGHV4-34"], d: ["IGHD2-2", "IGHD3-3", "IGHD6-19"], j: ["IGHJ2", "IGHJ4", "IGHJ6"] };
const codons = ["GAG", "GTG", "CAG", "CTG", "GTC", "GGA", "TAC", "TGG", "GGC", "AGC", "TAT", "GAT", "GCT", "TGG", "AAC", "TTC", "GAC", "CTG"];
const regions = [
  ["FR1", 1, "framework"], ["CDR1", 1.35, "cdr"], ["FR2", 1, "framework"], ["CDR2", 1.35, "cdr"], ["FR3", 1.15, "framework"], ["CDR3", 2, "cdr"], ["FR4", 1, "framework"],
] as const;

function Index() {
  const [stage, setStage] = useState(0);
  const [origin, setOrigin] = useState<Origin>("maternal");
  const [segments, setSegments] = useState({ v: "IGHV3-23", d: "IGHD6-19", j: "IGHJ4" });
  const [junction, setJunction] = useState("TACGGA");
  const [rounds, setRounds] = useState(0);
  const [pressure, setPressure] = useState(65);
  const [isotype, setIsotype] = useState("IgM");
  const [selectedRegion, setSelectedRegion] = useState("CDR3");

  const affinity = Math.max(0.4, 180 / (1 + rounds * (0.45 + pressure / 100)));
  const mutations = useMemo(() => new Set(Array.from({ length: Math.min(rounds * 2, 8) }, (_, i) => (i * 5 + rounds * 3) % codons.length)), [rounds]);
  const current = stages[stage];
  const randomize = () => {
    const pick = (key: SegmentKey) => segmentOptions[key][Math.floor(Math.random() * segmentOptions[key].length)];
    setSegments({ v: pick("v"), d: pick("d"), j: pick("j") });
    setJunction(Array.from({ length: 3 + Math.floor(Math.random() * 6) }, () => "ACGT"[Math.floor(Math.random() * 4)]).join(""));
  };
  const reset = () => { setStage(0); setOrigin("maternal"); setSegments({ v: "IGHV3-23", d: "IGHD6-19", j: "IGHJ4" }); setJunction("TACGGA"); setRounds(0); setPressure(65); setIsotype("IgM"); };

  return <div className="min-h-screen bg-background text-foreground antialiased">
    <header className="sticky top-0 z-30 border-b border-border bg-card/85 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1480px] items-center gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-2"><span className="grid size-7 place-items-center rounded-md bg-foreground font-display text-[11px] font-bold text-background">VJ</span><span className="font-display text-[15px] font-bold">VDJ LAB</span><span className="hidden font-mono text-[10px] text-muted-foreground sm:inline">HUMAN IGH · 14q32.33</span></div>
        <div className="ml-auto flex items-center gap-2 font-mono text-[9px]"><span className="rounded bg-primary/10 px-2 py-1 text-primary">{current.level}</span><span className="hidden rounded bg-generated/10 px-2 py-1 text-generated md:inline">{current.enzyme}</span><Button variant="labOutline" size="icon" onClick={reset} aria-label="Reset simulation" title="Reset simulation"><RotateCcw /></Button></div>
      </div>
    </header>

    <main className="mx-auto grid max-w-[1480px] grid-cols-1 items-start gap-4 p-4 lg:grid-cols-[220px_minmax(0,1fr)_300px] lg:p-5">
      <aside className="lab-rise rounded-lg border border-border bg-card p-3 lg:sticky lg:top-[76px]">
        <p className="mb-2 px-2 font-mono text-[10px] text-muted-foreground">MOLECULAR JOURNEY</p>
        <ol className="grid grid-cols-3 gap-1 sm:grid-cols-5 lg:grid-cols-1">
          {stages.map((item, i) => <li key={item.short}><button onClick={() => setStage(i)} className={cn("flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-[12px] transition", i === stage ? "bg-primary/10 font-semibold text-foreground ring-1 ring-primary/35" : "text-muted-foreground hover:bg-muted")}><span className={cn("grid size-5 shrink-0 place-items-center rounded-full font-mono text-[9px]", i < stage ? "bg-success text-primary-foreground" : i === stage ? "bg-primary text-primary-foreground" : "ring-1 ring-border")}>{i < stage ? <Check className="size-3" /> : i + 1}</span><span className="truncate">{item.short}</span></button></li>)}
        </ol>
        <div className="mt-3 border-t border-border pt-3"><p className="mb-2 px-1 font-mono text-[10px] text-muted-foreground">EXPRESSED HOMOLOG</p><div className="grid grid-cols-2 gap-2">{(["maternal","paternal"] as Origin[]).map(o => <Button key={o} size="sm" variant="labOutline" onClick={() => setOrigin(o)} className={cn(o === origin && (o === "maternal" ? "border-maternal/50 bg-maternal/10 text-maternal" : "border-paternal/50 bg-paternal/10 text-paternal"))}>{o === "maternal" ? "Mother" : "Father"}</Button>)}</div><p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">Both alleles are inherited; one productive heavy-chain allele is normally expressed per B cell.</p></div>
      </aside>

      <div className="min-w-0 space-y-4">
        <section className="lab-rise overflow-hidden rounded-lg border border-border bg-card" key={stage}>
          <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="mb-1 font-mono text-[10px] text-primary">STAGE {stage + 1} / {stages.length}</p><h1 className="font-display text-2xl font-bold">{current.title}</h1><p className="mt-1 text-[12px] text-muted-foreground">{current.place}</p></div>
            <div className="flex gap-2"><Button variant="lab" size="sm" onClick={randomize}><Shuffle />Randomize V·D·J</Button><Button variant="labOutline" size="sm" onClick={reset}><RotateCcw />Reset</Button></div>
          </div>

          <div className="p-4">
            <div className="mb-4 flex items-center justify-between"><span className="font-mono text-[10px] text-muted-foreground">GERMLINE LOCUS · 5′ → 3′ · NOT TO SCALE</span><span className={cn("font-mono text-[10px]", origin === "maternal" ? "text-maternal" : "text-paternal")}>{origin.toUpperCase()} ALLELE ACTIVE</span></div>
            <div className="space-y-3">
              {(["v","d","j"] as SegmentKey[]).map(key => <div key={key} className="flex items-center gap-3"><span className="w-10 font-mono text-[10px] text-muted-foreground">IGH{key.toUpperCase()}</span><div className="grid flex-1 gap-1" style={{gridTemplateColumns:`repeat(${segmentOptions[key].length}, minmax(0,1fr))`}}>{segmentOptions[key].map(opt => <button key={opt} onClick={() => setSegments(s => ({...s,[key]:opt}))} className={cn("h-9 truncate rounded-md px-1 font-mono text-[10px] ring-1 transition", segments[key] === opt ? origin === "maternal" ? "bg-maternal/15 text-maternal ring-maternal/45" : "bg-paternal/15 text-paternal ring-paternal/45" : "bg-muted/60 text-muted-foreground ring-border hover:bg-muted")}>{opt.replace("IGH","")}</button>)}</div></div>)}
              <div className="flex items-center gap-3"><span className="w-10 font-mono text-[10px] text-muted-foreground">IGHC</span><div className="flex flex-1 gap-1 overflow-hidden">{["Cμ","Cδ","Cγ3","Cγ1","Cα1","Cγ2","Cγ4","Cε","Cα2"].map((x,i)=><span key={x} className={cn("grid h-8 min-w-10 flex-1 place-items-center rounded bg-muted font-mono text-[9px] text-muted-foreground", isotype.includes(x.slice(1)) && "bg-primary/15 text-primary ring-1 ring-primary/35")}>{x}</span>)}</div></div>
            </div>

            <div className="mt-5 rounded-lg border border-border bg-background p-3">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2"><span className="font-mono text-[10px] text-muted-foreground">REARRANGED VDJ EXON · {segments.v} / {segments.d} / {segments.j}</span><span className="font-mono text-[10px] text-generated">N-addition: {junction.length} nt · {junction}</span></div>
              <div className="flex flex-wrap gap-1">{codons.map((c,i)=><span key={`${c}-${i}`} className={cn("mutation-flash rounded px-1.5 py-1 font-mono text-[11px]", mutations.has(i) ? "bg-mutation/15 font-semibold text-mutation ring-1 ring-mutation/30" : i > 5 && i < 12 ? "bg-generated/15 text-generated" : origin === "maternal" ? "bg-maternal/12 text-maternal" : "bg-paternal/12 text-paternal")}>{mutations.has(i) ? c.split("").reverse().join("") : c}</span>)}</div>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between"><div><h2 className="font-display text-lg font-semibold">VH domain · IMGT region lens</h2><p className="text-[11px] text-muted-foreground">Click a region to inspect where its diversity comes from.</p></div><span className="font-mono text-[10px] text-muted-foreground">{isotype} · Kd {affinity.toFixed(1)} nM</span></div>
          <div className="flex h-14 gap-1.5">{regions.map(([name, flex, type])=><button key={name} onClick={() => setSelectedRegion(name)} style={{flex}} className={cn("grid min-w-0 place-items-center rounded-md font-mono text-[10px] ring-1 transition", type === "cdr" ? "bg-cdr/15 text-cdr ring-cdr/35" : "bg-framework/20 text-muted-foreground ring-framework/40", selectedRegion === name && "outline-2 outline-offset-2 outline-foreground")}>{name}</button>)}</div>
          <p className="mt-3 rounded-md bg-muted/70 p-3 text-[12px] leading-relaxed text-muted-foreground">{selectedRegion === "CDR3" ? "CDR-H3 spans the V–D–J junction. Trimming plus P/N addition makes it the most diverse heavy-chain loop." : selectedRegion.startsWith("CDR") ? `${selectedRegion} is encoded within the selected V segment; its diversity comes from V-gene choice and later SHM, not junctional addition.` : `${selectedRegion} helps form the conserved immunoglobulin-fold scaffold that positions the CDR loops. Framework mutations can still alter stability or binding geometry.`}</p>
        </section>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-[76px]">
        <section className="rounded-lg border border-border bg-card p-4"><div className="mb-2 flex items-center gap-2"><Info className="size-4 text-primary"/><p className="font-mono text-[10px] text-muted-foreground">SCIENTIFIC NOTE</p></div><p className="text-[12px] leading-relaxed">{current.note}</p><p className="mt-3 border-l-2 border-primary pl-3 text-[11px] leading-relaxed text-muted-foreground">{current.action}</p></section>
        <section className="rounded-lg border border-border bg-card p-4"><p className="mb-3 font-mono text-[10px] text-muted-foreground">EXPERIMENT CONTROLS</p><label className="block"><span className="mb-1.5 flex justify-between font-mono text-[10px] text-muted-foreground"><span>SHM rounds</span><b className="text-foreground">{rounds}</b></span><input aria-label="Somatic hypermutation rounds" type="range" min="0" max="8" value={rounds} onChange={e=>setRounds(Number(e.target.value))} className="w-full accent-[var(--mutation)]" /></label><label className="mt-4 block"><span className="mb-1.5 flex justify-between font-mono text-[10px] text-muted-foreground"><span>Selection pressure</span><b className="text-foreground">{pressure}%</b></span><input aria-label="Selection pressure" type="range" min="0" max="100" value={pressure} onChange={e=>setPressure(Number(e.target.value))} className="w-full accent-[var(--generated)]" /></label><div className="mt-4"><p className="mb-2 font-mono text-[10px] text-muted-foreground">ISOTYPE · SAME VDJ</p><div className="grid grid-cols-3 gap-1">{["IgM","IgD","IgG1","IgA1","IgE","IgG4"].map(x=><Button key={x} size="sm" variant={x===isotype?"labActive":"labOutline"} onClick={()=>setIsotype(x)}>{x}</Button>)}</div><p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">IgD uses alternative RNA splicing. IgG, IgA and IgE require irreversible class-switch DNA recombination.</p></div></section>
        <section className="overflow-hidden rounded-lg border border-border bg-card p-4"><p className="mb-3 font-mono text-[10px] text-muted-foreground">ANTIGEN BINDING</p><div className="relative h-28 overflow-hidden rounded-md bg-background ring-1 ring-border"><div className="antigen-bind absolute left-1/2 top-3 -translate-x-1/2"><div className="size-8 rotate-45 rounded-[35%] bg-primary/25 ring-2 ring-primary"></div></div><div className="absolute bottom-2 left-1/2 -translate-x-1/2"><Dna className="mx-auto size-10 text-foreground"/><div className="mt-[-4px] h-7 w-1 bg-foreground mx-auto"/></div></div><div className="mt-3 flex items-end justify-between"><div><p className="font-display text-xl font-bold">{affinity < 10 ? "High" : affinity < 60 ? "Moderate" : "Low"} affinity</p><p className="font-mono text-[10px] text-muted-foreground">Predicted teaching model</p></div><p className="font-mono text-sm font-semibold text-primary">Kd {affinity.toFixed(1)} nM</p></div></section>
        <div className="flex gap-2"><Button variant="labOutline" className="flex-1" disabled={stage===0} onClick={()=>setStage(s=>Math.max(0,s-1))}><ChevronLeft/>Back</Button><Button variant="lab" className="flex-1" disabled={stage===stages.length-1} onClick={()=>setStage(s=>Math.min(stages.length-1,s+1))}>Next<ChevronRight/></Button></div>
      </aside>
    </main>
    <footer className="mx-auto flex max-w-[1480px] flex-col gap-2 border-t border-border px-5 py-5 text-[10px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between"><span>Teaching simulation · Human IGH nomenclature follows IMGT conventions</span><a className="inline-flex items-center gap-1 text-primary hover:underline" href="https://www.imgt.org/IMGTrepertoire/LocusGenes/locusdesc/human/IGH/Hu_IGHdesc.html" target="_blank" rel="noreferrer">Review source: IMGT <Sparkles className="size-3"/></a></footer>
  </div>;
}
