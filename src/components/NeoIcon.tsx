import type { ImgHTMLAttributes } from "react";

export type NeoIconName = "explorer" | "projects" | "about" | "terminal" | "lab" | "resume" | "contact" | "settings";
type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "width" | "height" | "alt"> & {
  name: NeoIconName;
  size?: number;
};

/** Pixel-art app icons cropped from the supplied JXY OS reference screenshot. */
export default function NeoIcon({ name, size = 40, ...props }: Props) {
  return (
    <img
      src={`/icons/${name}.png`}
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      draggable={false}
      decoding="async"
      {...props}
    />
  );
}
