import React from "react";
import { OrbitingCircles } from "./orbiting-circles";
import { File, Settings, Search } from "lucide-react";

// Example component that matches the MagicUI documentation exactly
export const OrbitingCirclesExample = () => {
  return (
    <div className="relative overflow-hidden h-[500px] w-full">
      <OrbitingCircles>
        <File />
        <Settings />
        <File />
      </OrbitingCircles>
      <OrbitingCircles radius={100} reverse>
        <File />
        <Settings />
        <File />
        <Search />
      </OrbitingCircles>
    </div>
  );
};
