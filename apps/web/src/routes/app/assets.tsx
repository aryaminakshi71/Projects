import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Share2, Tag, Upload, X, ImageIcon, Search, Trash2, CheckCircle2, Filter } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/app/assets")({
    component: AssetsPage,
});

type Asset = {
    id: string;
    name: string;
    url: string;
    tags: string[];
};

function UploadZone({ onUpload, isUploading }: { onUpload: (names: string[]) => void; isUploading: boolean }) {
    const [isDragging, setIsDragging] = useState(false);

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const onDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const fileCount = Math.floor(Math.random() * 3) + 1;
        onUpload(Array.from({ length: fileCount }, (_, i) => `Asset ${Date.now() + i}`));
    }, [onUpload]);

    return (
        <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={cn(
                "relative group cursor-pointer border-2 border-dashed rounded-3xl p-16 transition-all duration-700 flex flex-col items-center justify-center gap-6 text-center overflow-hidden",
                isDragging
                    ? "border-primary bg-primary/10 scale-[0.99] shadow-[0_0_50px_-12px_rgba(var(--primary-rgb),0.4)]"
                    : "border-muted-foreground/30 hover:border-primary/60 hover:bg-muted/30 hover:shadow-2xl",
                isUploading && "opacity-50 pointer-events-none"
            )}
            onClick={() => onUpload([`Manual Upload ${Date.now()}`])}
        >
            <div className={cn(
                "w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center transition-all duration-700 shadow-inner",
                isDragging ? "scale-125 rotate-12 bg-primary/20" : "group-hover:scale-110 group-hover:bg-primary/15"
            )}>
                {isUploading ? (
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                ) : (
                    <Upload className={cn("w-12 h-12 text-primary transition-all", isDragging && "animate-bounce")} />
                )}
            </div>
            <div className="space-y-3 relative z-10">
                <h3 className="text-3xl font-black tracking-tighter uppercase italic">Fuel Your Creative Engine</h3>
                <p className="text-muted-foreground font-semibold max-w-md mx-auto">
                    Drag and drop your high-performance assets here. Let AI categorize your workload instantly.
                </p>
                <div className="flex gap-3 justify-center mt-6">
                    {["IMAGE", "RAW", "VECTOR"].map(t => (
                        <Badge key={t} variant="outline" className="bg-background/80 backdrop-blur-sm px-4 py-1 font-black text-[10px] tracking-widest">{t}</Badge>
                    ))}
                </div>
            </div>
        </div>
    );
}

function AssetsPage() {
    const queryClient = useQueryClient();
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const { data: assets = [], isLoading } = useQuery(api.assets.list.queryOptions({
        search: searchQuery || undefined,
        tag: selectedTag || undefined
    }));

    const createAsset = useMutation(
        api.assets.create.mutationOptions({
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: api.assets.list.queryKey() });
                toast.success("ASSET SYNCED TO CLOUD");
            },
            onError: (error: any) => toast.error(`SYNC ERROR: ${error.message}`)
        })
    );

    const deleteMany = useMutation(
        api.assets.deleteMany.mutationOptions({
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: api.assets.list.queryKey() });
                setSelectedIds(new Set());
                toast.success("BATCH PURGE COMPLETE");
            }
        })
    );

    const analyzeAsset = useMutation(
        api.assets.analyze.mutationOptions({
            onSuccess: (updated) => {
                queryClient.invalidateQueries({ queryKey: api.assets.list.queryKey() });
                setSelectedAsset(updated as Asset);
                toast.success("AI ANALYSIS COMPLETE");
            },
            onError: (error: any) => toast.error(`AI FAULT: ${error.message}`)
        })
    );

    const handleUpload = async (names: string[]) => {
        for (const name of names) {
            try {
                const response = await fetch(`https://picsum.photos/seed/${Math.random().toString(36).substring(7)}/1200/800`);
                const blob = await response.blob();
                const file = new File([blob], `${name}.jpg`, { type: "image/jpeg" });

                const formData = new FormData();
                formData.append("file", file);

                const uploadRes = await fetch("/api/assets/upload", { method: "POST", body: formData });
                if (!uploadRes.ok) throw new Error("UP_ERR");
                const { url } = await uploadRes.json();

                createAsset.mutate({ name, url, tags: [] });
            } catch (error) {
                toast.error(`FAIL: ${name}`);
            }
        }
    };

    const toggleSelection = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const newSelection = new Set(selectedIds);
        if (newSelection.has(id)) newSelection.delete(id);
        else newSelection.add(id);
        setSelectedIds(newSelection);
    };

    const handleBatchDelete = () => {
        if (confirm(`PURGE ${selectedIds.size} ASSETS PERMANENTLY?`)) {
            deleteMany.mutate({ ids: Array.from(selectedIds) });
        }
    };

    const allTags = useMemo(() => {
        const tags = new Set<string>();
        assets.forEach((a: any) => a.tags?.forEach((t: string) => tags.add(t)));
        return Array.from(tags);
    }, [assets]);

    return (
        <div className="container mx-auto p-10 space-y-12 max-w-7xl animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary rounded-2xl shadow-lg shadow-primary/20">
                            <ImageIcon className="w-8 h-8 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-6xl font-black tracking-tighter italic uppercase leading-none">Vortex Hub</h1>
                            <p className="text-muted-foreground font-black tracking-widest text-xs mt-2 opacity-50 uppercase">Neural Asset Management // Rev 3.0</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <div className="relative group w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="SCAN REPOSITORY..."
                            className="pl-12 h-14 bg-muted/30 border-none rounded-2xl font-black tracking-tight focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    {selectedIds.size > 0 && (
                        <Button
                            variant="destructive"
                            className="h-14 px-8 rounded-2xl font-black uppercase tracking-tighter gap-2 animate-in zoom-in-90"
                            onClick={handleBatchDelete}
                        >
                            <Trash2 className="w-5 h-5" />
                            Purge ({selectedIds.size})
                        </Button>
                    )}
                </div>
            </header>

            <UploadZone onUpload={handleUpload} isUploading={createAsset.isPending} />

            <section className="space-y-8">
                <div className="flex items-center justify-between border-b-4 border-primary/10 pb-6">
                    <div className="flex items-center gap-6">
                        <h2 className="text-4xl font-black tracking-tighter italic uppercase">Registry</h2>
                        <div className="flex gap-2">
                            <Badge
                                variant={!selectedTag ? "default" : "outline"}
                                className="cursor-pointer h-7 px-4 rounded-full font-black text-[10px] tracking-widest transition-all"
                                onClick={() => setSelectedTag(null)}
                            >
                                ALL_CORE
                            </Badge>
                            {allTags.slice(0, 5).map(tag => (
                                <Badge
                                    key={tag}
                                    variant={selectedTag === tag ? "default" : "outline"}
                                    className="cursor-pointer h-7 px-4 rounded-full font-black text-[10px] tracking-widest uppercase"
                                    onClick={() => setSelectedTag(tag)}
                                >
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="aspect-[3/4] rounded-[2rem] bg-muted animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                        {assets.map((asset: any) => (
                            <div
                                key={asset.id}
                                className="group relative"
                                onClick={() => setSelectedAsset(asset as Asset) || setIsPreviewOpen(true)}
                            >
                                <div className={cn(
                                    "relative aspect-[3/4] overflow-hidden rounded-[2.5rem] transition-all duration-700 ring-2 ring-transparent",
                                    selectedIds.has(asset.id)
                                        ? "ring-primary shadow-[0_30px_60px_-12px_rgba(var(--primary-rgb),0.5)] scale-[0.98]"
                                        : "group-hover:ring-primary/40 group-hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)] group-hover:scale-[1.02]"
                                )}>
                                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={cn(
                                            "absolute top-6 right-6 z-30 rounded-full w-12 h-12 transition-all duration-500 backdrop-blur-md border-2",
                                            selectedIds.has(asset.id)
                                                ? "bg-primary text-primary-foreground border-primary scale-110"
                                                : "bg-white/10 text-white border-white/20 opacity-0 group-hover:opacity-100 hover:bg-white/20"
                                        )}
                                        onClick={(e) => toggleSelection(asset.id, e)}
                                    >
                                        <CheckCircle2 className="w-6 h-6" />
                                    </Button>

                                    <img
                                        src={asset.url}
                                        alt={asset.name}
                                        className="w-full h-full object-cover transition-transform duration-[2000ms] ease-out group-hover:scale-125"
                                    />

                                    <div className="absolute inset-0 flex flex-col justify-end p-8 z-20 translate-y-8 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-700">
                                        <p className="text-white font-black text-3xl mb-3 tracking-tighter leading-none">{asset.name}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {asset.tags?.slice(0, 3).map((tag: string) => (
                                                <Badge key={tag} className="bg-primary text-primary-foreground border-none text-[9px] font-black tracking-widest uppercase px-3">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {assets.length === 0 && (
                            <div className="col-span-full py-40 rounded-[3rem] bg-muted/20 border-8 border-dotted border-muted flex flex-col items-center gap-8 animate-pulse text-center px-10">
                                <Search className="w-24 h-24 text-muted opacity-20" />
                                <div className="space-y-2">
                                    <h4 className="text-4xl font-black italic uppercase tracking-tighter opacity-30">Scan Failed</h4>
                                    <p className="text-muted-foreground font-bold uppercase tracking-widest text-sm">No assets detected within specified sector.</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </section>

            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="sm:max-w-6xl p-0 overflow-hidden border-none shadow-[0_100px_200px_-50px_rgba(0,0,0,0.8)] rounded-[3rem] bg-black">
                    <Button variant="ghost" size="icon" className="absolute right-8 top-8 text-white hover:bg-white/10 z-50 rounded-full w-14 h-14" onClick={() => setIsPreviewOpen(false)}><X className="h-8 w-8" /></Button>
                    <div className="grid grid-cols-1 lg:grid-cols-[1.2fr,450px] min-h-[70vh]">
                        <div className="relative bg-[#020202] flex items-center justify-center p-4">
                            {selectedAsset && <img src={selectedAsset.url} className="max-w-full max-h-[85vh] object-contain rounded-2xl animate-in zoom-in-90 duration-1000 shadow-[0_0_100px_rgba(255,255,255,0.05)]" />}
                        </div>
                        <div className="bg-background p-12 flex flex-col gap-12 border-l border-white/5">
                            <div className="space-y-4">
                                <Badge className="bg-primary/20 text-primary border-none font-black tracking-widest text-[10px] px-4 h-8 flex w-fit items-center">SYSTEM_PREVIEW_MODE</Badge>
                                <h3 className="text-6xl font-black tracking-tighter leading-[0.9] uppercase italic">{selectedAsset?.name}</h3>
                                <div className="grid grid-cols-2 gap-4 mt-6">
                                    <div className="bg-muted/30 p-4 rounded-2xl"><p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Sector_ID</p><p className="font-black text-sm">CORE_7</p></div>
                                    <div className="bg-muted/30 p-4 rounded-2xl"><p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Version</p><p className="font-black text-sm">FINAL_01</p></div>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <h4 className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3 text-primary"><span className="w-10 h-[2px] bg-primary/30" /> Neural Tags</h4>
                                <div className="flex flex-wrap gap-2.5">
                                    {selectedAsset?.tags?.length === 0 ? (
                                        <div className="w-full p-10 rounded-3xl bg-muted/10 border-4 border-dotted border-muted/30 flex flex-col items-center gap-4 text-center">
                                            <Tag className="w-10 h-10 opacity-20" />
                                            <p className="text-sm font-black opacity-40 uppercase tracking-widest leading-loose">No thermal signatures detected.<br />Initiate AI scan for analysis.</p>
                                        </div>
                                    ) : (
                                        selectedAsset?.tags?.map((tag: string) => (
                                            <Badge key={tag} className="px-6 py-3 font-black rounded-xl border-none bg-primary/5 text-primary text-xs tracking-tighter hover:bg-primary hover:text-primary-foreground transition-all">
                                                {tag}
                                            </Badge>
                                        ))
                                    )}
                                </div>
                            </div>
                            <div className="mt-auto grid grid-cols-1 gap-4">
                                <Button
                                    className="w-full h-20 text-2xl font-black uppercase tracking-tighter rounded-3xl shadow-2xl shadow-primary/30 active:scale-95 transition-all"
                                    onClick={() => selectedAsset && analyzeAsset.mutate({ id: selectedAsset.id })}
                                    disabled={analyzeAsset.isPending || (selectedAsset?.tags?.length || 0) > 0}
                                >
                                    {analyzeAsset.isPending ? <><Loader2 className="mr-4 h-8 w-8 animate-spin" /> Analyzing...</> : <><Tag className="mr-4 h-8 w-8" /> Neural Override</>}
                                </Button>
                                <div className="grid grid-cols-2 gap-4">
                                    <Button variant="outline" className="h-16 text-sm font-black uppercase tracking-widest rounded-3xl border-2" onClick={() => { selectedAsset && navigator.clipboard.writeText(selectedAsset.url); toast.success("ENCRYPTED LINK COPIED"); }}>
                                        <Share2 className="mr-3 h-5 w-5" /> Share
                                    </Button>
                                    <Button variant="destructive" className="h-16 text-sm font-black uppercase tracking-widest rounded-3xl" onClick={() => { if (selectedAsset && confirm("DELETE ASSET?")) { deleteMany.mutate({ ids: [selectedAsset.id] }); setIsPreviewOpen(false); } }}>
                                        <Trash2 className="mr-3 h-5 w-5" /> Purge
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
