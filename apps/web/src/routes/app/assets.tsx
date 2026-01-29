import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Share2, Tag, Upload } from "lucide-react";

export const Route = createFileRoute("/app/assets")({
    component: AssetsPage,
});

type Asset = {
    id: string;
    name: string;
    url: string;
    tags: string[];
};

function AssetsPage() {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isTagging, setIsTagging] = useState(false);

    const handleUploadMock = () => {
        const newAsset: Asset = {
            id: crypto.randomUUID(),
            name: `Asset ${assets.length + 1}`,
            url: "https://placehold.co/600x400",
            tags: [],
        };
        setAssets([newAsset, ...assets]);
        toast.success("Asset uploaded successfully");
    };

    const handleOpenPreview = (asset: Asset) => {
        setSelectedAsset(asset);
        setIsPreviewOpen(true);
    };

    const handleAiTag = async () => {
        if (!selectedAsset) return;
        setIsTagging(true);
        // Simulate AI delay
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const newTags = ["Landscape", "Mountain", "Nature", "Vibrant"];
        const updatedAsset = { ...selectedAsset, tags: [...selectedAsset.tags, ...newTags] };

        setAssets(assets.map((a) => (a.id === selectedAsset.id ? updatedAsset : a)));
        setSelectedAsset(updatedAsset);
        setIsTagging(false);
        toast.success("AI Tags generated");
    };

    const handleShare = () => {
        navigator.clipboard.writeText(selectedAsset?.url || "");
        toast.success("Link copied to clipboard");
        setIsPreviewOpen(false);
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Assets</h1>
                <Button onClick={handleUploadMock}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Mock Asset
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {assets.map((asset) => (
                    <Card
                        key={asset.id}
                        className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => handleOpenPreview(asset)}
                    >
                        <CardHeader className="p-0">
                            <img
                                src={asset.url}
                                alt={asset.name}
                                className="w-full h-48 object-cover rounded-t-lg"
                            />
                        </CardHeader>
                        <CardContent className="p-4">
                            <CardTitle className="text-lg">{asset.name}</CardTitle>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {asset.tags.map(tag => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {assets.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500 border-2 border-dashed rounded-lg">
                        <p>No assets found. Upload one to get started.</p>
                    </div>
                )}
            </div>

            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>{selectedAsset?.name}</DialogTitle>
                    </DialogHeader>

                    {selectedAsset && (
                        <div className="space-y-4">
                            <img
                                src={selectedAsset.url}
                                alt={selectedAsset.name}
                                className="w-full rounded-lg border"
                            />

                            <div className="flex flex-wrap gap-2">
                                {selectedAsset.tags.length === 0 ? (
                                    <p className="text-sm text-gray-500 italic">No tags yet</p>
                                ) : (
                                    selectedAsset.tags.map(tag => (
                                        <Badge key={tag} variant="secondary">
                                            {tag}
                                        </Badge>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    <DialogFooter className="sm:justify-between gap-2">
                        <Button
                            variant="outline"
                            onClick={handleAiTag}
                            disabled={isTagging || (selectedAsset?.tags.length || 0) > 0}
                        >
                            {isTagging ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Tagging...
                                </>
                            ) : (
                                <>
                                    <Tag className="mr-2 h-4 w-4" />
                                    AI Tag
                                </>
                            )}
                        </Button>
                        <Button onClick={handleShare}>
                            <Share2 className="mr-2 h-4 w-4" />
                            Share Asset
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
