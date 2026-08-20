import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { useState } from "react";

interface RefreshButtonProps {
    featureKey: string | readonly unknown[];
    className?: string;
}

export default function RefreshButton({ featureKey, className }: RefreshButtonProps) {
    const queryClient = useQueryClient();
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = async () => {
        setIsRefreshing(true);

        // Normalize string key to array format for TanStack Query
        const queryKey = typeof featureKey === "string" ? [featureKey] : featureKey;

        await queryClient.invalidateQueries({ queryKey });

        // Slight delay for smooth visual spinner feedback
        setTimeout(() => {
            setIsRefreshing(false);
        }, 500);
    };

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={className}
            title="Refresh data"
        >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
        </Button>
    );
}