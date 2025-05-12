import { LoaderIcon } from "lucide-react";

function LoaderUI() {
  return (
    //correspondence to navbar h-16 + 1 for border = 65px
    <div className="h-[calc(100vh-4rem-1px)] flex items-center justify-center">
      <LoaderIcon className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}
export default LoaderUI;
