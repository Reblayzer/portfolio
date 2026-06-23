import Image from "next/image";

export function Architecture({ src, caption }: { src: string; caption?: string }) {
  return (
    <figure className="my-8">
      <div className="overflow-x-auto rounded-xl border border-border bg-foreground/[0.02] p-4">
        <Image
          src={src}
          alt={caption ?? "Architecture diagram"}
          width={1200}
          height={500}
          className="h-auto w-full"
          unoptimized
        />
      </div>
      {caption && <figcaption className="mt-2 text-center text-xs text-muted-foreground">{caption}</figcaption>}
    </figure>
  );
}
