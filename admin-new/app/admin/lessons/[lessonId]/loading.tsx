import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="flex flex-col gap-6">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-10 w-72" />
            <Skeleton className="h-10 w-full" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
            </div>
            <Skeleton className="h-40 w-full" />
        </div>
    );
}